import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import QuoteForm from "../components/QuoteForm";

import emailjs from "@emailjs/browser";
import { supabase } from "../lib/supabaseClient";
import { useMemo, useState, useEffect } from "react";
import { CheckCircle2, Download, MessageCircle, ArrowRight, Search, ShieldCheck } from "lucide-react";

const startingPrices = {
  "Website Starter / Landing Page": 2500,
  "Business Website": 4500,
  "Online Store / E-commerce": 6500,
  "Company Profile Website": 3500,
  "Custom Business System": 8500,
  "Client Portal": 7500,
  "Invoice / Quote Management System": 5500,
  "CRM / Leads Management System": 6500,
  "School / College IT Support System": 9500,
  "Loan / Mashonisa Management System": 8500,
  "Network Installation": 3500,
  "Wi-Fi Setup / Upgrade": 2800,
  "CCTV Installation Planning": 3500,
  "Cloud Backup Setup": 3000,
  "Microsoft 365 / Email Setup": 1800,
  "IT Support / Troubleshooting": 800,
  "Business Registration Support": 1200,
  "Company Profile Design": 1200,
  "Business Proposal Document": 1500,
  "Invoice / Document Template": 750,
  "CV / LinkedIn Profile Support": 500,
};

export default function Quote() {
  const [submitting, setSubmitting] = useState(false);
  const [submittedLead, setSubmittedLead] = useState(null);
  const [notice, setNotice] = useState({ type: "", message: "" });

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    service: "Business Website",
    size: "Business",
    location: "",
    timeline: "",
    budgetRange: "",
    contactMethod: "WhatsApp",
    message: "",
  });

  useEffect(() => {
    document.title = "Request Quote | MKETICS";

    if (notice.message) {
      const timer = setTimeout(() => setNotice({ type: "", message: "" }), 4500);
      return () => clearTimeout(timer);
    }
  }, [notice]);

  const estimatedPrice = useMemo(() => {
    const base = startingPrices[form.service] || 2500;
    const multiplier = form.size === "Enterprise" ? 3 : form.size === "Business" ? 1.8 : 1;
    return Math.round(base * multiplier);
  }, [form.service, form.size]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const projectMessage = [
        form.message,
        "",
        `Location/Site: ${form.location || "Not provided"}`,
        `Timeline: ${form.timeline || "Not provided"}`,
        `Budget Range: ${form.budgetRange || "Not provided"}`,
        `Preferred Contact: ${form.contactMethod || "WhatsApp"}`,
      ].join("\n");

      const leadData = {
        name: form.name,
        phone: form.phone,
        email: form.email,
        service: form.service,
        size: form.size,
        message: projectMessage,
        estimated_price: estimatedPrice,
        status: "New",
      };

      const { error } = await supabase.from("leads").insert([leadData]);
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
          message: projectMessage,
          location: form.location,
          timeline: form.timeline,
          budget_range: form.budgetRange,
          contact_method: form.contactMethod,
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
Location/Site: ${form.location || "Not provided"}
Timeline: ${form.timeline || "Not provided"}
Budget Range: ${form.budgetRange || "Not provided"}
Preferred Contact: ${form.contactMethod || "WhatsApp"}
Estimated Starting Budget: R${estimatedPrice.toLocaleString()}

Project Details:
${form.message || "Not provided"}

Please assist me.
      `);

      setSubmittedLead({ name: form.name, service: form.service, estimatedPrice, whatsappText });
      setNotice({ type: "success", message: "Quote request sent successfully." });

      setTimeout(() => {
        window.open(`https://wa.me/27722864367?text=${whatsappText}`, "_blank");
      }, 1200);

      setForm({
        name: "",
        phone: "",
        email: "",
        service: "Business Website",
        size: "Business",
        location: "",
        timeline: "",
        budgetRange: "",
        contactMethod: "WhatsApp",
        message: "",
      });
    } catch (err) {
      console.error(err);
      setNotice({ type: "error", message: "Something went wrong. Please try again or WhatsApp MKETICS." });
    } finally {
      setSubmitting(false);
    }
  };

  const generatePDF = async () => {
    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF("p", "mm", "a4");
    const today = new Date().toLocaleDateString("en-ZA");
    const quoteNumber = `MKQ-${Date.now().toString().slice(-6)}`;
    const safeName = submittedLead.name?.replace(/\s+/g, "_") || "Client";

    doc.setFillColor(248, 250, 252);
    doc.rect(0, 0, 210, 297, "F");
    doc.setFillColor(2, 6, 23);
    doc.roundedRect(12, 12, 186, 38, 6, 6, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.text("MKETICS", 20, 30);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Software • IT Infrastructure • Cloud • CCTV • Digital", 20, 40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text("PROJECT QUOTATION", 136, 28);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Quote No: ${quoteNumber}`, 136, 37);
    doc.text(`Date: ${today}`, 136, 43);

    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("Technology Project Estimate", 14, 68);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text("Prepared by MKETICS (PTY) LTD for your requested solution.", 14, 76);

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, 88, 86, 48, 5, 5, "FD");
    doc.roundedRect(110, 88, 86, 48, 5, 5, "FD");
    doc.setTextColor(14, 165, 233);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("CLIENT", 20, 100);
    doc.text("SERVICE REQUESTED", 116, 100);
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.text(submittedLead.name || "Client", 20, 112);
    doc.text(doc.splitTextToSize(submittedLead.service, 70), 116, 112);

    doc.setFillColor(14, 165, 233);
    doc.roundedRect(14, 148, 182, 34, 6, 6, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("ESTIMATED STARTING BUDGET", 22, 161);
    doc.setFontSize(24);
    doc.text(`R${submittedLead.estimatedPrice.toLocaleString()}`, 22, 174);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Final pricing depends on confirmed scope, integrations, infrastructure and deployment complexity.", 92, 164, { maxWidth: 92 });

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
    [
      "This quotation is an initial estimate based on the submitted request.",
      "A detailed consultation may be required before final pricing is confirmed.",
      "Timelines depend on scope, site readiness, infrastructure and client requirements.",
      "Deposit, milestones and payment terms will be confirmed in the final proposal.",
    ].forEach((note, i) => doc.text(`• ${note}`, 22, 218 + i * 8, { maxWidth: 160 }));

    doc.setFillColor(2, 6, 23);
    doc.rect(0, 282, 210, 15, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text("MKETICS (PTY) LTD", 14, 291);
    doc.text("www.mketics.co.za", 68, 291);
    doc.text("info@mketics.co.za", 122, 291);
    doc.text("+27 72 286 4367", 170, 291);
    doc.save(`MKETICS_Quote_${safeName}.pdf`);
  };

  if (submittedLead) {
    return (
      <main className="min-h-screen app-bg">
        <Navbar />
        <section className="mx-auto flex min-h-[80vh] max-w-5xl items-center justify-center px-4 py-16">
          <div className="w-full rounded-[2rem] app-card p-6 text-center shadow-2xl sm:p-8 lg:p-10">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-green-500/20 text-green-500">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h1 className="mt-6 text-4xl font-black md:text-5xl">Quote Request Received</h1>
            <p className="mx-auto mt-4 max-w-2xl app-muted">Thank you for contacting MKETICS. Your request has been captured and our team will review your project details.</p>
            <div className="mt-8 grid gap-5 text-left md:grid-cols-2">
              <div className="rounded-3xl app-surface p-6">
                <p className="text-sm app-subtle">Requested Service</p>
                <p className="mt-2 text-xl font-black">{submittedLead.service}</p>
                <p className="mt-5 text-sm app-subtle">Estimated Starting Budget</p>
                <p className="mt-2 text-4xl font-black text-sky-500">R{submittedLead.estimatedPrice.toLocaleString()}</p>
              </div>
              <div className="rounded-3xl app-surface p-6">
                <p className="text-sm font-black uppercase tracking-[0.2em] text-sky-500">What happens next?</p>
                <div className="mt-5 grid gap-4">
                  {["MKETICS reviews your request.", "We confirm details by WhatsApp or email.", "A refined quote is prepared if needed."].map((step) => (
                    <div key={step} className="flex gap-3"><CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-green-500" /><p className="app-muted">{step}</p></div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <a href={`https://wa.me/27722864367?text=${submittedLead.whatsappText}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-green-500 px-6 py-4 font-black text-white hover:bg-green-400"><MessageCircle className="h-5 w-5" />Continue to WhatsApp</a>
              <button onClick={generatePDF} className="inline-flex items-center justify-center gap-2 rounded-full bg-sky-500 px-6 py-4 font-black text-white hover:bg-sky-400"><Download className="h-5 w-5" />Download PDF</button>
              <button onClick={() => setSubmittedLead(null)} className="rounded-full app-surface px-6 py-4 font-black">Submit Another Request</button>
            </div>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen app-bg">
      <Navbar />
      <section className="relative overflow-hidden px-4 pt-28 pb-10 sm:pt-32 lg:pb-16">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-4 py-2 text-sm font-black text-sky-500">
              <Search className="h-4 w-4" /> Quote Request Center
            </div>
            <h1 className="mt-6 text-4xl font-black leading-tight md:text-6xl">Find the right MKETICS service and request a quote.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 app-muted">Search through MKETICS services, choose the closest match from the dropdown, then send your request. This keeps quote requests clean and helps MKETICS respond faster.</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {["Search services", "Add project details", "Receive follow-up"].map((item) => (
                <div key={item} className="rounded-2xl app-surface p-4"><ShieldCheck className="mb-3 h-5 w-5 text-sky-500" /><p className="font-black">{item}</p></div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="/docs/MKETICS_Service_Catalogue.pdf" download className="inline-flex items-center justify-center gap-2 rounded-full border border-sky-400/40 px-5 py-3 font-black text-sky-500 hover:bg-sky-500/10">
                <Download className="h-5 w-5" /> Download Catalogue
              </a>
              <a href="https://wa.me/27722864367" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-green-500 px-5 py-3 font-black text-white hover:bg-green-400">
                <MessageCircle className="h-5 w-5" /> WhatsApp MKETICS
              </a>
            </div>
          </div>
          <QuoteForm form={form} handleChange={handleChange} handleSubmit={handleSubmit} estimatedPrice={estimatedPrice} submitting={submitting} notice={notice} />
        </div>
      </section>
      <Footer />
    </main>
  );
}
