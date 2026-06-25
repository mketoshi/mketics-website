import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import SEO from "../components/seo/SEO";
import Button from "../components/ui/Button";
import { siteConfig } from "../data/site";
import { createWhatsAppLink, whatsappMessages } from "../utils/whatsapp";
import QuoteFlow from "../components/sections/QuoteFlow";

const serviceOptions = [
  "Website Design & Development",
  "Custom Business System / Portal / Dashboard",
  "Online Store / E-commerce",
  "IT Support / Network Support",
  "Google Workspace / Business Email",
  "Business Registration / Readiness Support",
  "Digital Marketing Support",
  "Smart Security / IP Camera Planning",
  "General Consultation",
];

const budgetOptions = [
  "Below R2,500",
  "R2,500 - R5,000",
  "R5,000 - R15,000",
  "R15,000 - R45,000",
  "R45,000+",
  "Not sure yet",
];

const timelineOptions = [
  "Urgent",
  "This week",
  "This month",
  "1 - 3 months",
  "Still planning",
];

const responseSteps = [
  {
    title: "1. Review",
    text: "MKETICS reviews your request based on service type, urgency, budget and project details.",
  },
  {
    title: "2. Clarify",
    text: "If needed, we ask follow-up questions so the scope is clear before pricing.",
  },
  {
    title: "3. Quote",
    text: "You receive guidance, pricing direction or a formal quotation depending on the request.",
  },
];

const trustPoints = [
  "Professional quote flow",
  "Clear project scoping",
  "Business-ready communication",
  "Support for businesses, schools and organisations",
];

