"use client";

import { useState } from "react";
import { Save, Bell, Store, Clock, Truck, MessageSquare } from "lucide-react";

function SettingsSection({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid #E8EED4" }}>
      <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom: "1px solid #E8EED4" }}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#F1F3E0" }}>
          <Icon size={16} style={{ color: "#778873" }} />
        </div>
        <h3 style={{ color: "#4a5c44" }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

function SettingsField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="block text-xs mb-1.5" style={{ color: "#6b7280" }}>{label}</label>
      {children}
    </div>
  );
}

export function Settings() {
  const [saved, setSaved] = useState(false);
  const [storeName, setStoreName] = useState("Everyday-Pairs");
  const [storeDesc, setStoreDesc] = useState("ร้านถุงเท้าออนไลน์ เปิด 09:00-18:00 น. ทุกวัน");
  const [openTime, setOpenTime] = useState("09:00");
  const [closeTime, setCloseTime] = useState("18:00");
  const [shippingFee, setShippingFee] = useState("50");
  const [freeShippingQty, setFreeShippingQty] = useState("3");
  const [telegramToken, setTelegramToken] = useState("YOUR_BOT_TOKEN");
  const [telegramChatId, setTelegramChatId] = useState("YOUR_CHAT_ID");
  const [alertTime, setAlertTime] = useState("00:05");
  const [notifyNewOrder, setNotifyNewOrder] = useState(true);
  const [notifyDaily, setNotifyDaily] = useState(true);
  const [notifyLowStock, setNotifyLowStock] = useState(true);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const inputClass = "w-full px-3 py-2.5 rounded-xl text-sm outline-none border";
  const inputStyle = { borderColor: "#D2DCB6" };

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ color: "#4a5c44" }}>ตั้งค่าร้านค้า</h1>
          <p className="text-sm" style={{ color: "#9ca3af" }}>จัดการการตั้งค่าทั่วไปของร้าน</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium text-white transition-all"
          style={{ backgroundColor: saved ? "#A1BC98" : "#778873" }}
        >
          <Save size={15} />
          {saved ? "บันทึกแล้ว ✓" : "บันทึก"}
        </button>
      </div>

      <SettingsSection icon={Store} title="ข้อมูลร้านค้า">
        <SettingsField label="ชื่อร้าน">
          <input className={inputClass} style={inputStyle} value={storeName} onChange={(e) => setStoreName(e.target.value)} />
        </SettingsField>
        <SettingsField label="คำอธิบายร้าน">
          <textarea
            className={`${inputClass} resize-none`}
            style={inputStyle}
            rows={2}
            value={storeDesc}
            onChange={(e) => setStoreDesc(e.target.value)}
          />
        </SettingsField>
      </SettingsSection>

      <SettingsSection icon={Clock} title="เวลาเปิด-ปิดร้าน">
        <div className="grid grid-cols-2 gap-4">
          <SettingsField label="เวลาเปิด">
            <input type="time" className={inputClass} style={inputStyle} value={openTime} onChange={(e) => setOpenTime(e.target.value)} />
          </SettingsField>
          <SettingsField label="เวลาปิด">
            <input type="time" className={inputClass} style={inputStyle} value={closeTime} onChange={(e) => setCloseTime(e.target.value)} />
          </SettingsField>
        </div>
      </SettingsSection>

      <SettingsSection icon={Truck} title="การจัดส่ง">
        <div className="grid grid-cols-2 gap-4">
          <SettingsField label="ค่าจัดส่ง (฿)">
            <input type="number" className={inputClass} style={inputStyle} value={shippingFee} onChange={(e) => setShippingFee(e.target.value)} />
          </SettingsField>
          <SettingsField label="ฟรีค่าส่งเมื่อสั่ง (คู่)">
            <input type="number" className={inputClass} style={inputStyle} value={freeShippingQty} onChange={(e) => setFreeShippingQty(e.target.value)} />
          </SettingsField>
        </div>
      </SettingsSection>

      <SettingsSection icon={MessageSquare} title="Telegram Bot (แจ้งเตือน)">
        <SettingsField label="Bot Token">
          <input className={inputClass} style={inputStyle} value={telegramToken} onChange={(e) => setTelegramToken(e.target.value)} placeholder="bot_token_here" />
        </SettingsField>
        <SettingsField label="Chat ID">
          <input className={inputClass} style={inputStyle} value={telegramChatId} onChange={(e) => setTelegramChatId(e.target.value)} placeholder="chat_id" />
        </SettingsField>
        <SettingsField label="เวลาส่งสรุปยอดรายวัน">
          <input type="time" className={inputClass} style={inputStyle} value={alertTime} onChange={(e) => setAlertTime(e.target.value)} />
        </SettingsField>
      </SettingsSection>

      <SettingsSection icon={Bell} title="การแจ้งเตือน">
        <div className="space-y-3">
          {[
            { label: "แจ้งเตือนเมื่อมีออเดอร์ใหม่", desc: "รับแจ้งเตือนทันทีผ่าน Telegram", value: notifyNewOrder, onChange: setNotifyNewOrder },
            { label: "สรุปยอดประจำวัน", desc: `ส่งรายงานสรุปทุกวันเวลา ${alertTime} น.`, value: notifyDaily, onChange: setNotifyDaily },
            { label: "แจ้งเตือนสินค้าใกล้หมด", desc: "แจ้งเตือนเมื่อสต็อกเหลือน้อยกว่า 20 คู่", value: notifyLowStock, onChange: setNotifyLowStock },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: "#F1F3E0" }}>
              <div>
                <p className="text-sm" style={{ color: "#4a5c44" }}>{item.label}</p>
                <p className="text-xs" style={{ color: "#9ca3af" }}>{item.desc}</p>
              </div>
              <button
                onClick={() => item.onChange(!item.value)}
                className="w-12 h-6 rounded-full transition-colors relative"
                style={{ backgroundColor: item.value ? "#778873" : "#D2DCB6" }}
              >
                <span
                  className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all"
                  style={{ left: item.value ? "26px" : "2px" }}
                />
              </button>
            </div>
          ))}
        </div>
      </SettingsSection>

      <div className="p-4 rounded-2xl text-xs" style={{ backgroundColor: "#F1F3E0", color: "#6b7280" }}>
        <p className="font-medium mb-1" style={{ color: "#4a5c44" }}>API Keys</p>
        <p>• GITHUB_MODEL_API_KEY — สำหรับ LLM chatbot</p>
        <p>• GOOGLE_AI_API_KEY — สำหรับ AI ทางเลือก</p>
        <p>• SUPABASE_URL / SUPABASE_ANON_KEY — ฐานข้อมูล</p>
        <p className="mt-1 text-xs" style={{ color: "#A1BC98" }}>ตั้งค่าผ่าน environment variables (.env)</p>
      </div>
    </div>
  );
}
