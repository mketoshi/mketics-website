import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import exportInvoicePDF from "../utils/generateInvoicePdf";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import {
  FolderKanban,
  FileText,
  MessageSquare,
  ShieldCheck,
  UserCircle2,
  LogOut,
  Download,
  CreditCard,
} from "lucide-react";

export default function ClientPortal() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        window.location.href = "/client-login";
        return;
      }

      setSession(data.session);

      const email = data.session.user.email;

      const { data: invoiceData } = await supabase
        .from("invoices")
        .select("*")
        .eq("client_email", email)
        .order("created_at", {
          ascending: false,
        });

      setInvoices(invoiceData || []);
      setLoading(false);
    };

    checkSession();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/client-login";
  };

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center app-bg">
        <div className="text-center">
          <img
            src="/images/logo-icon.webp?v=2"
            alt="MKETICS"
            className="mx-auto h-16 w-16 animate-pulse object-contain"
          />

          <p className="mt-5 text-lg font-bold app-muted">
            Loading Client Portal...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen app-bg">
      <Navbar />

      {/* HERO */}
      <section className="mx-auto max-w-7xl px-4 pb-16 pt-32">
        <div className="glass-card rounded-[2rem] p-8 md:p-12">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-sky-500/10 px-4 py-2 text-sm font-bold text-sky-600 dark:text-sky-300">
                <ShieldCheck className="h-4 w-4" />
                Secure Client Access
              </div>

              <h1 className="mt-6 text-4xl font-black md:text-6xl">
                Welcome Back
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-8 app-muted">
                Access your MKETICS projects, invoices,
                support requests, and digital services.
              </p>
            </div>

            <div className="rounded-[2rem] app-surface p-6">
              <div className="flex items-center gap-4">
                <UserCircle2 className="h-14 w-14 text-sky-500" />

                <div>
                  <p className="text-sm app-subtle">
                    Logged in as
                  </p>

                  <p className="max-w-[260px] break-words font-bold">
                    {session?.user?.email}
                  </p>
                </div>
              </div>

              <button
                onClick={logout}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-red-500 px-5 py-3 text-sm font-black text-white transition hover:bg-red-400"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* OVERVIEW */}
      <section className="mx-auto max-w-7xl px-4 pb-10">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <div className="glass-card rounded-[2rem] p-8">
            <div className="mb-6 inline-flex rounded-2xl bg-sky-500/10 p-4 text-sky-500">
              <FolderKanban className="h-8 w-8" />
            </div>

            <h2 className="text-2xl font-black">
              Projects
            </h2>

            <p className="mt-4 leading-8 app-muted">
              Track active projects, deployment progress,
              infrastructure work, and software systems.
            </p>

            <button className="mt-6 rounded-full bg-sky-500 px-5 py-3 text-sm font-black text-white">
              Coming Soon
            </button>
          </div>

          <div className="glass-card rounded-[2rem] p-8">
            <div className="mb-6 inline-flex rounded-2xl bg-sky-500/10 p-4 text-sky-500">
              <FileText className="h-8 w-8" />
            </div>

            <h2 className="text-2xl font-black">
              Invoices
            </h2>

            <p className="mt-4 leading-8 app-muted">
              View invoices, download branded PDF copies,
              and prepare payment references.
            </p>

            <p className="mt-6 text-3xl font-black text-sky-500">
              {invoices.length}
            </p>
          </div>

          <div className="glass-card rounded-[2rem] p-8">
            <div className="mb-6 inline-flex rounded-2xl bg-sky-500/10 p-4 text-sky-500">
              <MessageSquare className="h-8 w-8" />
            </div>

            <h2 className="text-2xl font-black">
              Support
            </h2>

            <p className="mt-4 leading-8 app-muted">
              Contact MKETICS regarding support,
              technical issues, upgrades, or service requests.
            </p>

            <a
              href="https://wa.me/27722864367"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex rounded-full bg-green-500 px-5 py-3 text-sm font-black text-white"
            >
              Contact Support
            </a>
          </div>
        </div>
      </section>

      {/* INVOICES */}
      <section className="mx-auto max-w-7xl px-4 pb-24">
        <div className="glass-card rounded-[2rem] p-6 sm:p-8">
          <div>
            <p className="font-bold uppercase tracking-[0.2em] text-sky-500">
              Billing
            </p>

            <h2 className="mt-3 text-3xl font-black">
              My Invoices
            </h2>

            <p className="mt-4 max-w-3xl leading-8 app-muted">
              Download your MKETICS invoices and use the
              invoice number as your payment reference.
            </p>
          </div>

          <div className="mt-8 grid gap-5">
            {invoices.length ? (
              invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="rounded-[2rem] app-surface p-6"
                >
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-2xl font-black">
                          {invoice.invoice_number}
                        </h3>

                        <span
                          className={`rounded-full px-4 py-2 text-xs font-black ${
                            invoice.status === "Paid"
                              ? "bg-green-500/10 text-green-500"
                              : "bg-orange-500/10 text-orange-500"
                          }`}
                        >
                          {invoice.status || "Unpaid"}
                        </span>
                      </div>

                      <p className="mt-2 app-muted">
                        {invoice.service}
                      </p>

                      <p className="mt-4 text-3xl font-black text-sky-500">
                        R
                        {Number(
                          invoice.amount || 0
                        ).toLocaleString()}
                      </p>

                      <p className="mt-2 text-sm app-subtle">
                        Created:{" "}
                        {invoice.created_at
                          ? new Date(
                              invoice.created_at
                            ).toLocaleDateString("en-ZA")
                          : "—"}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() =>
                          exportInvoicePDF(invoice)
                        }
                        className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-5 py-3 text-sm font-black text-white"
                      >
                        <Download className="h-4 w-4" />
                        Download PDF
                      </button>

                      <button className="inline-flex items-center gap-2 rounded-full bg-green-500 px-5 py-3 text-sm font-black text-white">
                        <CreditCard className="h-4 w-4" />
                        Pay Later
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[2rem] app-surface p-8 text-center">
                <FileText className="mx-auto h-12 w-12 text-sky-500" />

                <h3 className="mt-5 text-2xl font-black">
                  No invoices yet
                </h3>

                <p className="mx-auto mt-3 max-w-xl app-muted">
                  When MKETICS creates an invoice for your
                  project, it will appear here automatically.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}