export default function Contact() {
  const whatsappLink = createWhatsAppLink(whatsappMessages.general);

  return (
    <main className="bg-[#020B1F] text-white">
      <SEO
        title="Contact MKETICS | Request a Quote or Consultation"
        description="Contact MKETICS to request a quote, discuss a website, business system, IT support, digital business solution or smart technology project."
        path="/contact"
      />

      <section className="relative isolate overflow-hidden px-5 py-16 lg:py-24">
        <div className="absolute inset-0 -z-10">
          <img
            src="/assets/mketics-bg2.png"
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover object-center opacity-35"
          />
          <div className="absolute inset-0 bg-[#020B1F]/78" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#020B1F] via-[#020B1F]/88 to-[#020B1F]/45" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#020B1F]/20 via-transparent to-[#020B1F]" />
          <div className="absolute left-1/2 top-0 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-cyan-400/15 blur-[140px]" />
          <div className="absolute right-0 top-24 h-[430px] w-[430px] rounded-full bg-blue-600/15 blur-[120px]" />
        </div>

        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-cyan-300/20 bg-white/[0.05] px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-cyan-200 shadow-[0_0_40px_rgba(25,217,255,0.12)]">
              <Sparkles size={16} />
              Contact MKETICS
            </div>

            <h1 className="mt-7 max-w-4xl text-4xl font-black leading-[1.06] tracking-tight sm:text-5xl lg:text-6xl">
              Tell us what you want to build, fix or{" "}
              <span className="bg-gradient-to-r from-cyan-200 via-white to-cyan-300 bg-clip-text text-transparent">
                improve.
              </span>
            </h1>

            <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-300">
              Share your business need, project idea or technical challenge.
              MKETICS will help you choose the right service path, scope and
              next steps.
            </p>

            <div className="mt-8 grid gap-4">
              <ContactCard
                icon={Phone}
                title="Phone"
                text={siteConfig.phone}
                href={`tel:${siteConfig.phone.replace(/\s/g, "")}`}
              />

              <ContactCard
                icon={MessageCircle}
                title="WhatsApp"
                text="Chat directly with MKETICS"
                href={whatsappLink}
              />

              <ContactCard
                icon={Mail}
                title="Email"
                text={siteConfig.email}
                href={`mailto:${siteConfig.email}`}
              />

              <ContactCard
                icon={MapPin}
                title="Service Area"
                text="South Africa • Remote and project-based support"
              />
            </div>

            <div className="mt-8 rounded-[2rem] border border-cyan-300/15 bg-white/[0.05] p-6 backdrop-blur-xl">
              <p className="text-sm font-black uppercase tracking-[0.25em] text-cyan-300">
                Why contact MKETICS?
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {trustPoints.map((point) => (
                  <div key={point} className="flex items-start gap-3">
                    <CheckCircle2
                      className="mt-0.5 shrink-0 text-cyan-300"
                      size={18}
                    />
                    <p className="text-sm leading-6 text-slate-300">
                      {point}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-cyan-300/20 bg-white/[0.06] p-6 shadow-2xl backdrop-blur-xl">
            <div className="mb-6">
              <p className="text-sm font-black uppercase tracking-[0.25em] text-cyan-300">
                Request Form
              </p>

              <h2 className="mt-3 text-3xl font-black text-white">
                Start with clear project details.
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-300">
                The more detail you provide, the easier it is for MKETICS to
                prepare a serious response, quotation or consultation plan.
              </p>
            </div>

            <form
              className="grid gap-4"
              onSubmit={(event) => event.preventDefault()}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <FormInput label="Full Name" placeholder="Your name" />
                <FormInput label="Phone / WhatsApp" placeholder="+27..." />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormInput
                  label="Email Address"
                  placeholder="you@example.com"
                  type="email"
                />
                <FormInput
                  label="Business / Organisation"
                  placeholder="Business name"
                />
              </div>

              <FormSelect label="Service Needed" options={serviceOptions} />

              <div className="grid gap-4 md:grid-cols-2">
                <FormSelect label="Estimated Budget" options={budgetOptions} />
                <FormSelect label="Timeline" options={timelineOptions} />
              </div>

              <div>
                <label className="text-sm font-bold text-white">
                  Project Details
                </label>
                <textarea
                  rows="6"
                  placeholder="Tell us what you need, what problem you want to solve, who will use it, and what outcome you expect..."
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-300/10"
                />
              </div>

              <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/10 p-4">
                <div className="flex gap-3">
                  <ShieldCheck
                    className="mt-1 shrink-0 text-cyan-300"
                    size={18}
                  />
                  <p className="text-sm leading-7 text-slate-300">
                    This form is currently a professional lead-capture layout.
                    Form submission automation can be connected later using
                    EmailJS, Formspree, Supabase or a backend API.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Button href={`mailto:${siteConfig.email}`} className="justify-center">
                  Email MKETICS
                  <Send size={18} className="ml-2" />
                </Button>

                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-cyan-300 bg-white px-6 py-3 font-black text-[#061A33] transition hover:bg-cyan-300"
                >
                  <MessageCircle size={18} />
                  WhatsApp MKETICS
                </a>
              </div>
            </form>
          </div>
        </div>
      </section>

      <section className="bg-[#EAF6FF] px-5 py-16 text-[#061A33] lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-[#0B7CFF]">
              What Happens Next
            </p>

            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
              A clear response process for serious inquiries.
            </h2>

            <p className="mt-5 text-lg leading-8 text-slate-700">
              MKETICS reviews your request, clarifies missing details and then
              recommends the right next step.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {responseSteps.map((step) => (
              <div
                key={step.title}
                className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-cyan-300 hover:shadow-xl"
              >
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#061A33] text-cyan-300">
                  <Clock3 size={22} />
                </div>

                <h3 className="mt-5 text-xl font-black text-[#020B1F]">
                  {step.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <QuoteFlow
      variant="light"
      title="A professional quote starts with clear information."
      description="The better the request, the faster MKETICS can guide you with the right service, price direction and next step."
      />
    </main>
  );
}

function ContactCard({ icon: Icon, title, text, href }) {
  const content = (
    <div className="flex items-start gap-4 rounded-3xl border border-cyan-300/15 bg-white/[0.05] p-5 transition hover:border-cyan-300/40 hover:bg-white/[0.08]">
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-cyan-300/10 text-cyan-300">
        <Icon size={22} />
      </div>

      <div>
        <h3 className="font-black text-white">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-300">{text}</p>
      </div>
    </div>
  );

  if (!href) return content;

  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel="noreferrer"
    >
      {content}
    </a>
  );
}

function FormInput({ label, placeholder, type = "text" }) {
  return (
    <div>
      <label className="text-sm font-bold text-white">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-300/10"
      />
    </div>
  );
}

function FormSelect({ label, options }) {
  return (
    <div>
      <label className="text-sm font-bold text-white">{label}</label>
      <select className="mt-2 w-full rounded-2xl border border-white/10 bg-[#101827] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-300/10">
        <option>Select an option</option>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}