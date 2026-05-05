import jsPDF from "jspdf";
import emailjs from "@emailjs/browser";
import { supabase } from "../lib/supabaseClient";
import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Wifi,
  Camera,
  Code2,
  Cloud,
  Server,
  ArrowRight,
  CheckCircle2,
  PhoneCall,
  Mail,
  MapPin,
  Gauge,
  Users,
  BriefcaseBusiness,
  Sparkles,
} from "lucide-react";

/*
  MKETICS Premium Home Page
  --------------------------------------------------
  Branding:
  Replace the CSS variables in BRAND below with your exact logo colors.
  Example:
  primary: "#00AEEF",
  secondary: "#0A1A2F",
  accent: "#D4AF37",
*/

const BRAND = {
  primary: "#0ea5e9",
  secondary: "#020617",
  accent: "#38bdf8",
  text: "#F8FAFC",
  muted: "#94A3B8",
};


const services = [
  {
    icon: Wifi,
    title: "WiFi & Network Installation",
    desc: "Reliable home and business WiFi, point-to-point links, routers, switches, and structured cabling.",
  },
  {
    icon: Camera,
    title: "CCTV & Security Systems",
    desc: "Camera installations, remote viewing, monitoring-ready setups, storage planning, and maintenance.",
  },
  {
    icon: Code2,
    title: "Web & App Development",
    desc: "Modern websites, quote systems, dashboards, booking systems, and business automation tools.",
  },
  {
    icon: Cloud,
    title: "Cloud, Hosting & IT Support",
    desc: "Business email, cloud storage, backups, hosting setup, technical support, and system maintenance.",
  },
];

const packages = [
  {
    name: "Starter",
    price: "From R1,500",
    desc: "For small businesses needing a clean online presence or basic IT setup.",
    features: ["Landing page or basic setup", "WhatsApp contact integration", "Basic support", "Mobile-friendly design"],
  },
  {
    name: "Business",
    price: "From R4,500",
    desc: "Best for companies that need leads, automation, and a stronger business system.",
    popular: true,
    features: ["Premium website", "Quote request system", "EmailJS notifications", "Lead capture", "SEO foundation"],
  },
  {
    name: "Enterprise",
    price: "Custom Quote",
    desc: "For CCTV, networking, dashboards, cloud storage, and larger infrastructure projects.",
    features: ["Admin dashboard", "Supabase database", "CCTV/network planning", "Cloud/server setup", "Monthly maintenance"],
  },
];

const stats = [
  { icon: Gauge, label: "Enterprise support experience", value: "400+ Users" },
  { icon: Users, label: "Current campus IT support", value: "200+ Users" },
  { icon: BriefcaseBusiness, label: "ICT qualification", value: "DUT Degree" },
];

const trustPoints = [
  "Proven experience supporting 400+ users in government environments",
  "Current IT Technician / Systems Administrator experience in education infrastructure",
  "Skilled in LAN/WAN, routers, switches, firewalls, Active Directory, and end-user support",
  "Formal Bachelor of Information and Communications Technology qualification",
  "Practical background in web development, scripting, CCTV, cloud, and business systems",
];

const experienceHighlights = [
  {
    role: "IT Technician / Systems Administrator",
    place: "Ehlanzeni TVET College",
    detail: "Supporting 200+ users, campus systems, networks, applications, documentation, audits, interns, and web-based systems.",
  },
  {
    role: "IT Technician",
    place: "Department of Home Affairs",
    detail: "Supported 400+ users across offices, branches, and mobile units, including routers, switches, firewalls, printers, biometrics, and critical systems.",
  },
  {
    role: "Founder / Technical Lead",
    place: "MKETICS",
    detail: "Delivering professional IT support, network setup, CCTV installation, websites, cloud systems, and business automation.",
  },
];

const businessTrust = [
  "Registered South African private company: MKETICS (Pty) Ltd",
  "CIPC Registration Number: 2026/290708/07",
  "Tax registered with SARS",
  "Business banking account under MKETICS (Pty) Ltd",
  "Professional quotes, invoices, and business-level service standards",
];

