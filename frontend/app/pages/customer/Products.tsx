"use client";

import { useState } from "react";
import { products } from "../../data/mockData";
import { useApp } from "../../context/AppContext";
import { ShoppingCart, Search } from "lucide-react";

type Category = "all" | "student" | "white" | "black" | "other";

const categories: { key: Category; label: string }[] = [
  { key: "all", label: "ทั้งหมด" },
  { key: "student", label: "ถุงเท้านักเรียน" },
  { key: "white", label: "ถุงเท้าขาว" },
  { key: "black", label: "ถุงเท้าดำ" },
  { key: "other", label: "ถุงเท้าลาย" },
];

function SockIcon({ color, size = 48 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <path d="M18 6 L18 28 C18 36 26 42 32 38 L38 34 C42 30 40 24 36 26 L30 29 L30 6 Z" fill={color} stroke="#ccc" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function AddToCartModal({ product, onClose }: { product: (typeof products)[0]; onClose: () => void }) {
  const { addToCart } = useApp();
  const [size, setSize] = useState(product.sizes[0]);

  const handleAdd = () => {
    addToCart(product, size);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl" style={{ border: "1px solid #D2DCB6" }}>
        <div className="h-32 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: product.bgColor }}>
          <SockIcon color={product.sockColor} size={72} />
        </div>
        <h3 className="mb-1" style={{ color: "#4a5c44" }}>{product.name}</h3>
        <p className="text-xs mb-1" style={{ color: "#9ca3af" }}>{product.material}</p>
        <p className="text-xs mb-4" style={{ color: "#6b7280" }}>{product.description}</p>

        <div className="mb-4">
          <p className="text-sm mb-2" style={{ color: "#4a5c44" }}>เลือกขนาด</p>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className="px-4 py-1.5 rounded-full text-sm border transition-all"
                style={{
                  borderColor: size === s ? "#778873" : "#D2DCB6",
                  backgroundColor: size === s ? "#778873" : "transparent",
                  color: size === s ? "white" : "#6b7280",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-lg font-semibold" style={{ color: "#778873" }}>{product.price} ฿</span>
            {product.originalPrice && (
              <span className="text-xs line-through ml-2" style={{ color: "#9ca3af" }}>{product.originalPrice} ฿</span>
            )}
          </div>
          <span className="text-xs" style={{ color: "#A1BC98" }}>คงเหลือ {product.stock} คู่</span>
        </div>

        <button
          onClick={handleAdd}
          className="w-full py-3 rounded-xl font-medium text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#778873" }}
        >
          <ShoppingCart size={16} /> เพิ่มลงตะกร้า
        </button>
      </div>
    </div>
  );
}

export function Products() {
  const [category, setCategory] = useState<Category>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<(typeof products)[0] | null>(null);

  const filtered = products.filter((p) => {
    const matchCat = category === "all" || p.category === category;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="mb-2" style={{ color: "#4a5c44" }}>สินค้าทั้งหมด</h1>
      <p className="text-sm mb-6" style={{ color: "#9ca3af" }}>พบสินค้า {filtered.length} รายการ</p>

      <div className="relative mb-5">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "#9ca3af" }} />
        <input
          type="text"
          placeholder="ค้นหาสินค้า..."
          className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none bg-white border"
          style={{ borderColor: "#D2DCB6" }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex gap-2 flex-wrap mb-6">
        {categories.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setCategory(key)}
            className="px-4 py-2 rounded-full text-sm transition-all"
            style={{
              backgroundColor: category === key ? "#778873" : "white",
              color: category === key ? "white" : "#6b7280",
              border: `1px solid ${category === key ? "#778873" : "#D2DCB6"}`,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {filtered.map((p) => (
          <div
            key={p.id}
            onClick={() => setSelected(p)}
            className="bg-white rounded-2xl overflow-hidden shadow-sm border cursor-pointer transition-shadow hover:shadow-md"
            style={{ borderColor: "#E8EED4" }}
          >
            <div className="h-32 flex items-center justify-center relative" style={{ backgroundColor: p.bgColor }}>
              <SockIcon color={p.sockColor} size={64} />
              {p.isNew && (
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs text-white" style={{ backgroundColor: "#A1BC98" }}>ใหม่</span>
              )}
              {p.originalPrice && (
                <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs text-white" style={{ backgroundColor: "#ef4444" }}>
                  ลด {Math.round((1 - p.price / p.originalPrice) * 100)}%
                </span>
              )}
            </div>
            <div className="p-3">
              <p className="text-sm font-medium leading-tight mb-2" style={{ color: "#4a5c44" }}>{p.name}</p>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold" style={{ color: "#778873" }}>{p.price} ฿</span>
                  {p.originalPrice && (
                    <span className="text-xs line-through ml-1" style={{ color: "#9ca3af" }}>{p.originalPrice}</span>
                  )}
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setSelected(p); }}
                  className="p-1.5 rounded-full hover:opacity-80"
                  style={{ backgroundColor: "#F1F3E0" }}
                >
                  <ShoppingCart size={14} style={{ color: "#778873" }} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🧦</p>
          <p className="text-sm" style={{ color: "#9ca3af" }}>ไม่พบสินค้าที่ค้นหา</p>
        </div>
      )}

      {selected && <AddToCartModal product={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
