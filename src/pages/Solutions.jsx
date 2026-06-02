import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import {
  ArrowRight,
  CheckCircle2,
  FileText,
  LayoutDashboard,
  CreditCard,
  Headphones,
  ShieldCheck,
  ShoppingCart,
  School,
  BriefcaseBusiness,
  Workflow,
} from "lucide-react";

const solutions = [
  {
    icon: LayoutDashboard,
    title: "Client Portal",
    description:
      "A private online space where your clients can view project updates, invoices, documents and support progress.",
    bestFor: "Service businesses, contractors, schools and consultants",
    features: ["Client login", "Project updates", "Invoice access", "Document sharing"],
  },
  {
    icon: FileText,
    title: "Quote & Invoice System",
    description:
      "A structured system for creating quotes, managing invoices, tracking payment status and keeping client records organized.",
    bestFor: "Small businesses, installers and service providers",
    features: ["Quotes", "Invoices", "Paid/unpaid tracking", "PDF documents"],
  },
  {
    icon: BriefcaseBusiness,
    title: "Project Tracking System",
    description:
      "Track jobs, deadlines, stages, notes and client communication without losing everything in WhatsApp chats.",
    bestFor: "IT teams, agencies, technicians and field-service businesses",
    features: ["Job stages", "Progress status", "Tasks", "Client notes"],
  },
  {
    icon: Headphones,
    title: "IT Support Helpdesk",
    description:
      "Let staff or clients report technical issues while technicians track priority, response and completion.",
    bestFor: "Schools, offices, colleges and support teams",
    features: ["Tickets", "Priority levels", "Technician updates", "Reports"],
  },
  {
    icon: CreditCard,
    title: "Loan / Mashonisa Management System",
    description:
      "Manage borrowers, loans, repayments, balances, due dates and payment history in a controlled digital system.",
    bestFor: "Local lenders and small finance businesses",
    features: ["Client records", "Loan balances", "Repayments", "Payment history"],
  },
  {
    icon: ShoppingCart,
    title: "Online Store System",
    description:
      "Sell physical products online with product pages, checkout options, order tracking and delivery workflow support.",
    bestFor: "Retailers, clothing brands and product businesses",
    features: ["Products", "Orders", "Payments", "Delivery setup"],
  },
  {
    icon: School,
    title: "School / College IT System",
    description:
      "Support campus IT operations with asset records, lab checks, support logs, network reports and documentation.",
    bestFor: "Schools, colleges and training centres",
    features: ["Asset tracking", "Lab readiness", "Support logs", "Reports"],
  },
  {
    icon: ShieldCheck,
    title: "CCTV Site Management System",
    description:
      "Track camera sites, IP devices, maintenance records, cloud storage planning and security support workflows.",
    bestFor: "Security projects, estates, schools and multi-site clients",
    features: ["Site records", "Camera lists", "Maintenance logs", "Cloud planning"],
  },
];

export default function Solutions() {
  return (
    <main className="min-h-screen app-bg brand-grid-bg">
      <Navbar />

      <section className="relative overflow-hidden px-4 pb-16 pt-28 sm:pb-20 sm:pt-32">
        <div className="relative mx-auto max-w-7xl text-center">
          <div className="brand-kicker">
            <Workflow className="h-4 w-4" />
            MKETICS Solutions
          </div>

          <h1 className="brand-section-title mx-auto mt-8 max-w-5xl text-4xl sm:text-5xl md:text-7xl">
            Custom systems shaped around how your business actually works.
          </h1>

          <p className="mx-auto mt-7 max-w-3xl text-base leading-8 app-muted sm:text-lg">
            These are examples of business systems MKETICS can design and build. The goal is simple: organize your clients, work, documents, payments and support processes in one clear digital workflow.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
            <a
              href="/quote"
              className="mketics-button-primary inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 font-black transition"
            >
              Request Quote
              <ArrowRight className="h-5 w-5" />
            </a>

            <a
              href="/services"
              className="mketics-button-ghost inline-flex items-center justify-center rounded-full px-8 py-4 font-black transition"
            >
              View Services
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:pb-24">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {solutions.map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.title}
                className="mketics-card-pro rounded-[2rem] p-6 shadow-2xl transition hover:-translate-y-1 hover:border-sky-400/40 sm:p-8"
              >
                <div className="mketics-icon-box h-16 w-16">
                  <Icon className="h-8 w-8" />
                </div>

                <h2 className="mt-6 text-2xl font-black sm:text-3xl">
                  {item.title}
                </h2>

                <p className="mt-4 leading-7 app-muted">
                  {item.description}
                </p>

                <div className="mt-5 rounded-2xl app-surface p-4">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-sky-500">
                    Best for
                  </p>
                  <p className="mt-2 text-sm font-bold app-muted">
                    {item.bestFor}
                  </p>
                </div>

                <div className="mt-5 grid gap-3">
                  {item.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-sky-500" />
                      <span className="text-sm font-bold app-muted">{feature}</span>
                    </div>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24">
        <div className="mketics-card-pro rounded-[2.5rem] p-8 sm:p-10 lg:p-12">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="font-black uppercase tracking-[0.25em] text-sky-500">
                Important
              </p>
              <h2 className="mt-4 text-3xl font-black sm:text-4xl md:text-5xl">
                A solution is not a template product.
              </h2>
            </div>
            <p className="leading-8 app-muted">
              MKETICS first confirms your workflow, users, documents, payment process, reports and support needs. Then we design a system that matches your environment instead of forcing your business into a generic template.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24">
        <div className="mketics-section-panel rounded-[2.5rem] p-8 text-center text-white shadow-2xl sm:p-10 lg:p-14">
          <h2 className="text-3xl font-black sm:text-4xl md:text-5xl">
            Need a system built around your business?
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-white/90">
            Tell MKETICS what you are managing now using paper, Excel, WhatsApp or scattered files. We can help turn that workflow into a proper digital system.
          </p>
          <a
            href="/quote"
            className="mt-9 inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 font-black text-slate-950"
          >
            Start With a Quote
            <ArrowRight className="h-5 w-5" />
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}
