"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function Page() {
  const supabase = createClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (authError) {
      setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      return;
    }
    router.push("/admin/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#F1F3E0" }}>
      <div className="w-full max-w-sm">
        <Link href="/" className="inline-flex items-center gap-1 text-sm mb-6" style={{ color: "#778873" }}>
          <ArrowLeft size={15} /> กลับหน้าหลัก
        </Link>

        <div className="bg-white rounded-2xl shadow-sm p-8" style={{ border: "1px solid #D2DCB6" }}>
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center text-white text-xl font-bold mb-3" style={{ backgroundColor: "#778873" }}>
              EP
            </div>
            <h1 className="text-lg font-semibold" style={{ color: "#4a5c44" }}>Admin Login</h1>
            <p className="text-sm" style={{ color: "#9ca3af" }}>สำหรับผู้ดูแลระบบเท่านั้น</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm mb-1.5" style={{ color: "#4a5c44" }}>อีเมล</label>
              <input
                type="email"
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border transition-colors"
                style={{ borderColor: "#D2DCB6" }}
                placeholder="admin@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1.5" style={{ color: "#4a5c44" }}>รหัสผ่าน</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  className="w-full px-4 py-2.5 pr-10 rounded-xl text-sm outline-none border transition-colors"
                  style={{ borderColor: "#D2DCB6" }}
                  placeholder="รหัสผ่าน"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? <EyeOff size={16} color="#9ca3af" /> : <Eye size={16} color="#9ca3af" />}
                </button>
              </div>
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl text-sm font-medium transition-opacity hover:opacity-90 text-white"
              style={{ backgroundColor: "#778873" }}
            >
              เข้าสู่ระบบแอดมิน
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
