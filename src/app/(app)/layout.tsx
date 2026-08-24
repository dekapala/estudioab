import { createClient } from "@/lib/supabase/server";
import { logout } from "@/lib/auth-actions";
import { NavTabs } from "@/components/NavTabs";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let fullName = user?.email ?? "";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle();
    if (profile?.full_name) fullName = profile.full_name;
  }

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <span className="eyebrow">Beta funcional · v1</span>
            <h1>Sistema de gestión de casos</h1>
          </div>
          <NavTabs />
        </div>
        <div className="topbar-inner" style={{ paddingBottom: 8 }}>
          <span className="user-chip">
            {fullName}
            <form action={logout}>
              <button type="submit">salir</button>
            </form>
          </span>
        </div>
      </header>
      <div className="page">{children}</div>
    </>
  );
}
