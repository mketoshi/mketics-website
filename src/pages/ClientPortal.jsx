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
  const [projects, setProjects] = useState([]);
  const [projectUpdates, setProjectUpdates] = useState([]);

  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [tickets, setTickets] = useState([]);

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

      const { data: projectData } = await supabase
        .from("projects")
        .select("*")
        .eq("client_email", email)
        .order("created_at", {
          ascending: false,
        });

      setProjects(projectData || []);

      const { data: updatesData } = await supabase
        .from("project_updates")
        .select("*")
        .eq("client_email", email)
        .order("created_at", {
          ascending: false,
        });

      setProjectUpdates(updatesData || []);

      const { data: ticketData } = await supabase
        .from("support_tickets")
        .select("*")
        .eq("client_email", email)
        .order("created_at", {
          ascending: false,
        });

      setTickets(ticketData || []);

      setLoading(false);
    };

    checkSession();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/client-login";
  };

  const createTicket = async () => {
    if (!ticketSubject || !ticketMessage) {
      alert("Complete all ticket fields.");
      return;
    }

    const email = session.user.email;

    await supabase.from("support_tickets").insert([
      {
        client_email: email,
        subject: ticketSubject,
        message: ticketMessage,
      },
    ]);

    await supabase.from("activity_logs").insert([
      {
        user_email: email,
        action: "Created support ticket",
        module: "Support",
      },
    ]);

    setTicketSubject("");
    setTicketMessage("");

    const { data: refreshedTickets } = await supabase
      .from("support_tickets")
      .select("*")
      .eq("client_email", email)
      .order("created_at", {
        ascending: false,
      });

    setTickets(refreshedTickets || []);
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
                  <p className="text-sm app-subtle">Logged in as</p>

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

      <section className="mx-auto max-w-7xl px-4 pb-10">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <div className="glass-card rounded-[2rem] p-8">
            <div className="mb-6 inline-flex rounded-2xl bg-sky-500/10 p-4 text-sky-500">
              <FolderKanban className="h-8 w-8" />
            </div>

            <h2 className="text-2xl font-black">Projects</h2>

            <p className="mt-4 leading-8 app-muted">
              Track active projects, deployment progress,
              infrastructure work, and software systems.
            </p>

            <p className="mt-6 text-3xl font-black text-sky-500">
              {projects.length}
            </p>
          </div>

          <div className="glass-card rounded-[2rem] p-8">
            <div className="mb-6 inline-flex rounded-2xl bg-sky-500/10 p-4 text-sky-500">
              <FileText className="h-8 w-8" />
            </div>

            <h2 className="text-2xl font-black">Invoices</h2>

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

            <h2 className="text-2xl font-black">Support</h2>

            <p className="mt-4 leading-8 app-muted">
              Create support tickets and track MKETICS
              responses inside your portal.
            </p>

            <p className="mt-6 text-3xl font-black text-sky-500">
              {tickets.length}
            </p>
          </div>
        </div>
      </section>


      <section className="mx-auto max-w-7xl px-4 pb-10">
        <div className="glass-card rounded-[2rem] p-6 sm:p-8">
          <p className="font-bold uppercase tracking-[0.2em] text-sky-500">
            Project Timeline
          </p>

          <h2 className="mt-3 text-3xl font-black">
            My Projects & Updates
          </h2>

          <p className="mt-4 max-w-3xl leading-8 app-muted">
            Track active project progress, delivery stages, and MKETICS
            project communication updates.
          </p>

          <div className="mt-8 grid gap-5">
            {projects.map((project) => (
              <div
                key={project.id}
                className="rounded-[2rem] app-surface p-6"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h3 className="text-2xl font-black">
                      {project.project_name}
                    </h3>

                    <p className="mt-2 app-muted">
                      Status: {project.status || "Planning"}
                    </p>

                    <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                      <div
                        className="h-full rounded-full bg-purple-500"
                        style={{
                          width: `${project.progress || 0}%`,
                        }}
                      />
                    </div>

                    <p className="mt-2 text-sm font-bold text-sky-500">
                      {project.progress || 0}% Complete
                    </p>
                  </div>

                  <p className="text-sm app-subtle">
                    {project.created_at
                      ? new Date(project.created_at).toLocaleDateString("en-ZA")
                      : "—"}
                  </p>
                </div>
              </div>
            ))}

            {!projects.length && (
              <div className="rounded-[2rem] app-surface p-8 text-center">
                <FolderKanban className="mx-auto h-12 w-12 text-sky-500" />

                <h3 className="mt-5 text-2xl font-black">
                  No projects yet
                </h3>

                <p className="mx-auto mt-3 max-w-xl app-muted">
                  When MKETICS creates a project for you, it will appear here.
                </p>
              </div>
            )}
          </div>

          <div className="mt-10">
            <h3 className="text-2xl font-black">
              Timeline Updates
            </h3>

            <div className="mt-6 grid gap-5">
              {projectUpdates.map((update) => (
                <div
                  key={update.id}
                  className="rounded-[2rem] app-surface p-6"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-sm font-black uppercase tracking-[0.2em] text-sky-500">
                        Project Update
                      </p>

                      <h4 className="mt-2 text-xl font-black">
                        {update.update_title}
                      </h4>

                      <p className="mt-3 leading-8 app-muted">
                        {update.update_message || "No additional details provided."}
                      </p>
                    </div>

                    <p className="shrink-0 text-sm app-subtle">
                      {update.created_at
                        ? new Date(update.created_at).toLocaleString("en-ZA")
                        : "—"}
                    </p>
                  </div>
                </div>
              ))}

              {!projectUpdates.length && (
                <div className="rounded-[2rem] app-surface p-8 text-center">
                  <p className="font-bold app-muted">
                    No project timeline updates yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10">
        <div className="glass-card rounded-[2rem] p-6 sm:p-8">
          <p className="font-bold uppercase tracking-[0.2em] text-sky-500">
            Support Center
          </p>

          <h2 className="mt-3 text-3xl font-black">
            Support Tickets
          </h2>

          <div className="mt-8 grid gap-5">
            <input
              type="text"
              placeholder="Ticket Subject"
              value={ticketSubject}
              onChange={(e) => setTicketSubject(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5"
            />

            <textarea
              placeholder="Describe your issue..."
              value={ticketMessage}
              onChange={(e) => setTicketMessage(e.target.value)}
              rows={5}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5"
            />

            <button
              onClick={createTicket}
              className="rounded-2xl bg-sky-500 px-5 py-4 font-black text-white"
            >
              Submit Ticket
            </button>
          </div>

          <div className="mt-10 grid gap-5">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="rounded-[2rem] app-surface p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-black">
                      {ticket.subject}
                    </h3>

                    <p className="mt-2 app-muted">
                      {ticket.message}
                    </p>

                    <p className="mt-3 text-sm app-subtle">
                      {ticket.created_at
                        ? new Date(ticket.created_at).toLocaleString("en-ZA")
                        : "—"}
                    </p>
                  </div>

                  <span className="rounded-full bg-orange-500/10 px-4 py-2 text-xs font-black text-orange-500">
                    {ticket.status || "Open"}
                  </span>
                </div>
              </div>
            ))}

            {!tickets.length && (
              <div className="rounded-[2rem] app-surface p-8 text-center">
                <p className="font-bold app-muted">
                  No support tickets yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

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

                      <p className="mt-2 app-muted">{invoice.service}</p>

                      <p className="mt-4 text-3xl font-black text-sky-500">
                        R{Number(invoice.amount || 0).toLocaleString()}
                      </p>

                      <p className="mt-2 text-sm app-subtle">
                        Created:{" "}
                        {invoice.created_at
                          ? new Date(invoice.created_at).toLocaleDateString("en-ZA")
                          : "—"}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => exportInvoicePDF(invoice)}
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