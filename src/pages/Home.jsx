import Hero from "../components/Hero";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import QuoteForm from "../components/QuoteForm";

import jsPDF from "jspdf";
import emailjs from "@emailjs/browser";
import { supabase } from "../lib/supabaseClient";
import { useMemo, useState, useEffect } from "react";

import {
  CheckCircle2,
  Code2,
  Network,
  Sparkles,
} from "lucide-react";

const trustPoints = [
  "Enterprise IT and infrastructure experience",
  "Modern software and cloud solutions",
  "Professional support and system delivery",
  "Registered South African business",
];

export default function Home() {
  const [submitting, setSubmitting] =
    useState(false);

  const [submittedLead, setSubmittedLead] =
    useState(null);

  const [notice, setNotice] =
    useState({
      type: "",
      message: "",
    });

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    service:
      "System Design & Development",
    size: "Business",
    message: "",
  });

  useEffect(() => {
    if (notice.message) {
      const timer = setTimeout(() => {
        setNotice({
          type: "",
          message: "",
        });
      }, 4000);

      return () =>
        clearTimeout(timer);
    }
  }, [notice]);

  const estimatedPrice = useMemo(() => {
    const base =
      {
        "System Design & Development":
          4500,

        "IT & Network Infrastructure":
          3500,

        "Digital Hub": 2500,
      }[form.service] || 2500;

    const multiplier =
      form.size === "Enterprise"
        ? 3
        : form.size === "Business"
        ? 1.8
        : 1;

    return Math.round(
      base * multiplier
    );
  }, [form.service, form.size]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]:
        e.target.value,
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
        estimated_price:
          estimatedPrice,
        status: "New",
      };

      const { error } =
        await supabase
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

      const whatsappText =
        encodeURIComponent(`
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
        message:
          "Quote request sent successfully.",
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
        service:
          "System Design & Development",
        size: "Business",
        message: "",
      });
    } catch (err) {
      console.error(err);

      setNotice({
        type: "error",
        message:
          "Something went wrong.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(22);

    doc.text(
      "MKETICS Quote",
      20,
      20
    );

    doc.setFontSize(12);

    doc.text(
      `Client: ${submittedLead.name}`,
      20,
      50
    );

    doc.text(
      `Service: ${submittedLead.service}`,
      20,
      65
    );

    doc.text(
      `Estimated Budget: R${submittedLead.estimatedPrice.toLocaleString()}`,
      20,
      80
    );

    doc.save(
      "MKETICS_Quote.pdf"
    );
  };

  if (submittedLead) {
    return (
      <main className="flex min-h-screen items-center justify-center app-bg px-4">
        <div className="w-full max-w-2xl rounded-[2rem] app-card p-8 text-center shadow-2xl">
          <img
            src="/images/logo-icon.webp"
            alt="MKETICS"
            className="mx-auto mb-6 h-20 w-20 object-contain"
          />

          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-green-500/20 text-green-500">
            <CheckCircle2 className="h-10 w-10" />
          </div>

          <h1 className="mt-6 text-4xl font-black">
            Quote Request Sent
          </h1>

          <p className="mt-4 app-muted">
            Thank you for contacting
            MKETICS.
          </p>

          <div className="mt-8 rounded-3xl app-surface p-6 text-left">
            <p className="text-sm app-subtle">
              Service
            </p>

            <p className="font-bold">
              {submittedLead.service}
            </p>

            <p className="mt-5 text-sm app-subtle">
              Estimated Budget
            </p>

            <p className="text-3xl font-black text-sky-500">
              R
              {submittedLead.estimatedPrice.toLocaleString()}
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <a
              href={`https://wa.me/27722864367?text=${submittedLead.whatsappText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-green-500 px-6 py-4 font-black text-white hover:bg-green-400"
            >
              Continue to WhatsApp
            </a>

            <button
              onClick={generatePDF}
              className="rounded-full bg-sky-500 px-6 py-4 font-black text-white hover:bg-sky-400"
            >
              Download PDF
            </button>

            <button
              onClick={() =>
                setSubmittedLead(null)
              }
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
    <main className="min-h-screen overflow-x-hidden app-bg">
      <Navbar />

      <Hero />

      {/* SERVICES */}
      <section
        id="services"
        className="mx-auto max-w-7xl px-4 py-24"
      >
        <div className="text-center">
          <p className="font-bold uppercase tracking-[0.3em] text-sky-500">
            Core Services
          </p>

          <h2 className="mt-4 text-4xl font-black md:text-5xl">
            Enterprise Technology
            Solutions
          </h2>

          <p className="mx-auto mt-5 max-w-3xl app-muted">
            MKETICS delivers modern
            software systems,
            enterprise infrastructure,
            and digital innovation
            solutions for businesses
            and organizations.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          <div className="glass-card rounded-[2rem] p-8">
            <div className="mb-6 inline-flex rounded-2xl bg-sky-500/10 p-4 text-sky-500">
              <Code2 className="h-8 w-8" />
            </div>

            <h3 className="text-2xl font-black">
              System Design &
              Development
            </h3>

            <p className="mt-4 leading-8 app-muted">
              Custom software systems,
              dashboards, automation
              platforms, portals,
              APIs, and enterprise web
              applications.
            </p>
          </div>

          <div className="glass-card rounded-[2rem] p-8">
            <div className="mb-6 inline-flex rounded-2xl bg-sky-500/10 p-4 text-sky-500">
              <Network className="h-8 w-8" />
            </div>

            <h3 className="text-2xl font-black">
              IT & Network
              Infrastructure
            </h3>

            <p className="mt-4 leading-8 app-muted">
              Enterprise networking,
              WiFi deployment, CCTV
              integration, cloud
              infrastructure, support,
              and systems management.
            </p>
          </div>

          <div className="glass-card rounded-[2rem] p-8">
            <div className="mb-6 inline-flex rounded-2xl bg-sky-500/10 p-4 text-sky-500">
              <Sparkles className="h-8 w-8" />
            </div>

            <h3 className="text-2xl font-black">
              Digital Hub
            </h3>

            <p className="mt-4 leading-8 app-muted">
              Branding, websites, SEO,
              online business systems,
              and digital experiences.
            </p>
          </div>
        </div>
      </section>

      {/* WHY */}
      <section className="mx-auto max-w-7xl px-4 py-24">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="font-bold uppercase tracking-[0.3em] text-sky-500">
              Why MKETICS
            </p>

            <h2 className="mt-4 text-4xl font-black md:text-5xl">
              Technology solutions
              built for modern
              business.
            </h2>

            <p className="mt-6 leading-8 app-muted">
              MKETICS combines
              enterprise IT experience,
              infrastructure expertise,
              and modern development
              to deliver scalable
              digital solutions.
            </p>
          </div>

          <div className="glass-card rounded-[2rem] p-8">
            <div className="grid gap-4">
              {trustPoints.map(
                (point) => (
                  <div
                    key={point}
                    className="flex gap-3 rounded-2xl app-surface p-4"
                  >
                    <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-sky-500" />

                    <p className="app-muted">
                      {point}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* QUOTE */}
      <section
        id="quote"
        className="mx-auto grid max-w-7xl gap-10 px-4 py-24 lg:grid-cols-2"
      >
        <div>
          <img
            loading="lazy"
            src="/images/logo-clean.webp"
            alt="MKETICS"
            className="logo-glow mb-6 h-24 object-contain"
          />

          <p className="font-bold uppercase tracking-[0.3em] text-sky-500">
            Request Quote
          </p>

          <h2 className="mt-4 text-4xl font-black md:text-5xl">
            Start your next
            technology project.
          </h2>

          <p className="mt-6 leading-8 app-muted">
            Request a professional
            consultation for software
            systems, infrastructure
            deployment, networking,
            or digital transformation.
          </p>
        </div>

        <QuoteForm
          form={form}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          estimatedPrice={
            estimatedPrice
          }
          submitting={submitting}
          notice={notice}
        />
      </section>

      <Footer />
    </main>
  );
}