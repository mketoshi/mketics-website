import Hero from "../components/Hero";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import QuoteForm from "../components/QuoteForm";

import emailjs from "@emailjs/browser";
import { supabase } from "../lib/supabaseClient";
import { useMemo, useState, useEffect } from "react";

import {
  ArrowRight,
  CheckCircle2,
  Code2,
  Download,
  MessageCircle,
  Network,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const trustPoints = [
  "Hands-on IT and infrastructure experience",
  "Software, cloud and CCTV planning",
  "Clear communication and documentation",
  "Founder-led South African business",
];

const serviceCards = [
  {
    title: "Software Systems",
    icon: Code2,
    description:
      "Client portals, dashboards, quote tools, invoice systems and custom online workflows built around real business needs.",
    features: ["Client portals", "Invoices", "Automation", "Dashboards"],
  },
  {
    title: "IT, Network & CCTV",
    icon: Network,
    description:
      "Networking, Wi-Fi, CCTV, cloud support and technical documentation for offices, schools and business sites.",
    features: ["Networking", "Wi-Fi", "CCTV", "Cloud support"],
  },
  {
    title: "Digital Hub",
    icon: Sparkles,
    description:
      "Websites, branding, company profiles, digital documents and practical support for growing businesses.",
    features: ["Websites", "Branding", "Documents", "Digital presence"],
  },
];

const proofStats = [
  {
    value: "Level 1",
    label: "B-BBEE Contributor",
  },
  {
    value: "135%",
    label: "Procurement Recognition",
  },
  {
    value: "ZA",
    label: "Registered South African Business",
  },
  {
    value: "Cloud",
    label: "Modern Infrastructure Ready",
  },
];

export default function Home() {
  const [submitting, setSubmitting] = useState(false);
  const [submittedLead, setSubmittedLead] = useState(null);
  const [notice, setNotice] = useState({
    type: "",
    message: "",
  });

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    service: "Software Systems",
    size: "Business",
    message: "",
  });

  useEffect(() => {
    document.title =
      "MKETICS | Technology services with a real MKETICS process";

    if (notice.message) {
      const timer = setTimeout(() => {
        setNotice({
          type: "",
          message: "",
        });
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [notice]);

  const estimatedPrice = useMemo(() => {
    const base =
      {
        "Software Systems": 4500,
        "IT, Network & CCTV": 3500,
        "Digital Hub": 2500,
      }[form.service] || 2500;

    const multiplier =
      form.size === "Enterprise"
        ? 3
        : form.size === "Business"
        ? 1.8
        : 1;

    return Math.round(base * multiplier);
  }, [form.service, form.size]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);

    try {
      const leadData = {
        name: form.name,
        phone: form.phone,
        email: form.email,
        service: form.service,
        size: form.size,
        message: form.message,
        estimated_price: estimatedPrice,
        status: "New",
      };

      const { error } = await supabase
        .from("leads")
        .insert([leadData]);

      if (error) throw error;

      await emailjs.send(
        "service_j54ayfr",
        "template_4weiuia",
        {
          name: form.name,
          phone: form.phone,
          email: form.email,
          service: form.service,
          size: form.size,
          message: form.message,
          estimated_price: `R${estimatedPrice.toLocaleString()}`,
        },
        "py8cRBCVu5UZFjux1"
      );

      const whatsappText = encodeURIComponent(`
Hi MKETICS,

I submitted a quote request.

Name: ${form.name}
Service: ${form.service}
Project Type: ${form.size}
Budget: R${estimatedPrice.toLocaleString()}

Please assist me.
      `);

      setSubmittedLead({
        name: form.name,
        service: form.service,
        estimatedPrice,
        whatsappText,
      });

      setNotice({
        type: "success",
        message: "Quote request sent successfully.",
      });

      setTimeout(() => {
        window.open(
          `https://wa.me/27722864367?text=${whatsappText}`,
          "_blank"
        );
      }, 1500);

      setForm({
        name: "",
        phone: "",
        email: "",
        service: "Software Systems",
        size: "Business",
        message: "",
      });
    } catch (err) {
      console.error(err);

      setNotice({
        type: "error",
        message: "Something went wrong.",
      });
    } finally {
      setSubmitting(false);
    }
  };

const generatePDF = async () => {
  const { default: jsPDF } = await import("jspdf");

  const doc = new jsPDF("p", "mm", "a4");

  const today = new Date().toLocaleDateString("en-ZA");
  const quoteNumber = `MKQ-${Date.now().toString().slice(-6)}`;
  const safeName =
    submittedLead.name?.replace(/\s+/g, "_") || "Client";

  const loadImageAsBase64 = async (url) => {
    const response = await fetch(url);
    const blob = await response.blob();

    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  };

  const logo = await loadImageAsBase64(
    "/images/logo-icon.webp?v=2"
  );

  // PAGE BACKGROUND
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, 210, 297, "F");

  // HEADER
  doc.setFillColor(2, 6, 23);
  doc.roundedRect(12, 12, 186, 38, 6, 6, "F");

  doc.addImage(logo, "PNG", 20, 18, 22, 22);

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("MKETICS", 48, 28);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(
    "SYSTEMS • INFRASTRUCTURE • DIGITAL",
    48,
    36
  );

  doc.setFontSize(9);
  doc.setTextColor(125, 211, 252);
  doc.text("Innovate • Integrate • Elevate", 48, 43);

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("PROJECT QUOTATION", 142, 28);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Quote No: ${quoteNumber}`, 142, 37);
  doc.text(`Date: ${today}`, 142, 43);

  // TITLE SECTION
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Technology Project Estimate", 14, 68);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text(
    "Prepared by MKETICS (Pty) Ltd for your requested technology solution.",
    14,
    76
  );

  // CLIENT CARD
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 88, 86, 48, 5, 5, "FD");

  doc.setTextColor(14, 165, 233);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("CLIENT DETAILS", 20, 100);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.text(submittedLead.name || "Client", 20, 112);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text("Quote request submitted online", 20, 122);

  // SERVICE CARD
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(110, 88, 86, 48, 5, 5, "FD");

  doc.setTextColor(14, 165, 233);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("SERVICE REQUESTED", 116, 100);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);

  const serviceLines = doc.splitTextToSize(
    submittedLead.service,
    70
  );

  doc.text(serviceLines, 116, 112);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text("Initial project category", 116, 128);

  // PRICE BLOCK
  doc.setFillColor(14, 165, 233);
  doc.roundedRect(14, 148, 182, 34, 6, 6, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("ESTIMATED STARTING BUDGET", 22, 161);

  doc.setFontSize(24);
  doc.text(
    `R${submittedLead.estimatedPrice.toLocaleString()}`,
    22,
    174
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(
    "Final pricing depends on confirmed scope, integrations, infrastructure requirements, and deployment complexity.",
    92,
    164,
    { maxWidth: 92 }
  );

  // SCOPE NOTES
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 194, 182, 46, 5, 5, "FD");

  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Scope & Important Notes", 22, 207);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105);

  const notes = [
    "This quotation is an initial estimate based on the submitted request.",
    "A detailed consultation may be required before final pricing is confirmed.",
    "Project timelines depend on system scope, infrastructure needs, and client readiness.",
    "Deposit, milestones, and payment terms will be confirmed in the final proposal.",
  ];

  let noteY = 218;

  notes.forEach((note) => {
    doc.setTextColor(14, 165, 233);
    doc.text("•", 22, noteY);

    doc.setTextColor(71, 85, 105);
    doc.text(note, 28, noteY, { maxWidth: 155 });

    noteY += 8;
  });

  // NEXT STEPS
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 250, 182, 22, 5, 5, "FD");

  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Next Step", 22, 263);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(
    "MKETICS will review your request and contact you to confirm technical requirements.",
    52,
    263,
    { maxWidth: 130 }
  );

  // FOOTER
  doc.setFillColor(2, 6, 23);
  doc.rect(0, 282, 210, 15, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text("MKETICS (Pty) Ltd", 14, 291);
  doc.text("www.mketics.co.za", 68, 291);
  doc.text("info@mketics.co.za", 122, 291);
  doc.text("+27 72 286 4367", 170, 291);

  doc.save(`MKETICS_Quote_${safeName}.pdf`);
};

  if (submittedLead) {
    return (
      <main className="flex min-h-screen items-center justify-center app-bg px-4 py-10">
        <div className="w-full max-w-4xl rounded-[2rem] app-card p-6 text-center shadow-2xl sm:p-8 lg:p-10">
          <img
            src="/images/logo-icon.webp?v=2"
            alt="MKETICS"
            className="mx-auto mb-6 h-20 w-20 object-contain"
          />

          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-green-500/20 text-green-500">
            <CheckCircle2 className="h-10 w-10" />
          </div>

          <h1 className="mt-6 text-4xl font-black md:text-5xl">
            Quote Request Received
          </h1>

          <p className="mx-auto mt-4 max-w-2xl app-muted">
            Thank you for contacting MKETICS. Your request has been captured
            and our team will review your project details.
          </p>

          <div className="mt-8 grid gap-5 text-left md:grid-cols-2">
            <div className="rounded-3xl app-surface p-6">
              <p className="text-sm app-subtle">Requested Service</p>

              <p className="mt-2 text-xl font-black">
                {submittedLead.service}
              </p>

              <p className="mt-5 text-sm app-subtle">
                Estimated Starting Budget
              </p>

              <p className="mt-2 text-4xl font-black text-sky-500">
                R{submittedLead.estimatedPrice.toLocaleString()}
              </p>
            </div>

            <div className="rounded-3xl app-surface p-6">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-sky-500">
                What happens next?
              </p>

              <div className="mt-5 grid gap-4">
                {[
                  "MKETICS reviews your request.",
                  "We confirm details by WhatsApp or email.",
                  "A refined quote is prepared if needed.",
                ].map((step) => (
                  <div key={step} className="flex gap-3">
                    <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-green-500" />

                    <p className="app-muted">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <a
              href={`https://wa.me/27722864367?text=${submittedLead.whatsappText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-green-500 px-6 py-4 font-black text-white hover:bg-green-400"
            >
              <MessageCircle className="h-5 w-5" />
              Continue to WhatsApp
            </a>

            <button
              onClick={generatePDF}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-sky-500 px-6 py-4 font-black text-white hover:bg-sky-400"
            >
              <Download className="h-5 w-5" />
              Download PDF
            </button>

            <button
              onClick={() => setSubmittedLead(null)}
              className="rounded-full app-surface px-6 py-4 font-black"
            >
              Submit Another Request
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden app-bg brand-grid-bg">
      <Navbar />

      <Hero />

      {/* PROOF */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:py-16 lg:py-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {proofStats.map((stat) => (
            <div
              key={stat.label}
              className="mketics-proof-badge rounded-[2rem] p-6 text-center"
            >
              <p className="text-3xl font-black text-sky-500">
                {stat.value}
              </p>

              <p className="mt-2 text-sm font-bold app-subtle">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section
        id="services"
        className="mx-auto max-w-7xl px-4 py-16 sm:py-20 lg:py-24"
      >
        <div className="text-center">
          <p className="font-bold uppercase tracking-[0.3em] text-sky-500">
            Core Services
          </p>

          <h2 className="mt-4 text-4xl font-black md:text-5xl">
            Technology services with a real MKETICS process
          </h2>

          <p className="mx-auto mt-5 max-w-3xl app-muted">
            MKETICS helps businesses, schools and individuals build practical systems, reliable infrastructure, CCTV planning and digital presence that can be supported after delivery.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {serviceCards.map((service) => {
            const Icon = service.icon;

            return (
              <div
                key={service.title}
                className="group mketics-card-pro rounded-[2rem] p-8 transition duration-300 hover:-translate-y-2 hover:border-sky-400/40"
              >
                <div className="mketics-icon-box mb-6 h-16 w-16 transition group-hover:scale-110">
                  <Icon className="h-8 w-8" />
                </div>

                <h3 className="text-2xl font-black">
                  {service.title}
                </h3>

                <p className="mt-4 leading-8 app-muted">
                  {service.description}
                </p>

                <div className="mt-6 grid gap-3">
                  {service.features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center gap-3 rounded-2xl app-surface px-4 py-3"
                    >
                      <CheckCircle2 className="h-4 w-4 text-sky-500" />

                      <span className="text-sm font-bold">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <a
                  href="/services"
                  className="mt-7 inline-flex items-center gap-2 text-sm font-black text-sky-500"
                >
                  View service details
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            );
          })}
        </div>
      </section>

      {/* WHY */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:py-20 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="font-bold uppercase tracking-[0.3em] text-sky-500">
              Why MKETICS
            </p>

            <h2 className="mt-4 text-4xl font-black md:text-5xl">
              A technology partner, not just another website template.
            </h2>

            <p className="mt-6 leading-8 app-muted">
              MKETICS combines hands-on IT support, software development, cloud knowledge, technical documentation and real client service experience. The focus is practical delivery and long-term support.
            </p>
          </div>

          <div className="glass-card rounded-[2rem] p-8">
            <div className="grid gap-4">
              {trustPoints.map((point) => (
                <div
                  key={point}
                  className="flex gap-3 rounded-2xl app-surface p-4"
                >
                  <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-sky-500" />

                  <p className="app-muted">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:py-20 lg:py-24">
        <div className="mketics-section-panel rounded-[2rem] p-8 text-center text-white shadow-2xl sm:p-10 lg:p-14">
          <Sparkles className="mx-auto h-12 w-12" />

          <h2 className="mt-6 text-4xl font-black md:text-5xl">
            Ready to build technology that works in the real world?
          </h2>

          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-white/90">
            From websites and business systems to networks, cloud support and CCTV planning, MKETICS helps clients build reliable technology foundations.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
            <a
              href="/quote"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 font-black text-slate-950"
            >
              Request Quote
              <ArrowRight className="h-5 w-5" />
            </a>

            <a
              href="/docs/MKETICS_Service_Catalogue.pdf"
              download
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-8 py-4 font-black text-white"
            >
              Download Catalogue
              <Download className="h-5 w-5" />
            </a>

            <a
              href="https://wa.me/27722864367?text=Hi%20MKETICS%2C%20I%20would%20like%20to%20discuss%20a%20technology%20project."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-8 py-4 font-black text-white"
            >
              WhatsApp MKETICS
              <MessageCircle className="h-5 w-5" />
            </a>
          </div>
        </div>
      </section>

      {/* QUOTE CTA moved to dedicated /quote page */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="rounded-[2rem] app-card p-8 text-center shadow-xl sm:p-10">
          <p className="font-bold uppercase tracking-[0.3em] text-sky-500">Request Quote</p>
          <h2 className="mt-4 text-3xl font-black md:text-5xl">Need a price for a specific MKETICS service?</h2>
          <p className="mx-auto mt-4 max-w-2xl app-muted">Use the dedicated quote page to search services, choose from dropdowns, and submit a cleaner request.</p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <a href="/quote" className="inline-flex items-center justify-center gap-2 rounded-full bg-sky-500 px-8 py-4 font-black text-white">Open Quote Page <ArrowRight className="h-5 w-5" /></a>
            <a href="/docs/MKETICS_Service_Catalogue.pdf" download className="inline-flex items-center justify-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-8 py-4 font-black text-sky-700 dark:text-sky-200">Download Catalogue <Download className="h-5 w-5" /></a>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}