"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Bot } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "bot";
  text: string;
}

const customerResponses: Record<string, string> = {
  เวลา: "ร้าน Everyday-Pairs เปิดทุกวัน เวลา 09:00 – 18:00 น. ค่ะ 🕘",
  เปิด: "ร้านเปิดเวลา 09:00 น. ปิด 18:00 น. ทุกวันค่ะ ☀️",
  ปิด: "ร้านปิดเวลา 18:00 น. ค่ะ",
  ราคา: "ราคาถุงเท้าเริ่มต้นที่ 30 บาท ขึ้นอยู่กับชนิดและแบบค่ะ เช่น ถุงเท้านักเรียน 30-35 บาท, ถุงเท้าสปอร์ต 45-50 บาท, ถุงเท้าลาย 55-65 บาท ค่ะ",
  เมนู: "เรามีถุงเท้าหลายประเภทค่ะ: 🧦 ถุงเท้านักเรียน (ขาว/กรมท่า), ถุงเท้าขาว (สปอร์ต/ลูกไม้), ถุงเท้าดำ (ข้อสั้น/ข้อยาว), ถุงเท้าลายน่ารัก",
  นักเรียน: "ถุงเท้านักเรียนมี 3 รุ่นค่ะ:\n• ขาวข้อยาว 35 บาท\n• ขาวข้อสั้น 30 บาท\n• กรมท่าข้อยาว 35 บาท",
  สปอร์ต: "ถุงเท้าสปอร์ตของเรามีทั้งสีขาวและดำค่ะ ราคา 45-50 บาท ผลิตจาก Cotton+Polyester กันลื่น นุ่มนวล",
  ส่วนประสม: "ถุงเท้าของเราผลิตจาก Cotton 80-100% ผสม Polyester หรือ Spandex เล็กน้อย ขึ้นอยู่กับรุ่นค่ะ ทุกรุ่นนุ่มสบายและทนทาน",
  ชำระ: "รับชำระผ่าน 💳 พร้อมเพย์ / ธนาคาร / เก็บเงินปลายทาง (COD) ค่ะ",
  จ่าย: "รับชำระผ่าน 💳 พร้อมเพย์ / โอนธนาคาร / เก็บเงินปลายทาง (COD) ค่ะ",
  ส่ง: "ค่าส่ง 50 บาท ส่งทั่วประเทศ ผ่าน Kerry / J&T ค่ะ",
  ใหม่: "เมนูใหม่ล่าสุด! 🆕\n• ถุงเท้านักเรียนขาว ข้อสั้น\n• ถุงเท้าขาว สปอร์ต\n• ถุงเท้าลายดอกไม้\n• ถุงเท้าดำ สปอร์ต",
  แนะนำ: "ขายดีที่สุดตอนนี้คือ ✨ ถุงเท้านักเรียนขาว ข้อยาว และ ถุงเท้าดำ ข้อยาว ค่ะ",
  สวัสดี: "สวัสดีค่ะ! 👋 ยินดีต้อนรับสู่ร้าน Everyday-Pairs ร้านถุงเท้าออนไลน์ เปิด 09:00-18:00 น. มีอะไรให้ช่วยไหมคะ?",
  hello: "สวัสดีค่ะ! 👋 ยินดีต้อนรับสู่ร้าน Everyday-Pairs มีอะไรให้ช่วยไหมคะ?",
  hi: "สวัสดีค่ะ! 👋 มีอะไรให้ช่วยสอบถามได้เลยนะคะ",
};

