import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
  LifeBuoy,
} from "lucide-react";
import Button from "../components/ui/Button";
import { siteConfig } from "../data/site";
import SEO from "../components/seo/SEO";

const serviceOptions = [
  "Website / business system",
  "Online store",
  "Client portal / dashboard",
  "IT support",
  "Network / Wi-Fi assessment",
  "Google Workspace setup",
  "Digital business solutions",
  "Compliance support",
  "Security / smart technology",
  "Not sure yet",
];

const budgetOptions = [
  "Starter",
  "Standard",
  "Premium",
  "Enterprise / custom",
  "Not sure yet",
];

const timelineOptions = [
  "Urgent",
  "This week",
  "This month",
  "Planning ahead",
  "Not sure yet",
];

const supportChannels = [
  {
    icon: MessageCircle,
    title: "WhatsApp MKETICS",
    text: "Best for quick questions, quote requests and simple project updates.",
    action: "Send WhatsApp Message",
    href: siteConfig.whatsapp,
  },
  {
    icon: Mail,
    title: "Email MKETICS",
    text: "Best for formal requests, documents, project briefs and quotation follow-ups.",
    action: siteConfig.email,
    href: `mailto:${siteConfig.email}`,
  },
  {
    icon: LifeBuoy,
    title: "Support Requests",
    text: "Best for technical support, project assistance and follow-up communication.",
    action: "Request Support",
    href: `mailto:${siteConfig.email}?subject=MKETICS Support Request`,
  },
];

const responseSteps = [
  "MKETICS reviews your request.",
  "We clarify the service, budget and timeline.",
  "You receive guidance, next steps or a quotation.",
];

