const ADMIN_EMAILS = [
  "smsane0505@gmail.com",
  "admin@mketics.co.za"
];

import "./App.css";
import { useEffect, useState } from "react";
import Home from "./pages/Home";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import { supabase } from "./lib/supabaseClient";

function App() {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);

  const isAdminRoute = window.location.pathname === "/admin";

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (checking) return null;

const ADMIN_EMAIL = "smsane0505@gmail.com";

if (isAdminRoute) {
  if (!session) {
    return <AdminLogin onLogin={() => window.location.reload()} />;
  }

  if (session.user?.email !== ADMIN_EMAIL) {
    return (
      <main className="min-h-[100svh] flex items-center justify-center bg-slate-950 px-4 text-white">
        <div className="max-w-md rounded-[2rem] border border-red-500/20 bg-red-500/10 p-8 text-center">
          <h1 className="text-2xl font-black">Access denied</h1>
          <p className="mt-3 text-red-100">
            This dashboard is restricted to the MKETICS admin account.
          </p>
        </div>
      </main>
    );
  }

  return <AdminDashboard />;
}

  return <Home />;
}

export default App;