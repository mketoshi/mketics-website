import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import SEO from "../components/seo/SEO";
import QuoteFlow from "../components/sections/QuoteFlow";
import { siteConfig } from "../data/site";
import { seoPages } from "../data/seo";
import { serviceExplorerItems } from "../data/serviceExplorer";
import { createWhatsAppLink, whatsappMessages } from "../utils/whatsapp";
import { getServiceExplorerLeadFromSearch } from "../utils/serviceExplorerLead";
import { submitContactForm } from "../utils/contactSubmission";

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

function buildShortProjectDetails(serviceExplorerLead) {
  if (!serviceExplorerLead) return "";

  return `I completed the MKETICS Service Explorer.

Recommended Service: ${serviceExplorerLead.service}
Service Pillar: ${serviceExplorerLead.pillar}
Readiness Level: ${serviceExplorerLead.readiness}

Please help me confirm the scope, pricing direction and next step.`;
}

function getInitialFormData(serviceExplorerLead) {
  return {
    fullName: "",
    phone: "",
    email: "",
    organisation: "",
    serviceNeeded: serviceExplorerLead?.service || "",
    budget: "",
    timeline: "",
    preferredContact: "WhatsApp",
    projectDetails: buildShortProjectDetails(serviceExplorerLead),
  };
}

