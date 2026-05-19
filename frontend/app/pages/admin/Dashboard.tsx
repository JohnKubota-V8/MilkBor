"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { hourlySales, topSelling, recentOrders } from "../../data/mockData";
import { TrendingUp, ShoppingBag, DollarSign, Package } from "lucide-react";

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: "#fff3cd", text: "#856404", label: "รอยืนยัน" },
  confirmed: { bg: "#D2DCB6", text: "#4a5c44", label: "ยืนยันแล้ว" },
  shipped: { bg: "#cce5ff", text: "#004085", label: "จัดส่งแล้ว" },
  delivered: { bg: "#d4edda", text: "#155724", label: "ส่งถึงแล้ว" },
  cancelled: { bg: "#f8d7da", text: "#721c24", label: "ยกเลิก" },
};

export function Dashboard() {
  const todaySales = hourlySales.reduce((s, h) => s + h.sales, 0);
  const todayOrders = hourlySales.reduce((s, h) => s + h.orders, 0);
  const avgPerOrder = Math.round(todaySales / todayOrders);

  const statCards = [
    { label: "ยอดขายวันนี้", value: `${todaySales.toLocaleString()} ฿`, icon: DollarSign, color: "#778873" },
    { label: "จำนวนออเดอร์", value: `${todayOrders} ออเดอร์`, icon: ShoppingBag, color: "#A1BC98" },
    { label: "เฉลี่ย/ออเดอร์", value: `${avgPerOrder} ฿`, icon: TrendingUp, color: "#D2DCB6" },
    { label: "สินค้าทั้งหมด", value: "10 รายการ", icon: Package, color: "#F1F3E0" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 style={{ color: "#4a5c44" }}>แดชบอร์ด</h1>
        <p className="text-sm" style={{ color: "#9ca3af" }}>17 พฤษภาคม 2026 | ข้อมูลล่าสุด 23:59 น.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-5" style={{ border: "1px solid #E8EED4" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: color }}>
              <Icon size={18} style={{ color: color === "#F1F3E0" ? "#778873" : "white" }} />
            </div>
            <p className="text-sm" style={{ color: "#9ca3af" }}>{label}</p>
            <p className="font-semibold text-lg" style={{ color: "#4a5c44" }}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid #E8EED4" }}>
          <h3 className="mb-4" style={{ color: "#4a5c44" }}>ยอดขายรายชั่วโมง</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={hourlySales} barSize={32}>
              <XAxis dataKey="hour" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
                formatter={(v: number) => [`${v} ฿`, "ยอดขาย"]}
              />
              <Bar dataKey="sales" radius={[6, 6, 0, 0]}>
                {hourlySales.map((_, i) => (
                  <Cell key={i} fill={i === 2 ? "#778873" : "#D2DCB6"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid #E8EED4" }}>
          <h3 className="mb-4" style={{ color: "#4a5c44" }}>ถุงเท้าขายดีวันนี้</h3>
          <div className="space-y-3">
            {topSelling.map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span style={{ color: "#4a5c44" }}>{item.name}</span>
                  <span style={{ color: "#778873" }}>{item.sold} คู่</span>
                </div>
                <div className="h-2 rounded-full" style={{ backgroundColor: "#F1F3E0" }}>
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{ width: `${item.percentage}%`, backgroundColor: i === 0 ? "#778873" : "#A1BC98" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid #E8EED4" }}>
        <div className="px-5 py-4" style={{ borderBottom: "1px solid #E8EED4" }}>
          <h3 style={{ color: "#4a5c44" }}>ออเดอร์ล่าสุด</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: "#F1F3E0" }}>
                {["เวลา", "ออเดอร์", "ลูกค้า", "รายการ", "ราคา", "สถานะ"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium" style={{ color: "#6b7280" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "#E8EED4" }}>
              {recentOrders.slice(0, 5).map((order) => {
                const s = statusColors[order.status];
                return (
                  <tr key={order.id} className="hover:bg-[#fafafa] transition-colors">
                    <td className="px-5 py-3 text-sm" style={{ color: "#9ca3af" }}>{order.time}</td>
                    <td className="px-5 py-3 text-sm font-medium" style={{ color: "#4a5c44" }}>{order.orderNumber}</td>
                    <td className="px-5 py-3 text-sm" style={{ color: "#4a5c44" }}>{order.customer}</td>
                    <td className="px-5 py-3 text-sm" style={{ color: "#6b7280" }}>{order.items.map((i) => i.name.slice(0, 10)).join(", ")}</td>
                    <td className="px-5 py-3 text-sm font-medium" style={{ color: "#778873" }}>{order.total} ฿</td>
                    <td className="px-5 py-3">
                      <span className="px-2.5 py-1 rounded-full text-xs" style={{ backgroundColor: s.bg, color: s.text }}>
                        {s.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
