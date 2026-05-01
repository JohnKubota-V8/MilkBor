"""Caption generator for MilkLab cafe Instagram posts."""

import os
from dotenv import load_dotenv

# Preferred order: try full flash first, then fall back to lite if rate-limited.
MODEL_CANDIDATES: tuple[str, ...] = (
	"gemini-2.5-flash",
	"gemini-2.5-flash-lite",
)

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
	return (
		"คุณคือผู้ช่วยเขียนแคปชันสำหรับ Instagram ของร้าน MilkLab cafe\n"
		"ช่วยเขียนแคปชันเป็นภาษาไทยแบบเป็นกันเอง อบอุ่น น่ารัก และอ่านง่าย\n"
		"ตอบกลับมาเป็น 3 บรรทัดเท่านั้น และต้องขึ้นต้นด้วยคำว่า Cute:, Minimal:, Gen-Z: ตามลำดับ\n"
		"โทนภาษาต้องเป็นกันเอง เหมือนคุยกับเพื่อน และให้สไตล์ใกล้เคียงตัวอย่างนี้\n\n"
		"Cute: คืนนี้มีอะไรหวานๆ มาเสิร์ฟ ลาเต้น้ำผึ้งสูตรใหม่ 65 บาทเท่านั้น\n"
		"Minimal: HONEY LATTE. 65 บาท. Tonight only.\n"
		"Gen-Z: ลาเต้น้ำผึ้ง 65 บาท hits different ตอนตี 1 ลองเลยพี่\n\n"
		f"ชื่อเมนู: {menu_name}\n"
		f"ราคา: {price}\n\n"
		"ข้อกำหนด:\n"
		"- ใช้ภาษาไทยเป็นหลัก ยกเว้นบรรทัด Minimal ที่ใช้อังกฤษได้ตามตัวอย่าง\n"
		"- แต่ละบรรทัดต้องสั้น กระชับ และมีจังหวะเหมือนแคปชันจริง\n"
		"- อย่าใส่คำอธิบายเพิ่ม ไม่ต้องมีคำนำหรือปิดท้าย\n"
		"- อย่าแยกเป็นข้อย่อยหรือใช้เลขนำหน้า"
	)

def generate_captions(menu_name: str, price: str) -> str:
	"""Generate three Thai caption variants for the given menu item."""
	api_key = _get_api_key()
	prompt = build_caption_prompt(menu_name, price)
	try:
		last_rate_limit_error: RuntimeError | None = None
		for model_name in MODEL_CANDIDATES:
			try:
				return _generate_with_google_genai(api_key, prompt, model_name)
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
		return _generate_with_google_generativeai(api_key, prompt)

if __name__ == "__main__":
	menu_name = input("กรอกชื่อเมนู: ").strip()
	price = input("กรอกราคา: ").strip()
	try:
		print(generate_captions(menu_name, price))
	except Exception as e:
		raise SystemExit(f"Error: {e}")