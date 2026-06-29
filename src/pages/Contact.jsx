import { useSearchParams } from "react-router-dom";
import {
  CheckCircle2,
  ClipboardList,
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
import QuoteFlow from "../components/sections/QuoteFlow";
import { siteConfig } from "../data/site";
import { seoPages } from "../data/seo";
import { serviceExplorerItems } from "../data/serviceExplorer";
import { createWhatsAppLink, whatsappMessages } from "../utils/whatsapp";
import { getServiceExplorerLeadFromSearch } from "../utils/serviceExplorerLead";

const serviceOptions = [
  "General Consultation",
  ...serviceExplorerItems.map((service) => service.title),
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
  const [searchParams] = useSearchParams();
  const serviceExplorerLead = getServiceExplorerLeadFromSearch(searchParams);

  const selectedService = serviceExplorerLead?.service || "";
  const selectedNotes = serviceExplorerLead?.notes || "";

  const whatsappLink = createWhatsAppLink(
    serviceExplorerLead
      ? buildContactWhatsAppMessage(serviceExplorerLead)
      : whatsappMessages.general
  );

  const emailLink = buildEmailLink(serviceExplorerLead);

  return (
    <main className="bg-[#020B1F] text-white">
      <SEO {...seoPages.contact} />

      <section className="relative isolate overflow-hidden px-5 py-16 lg:py-24">
        <div className="absolute inset-0 -z-10">
          <img
            src="/assets/mketics-bg2.webp"
            alt=""
            aria-hidden="true"
            loading="eager"
            decoding="async"
            className="hidden h-full w-full object-cover object-center opacity-35 lg:block"
          />
          <div className="absolute inset-0 bg-[#020B1F]/78" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#020B1F] via-[#020B1F]/88 to-[#020B1F]/45" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#020B1F]/20 via-transparent to-[#020B1F]" />
          <div className="absolute left-1/2 top-0 hidden h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-cyan-400/15 blur-[140px] lg:block" />
          <div className="absolute right-0 top-24 hidden h-[430px] w-[430px] rounded-full bg-blue-600/15 blur-[120px] lg:block" />
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

            {serviceExplorerLead && (
              <ServiceExplorerLeadCard lead={serviceExplorerLead} />
            )}

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
                external
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
                    <p className="text-sm leading-6 text-slate-300">{point}</p>
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

            {serviceExplorerLead && (
              <div className="mb-6 rounded-[1.5rem] border border-cyan-300/25 bg-cyan-300/10 p-5">
                <div className="flex items-start gap-3">
                  <ClipboardList
                    className="mt-0.5 shrink-0 text-cyan-300"
                    size={22}
                  />
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">
                      Service Explorer Data Attached
                    </p>
                    <p className="mt-2 text-sm leading-7 text-slate-300">
                      The form below has been prefilled using the visitor’s
                      Service Explorer recommendation.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <form
              className="grid gap-4"
              onSubmit={(event) => event.preventDefault()}
            >
              {serviceExplorerLead && (
                <>
                  <input
                    type="hidden"
                    name="lead-source"
                    value="Service Explorer"
                  />
                  <input
                    type="hidden"
                    name="service-pillar"
                    value={serviceExplorerLead.pillar}
                  />
                  <input
                    type="hidden"
                    name="readiness-level"
                    value={serviceExplorerLead.readiness}
                  />
                  <input
                    type="hidden"
                    name="supporting-services"
                    value={serviceExplorerLead.supporting}
                  />
                  <input
                    type="hidden"
                    name="selected-answers"
                    value={serviceExplorerLead.answers}
                  />
                </>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <FormInput
                  label="Full Name"
                  name="full-name"
                  placeholder="Your name"
                  autoComplete="name"
                />
                <FormInput
                  label="Phone / WhatsApp"
                  name="phone-whatsapp"
                  placeholder="+27..."
                  type="tel"
                  autoComplete="tel"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormInput
                  label="Email Address"
                  name="email-address"
                  placeholder="you@example.com"
                  type="email"
                  autoComplete="email"
                />
                <FormInput
                  label="Business / Organisation"
                  name="business-organisation"
                  placeholder="Business name"
                  autoComplete="organization"
                />
              </div>

              <FormSelect
                label="Service Needed"
                name="service-needed"
                options={serviceOptions}
                defaultValue={selectedService}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormSelect
                  label="Estimated Budget"
                  name="estimated-budget"
                  options={budgetOptions}
                />
                <FormSelect
                  label="Timeline"
                  name="timeline"
                  options={timelineOptions}
                />
              </div>

              <div>
                <label
                  htmlFor="project-details"
                  className="text-sm font-bold text-white"
                >
                  Project Details
                </label>
                <textarea
                  id="project-details"
                  name="project-details"
                  rows="8"
                  defaultValue={selectedNotes}
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
                    EmailJS, Formspree, Supabase or a backend API. Service
                    Explorer recommendations are preserved in the form and
                    WhatsApp message.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Button href={emailLink} className="justify-center">
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

function ServiceExplorerLeadCard({ lead }) {
  const supportingServices = lead.supporting
    ? lead.supporting.split(",").map((item) => item.trim()).filter(Boolean)
    : [];

  return (
    <div className="mt-8 rounded-[2rem] border border-cyan-300/25 bg-cyan-300/10 p-6">
      <div className="flex items-start gap-4">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-cyan-300 text-[#061A33]">
          <ClipboardList size={24} />
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200">
            Service Explorer Recommendation
          </p>

          <h2 className="mt-2 text-2xl font-black text-white">
            {lead.service}
          </h2>

          <p className="mt-3 text-sm leading-7 text-slate-300">
            <span className="font-bold text-white">Service Pillar:</span>{" "}
            {lead.pillar}
          </p>

          <p className="mt-1 text-sm leading-7 text-slate-300">
            <span className="font-bold text-white">Readiness Level:</span>{" "}
            {lead.readiness}
          </p>

          {supportingServices.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-bold text-white">
                Supporting Services:
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {supportingServices.map((service) => (
                  <span
                    key={service}
                    className="rounded-full border border-cyan-300/25 bg-white/[0.05] px-3 py-1 text-xs font-bold text-cyan-100"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>
          )}

          <details className="mt-5 rounded-2xl border border-white/10 bg-[#020B1F]/35 p-4">
            <summary className="cursor-pointer text-sm font-black text-cyan-200">
              View selected answers
            </summary>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-300">
              {lead.answers || "No answer summary available."}
            </p>
          </details>
        </div>
      </div>
    </div>
  );
}

function ContactCard({ icon: Icon, title, text, href, external = false }) {
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
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      aria-label={`${title}: ${text}`}
    >
      {content}
    </a>
  );
}

function FormInput({
  label,
  placeholder,
  type = "text",
  name,
  autoComplete = "off",
  defaultValue = "",
}) {
  const fieldId =
    name ||
    label
      .toLowerCase()
      .replaceAll(" / ", "-")
      .replaceAll(" ", "-")
      .replaceAll("/", "-");

  return (
    <div>
      <label htmlFor={fieldId} className="text-sm font-bold text-white">
        {label}
      </label>
      <input
        id={fieldId}
        name={fieldId}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-300/10"
      />
    </div>
  );
}

function FormSelect({ label, options, name, defaultValue = "" }) {
  const fieldId =
    name ||
    label
      .toLowerCase()
      .replaceAll(" / ", "-")
      .replaceAll(" ", "-")
      .replaceAll("/", "-");

  return (
    <div>
      <label htmlFor={fieldId} className="text-sm font-bold text-white">
        {label}
      </label>
      <select
        id={fieldId}
        name={fieldId}
        defaultValue={defaultValue}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-[#101827] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-300/10"
      >
        <option value="">Select an option</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function buildContactWhatsAppMessage(lead) {
  return `Hello MKETICS, I completed the Service Explorer and would like to request a quote.

Recommended Service: ${lead.service}
Service Pillar: ${lead.pillar}
Readiness Level: ${lead.readiness}
Supporting Services: ${lead.supporting || "Not applicable"}

Selected Answers:
${lead.answers || "Not available"}

Please assist me with the next step, scope and pricing direction.`;
}

function buildEmailLink(lead) {
  const subject = lead
    ? `MKETICS Quote Request - ${lead.service}`
    : "MKETICS Quote Request";

  const body = lead
    ? `Hello MKETICS,

I completed the Service Explorer and would like to request a quote.

${lead.notes}

Please assist me with the next step, scope and pricing direction.`
    : `Hello MKETICS,

I would like to request a quote or consultation.

Please assist me with the next step.`;

  return `mailto:${siteConfig.email}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;
}