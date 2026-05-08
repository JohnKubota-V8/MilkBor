"""agent_harness.py"""

import json
import os
from datetime import datetime

from dotenv import load_dotenv

from agent_tools import TOOLS

# Preferred order: try full flash first, then fall back to lite if rate-limited.
MODEL_CANDIDATES: tuple[str, ...] = (
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
)

SYSTEM_INSTRUCTION = """
คุณคือ John ผู้ช่วย AI ของร้าน MilkBor
หน้าที่ของนักศึกษาคือแปลงคำสั่งภาษาไทยเป็น JSON action
ตอบกลับเป็น JSON เท่านั้น ในรูปแบบ:
{"action": "log_sale", "args": {"menu": "...", "quantity": N, "price": N}}
ถ้าคำสั่งไม่ใช่การบันทึกยอดขาย ตอบ: {"action": "unknown", "args": {}}
"""

TRACE_FILE = "agent_trace.log"


def _get_api_key() -> str:
    load_dotenv()
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise RuntimeError(
            "Missing GOOGLE_API_KEY. Create a .env file next to agent_harness.py with\n"
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


def _strip_code_fences(text: str) -> str:
    # Some models wrap output in ``` fences; remove them to simplify parsing.
    text = text.strip()
    if "```" not in text:
        return text
    # Remove opening fence line (``` or ```lang) and the closing fence.
    text = text.replace("\r\n", "\n")
    text = text.replace("\r", "\n")
    text = text.replace("```json\n", "", 1)
    if text.startswith("```"):
        text = text.split("\n", 1)[1] if "\n" in text else ""
    if text.endswith("```"):
        text = text[: -3]
    return text.strip()


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

    genai.configure(api_key=api_key)  # type: ignore
    model = genai.GenerativeModel(MODEL_CANDIDATES[0])  # type: ignore
    response = model.generate_content(prompt)
    text = getattr(response, "text", None)
    if not text:
        raise RuntimeError("Gemini returned an empty response.")
    return text


def write_trace(event: str, data: dict):
    with open(TRACE_FILE, "a", encoding="utf-8") as f:
        f.write(
            json.dumps(
                {
                    "timestamp": datetime.now().isoformat(),
                    "event": event,
                    **data,
                },
                ensure_ascii=False,
            )
            + "\n"
        )


def run_agent(user_input: str) -> str:
    write_trace("user_input", {"message": user_input})
    api_key = _get_api_key()
    prompt = f"{SYSTEM_INSTRUCTION}\n\nคำสั่ง: {user_input}"

    try:
        last_rate_limit_error: RuntimeError | None = None
        for model_name in MODEL_CANDIDATES:
            try:
                raw = _generate_with_google_genai(api_key, prompt, model_name)
                raw = _strip_code_fences(raw)
                write_trace("llm_response", {"raw": raw, "model": model_name})
                break
            except RuntimeError as e:
                message = str(e)
                if "Missing dependency 'google-genai'" in message:
                    # Backwards-compatible fallback for environments that still have the old SDK.
                    raw = _generate_with_google_generativeai(api_key, prompt)
                    raw = _strip_code_fences(raw)
                    write_trace(
                        "llm_response",
                        {"raw": raw, "model": "generativeai-fallback"},
                    )
                    break
                if _is_rate_limit_or_quota_error(message):
                    last_rate_limit_error = e
                    continue
                raise
        else:
            raise RuntimeError(
                "All configured Gemini models are rate-limited or have no quota right now. "
                "Try again later, check https://ai.dev/rate-limit, or enable billing/quota. "
                f"Models tried: {', '.join(MODEL_CANDIDATES)}"
            ) from last_rate_limit_error
    except ImportError:
        # Backwards-compatible fallback for environments that still have the old SDK.
        raw = _generate_with_google_generativeai(api_key, prompt)
        raw = _strip_code_fences(raw)
        write_trace("llm_response", {"raw": raw, "model": "generativeai-fallback"})

    try:
        action_data = json.loads(raw)
    except json.JSONDecodeError:
        return "❌ AI ตอบกลับในรูปแบบที่ไม่ถูกต้อง"

    action = action_data.get("action")
    args = action_data.get("args", {})

    if action not in TOOLS:
        return f"⚠️ ไม่รู้จัก action: {action}"

    try:
        result = TOOLS[action](**args)
        write_trace("tool_result", {"action": action, "result": result})
        return f"✅ บันทึกสำเร็จ: {result['menu']} x{result['quantity']} = {result['total']} บาท"
    except (ValueError, TypeError) as e:
        write_trace("tool_error", {"action": action, "error": str(e)})
        return f"❌ ข้อมูลไม่ถูกต้อง: {e}"


if __name__ == "__main__":
    print("John Agent พร้อมรับคำสั่ง (พิมพ์ 'exit' เพื่อออก)\n")
    while True:
        user_input = input("คุณ: ").strip()
        if user_input.lower() == "exit":
            break
        print(f"John: {run_agent(user_input)}\n")