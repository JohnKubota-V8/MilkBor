"""Caption generator for MilkLab cafe Instagram posts."""

import os
import re
from dotenv import load_dotenv

# Preferred order: try full flash first, then fall back to lite if rate-limited.
MODEL_CANDIDATES: tuple[str, ...] = (
	"gemini-2.5-flash",
	"gemini-2.5-flash-lite",
)

CAPTION_PREFIXES: tuple[str, ...] = (
	"Cute:",
	"Minimal:",
	"Gen-Z:",
)

_PREFIX_PATTERNS: dict[str, re.Pattern[str]] = {
	"Cute:": re.compile(r"^\s*Cute\s*:\s*", re.IGNORECASE),
	"Minimal:": re.compile(r"^\s*Minimal\s*:\s*", re.IGNORECASE),
	"Gen-Z:": re.compile(r"^\s*Gen\s*-\s*Z\s*:\s*", re.IGNORECASE),
}


def _strip_code_fences(text: str) -> str:
	# Some models wrap output in ``` fences; remove them to simplify parsing.
	text = text.strip()
	if "```" not in text:
		return text
	# Remove opening fence line (``` or ```lang) and the closing fence.
	text = re.sub(r"^```[a-zA-Z0-9_-]*\s*\n", "", text)
	text = re.sub(r"\n```\s*$", "", text)
	return text.strip()


def normalize_caption_output(text: str) -> str:
	"""Normalize model output to exactly 3 lines with required prefixes."""
	text = _strip_code_fences(text)
	raw_lines = [line.strip() for line in text.splitlines() if line.strip()]

	# Try to pick the labeled lines wherever they appear.
	found: dict[str, str] = {}
	for line in raw_lines:
		for prefix in CAPTION_PREFIXES:
			pattern = _PREFIX_PATTERNS[prefix]
			if pattern.match(line):
				content = pattern.sub("", line).strip()
				found[prefix] = content
				break

	if len(found) == 3:
		return "\n".join(f"{p} {found[p]}" for p in CAPTION_PREFIXES)

	# Best-effort fallback: force 3 lines in order.
	lines = (raw_lines + ["", "", ""])[:3]
	normalized: list[str] = []
	for prefix, line in zip(CAPTION_PREFIXES, lines, strict=False):
		pattern = _PREFIX_PATTERNS[prefix]
		if pattern.match(line):
			line = f"{prefix} {pattern.sub('', line).strip()}"
		else:
			line = f"{prefix} {line.strip()}".rstrip()
		normalized.append(line)
	return "\n".join(normalized)


def _price_token(price: str) -> str:
	price = price.strip()
	# If the user types just digits like "65", make a Thai-friendly token.
	if re.fullmatch(r"\d+(?:\.\d+)?", price):
		return f"{price} บาท"
	return price


def _price_digits(price: str) -> str | None:
	match = re.search(r"\d+(?:\.\d+)?", price)
	return match.group(0) if match else None


def ensure_price_in_caption_output(text: str, price: str) -> str:
	"""Ensure the price appears in the required lines (best-effort).

	We require the price in Cute/Minimal (and keep Gen-Z consistent too).
	"""
	price = price.strip()
	if not price:
		return text
	price_full = _price_token(price)
	price_digits = _price_digits(price)

	lines = [line.rstrip() for line in text.splitlines()]
	if len(lines) != 3:
		# Unexpected format; don't attempt invasive edits.
		return text

	def has_price(line: str) -> bool:
		if price_full and price_full in line:
			return True
		if price_digits and price_digits in line:
			return True
		return False

	updated: list[str] = []
	for i, (prefix, line) in enumerate(zip(CAPTION_PREFIXES, lines, strict=False)):
		# Ensure the line begins with the expected prefix.
		content = line
		pattern = _PREFIX_PATTERNS[prefix]
		if pattern.match(content):
			content = pattern.sub("", content).strip()
		else:
			# If the line doesn't have the right prefix, keep it as-is.
			content = content.strip()

		# Enforce price for Cute/Minimal; also do Gen-Z for consistency.
		requires_price = i in (0, 1, 2)
		new_line = f"{prefix} {content}".rstrip()
		if requires_price and not has_price(new_line):
			new_line = f"{new_line} {price_full}".rstrip()
		updated.append(new_line)

	return "\n".join(updated)