export default function Contact() {
  const [searchParams] = useSearchParams();

  const serviceExplorerLead = useMemo(
    () => getServiceExplorerLeadFromSearch(searchParams),
    [searchParams]
  );

  const [formData, setFormData] = useState(() =>
    getInitialFormData(serviceExplorerLead)
  );

  const [formStatus, setFormStatus] = useState({
    state: "idle",
    message: "",
  });

  useEffect(() => {
    setFormData((current) => ({
      ...current,
      serviceNeeded: serviceExplorerLead?.service || current.serviceNeeded,
      projectDetails:
        serviceExplorerLead && !current.projectDetails.trim()
          ? buildShortProjectDetails(serviceExplorerLead)
          : current.projectDetails || buildShortProjectDetails(serviceExplorerLead),
    }));
  }, [serviceExplorerLead]);

  const whatsappLink = createWhatsAppLink(
    serviceExplorerLead
      ? buildContactWhatsAppMessage(serviceExplorerLead)
      : whatsappMessages.general
  );

  const emailLink = buildEmailLink(serviceExplorerLead);

  function updateField(field, value) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));

    if (formStatus.state !== "idle") {
      setFormStatus({
        state: "idle",
        message: "",
      });
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!formData.fullName.trim()) {
      setFormStatus({
        state: "error",
        message: "Please enter your full name before submitting.",
      });
      return;
    }

    if (!formData.phone.trim() && !formData.email.trim()) {
      setFormStatus({
        state: "error",
        message: "Please enter at least a phone number or email address.",
      });
      return;
    }

    if (!formData.serviceNeeded.trim()) {
      setFormStatus({
        state: "error",
        message: "Please select the service you need.",
      });
      return;
    }

    if (!formData.projectDetails.trim()) {
      setFormStatus({
        state: "error",
        message: "Please describe what you need MKETICS to assist with.",
      });
      return;
    }

    setFormStatus({
      state: "loading",
      message: "Submitting your request...",
    });

    const payload = {
      formName: "MKETICS Website Contact Form",
      leadSource: serviceExplorerLead ? "Service Explorer" : "Contact Page",
      submittedAt: new Date().toISOString(),
      pageUrl: `${window.location.origin}${window.location.pathname}`,

      fullName: formData.fullName,
      phone: formData.phone,
      email: formData.email,
      organisation: formData.organisation,
      serviceNeeded: formData.serviceNeeded,
      budget: formData.budget,
      timeline: formData.timeline,
      preferredContact: formData.preferredContact,
      projectDetails: formData.projectDetails,

      serviceExplorer: serviceExplorerLead
        ? {
            recommendedService: serviceExplorerLead.service,
            pillar: serviceExplorerLead.pillar,
            readiness: serviceExplorerLead.readiness,
            supporting: serviceExplorerLead.supporting,
            answers: serviceExplorerLead.answers,
            notes: serviceExplorerLead.notes,
          }
        : null,
    };

    try {
      await submitContactForm(payload);

      setFormStatus({
        state: "success",
        message:
          "Request submitted successfully. MKETICS received your enquiry and will review your project details. You may also WhatsApp MKETICS if the matter is urgent.",
      });

      setFormData((current) => ({
        ...current,
        fullName: "",
        phone: "",
        email: "",
        organisation: "",
        budget: "",
        timeline: "",
        preferredContact: "WhatsApp",
        serviceNeeded: serviceExplorerLead?.service || "",
        projectDetails: buildShortProjectDetails(serviceExplorerLead),
      }));
    } catch (error) {
      setFormStatus({
        state: "error",
        message:
          error.message ||
          "Something went wrong while submitting your request. Please try WhatsApp or email.",
      });
    }
  }

  return (
    <main className="bg-[#020B1F] pb-12 text-white">
      <SEO {...seoPages.contact} />

      <section className="relative isolate overflow-hidden px-5 py-12 lg:py-24">
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

        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="order-2 lg:order-1">
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

            <div className="mt-8 grid gap-3 sm:gap-4">
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

            <div className="mt-8 rounded-[2rem] border border-cyan-300/15 bg-white/[0.05] p-5 lg:p-6 lg:backdrop-blur-xl">
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

          <div
            id="request-form"
            className="order-1 rounded-[2rem] border border-cyan-300/20 bg-white/[0.06] p-5 shadow-2xl lg:order-2 lg:p-6 lg:backdrop-blur-xl"
          >
            <div className="mb-6">
              <p className="text-sm font-black uppercase tracking-[0.25em] text-cyan-300">
                Request Form
              </p>

              <h2 className="mt-3 text-3xl font-black text-white">
                Start with clear project details.
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-300">
                Send MKETICS your request directly. A clear message helps us
                respond with the right service, scope and pricing direction.
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
                      Your recommendation has been attached. The form stays
                      clean, while MKETICS still receives the full selected
                      answers in the email.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <form className="grid gap-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <FormInput
                  label="Full Name"
                  name="fullName"
                  placeholder="Your name"
                  autoComplete="name"
                  value={formData.fullName}
                  onChange={(value) => updateField("fullName", value)}
                />
                <FormInput
                  label="Phone / WhatsApp"
                  name="phone"
                  placeholder="+27..."
                  type="tel"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={(value) => updateField("phone", value)}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormInput
                  label="Email Address"
                  name="email"
                  placeholder="you@example.com"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={(value) => updateField("email", value)}
                />
                <FormInput
                  label="Business / Organisation"
                  name="organisation"
                  placeholder="Business name"
                  autoComplete="organization"
                  value={formData.organisation}
                  onChange={(value) => updateField("organisation", value)}
                />
              </div>

              <FormSelect
                label="Service Needed"
                name="serviceNeeded"
                options={serviceOptions}
                value={formData.serviceNeeded}
                onChange={(value) => updateField("serviceNeeded", value)}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormSelect
                  label="Estimated Budget"
                  name="budget"
                  options={budgetOptions}
                  value={formData.budget}
                  onChange={(value) => updateField("budget", value)}
                />
                <FormSelect
                  label="Timeline"
                  name="timeline"
                  options={timelineOptions}
                  value={formData.timeline}
                  onChange={(value) => updateField("timeline", value)}
                />
              </div>

              <FormSelect
                label="Preferred Contact Method"
                name="preferredContact"
                options={["WhatsApp", "Phone Call", "Email"]}
                value={formData.preferredContact}
                onChange={(value) => updateField("preferredContact", value)}
              />

              <div>
                <label
                  htmlFor="projectDetails"
                  className="text-sm font-bold text-white"
                >
                  Project Details
                </label>
                <textarea
                  id="projectDetails"
                  name="projectDetails"
                  rows="6"
                  value={formData.projectDetails}
                  onChange={(event) =>
                    updateField("projectDetails", event.target.value)
                  }
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
                    Your request will be submitted with your selected service,
                    budget direction, timeline and Service Explorer
                    recommendation where applicable.
                  </p>
                </div>
              </div>

              {formStatus.state !== "idle" && (
                <FormStatusMessage status={formStatus} />
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="submit"
                  disabled={formStatus.state === "loading"}
                  className="inline-flex items-center justify-center rounded-full bg-cyan-300 px-6 py-3 font-black text-[#061A33] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {formStatus.state === "loading" ? (
                    <>
                      <Loader2 size={18} className="mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Request
                      <Send size={18} className="ml-2" />
                    </>
                  )}
                </button>

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

              <a
                href={emailLink}
                className="inline-flex items-center justify-center rounded-full border border-white/10 px-6 py-3 text-sm font-black text-slate-300 transition hover:border-cyan-300/60 hover:text-white"
              >
                <Mail size={16} className="mr-2" />
                Email Instead
              </a>
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
    <div className="mt-8 rounded-[2rem] border border-cyan-300/25 bg-cyan-300/10 p-5 lg:p-6">
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
    <div className="flex items-start gap-4 rounded-3xl border border-cyan-300/15 bg-white/[0.05] p-4 transition hover:border-cyan-300/40 hover:bg-white/[0.08] lg:p-5">
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-cyan-300/10 text-cyan-300 lg:h-12 lg:w-12">
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
  value,
  onChange,
}) {
  return (
    <div>
      <label htmlFor={name} className="text-sm font-bold text-white">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-300/10"
      />
    </div>
  );
}

function FormSelect({ label, options, name, value, onChange }) {
  return (
    <div>
      <label htmlFor={name} className="text-sm font-bold text-white">
        {label}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
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

function FormStatusMessage({ status }) {
  const isSuccess = status.state === "success";

  return (
    <div
      className={`rounded-2xl border p-4 ${
        isSuccess
          ? "border-emerald-300/40 bg-emerald-400/10 text-emerald-100"
          : "border-red-300/40 bg-red-400/10 text-red-100"
      }`}
    >
      <div className="flex gap-3">
        {isSuccess ? (
          <CheckCircle2 className="mt-0.5 shrink-0" size={20} />
        ) : (
          <AlertCircle className="mt-0.5 shrink-0" size={20} />
        )}
        <p className="text-sm font-semibold leading-7">{status.message}</p>
      </div>
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