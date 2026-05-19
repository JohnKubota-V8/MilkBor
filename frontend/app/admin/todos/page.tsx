import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { AdminLayout } from "@/app/components/AdminLayout";

export default async function Page() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: todos } = await supabase.from("todos").select();

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div>
          <h1 style={{ color: "#4a5c44" }}>Todos</h1>
          <p className="text-sm" style={{ color: "#9ca3af" }}>รายการจาก Supabase</p>
        </div>
        <div className="bg-white rounded-2xl p-4" style={{ border: "1px solid #E8EED4" }}>
          {todos && todos.length > 0 ? (
            <ul className="space-y-2">
              {todos.map((todo) => (
                <li key={todo.id} className="text-sm" style={{ color: "#4a5c44" }}>
                  {todo.name}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm" style={{ color: "#9ca3af" }}>ยังไม่มีข้อมูล</p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
