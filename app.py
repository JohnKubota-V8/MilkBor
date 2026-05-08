# app.py
import os
import streamlit as st
from dotenv import load_dotenv
from google import genai
from rag_engine import RAGEngine

load_dotenv()
client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))

# Preferred order: try full flash first, then fall back to lite if rate-limited.
MODEL_CANDIDATES: tuple[str, ...] = (
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
)

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

def _generate_answer(prompt: str) -> str:
    last_rate_limit_error: Exception | None = None
    for model_name in MODEL_CANDIDATES:
        try:
            response = client.models.generate_content(model=model_name, contents=prompt)
            text = getattr(response, "text", None)
            if not text:
                raise RuntimeError("Gemini returned an empty response.")
            return text
        except Exception as e:
            if _is_rate_limit_or_quota_error(str(e)):
                last_rate_limit_error = e
                continue
            raise
    raise RuntimeError(
        "All configured Gemini models are rate-limited or have no quota right now. "
        "Try again later or enable billing/quota."
    ) from last_rate_limit_error

@st.cache_resource
def load_rag():
    return RAGEngine("knowledge/milkbor.txt")

rag = load_rag()

st.title("John ผู้ช่วย AI ของ MilkBor")
st.caption("ถามเรื่องเมนู เวลาเปิด หรือข้อมูลร้านได้เลย")

if "messages" not in st.session_state:
    st.session_state.messages = []

for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        st.write(msg["content"])

if prompt := st.chat_input("ถามอะไรเกี่ยวกับร้านได้เลย..."):
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.write(prompt)

    # RAG: Search
    context_chunks = rag.search(prompt, top_k=3)
    context = "\n---\n".join(context_chunks)

    # Generate
    full_prompt = f"""คุณคือ John ผู้ช่วย AI ของร้าน MilkBor ตอบเฉพาะจากข้อมูลด้านล่าง
ถ้าไม่พบข้อมูล ให้บอกว่าไม่ทราบ อย่าแต่งข้อมูลเอง

ข้อมูลร้าน:
{context}

คำถาม: {prompt}
"""
    with st.spinner("กำลังคิดคำตอบ..."):
        try:
            answer = _generate_answer(full_prompt)
        except Exception as e:
            st.error(f"เกิดข้อผิดพลาด: {e}")
            st.stop()

    st.session_state.messages.append({"role": "assistant", "content": answer})
    with st.chat_message("assistant"):
        st.write(answer)