def _get_api_key() -> str:
	load_dotenv()
	api_key = os.getenv("GOOGLE_API_KEY")
	if not api_key:
		raise RuntimeError(
			"Missing GOOGLE_API_KEY. Create a .env file next to caption.py with\n"
			"GOOGLE_API_KEY=YOUR_KEY_HERE\n"
			"or set it as an environment variable."
		)
	return api_key

def _is_rate_limit_or_quota_error(message: str) -> bool:
	message_upper = message.upper()
	return (
		"RESOURCE_EXHAUSTED" in message_upper
		or "QUOTA EXCEEDED" in message_upper
		or "RATE LIMIT" in message_upper
		or "429" in message_upper
		or "UNAVAILABLE" in message_upper
		or "HIGH DEMAND" in message_upper
		or "503" in message_upper
	)


def _generate_with_google_genai(api_key: str, prompt: str, model_name: str) -> str:
	"""Generate text using the supported google-genai SDK."""
	try:
		from google import genai  # type: ignore
	except ImportError as e:
		raise RuntimeError(
			"Missing dependency 'google-genai'. Install it with: pip install google-genai"
		) from e

	client = genai.Client(api_key=api_key)
	try:
		response = client.models.generate_content(model=model_name, contents=prompt)
	except Exception as e:
		message = str(e)
		if _is_rate_limit_or_quota_error(message):
			# Let the caller decide whether to retry with a different model.
			raise RuntimeError(
				f"Gemini rate limit/quota hit for model '{model_name}'."
			) from e
		raise
	text = getattr(response, "text", None)
	if not text:
		raise RuntimeError(f"Gemini returned an empty response for model '{model_name}'.")
	return text

def _generate_with_google_generativeai(api_key: str, prompt: str) -> str:
	"""Generate text using the deprecated google-generativeai SDK (fallback)."""
	import google.generativeai as genai  # type: ignore

	genai.configure(api_key=api_key) # type: ignore
	model = genai.GenerativeModel(MODEL_CANDIDATES[0]) # type: ignore
	response = model.generate_content(prompt)
	text = getattr(response, "text", None)
	if not text:
		raise RuntimeError("Gemini returned an empty response.")
	return text

def build_caption_prompt(menu_name: str, price: str) -> str:
	"""Build a Thai-friendly prompt for caption generation."""
	# Token-saving prompt: keep instructions compact and mostly English.
	# Output language/style requirements are still enforced.
	lines: list[str] = [
		"You write Instagram captions for MilkLab cafe.",
		"OUTPUT EXACTLY 3 LINES, in this exact order and format:",
		"Cute: <Thai, friendly/warm/cute>",
		"Minimal: <short, minimal; English allowed>",
		"Gen-Z: <Thai Gen-Z vibe>",
		"Rules: include the price in EVERY line; no extra text; no bullets/numbering.",
		f"Menu: {menu_name}",
		f"Price: {price}",
	]
	return "\n".join(lines)

def generate_captions(menu_name: str, price: str) -> str:
	"""Generate three Thai caption variants for the given menu item."""
	api_key = _get_api_key()
	prompt = build_caption_prompt(menu_name, price)
	try:
		last_rate_limit_error: RuntimeError | None = None
		for model_name in MODEL_CANDIDATES:
			try:
				text = _generate_with_google_genai(api_key, prompt, model_name)
				normalized = normalize_caption_output(text)
				return ensure_price_in_caption_output(normalized, price)
			except RuntimeError as e:
				# Only auto-fallback for rate limit / quota issues.
				if _is_rate_limit_or_quota_error(str(e)):
					last_rate_limit_error = e
					continue
				raise
		raise RuntimeError(
			"All configured Gemini models are rate-limited or have no quota right now. "
			"Try again later, check https://ai.dev/rate-limit, or enable billing/quota. "
			f"Models tried: {', '.join(MODEL_CANDIDATES)}"
		) from last_rate_limit_error
	except RuntimeError:
		raise
	except ImportError:
		# Backwards-compatible fallback for environments that still have the old SDK.
		text = _generate_with_google_generativeai(api_key, prompt)
		normalized = normalize_caption_output(text)
		return ensure_price_in_caption_output(normalized, price)

if __name__ == "__main__":
	menu_name = input("กรอกชื่อเมนู: ").strip()
	price = input("กรอกราคา: ").strip()
	try:
		print(generate_captions(menu_name, price))
	except Exception as e:
		raise SystemExit(f"Error: {e}")