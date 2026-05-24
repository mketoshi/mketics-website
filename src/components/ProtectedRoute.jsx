import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

import {
  ShieldCheck,
  LockKeyhole,
} from "lucide-react";

export default function ProtectedRoute({
  children,
  requiredRole = null,
}) {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      window.location.href = "/client-login";
      return;
    }

    if (!requiredRole) {
      setAllowed(true);
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (!profile) {
      window.location.href = "/";
      return;
    }

    if (profile.role !== requiredRole) {
      window.location.href = "/";
      return;
    }

    setAllowed(true);
    setLoading(false);
  };

  if (loading) {
    return (
      <main className="relative grid min-h-screen place-items-center overflow-hidden app-bg px-4">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute left-10 top-10 h-72 w-72 rounded-full bg-sky-500 blur-3xl" />
          <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-purple-500 blur-3xl" />
        </div>

        <div className="glass-card relative w-full max-w-md rounded-[2.5rem] p-8 text-center shadow-2xl">
          <img
            src="/images/logo-icon.webp?v=2"
            alt="MKETICS"
            className="mx-auto h-16 w-16 animate-pulse object-contain"
          />

          <div className="mx-auto mt-6 grid h-16 w-16 place-items-center rounded-2xl bg-sky-500/10 text-sky-500">
            <ShieldCheck className="h-8 w-8" />
          </div>

          <h1 className="mt-6 text-3xl font-black">
            Verifying Secure Access
          </h1>

          <p className="mt-4 leading-7 app-muted">
            MKETICS is checking your account permissions and protected workspace
            access.
          </p>

          <div className="mt-6 flex items-center justify-center gap-2 text-sm font-black text-sky-500">
            <LockKeyhole className="h-4 w-4" />
            Protected Route
          </div>
        </div>
      </main>
    );
  }

  if (!allowed) return null;

  return children;
}
