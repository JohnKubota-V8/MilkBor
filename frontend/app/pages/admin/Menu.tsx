"use client";

import { useState } from "react";
import { products as initialProducts, Product } from "../../data/mockData";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";

const categoryLabels: Record<string, string> = {
  student: "ถุงเท้านักเรียน",
  white: "ถุงเท้าขาว",
  black: "ถุงเท้าดำ",
  other: "ถุงเท้าลาย",
};

function SockBadge({ color }: { color: string }) {
  return (
    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#F1F3E0" }}>
      <svg width={28} height={28} viewBox="0 0 48 48" fill="none">
        <path d="M18 6 L18 28 C18 36 26 42 32 38 L38 34 C42 30 40 24 36 26 L30 29 L30 6 Z" fill={color} stroke="#ccc" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function ProductFormModal({
  product,
  onSave,
  onClose,
}: {
  product: Partial<Product>;
  onSave: (p: Product) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Partial<Product>>({
    name: "",
    price: 0,
    category: "student",
    description: "",
    material: "Cotton 100%",
    isNew: false,
    isFeatured: false,
    sockColor: "#f5f5f5",
    bgColor: "#F1F3E0",
    stock: 100,
    sizes: ["S", "M", "L"],
    ...product,
  });

  const handleSave = () => {
    if (!form.name || !form.price) return;
    onSave({
      id: product.id || Date.now().toString(),
      name: form.name!,
      price: form.price!,
      category: form.category as Product["category"],
      description: form.description || "",
      material: form.material || "Cotton 100%",
      isNew: form.isNew || false,
      isFeatured: form.isFeatured || false,
      sockColor: form.sockColor || "#f5f5f5",
      bgColor: form.bgColor || "#F1F3E0",
      stock: form.stock || 0,
      sizes: form.sizes || ["M"],
      originalPrice: form.originalPrice,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-3xl p-6 w-full max-w-md shadow-xl overflow-y-auto max-h-[90vh]" style={{ border: "1px solid #D2DCB6" }}>
        <div className="flex justify-between items-center mb-5">
          <h3 style={{ color: "#4a5c44" }}>{product.id ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}</h3>
          <button onClick={onClose}><X size={18} /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs mb-1" style={{ color: "#6b7280" }}>ชื่อสินค้า</label>
            <input
              className="w-full px-3 py-2 rounded-xl text-sm outline-none border"
              style={{ borderColor: "#D2DCB6" }}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs mb-1" style={{ color: "#6b7280" }}>ราคา (฿)</label>
              <input
                type="number"
                className="w-full px-3 py-2 rounded-xl text-sm outline-none border"
                style={{ borderColor: "#D2DCB6" }}
                value={form.price}
                onChange={(e) => setForm({ ...form, price: +e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: "#6b7280" }}>ราคาเดิม (ถ้ามี)</label>
              <input
                type="number"
                className="w-full px-3 py-2 rounded-xl text-sm outline-none border"
                style={{ borderColor: "#D2DCB6" }}
                value={form.originalPrice || ""}
                onChange={(e) => setForm({ ...form, originalPrice: e.target.value ? +e.target.value : undefined })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs mb-1" style={{ color: "#6b7280" }}>หมวดหมู่</label>
            <select
              className="w-full px-3 py-2 rounded-xl text-sm outline-none border bg-white"
              style={{ borderColor: "#D2DCB6" }}
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as Product["category"] })}
            >
              {Object.entries(categoryLabels).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs mb-1" style={{ color: "#6b7280" }}>คำอธิบาย</label>
            <textarea
              className="w-full px-3 py-2 rounded-xl text-sm outline-none border resize-none"
              style={{ borderColor: "#D2DCB6" }}
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs mb-1" style={{ color: "#6b7280" }}>วัสดุ</label>
              <input
                className="w-full px-3 py-2 rounded-xl text-sm outline-none border"
                style={{ borderColor: "#D2DCB6" }}
                value={form.material}
                onChange={(e) => setForm({ ...form, material: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: "#6b7280" }}>สต็อก (คู่)</label>
              <input
                type="number"
                className="w-full px-3 py-2 rounded-xl text-sm outline-none border"
                style={{ borderColor: "#D2DCB6" }}
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: +e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: "#4a5c44" }}>
              <input type="checkbox" className="accent-[#778873]" checked={form.isNew} onChange={(e) => setForm({ ...form, isNew: e.target.checked })} />
              สินค้าใหม่
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: "#4a5c44" }}>
              <input type="checkbox" className="accent-[#778873]" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />
              สินค้าแนะนำ
            </label>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full mt-5 py-3 rounded-xl font-medium text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#778873" }}
        >
          <Check size={16} /> บันทึก
        </button>
      </div>
    </div>
  );
}

export function Menu() {
  const [items, setItems] = useState<Product[]>(initialProducts);
  const [modalProduct, setModalProduct] = useState<Partial<Product> | null>(null);

  const handleSave = (p: Product) => {
    setItems((prev) => {
      const exists = prev.find((i) => i.id === p.id);
      if (exists) return prev.map((i) => (i.id === p.id ? p : i));
      return [...prev, p];
    });
    setModalProduct(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("ยืนยันลบสินค้านี้?")) {
      setItems((prev) => prev.filter((i) => i.id !== id));
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ color: "#4a5c44" }}>จัดการสินค้า</h1>
          <p className="text-sm" style={{ color: "#9ca3af" }}>สินค้าทั้งหมด {items.length} รายการ</p>
        </div>
        <button
          onClick={() => setModalProduct({})}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white"
          style={{ backgroundColor: "#778873" }}
        >
          <Plus size={15} /> เพิ่มสินค้า
        </button>
      </div>

      <div className="bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid #E8EED4" }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: "#F1F3E0" }}>
                {["สินค้า", "หมวดหมู่", "ราคา", "สต็อก", "สถานะ", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium" style={{ color: "#6b7280" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "#E8EED4" }}>
              {items.map((p) => (
                <tr key={p.id} className="hover:bg-[#fafafa]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <SockBadge color={p.sockColor} />
                      <div>
                        <p className="text-sm font-medium" style={{ color: "#4a5c44" }}>{p.name}</p>
                        <p className="text-xs" style={{ color: "#9ca3af" }}>{p.material}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: "#6b7280" }}>{categoryLabels[p.category]}</td>
                  <td className="px-4 py-3 text-sm font-medium" style={{ color: "#778873" }}>{p.price} ฿</td>
                  <td className="px-4 py-3 text-sm" style={{ color: p.stock < 50 ? "#ef4444" : "#4a5c44" }}>
                    {p.stock} คู่ {p.stock < 50 && <span className="text-xs">⚠️</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {p.isNew && (
                        <span className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: "#D2DCB6", color: "#4a5c44" }}>ใหม่</span>
                      )}
                      {p.isFeatured && (
                        <span className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: "#F1F3E0", color: "#778873" }}>แนะนำ</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => setModalProduct(p)} className="p-1.5 rounded-lg hover:bg-[#F1F3E0]">
                        <Pencil size={14} style={{ color: "#778873" }} />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg hover:bg-red-50">
                        <Trash2 size={14} color="#ef4444" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalProduct !== null && (
        <ProductFormModal product={modalProduct} onSave={handleSave} onClose={() => setModalProduct(null)} />
      )}
    </div>
  );
}