export default function Contact() {
  return (
    <>
    <SEO
    title="Contact MKETICS | Request a Quote or Consultation"
    description="Contact MKETICS to request a quote, discuss a website, business system, IT support, digital business solution or smart technology project."
    path="/contact"
    />
      <section className="relative isolate overflow-hidden bg-[#020B1F] px-5 py-16 text-white lg:py-24">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[540px] w-[540px] -translate-x-1/2 rounded-full bg-cyan-400/15 blur-[130px]" />
          <div className="absolute right-0 top-28 h-[420px] w-[420px] rounded-full bg-blue-600/15 blur-[120px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(25,217,255,0.10),transparent_38%),linear-gradient(180deg,rgba(2,11,31,0.1),#020B1F_92%)]" />
        </div>

        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.85fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-cyan-300/20 bg-white/[0.04] px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-cyan-200">
              <Sparkles size={16} />
              Contact & Support
            </div>

            <h1 className="mt-7 max-w-5xl text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-7xl">
              Let’s build your next{" "}
              <span className="bg-gradient-to-r from-cyan-200 via-white to-cyan-300 bg-clip-text text-transparent">
                digital solution.
              </span>
            </h1>

            <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-300">
              Tell MKETICS what you need help with. We will review your request
              and guide you toward the right service, quote or consultation.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Button href={siteConfig.whatsapp}>
                Send WhatsApp Message
                <ArrowRight size={18} className="ml-2" />
              </Button>
              <Button href={`mailto:${siteConfig.email}`} variant="secondary">
                Email MKETICS
              </Button>
            </div>
          </div>

          <div className="rounded-[2rem] border border-cyan-300/20 bg-white/[0.05] p-6 backdrop-blur-xl">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-cyan-300">
              Contact Details
            </p>

            <div className="mt-6 grid gap-4">
              <ContactLine icon={Phone} label="WhatsApp" value={siteConfig.phone} />
              <ContactLine icon={Mail} label="Email" value={siteConfig.email} />
              <ContactLine icon={MapPin} label="Website" value={siteConfig.website} />
              <ContactLine
                icon={Clock}
                label="Response"
                value="MKETICS will review your details and respond with the next step."
              />
            </div>

            <div className="mt-6 rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-5">
              <p className="text-sm font-semibold text-cyan-100">
                You do not need all technical details.
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Start with your idea, challenge or business need. MKETICS will
                help you clarify the right solution.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#EAF6FF] px-5 py-16 text-[#061A33] lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-[#0B7CFF]">
              Request a Quote
            </p>

            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
              Share your project details.
            </h2>

            <p className="mt-5 text-lg leading-8 text-slate-700">
              Use this form structure to prepare your request. For now, the
              buttons will send visitors to email or WhatsApp. In the lead
              generation phase, we will connect this form to email notifications
              and a database.
            </p>

            <div className="mt-8 rounded-[2rem] bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#061A33] text-cyan-300">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h3 className="font-black text-[#020B1F]">
                    Responsible information handling
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-slate-700">
                    Your information is used to respond to your request and
                    provide relevant MKETICS service guidance.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              {responseSteps.map((step) => (
                <div key={step} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-1 shrink-0 text-[#0B7CFF]" size={20} />
                  <p className="leading-7 text-slate-700">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <form
            className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl"
            onSubmit={(event) => event.preventDefault()}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full Name" placeholder="Your full name" />
              <Field
                label="Company / Organisation"
                placeholder="Business or organisation name"
              />
              <Field label="Phone / WhatsApp" placeholder="+27..." />
              <Field label="Email Address" placeholder="you@example.com" />
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Select label="Service Needed" options={serviceOptions} />
              <Select label="Budget Range" options={budgetOptions} />
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Select label="Preferred Timeline" options={timelineOptions} />
              <Select
                label="Preferred Contact Method"
                options={["WhatsApp", "Email", "Phone call", "Google Meet"]}
              />
            </div>

            <div className="mt-4">
              <label className="text-sm font-bold text-[#061A33]">
                Project Description
              </label>
              <textarea
                rows="6"
                placeholder="Tell us what you want to build, fix, improve or discuss..."
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
              />
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button href={`mailto:${siteConfig.email}`} className="sm:flex-1">
                Submit My Request
                <Send size={16} className="ml-2" />
              </Button>

              <Button href={siteConfig.whatsapp} variant="light" className="sm:flex-1">
                WhatsApp Instead
              </Button>
            </div>

            <p className="mt-4 text-xs leading-6 text-slate-500">
              Form automation will be added later. Until then, use email or
              WhatsApp so MKETICS can respond directly.
            </p>
          </form>
        </div>
      </section>

      <section className="bg-white px-5 py-16 text-[#061A33] lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-[#0B7CFF]">
              Support Channels
            </p>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
              Choose the best way to reach MKETICS.
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-700">
              Different requests need different communication channels. Use the
              option that best fits your need.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {supportChannels.map((channel) => (
              <SupportCard key={channel.title} channel={channel} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#020B1F] px-5 pb-20 text-white lg:pb-28">
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-cyan-300/20 bg-cyan-400/10 p-8 md:p-14">
            <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-cyan-300/20 blur-[100px]" />

            <div className="relative max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-200">
                Start simple
              </p>
              <h2 className="mt-4 text-3xl font-black leading-tight sm:text-5xl">
                Send MKETICS your idea or challenge.
              </h2>
              <p className="mt-5 text-lg leading-8 text-slate-200">
                Whether you need a website, system, IT support, business
                document, Google Workspace setup or smart security guidance, we
                are ready to assist.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Button href={siteConfig.whatsapp}>
                  Message MKETICS
                  <ArrowRight size={18} className="ml-2" />
                </Button>
                <Button to="/services" variant="secondary">
                  Explore Services
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function ContactLine({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-cyan-300/10 text-cyan-300">
        <Icon size={22} />
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
          {label}
        </p>
        <p className="mt-1 text-sm leading-6 text-slate-200">{value}</p>
      </div>
    </div>
  );
}

function Field({ label, placeholder }) {
  return (
    <div>
      <label className="text-sm font-bold text-[#061A33]">{label}</label>
      <input
        type="text"
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
      />
    </div>
  );
}

function Select({ label, options }) {
  return (
    <div>
      <label className="text-sm font-bold text-[#061A33]">{label}</label>
      <select className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100">
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}

function SupportCard({ channel }) {
  const Icon = channel.icon;

  return (
    <article className="rounded-[2rem] border border-slate-200 bg-[#F8FCFF] p-6 shadow-sm transition hover:-translate-y-1 hover:border-cyan-300 hover:shadow-xl">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#061A33] text-cyan-300">
        <Icon size={28} />
      </div>

      <h3 className="mt-6 text-2xl font-black text-[#020B1F]">
        {channel.title}
      </h3>

      <p className="mt-3 text-sm leading-7 text-slate-700">{channel.text}</p>

      <a
        href={channel.href}
        className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#0B7CFF] transition hover:text-[#00AEEF]"
      >
        {channel.action}
        <ArrowRight size={16} />
      </a>
    </article>
  );
}