export default function Home() {
  const [submitting, setSubmitting] = useState(false);
  const [submittedLead, setSubmittedLead] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", service: "WiFi Installation", size: "Home", message: "" });
  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState({ type: "", message: "" });

  useEffect(() => {
  if (notice.message) {
    const timer = setTimeout(() => {
      setNotice({ type: "", message: "" });
    }, 4000);

    return () => clearTimeout(timer);
  }
}, [notice]);

  const estimatedPrice = useMemo(() => {
    const base = {
      "WiFi Installation": 1500,
      "CCTV Installation": 2500,
      "Website Development": 3500,
      "Cloud / IT Support": 1200,
    }[form.service] || 1500;

    const multiplier = form.size === "Business" ? 2.2 : form.size === "Enterprise" ? 4 : 1;
    return Math.round(base * multiplier);
  }, [form.service, form.size]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  const quoteLink = `${window.location.origin}/quote`;

  setSubmitting(true);

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

  try {
    const { error } = await supabase.from("leads").insert([leadData]);

    if (error) {
      throw error;
    }

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
        created_at: new Date().toLocaleString("en-ZA"),
        company: "MKETICS",
        estimated_price: `R${estimatedPrice.toLocaleString()}`,
      },
      "py8cRBCVu5UZFjux1"
    );


const whatsappText = encodeURIComponent(
  `Hi MKETICS 👋

I just submitted a quote request.

Name: ${form.name}
Phone: ${form.phone}
Email: ${form.email}
Service: ${form.service}
Project Type: ${form.size}
Estimated Budget: R${estimatedPrice.toLocaleString()}

Message:
${form.message}

Please assist me.`
);


setNotice({
  type: "success",
  message: "Quote sent successfully. Opening WhatsApp...",
});

const leadSummary = {
  name: form.name,
  service: form.service,
  size: form.size,
  estimatedPrice,
  whatsappText,
};

setSubmittedLead(leadSummary);

setNotice({
  type: "success",
  message: "Quote request sent successfully.",
});

setTimeout(() => {
  window.open(
    `https://wa.me/27722864367?text=${whatsappText}`,
    "_blank"
  );
}, 2000);

    setForm({
      name: "",
      phone: "",
      email: "",
      service: "WiFi Installation",
      size: "Home",
      message: "",
    });
  } catch (err) {
    console.error("Quote submit error:", err);
setNotice({
  type: "error",
  message: "Something went wrong. Please try again.",
});
  }
};

const whatsappUrl = submittedLead
  ? `https://wa.me/27722864367?text=${submittedLead.whatsappText}`
  : "";

const generatePDF = () => {
  const doc = new jsPDF();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("MKETICS QUOTE", 20, 20);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");

  doc.text(`Client: ${submittedLead.name}`, 20, 40);
  doc.text(`Service: ${submittedLead.service}`, 20, 50);
  doc.text(`Project Type: ${submittedLead.size}`, 20, 60);
  doc.text(
    `Estimated Price: R${submittedLead.estimatedPrice.toLocaleString()}`,
    20,
    70
  );

  doc.text(" ", 20, 80);
  doc.text("Thank you for choosing MKETICS.", 20, 90);

  doc.save(`MKETICS_Quote_${submittedLead.name}.pdf`);
};