const adminResponses: Record<string, string> = {
  ยอด: "ยอดขายวันนี้ (17 พ.ค. 2026) 💰\n• รายได้รวม: 3,800 บาท\n• จำนวนออเดอร์: 56 ออเดอร์\n• เฉลี่ย/ออเดอร์: 67.86 บาท",
  วันนี้: "สรุปยอดวันนี้ 📊\n• รายได้: 3,800 บาท\n• ออเดอร์: 56 รายการ\n• ขายดีสุด: ถุงเท้านักเรียนขาว ข้อยาว (45 คู่)",
  เดือน: "ยอดขายเดือนพฤษภาคม 2026 📈\n• รายได้รวม: 14,300 บาท\n• จำนวนออเดอร์: 198 ออเดอร์\n• เฉลี่ย/ออเดอร์: 72.22 บาท",
  ออเดอร์: "ออเดอร์ที่รอดำเนินการ: 3 ออเดอร์\n• EP-001: คุณสมหญิง (185 บาท) - ยืนยันแล้ว\n• EP-002: คุณมานะ (90 บาท) - จัดส่งแล้ว\n• EP-003: คุณวิภา (185 บาท) - รอยืนยัน",
  caption: "ได้เลยค่ะ! 🎨 กรุณาระบุชื่อสินค้าที่ต้องการสร้าง caption ค่ะ เช่น พิมพ์ว่า 'caption: ถุงเท้านักเรียน'",
  "caption:": "ได้เลยค่ะ! นี่คือ 3 สไตล์:\n\n😊 Cute: \"สาวน้อยสไตล์คิ้วท์ ต้องมีถุงเท้าสุดน่ารักไว้ใส่ทุกวัน!\"\n\n⚪ Minimal: \"ความเรียบง่ายที่ลงตัว ถุงเท้าคุณภาพดี ราคาเข้าถึงได้\"\n\n✌️ Gen-Z: \"no cap นี่คือถุงเท้าที่ aesthetic สุดๆ เอาไปลง IG ได้เลย fr fr 🔥\"",
  สต็อก: "สินค้าใกล้หมด ⚠️\n• ถุงเท้าลายดอกไม้: เหลือ 45 คู่\n• ถุงเท้านักเรียนกรมท่า: เหลือ 80 คู่\n• ถุงเท้าขาว ลูกไม้: เหลือ 60 คู่",
  แจ้งเตือน: "ตั้งค่าการแจ้งเตือนผ่าน Telegram แล้วค่ะ 🔔 ระบบจะส่งสรุปยอดประจำวันทุก 00:05 น.",
  สรุป: "สรุปประจำวัน 📋\n✅ ออเดอร์วันนี้: 56 รายการ\n💰 รายได้: 3,800 บาท\n🏆 ขายดีสุด: ถุงเท้านักเรียนขาว\n⚠️ ใกล้หมด: ถุงเท้าลายดอกไม้",
  สวัสดี: "สวัสดีค่ะ แอดมิน! 👋 วันนี้มียอดขาย 3,800 บาท จาก 56 ออเดอร์ค่ะ มีอะไรให้ช่วยไหม?",
};

function getBotResponse(text: string, mode: "customer" | "admin"): string {
  const lower = text.toLowerCase();
  const responses = mode === "customer" ? customerResponses : adminResponses;

  for (const key of Object.keys(responses)) {
    if (lower.includes(key)) return responses[key];
  }

  if (mode === "customer") {
    return "ขอบคุณสำหรับคำถามค่ะ ✨ สามารถสอบถามเรื่อง เวลาเปิดปิดร้าน, ราคาสินค้า, เมนูแนะนำ, วิธีชำระเงิน และเมนูใหม่ได้เลยนะคะ!";
  }
  return "สามารถสอบถาม ยอดขาย, ออเดอร์, สต็อกสินค้า, สรุปรายเดือน หรือขอ caption โปรโมชันได้เลยนะคะ!";
}

interface AIChatPopupProps {
  mode: "customer" | "admin";
}

export function AIChatPopup({ mode }: AIChatPopupProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "0",
      role: "bot",
      text:
        mode === "customer"
          ? "สวัสดีค่ะ! 👋 ยินดีต้อนรับสู่ร้าน Everyday-Pairs ร้านถุงเท้าออนไลน์ เปิด 09:00-18:00 น. สอบถามได้เลยนะคะ"
          : "สวัสดีค่ะ แอดมิน! 👋 วันนี้มียอดขาย 3,800 บาท จาก 56 ออเดอร์ค่ะ มีอะไรให้ช่วยไหม?",
    },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", text: input };
    const botMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: "bot",
      text: getBotResponse(input, mode),
    };
    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput("");
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110"
        style={{ backgroundColor: "#778873" }}
        title="AI Assistant"
      >
        <Bot size={26} color="white" />
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-[#D2DCB6]" style={{ height: 420, backgroundColor: "#ffffff" }}>
          <div className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: "#778873" }}>
            <div className="flex items-center gap-2">
              <Bot size={20} color="white" />
              <span className="text-white text-sm font-medium">
                {mode === "customer" ? "AI ช่วยเหลือลูกค้า" : "AI สำหรับแอดมิน"}
              </span>
            </div>
            <button onClick={() => setOpen(false)} className="text-white hover:opacity-80">
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ backgroundColor: "#F1F3E0" }}>
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "bot" && (
                  <div className="w-7 h-7 rounded-full flex items-center justify-center mr-1 shrink-0" style={{ backgroundColor: "#A1BC98" }}>
                    <Bot size={14} color="white" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] px-3 py-2 rounded-2xl text-xs whitespace-pre-wrap leading-relaxed ${
                    msg.role === "user"
                      ? "text-white rounded-br-sm"
                      : "rounded-bl-sm"
                  }`}
                  style={
                    msg.role === "user"
                      ? { backgroundColor: "#778873" }
                      : { backgroundColor: "#ffffff", color: "#4a5c44" }
                  }
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="flex items-center gap-2 p-3 border-t border-[#D2DCB6] bg-white">
            <input
              type="text"
              className="flex-1 text-xs px-3 py-2 rounded-full outline-none border border-[#D2DCB6] focus:border-[#A1BC98]"
              placeholder="พิมพ์ข้อความ..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
            />
            <button
              onClick={send}
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: "#778873" }}
            >
              <Send size={14} color="white" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
