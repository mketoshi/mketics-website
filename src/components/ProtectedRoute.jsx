import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

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
      <main className="grid min-h-screen place-items-center bg-slate-950 text-white">
        <p className="text-xl font-black">
          Verifying secure access...
        </p>
      </main>
    );
  }

  if (!allowed) return null;

  return children;
}