if (submittedLead) {
  return (
    <main className="min-h-[100svh] flex items-center justify-center bg-slate-950 px-4 text-white">
      <div className="w-full max-w-2xl rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 text-center shadow-2xl">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-green-500/20 text-green-300">
          <CheckCircle2 className="h-10 w-10" />
        </div>

        <h1 className="mt-6 text-3xl font-black">
          Quote Request Sent Successfully
        </h1>

        <p className="mt-3 text-slate-300">
          Thank you, {submittedLead.name}. MKETICS has received your request.
        </p>

        <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900/70 p-5 text-left">
          <p className="text-sm text-slate-400">Service</p>
          <p className="font-bold">{submittedLead.service}</p>

          <p className="mt-4 text-sm text-slate-400">Project Type</p>
          <p className="font-bold">{submittedLead.size}</p>

          <p className="mt-4 text-sm text-slate-400">Estimated Starting Budget</p>
          <p className="text-2xl font-black text-sky-300">
            R{submittedLead.estimatedPrice.toLocaleString()}
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
<a
  href={whatsappUrl}
  target="_blank"
  rel="noopener noreferrer"
  className="rounded-full bg-green-500 px-6 py-4 font-black text-white hover:bg-green-400"
>
  Continue to WhatsApp
</a>

          <button
            onClick={() => setSubmittedLead(null)}
            className="rounded-full border border-white/10 bg-white/5 px-6 py-4 font-black text-white hover:bg-white/10"
          >
            Submit Another Request
          </button>
          <button
  onClick={generatePDF}
  className="rounded-full bg-sky-500 px-6 py-4 font-black text-white hover:bg-sky-400"
>
  Download PDF Quote
</button>
        </div>
      </div>
    </main>
  );
}

  return (
    <main
      className="min-h-[100svh] w-full overflow-x-hidden text-slate-50"
      style={{
        background: `radial-gradient(circle at top left, ${BRAND.primary}18, transparent 35%), radial-gradient(circle at top right, ${BRAND.accent}18, transparent 30%), ${BRAND.secondary}`,
      }}
    >
      <style>{`
        :root {
          --mketics-primary: ${BRAND.primary};
          --mketics-secondary: ${BRAND.secondary};
          --mketics-accent: ${BRAND.accent};
        }
        .glass-card {
          background: rgba(255,255,255,0.055);
          border: 1px solid rgba(255,255,255,0.11);
          backdrop-filter: blur(20px);
          box-shadow: 0 24px 80px rgba(0,0,0,0.22);
        }
        .brand-gradient {
          background: linear-gradient(135deg, #0284c7, #38bdf8);
        }
        .brand-text {
          background: linear-gradient(135deg, #0ea5e9, #38bdf8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>

      {/* Navbar */}
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-2xl">
        <nav className="mx-auto flex w-full max-w-[1600px] items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <a href="#home" className="flex min-w-0 items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl brand-gradient shadow-lg shadow-sky-500/20 sm:h-11 sm:w-11">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-black tracking-wide sm:text-lg">MKETICS</p>
              <p className="-mt-1 hidden text-xs text-slate-400 xs:block sm:block">Digital • Network • Security</p>
            </div>
          </a>

          <div className="hidden items-center gap-8 text-sm text-slate-300 lg:flex">
            <a href="#services" className="hover:text-white">Services</a>
            <a href="#trust" className="hover:text-white">Trust</a>
            <a href="#registered" className="hover:text-white">Company</a>
            <a href="#pricing" className="hover:text-white">Pricing</a>
            <a href="#quote" className="hover:text-white">Quote</a>
          </div>

          <div className="flex items-center gap-2">
            <a href="#quote" className="hidden rounded-full brand-gradient px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-sky-500/20 sm:inline-flex">
              Request Quote
            </a>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white lg:hidden"
              type="button"
            >
              Menu
            </button>
          </div>
        </nav>

        {menuOpen && (
          <div className="border-t border-white/10 bg-slate-950/95 px-4 py-4 lg:hidden">
            <div className="mx-auto grid max-w-[1600px] gap-3 text-sm text-slate-200">
              {["services", "trust", "experience", "registered", "pricing", "quote", "contact"].map((item) => (
                <a key={item} onClick={() => setMenuOpen(false)} href={`#${item}`} className="rounded-2xl bg-white/5 px-4 py-3 capitalize">
                  {item}
                </a>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section id="home" className="relative mx-auto grid min-h-[100svh] w-full max-w-[1600px] items-center gap-10 px-4 pb-16 pt-28 sm:px-6 sm:pt-32 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16 lg:px-10 xl:pb-24">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/5 px-4 py-2 text-sm font-semibold text-slate-300 shadow-lg shadow-sky-500/5">
            <Sparkles className="h-4 w-4" style={{ color: BRAND.accent }} />
            Premium IT systems for serious businesses
          </div>

          <h1 className="max-w-3xl text-[clamp(2.7rem,5.6vw,4.9rem)] font-black leading-[1.02] tracking-[-0.055em]">
            Enterprise-level IT solutions for <span className="brand-text">modern businesses</span>.
          </h1>

          <p className="mt-7 max-w-2xl text-base leading-8 text-slate-300/90 sm:text-lg">
            We design, install, and support professional IT systems including networks, CCTV, cloud platforms, web applications, and automated quote workflows — built to scale, perform, and help your business operate smarter.
          </p>

          <div className="mt-10 flex flex-col gap-4 min-[420px]:flex-row">
            <a href="#quote" className="inline-flex items-center justify-center gap-2 rounded-full brand-gradient px-7 py-4 font-bold text-white shadow-xl shadow-sky-500/20">
              Start a Project <ArrowRight className="h-5 w-5" />
            </a>
            <a href="#services" className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-7 py-4 font-bold text-white hover:bg-white/10">
              View Services
            </a>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.15 }} className="relative">
          <div className="absolute -inset-8 rounded-[3rem] blur-3xl opacity-20 brand-gradient" />
          <div className="relative glass-card rounded-[2rem] p-4 shadow-2xl sm:p-6">
            <div className="grid gap-4">
              {stats.map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-3xl bg-white/[0.045] p-5 ring-1 ring-white/5">
                  <div className="flex items-center gap-4">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10">
                      <item.icon className="h-6 w-6" style={{ color: BRAND.primary }} />
                    </div>
                    <p className="text-slate-300">{item.label}</p>
                  </div>
                  <p className="font-black" style={{ color: BRAND.accent }}>{item.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/70 p-6">
              <p className="mb-2 text-sm text-slate-400">Business system pipeline</p>
              <div className="space-y-3">
                {["Client submits quote", "Email + WhatsApp notification", "Lead saved to dashboard", "Follow up and close deal"].map((step) => (
                  <div key={step} className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="h-5 w-5" style={{ color: BRAND.accent }} />
                    {step}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Services */}
      <section id="services" className="mx-auto w-full max-w-[1600px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="mb-12 max-w-3xl">
          <p className="font-bold uppercase tracking-[0.3em]" style={{ color: BRAND.accent }}>Services</p>
          <h2 className="mt-3 text-4xl font-black md:text-5xl">Complete IT solutions for homes, businesses, and growing companies.</h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {services.map((service) => (
            <motion.div whileHover={{ y: -6 }} key={service.title} className="glass-card rounded-3xl p-6">
              <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-white/10">
                <service.icon className="h-7 w-7" style={{ color: BRAND.primary }} />
              </div>
              <h3 className="text-xl font-black">{service.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">{service.desc}</p>
              <a
  href="#quote"
  className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-sky-300 hover:text-sky-200"
>
  Request this service <ArrowRight className="h-4 w-4" />
</a>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trust */}
      <section id="trust" className="mx-auto w-full max-w-[1600px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="font-bold uppercase tracking-[0.3em]" style={{ color: BRAND.accent }}>Why Choose MKETICS</p>
            <h2 className="mt-3 text-4xl font-black md:text-5xl">Qualified experience, not guesswork.</h2>
            <p className="mt-5 text-slate-300 leading-8">
              MKETICS is built on real enterprise IT experience across government and education environments, backed by formal ICT training and hands-on technical delivery.
            </p>
          </div>

          <div className="glass-card rounded-[2rem] p-6">
            <div className="grid gap-4">
              {trustPoints.map((point) => (
                <div key={point} className="flex gap-3 rounded-2xl bg-white/5 p-4 text-sm leading-6 text-slate-200">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" style={{ color: BRAND.accent }} />
                  {point}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Experience */}
      <section id="experience" className="mx-auto w-full max-w-[1600px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="mb-12 max-w-3xl">
          <p className="font-bold uppercase tracking-[0.3em]" style={{ color: BRAND.accent }}>Experience Highlights</p>
          <h2 className="mt-3 text-4xl font-black md:text-5xl">Enterprise background clients can trust.</h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {experienceHighlights.map((item) => (
            <motion.div whileHover={{ y: -6 }} key={item.role} className="glass-card rounded-3xl p-6">
              <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-white/10">
                <BriefcaseBusiness className="h-7 w-7" style={{ color: BRAND.primary }} />
              </div>
              <h3 className="text-xl font-black">{item.role}</h3>
              <p className="mt-1 text-sm font-bold" style={{ color: BRAND.accent }}>{item.place}</p>
              <p className="mt-4 text-sm leading-7 text-slate-300">{item.detail}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Registered Business */}
      <section id="registered" className="mx-auto w-full max-w-[1600px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="glass-card overflow-hidden rounded-[2rem]">
          <div className="grid gap-8 p-7 lg:grid-cols-[0.9fr_1.1fr] lg:p-10">
            <div>
              <p className="font-bold uppercase tracking-[0.3em]" style={{ color: BRAND.accent }}>Registered Business</p>
              <h2 className="mt-3 text-4xl font-black md:text-5xl">Professional company. Accountable service.</h2>
              <p className="mt-5 text-slate-300 leading-8">
                MKETICS (Pty) Ltd operates as a registered South African business, giving clients confidence when requesting quotes, approving projects, and making payments.
              </p>
              <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/50 p-5">
                <p className="text-sm text-slate-400">Registered Company</p>
                <p className="mt-1 text-2xl font-black">MKETICS (Pty) Ltd</p>
                <p className="mt-2 text-sm" style={{ color: BRAND.accent }}>Reg No: 2026/290708/07</p>
              </div>
            </div>

            <div className="grid gap-4">
              {businessTrust.map((point) => (
                <div key={point} className="flex gap-3 rounded-2xl bg-white/5 p-4 text-sm leading-6 text-slate-200">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" style={{ color: BRAND.primary }} />
                  {point}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto w-full max-w-[1600px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="mb-12 text-center">
          <p className="font-bold uppercase tracking-[0.3em]" style={{ color: BRAND.accent }}>Packages</p>
          <h2 className="mt-3 text-4xl font-black md:text-5xl">Clear options. Premium delivery.</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {packages.map((pkg) => (
            <div key={pkg.name} className={`relative rounded-[2rem] p-7 ${pkg.popular ? "brand-gradient text-white" : "glass-card"}`}>
              {pkg.popular && <div className="absolute right-6 top-6 rounded-full bg-white/20 px-3 py-1 text-xs font-black">MOST POPULAR</div>}
              <h3 className="text-2xl font-black">{pkg.name}</h3>
              <p className="mt-3 text-sm leading-7 opacity-85">{pkg.desc}</p>
              <p className="mt-6 text-3xl font-black">{pkg.price}</p>
              <div className="mt-7 space-y-3">
                {pkg.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="h-5 w-5" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quote */}
      <section id="quote" className="mx-auto grid w-full max-w-[1600px] gap-8 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:px-8 lg:py-24">
        <div>
          <p className="font-bold uppercase tracking-[0.3em]" style={{ color: BRAND.accent }}>Smart Quote</p>
          <h2 className="mt-3 text-4xl font-black md:text-5xl">Let clients request quotes instantly.</h2>
<p className="mt-5 text-slate-300 leading-8">
  Submit your details and MKETICS will review your request, send a confirmation email, and follow up with the best solution for your project.
</p>
        </div>

{notice.message && (
  
  <div
    className={`mb-5 rounded-2xl px-4 py-3 text-sm ${
      notice.type === "success"
        ? "border border-green-400/30 bg-green-500/10 text-green-200"
        : "border border-red-400/30 bg-red-500/10 text-red-200"
    }`}
  >
    {notice.message}
        {/* ✅ WhatsApp fallback link */}
    {notice.type === "success" && (
      <a
        href={`https://wa.me/27722864367?text=${encodeURIComponent(
          `Hi MKETICS, I just submitted a quote request.`
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 block text-blue-400 underline"
      >
        Open WhatsApp manually
      </a>
    )}
  </div>
  
)}
        <form onSubmit={handleSubmit} className="glass-card rounded-[2rem] p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <input className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none" name="name" placeholder="Your name" value={form.name} onChange={handleChange} required />
            <input className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none" name="phone" placeholder="Phone number" value={form.phone} onChange={handleChange} required />
            <input className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none md:col-span-2" name="email" type="email" placeholder="Email address" value={form.email} onChange={handleChange} />
            <select className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 outline-none" name="service" value={form.service} onChange={handleChange}>
              <option>WiFi Installation</option>
              <option>CCTV Installation</option>
              <option>Website Development</option>
              <option>Cloud / IT Support</option>
            </select>
            <select className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 outline-none" name="size" value={form.size} onChange={handleChange}>
              <option>Home</option>
              <option>Business</option>
              <option>Enterprise</option>
            </select>
            <textarea className="min-h-32 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none md:col-span-2" name="message" placeholder="Tell us what you need" value={form.message} onChange={handleChange} />
          </div>

          <div className="mt-5 rounded-2xl bg-white/5 p-4">
            <p className="text-sm text-slate-400">Estimated starting budget</p>
            <p className="text-3xl font-black" style={{ color: BRAND.accent }}>R{estimatedPrice.toLocaleString()}</p>
          </div>

<p className="mt-4 text-sm text-slate-400">
  Your request is securely saved and sent directly to MKETICS.
</p>

<button
  className="mt-5 flex w-full items-center justify-center gap-2 rounded-full brand-gradient px-6 py-4 font-black text-white"
  type="submit"
>
  {submitting ? "Sending request..." : "Send Quote Request"}
  <ArrowRight className="h-5 w-5" />
</button>
        </form>
      </section>

      {/* Contact */}
      <footer id="contact" className="border-t border-white/10 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid w-full max-w-[1600px] gap-8 md:grid-cols-3">
          <div>
            <h3 className="text-2xl font-black">MKETICS</h3>
            <p className="mt-3 text-sm leading-7 text-slate-400">Premium digital, networking, cloud, CCTV, and business automation systems.</p>
            <p className="mt-3 text-xs text-slate-500">MKETICS (Pty) Ltd • Reg No: 2026/290708/07</p>
          </div>
          <div className="space-y-3 text-sm text-slate-300">
            <p className="flex items-center gap-3"><PhoneCall className="h-5 w-5" /> 072 286 4367</p>
            <p className="flex items-center gap-3"><Mail className="h-5 w-5" /> info@mketics.co.za</p>
            <p className="flex items-center gap-3"><MapPin className="h-5 w-5" /> KwaZulu-Natal, South Africa</p>
            <p className="text-xs text-slate-500">Registered with CIPC • Tax registered with SARS</p>
          </div>
          <div className="md:text-right">
            <a href="#quote" className="inline-flex rounded-full brand-gradient px-6 py-3 font-bold text-white">Request Quote</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
