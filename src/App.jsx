import "./App.css";

import { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";

import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Services from "./pages/Services";
import Portfolio from "./pages/Portfolio";
import Contact from "./pages/Contact";
import MketicsDigitalHub from "./pages/MketicsDigitalHub";

import ClientLogin from "./pages/ClientLogin";
import ClientRegister from "./pages/ClientRegister";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ClientPortal from "./pages/ClientPortal";
import ProposalApproval from "./pages/ProposalApproval";

import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

const ADMIN_EMAILS = [
  "smsane0505@gmail.com",
  "admin@mketics.co.za",
];

function App() {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);

  const path = window.location.pathname;

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });

    const { data: listener } =
      supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
      });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const seo = {
      "/": {
        title: "MKETICS | Enterprise Technology Solutions",
        description:
          "MKETICS provides enterprise software systems, IT infrastructure, cloud solutions, networking, CCTV systems, and digital business platforms.",
      },
      "/services": {
        title: "Services | MKETICS",
        description:
          "Explore MKETICS software development, networking infrastructure, cloud systems, digital platforms, and enterprise technology services.",
      },
      "/portfolio": {
        title: "Portfolio | MKETICS",
        description:
          "View MKETICS technology projects, infrastructure deployments, software systems, and digital business solutions.",
      },
      "/contact": {
        title: "Contact MKETICS",
        description:
          "Contact MKETICS for software systems, networking infrastructure, cloud solutions, and digital transformation services.",
      },
      "/mketics-digital-hub": {
        title: "MKETICS Digital Hub",
        description:
          "Digital branding, websites, SEO, online business systems, and modern digital experiences.",
      },
      "/client-login": {
        title: "Client Login | MKETICS",
        description:
          "Secure MKETICS client portal login for projects, invoices, and support.",
      },
      "/client-register": {
        title: "Create Client Account | MKETICS",
        description:
          "Create a secure MKETICS client account to access projects, invoices, and support.",
      },
      "/forgot-password": {
        title: "Forgot Password | MKETICS",
        description:
          "Recover access to your MKETICS client portal account.",
      },
      "/reset-password": {
        title: "Reset Password | MKETICS",
        description:
          "Reset your MKETICS client portal password securely.",
      },
      "/client-portal": {
        title: "Client Portal | MKETICS",
        description:
          "Access your MKETICS projects, invoices, and support requests.",
      },
      "/admin": {
        title: "Admin | MKETICS",
        description:
          "Restricted MKETICS internal operations dashboard.",
      },
    };

    const current = seo[path] || seo["/"];

    document.title = current.title;

    const meta = document.querySelector(
      'meta[name="description"]'
    );

    if (meta) {
      meta.setAttribute("content", current.description);
    }
  }, [path]);

  if (checking) {
    return (
      <main className="grid min-h-screen place-items-center app-bg">
        <div className="text-center">
          <img
            src="/images/logo-icon.webp?v=2"
            alt="MKETICS"
            className="mx-auto h-16 w-16 animate-pulse object-contain"
          />

          <p className="mt-5 text-lg font-bold app-muted">
            Loading MKETICS...
          </p>
        </div>
      </main>
    );
  }

  if (path === "/services") {
    return <Services />;
  }

  if (path === "/portfolio") {
    return <Portfolio />;
  }

  if (path === "/contact") {
    return <Contact />;
  }

  if (path === "/mketics-digital-hub") {
    return <MketicsDigitalHub />;
  }

  if (path === "/client-portal") {
    return (
      <ProtectedRoute>
        <ClientPortal />
      </ProtectedRoute>
    );
  }

  if (path === "/client-register") {
    return <ClientRegister />;
  }

  if (path === "/forgot-password") {
    return <ForgotPassword />;
  }

  if (path === "/reset-password") {
    return <ResetPassword />;
  }

  if (path === "/client-portal") {
    return <ClientPortal />;
  }

  if (path === "/proposal-approval") {
    return <ProposalApproval />;
  }

  if (path === "/admin") {
    if (!session) {
      return <AdminLogin />;
    }

    if (!ADMIN_EMAILS.includes(session.user?.email)) {
      return (
        <main className="flex min-h-screen items-center justify-center app-bg px-4">
          <div className="w-full max-w-md rounded-[2rem] app-card p-8 text-center shadow-2xl">
            <img
              src="/images/logo-icon.webp?v=2"
              alt="MKETICS"
              className="mx-auto h-16 w-16 object-contain"
            />

            <h1 className="mt-6 text-3xl font-black text-red-500">
              Access Denied
            </h1>

            <p className="mt-4 app-muted">
              This page is restricted to authorized MKETICS
              administrators only.
            </p>

            <a
              href="/"
              className="mt-6 inline-flex rounded-full bg-sky-500 px-6 py-3 font-black text-white"
            >
              Back to MKETICS
            </a>
          </div>
        </main>
      );
    }

    return (
  <ProtectedRoute requiredRole="admin">
    <AdminDashboard />
  </ProtectedRoute>
);
  }

  return <Home />;
}

export default App;