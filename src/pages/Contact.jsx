import { useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { trackEvent, trackLead } from "../utils/analytics";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  SearchCheck,
  Send,
  ShieldCheck,
  Sparkles,
  WalletCards,
} from "lucide-react";
import SEO from "../components/seo/SEO";
import Button from "../components/ui/Button";
import QuoteFlow from "../components/sections/QuoteFlow";
import { siteConfig } from "../data/site";
import { seoPages } from "../data/seo";
import { serviceExplorerItems } from "../data/serviceExplorer";
import { createWhatsAppLink } from "../utils/whatsapp";
import { getServiceExplorerLeadFromSearch } from "../utils/serviceExplorerLead";
import { submitContactForm } from "../utils/contactSubmission";

const contactDetails = {
  phone: siteConfig.phone || "+27 72 286 4367",
  email: siteConfig.email || "services@mketics.co.za",
  whatsapp: siteConfig.whatsapp || "https://wa.me/27722864367",
  serviceArea: "South Africa • Remote and project-based support",
};

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  organisation: "",
  serviceNeeded: "",
  budget: "",
  timeline: "",
  preferredContact: "WhatsApp",
  projectDetails: "",
};

const budgetOptions = [
  "I am still planning",
  "Below R2,500",
  "R2,500 - R5,000",
  "R5,000 - R10,000",
  "R10,000 - R25,000",
  "R25,000+",
  "Custom system / larger project budget",
];

const timelineOptions = [
  "I am still planning",
  "As soon as possible",
  "Within 1 week",
  "Within 2 - 4 weeks",
  "Within 1 - 3 months",
  "Flexible timeline",
];

const contactMethodOptions = ["WhatsApp", "Phone call", "Email"];

const fallbackServiceOptions = [
  "Website / Online Presence",
  "Online Store / E-commerce",
  "Custom System / Portal",
  "IT Support / Network Support",
  "Business Email / Google Workspace",
  "Digital Marketing",
  "Business Registration / Readiness",
  "Maintenance / Monthly Support",
  "Not sure yet",
];

const nextSteps = [
  {
    title: "Review",
    text: "MKETICS reviews your request, service direction and project details.",
    icon: SearchCheck,
  },
  {
    title: "Clarify",
    text: "We may ask follow-up questions to confirm scope, budget and timeline.",
    icon: ClipboardList,
  },
  {
    title: "Quote",
    text: "You receive pricing direction or a formal quotation based on the confirmed scope.",
    icon: WalletCards,
  },
  {
    title: "Start",
    text: "Once approved, the work moves into setup, design, development or support.",
    icon: ShieldCheck,
  },
];

export default function Contact() {
  const [searchParams] = useSearchParams();
  const searchKey = searchParams.toString();

  const serviceExplorerLead = useMemo(() => {
    const rawLead = getServiceExplorerLeadFromSearch(searchParams);
    return normaliseServiceExplorerLead(rawLead);
  }, [searchKey, searchParams]);

  const serviceOptions = useMemo(() => {
    const dynamicOptions = serviceExplorerItems
      .map((item) => item?.title || item?.name || item?.label || "")
      .filter(Boolean);

    return [...new Set([...dynamicOptions, ...fallbackServiceOptions])];
  }, []);

  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({
    type: "idle",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!serviceExplorerLead.exists) return;

    setForm((current) => ({
      ...current,
      serviceNeeded:
        current.serviceNeeded || serviceExplorerLead.recommendedService,
      projectDetails:
        current.projectDetails ||
        buildPrefillProjectDetails(serviceExplorerLead),
    }));
  }, [searchKey, serviceExplorerLead]);

  const whatsappMessage = useMemo(
    () => buildContactWhatsAppMessage(form, serviceExplorerLead),
    [form, serviceExplorerLead]
  );

  const emailLink = useMemo(
    () => buildEmailLink(form, serviceExplorerLead),
    [form, serviceExplorerLead]
  );

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    if (status.type !== "idle") {
      setStatus({ type: "idle", message: "" });
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationErrors = validateForm(form);

    if (validationErrors.length) {
      trackEvent("contact_form_validation_error", {
        method: "emailjs_contact_form",
        service_needed: form.serviceNeeded || "not_selected",
        has_service_explorer_data: serviceExplorerLead.exists,
      });

      setStatus({
        type: "error",
        message: validationErrors[0],
      });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: "idle", message: "" });

    try {
      await submitContactForm({
        formName: "MKETICS Website Contact Form",
        leadSource: serviceExplorerLead.exists
          ? "Service Explorer Handoff"
          : "Contact Page",
        submittedAt: new Date().toISOString(),
        pageUrl: window.location.href,

        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        organisation: form.organisation,
        serviceNeeded: form.serviceNeeded,
        budget: form.budget,
        timeline: form.timeline,
        preferredContact: form.preferredContact,
        projectDetails: form.projectDetails,

        serviceExplorer: serviceExplorerLead.exists
          ? {
              recommendedService: serviceExplorerLead.recommendedService,
              pillar: serviceExplorerLead.pillar,
              readiness: serviceExplorerLead.readiness,
              supporting: serviceExplorerLead.supporting,
              answers: serviceExplorerLead.answers,
            }
          : null,
      });

      trackLead({
        method: "emailjs_contact_form",
        lead_source: serviceExplorerLead.exists
          ? "service_explorer_handoff"
          : "contact_page",
        service_needed: form.serviceNeeded || "not_selected",
        budget_direction: form.budget || "not_provided",
        timeline: form.timeline || "not_provided",
        preferred_contact: form.preferredContact || "not_provided",
        has_service_explorer_data: serviceExplorerLead.exists,
      });

      setStatus({
        type: "success",
        message:
          "Your request has been submitted successfully. MKETICS will review it and respond as soon as possible.",
      });

      setForm({
        ...initialForm,
        serviceNeeded: serviceExplorerLead.exists
          ? serviceExplorerLead.recommendedService
          : "",
        projectDetails: serviceExplorerLead.exists
          ? buildPrefillProjectDetails(serviceExplorerLead)
          : "",
      });
    } catch (error) {
      trackEvent("contact_form_error", {
        method: "emailjs_contact_form",
        service_needed: form.serviceNeeded || "not_selected",
        has_service_explorer_data: serviceExplorerLead.exists,
      });

      setStatus({
        type: "error",
        message:
          error?.message ||
          "Your request could not be submitted. Please try again or contact MKETICS on WhatsApp.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="bg-white text-[#061A33]">
      <SEO {...seoPages.contact} />

      <section className="relative isolate overflow-hidden bg-[#EAF6FF] px-5 py-12 lg:py-16">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-[-12rem] top-[-12rem] h-[34rem] w-[34rem] rounded-full bg-cyan-300/40 blur-[140px]" />
          <div className="absolute right-[-14rem] top-10 h-[36rem] w-[36rem] rounded-full bg-blue-500/20 blur-[150px]" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white/80 to-transparent" />
        </div>

        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-cyan-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-[#0B7CFF] shadow-sm">
              <Sparkles size={16} />
              Contact MKETICS
            </div>

            <h1 className="mt-6 max-w-5xl text-4xl font-black leading-[1.05] tracking-tight text-[#020B1F] sm:text-5xl lg:text-6xl">
              Tell MKETICS what you want to{" "}
              <span className="bg-gradient-to-r from-[#0B7CFF] via-[#00AEEF] to-[#061A33] bg-clip-text text-transparent">
                build, fix or improve.
              </span>
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-700">
              Send your request with the service direction, budget, timeline and
              project details. MKETICS will review your enquiry and guide the
              next step.
            </p>

            <div className="mt-7 flex flex-col gap-4 sm:flex-row">
              <Button
                to="#quote-form"
                onClick={() =>
                  trackEvent("quote_cta_click", {
                    location: "contact_hero",
                    cta: "start_request",
                  })
                }
              >
                Start Request
                <ArrowRight size={18} className="ml-2" />
              </Button>

              <a
                href={createWhatsAppLink(whatsappMessage)}
                target="_blank"
                rel="noreferrer"
                onClick={() =>
                  trackEvent("whatsapp_click", {
                    location: "contact_hero",
                    service_needed: form.serviceNeeded || "not_selected",
                    has_service_explorer_data: serviceExplorerLead.exists,
                  })
                }
                className="inline-flex items-center justify-center rounded-full border border-[#0B7CFF]/25 bg-white px-6 py-3 font-black text-[#061A33] shadow-sm transition hover:border-cyan-300 hover:bg-cyan-300"
              >
                <MessageCircle size={18} className="mr-2" />
                WhatsApp
              </a>
            </div>
          </div>

          <div className="hidden rounded-[2.5rem] border border-white bg-white p-5 shadow-2xl lg:block">
            <div className="rounded-[2rem] bg-[#020B1F] p-6 text-white">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
                Contact Flow
              </p>

              <h2 className="mt-3 text-3xl font-black">
                Clear request. Better response.
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-300">
                The more clearly you explain the problem, goal and timeline, the
                easier it is for MKETICS to recommend the right service or quote.
              </p>

              <div className="mt-6 grid gap-3">
                <MiniCheck text="Share your service direction" />
                <MiniCheck text="Add budget and timeline" />
                <MiniCheck text="Receive next-step guidance" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-12 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-[#0B7CFF]">
              Contact Options
            </p>

            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
              Choose how to reach MKETICS.
            </h2>

            <p className="mt-5 text-lg leading-8 text-slate-700">
              Use the form for a structured request, or contact MKETICS directly
              through WhatsApp, phone or email.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <ContactCard
              icon={Phone}
              title="Phone"
              text={contactDetails.phone}
              href={`tel:${contactDetails.phone.replace(/\s/g, "")}`}
              onClick={() =>
                trackEvent("phone_click", {
                  location: "contact_options",
                })
              }
            />

            <ContactCard
              icon={MessageCircle}
              title="WhatsApp"
              text="Chat directly with MKETICS"
              href={createWhatsAppLink(whatsappMessage)}
              external
              onClick={() =>
                trackEvent("whatsapp_click", {
                  location: "contact_options",
                  service_needed: form.serviceNeeded || "not_selected",
                  has_service_explorer_data: serviceExplorerLead.exists,
                })
              }
            />

            <ContactCard
              icon={Mail}
              title="Email"
              text={contactDetails.email}
              href={`mailto:${contactDetails.email}`}
              onClick={() =>
                trackEvent("email_click", {
                  location: "contact_options",
                })
              }
            />

            <ContactCard
              icon={MapPin}
              title="Service Area"
              text={contactDetails.serviceArea}
            />
          </div>
        </div>
      </section>

      <section id="quote-form" className="bg-[#EAF6FF] px-5 py-12 lg:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-[#0B7CFF]">
              Request Form
            </p>

            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
              Send a clear project request.
            </h2>

            <p className="mt-5 text-lg leading-8 text-slate-700">
              Use this form for websites, systems, IT support, digital business
              solutions, maintenance or guidance.
            </p>

            {serviceExplorerLead.exists && (
              <div className="mt-7">
                <ServiceExplorerLeadCard lead={serviceExplorerLead} />
              </div>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:p-8"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput
                label="Full Name"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Your name and surname"
                required
              />

              <FormInput
                label="Business / Organisation"
                name="organisation"
                value={form.organisation}
                onChange={handleChange}
                placeholder="Business name, school or organisation"
              />

              <FormInput
                label="Email Address"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
              />

              <FormInput
                label="Phone / WhatsApp"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+27 72 286 4367"
              />

              <FormSelect
                label="Service Needed"
                name="serviceNeeded"
                value={form.serviceNeeded}
                onChange={handleChange}
                options={serviceOptions}
                placeholder="Choose a service"
                required
              />

              <FormSelect
                label="Budget Direction"
                name="budget"
                value={form.budget}
                onChange={handleChange}
                options={budgetOptions}
                placeholder="Choose budget range"
              />

              <FormSelect
                label="Timeline"
                name="timeline"
                value={form.timeline}
                onChange={handleChange}
                options={timelineOptions}
                placeholder="Choose timeline"
              />

              <FormSelect
                label="Preferred Contact"
                name="preferredContact"
                value={form.preferredContact}
                onChange={handleChange}
                options={contactMethodOptions}
                placeholder="Choose contact method"
              />
            </div>

            <div className="mt-4">
              <FormTextArea
                label="Project Details"
                name="projectDetails"
                value={form.projectDetails}
                onChange={handleChange}
                placeholder={`Tell MKETICS what you need help with.

Example:
- I need a website for my business
- I want clients to contact me on WhatsApp
- I need business email setup
- My budget direction is around R5,000
- I want to start within 2 weeks`}
                required
              />
            </div>

            <FormStatusMessage status={status} />

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#0B7CFF] to-[#00AEEF] px-6 py-3 font-black text-white shadow-[0_16px_40px_rgba(0,174,239,0.28)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 sm:col-span-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="mr-2 animate-spin" />
                    Sending
                  </>
                ) : (
                  <>
                    Submit Request
                    <Send size={18} className="ml-2" />
                  </>
                )}
              </button>

              <a
                href={createWhatsAppLink(whatsappMessage)}
                target="_blank"
                rel="noreferrer"
                onClick={() =>
                  trackEvent("whatsapp_click", {
                    location: "contact_form",
                    service_needed: form.serviceNeeded || "not_selected",
                    has_service_explorer_data: serviceExplorerLead.exists,
                  })
                }
                className="inline-flex items-center justify-center rounded-full border border-[#0B7CFF]/25 bg-[#EAF6FF] px-6 py-3 font-black text-[#061A33] transition hover:border-cyan-300 hover:bg-cyan-300"
              >
                <MessageCircle size={18} className="mr-2" />
                WhatsApp
              </a>

              <a
                href={emailLink}
                onClick={() =>
                  trackEvent("email_click", {
                    location: "contact_form",
                    service_needed: form.serviceNeeded || "not_selected",
                    has_service_explorer_data: serviceExplorerLead.exists,
                  })
                }
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 font-black text-[#061A33] transition hover:border-cyan-300 hover:bg-cyan-300"
              >
                <Mail size={18} className="mr-2" />
                Email Instead
              </a>
            </div>
          </form>
        </div>
      </section>

      <section className="px-5 py-12 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-[#0B7CFF]">
                What Happens Next
              </p>

              <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
                A simple response process.
              </h2>

              <p className="mt-5 text-lg leading-8 text-slate-700">
                MKETICS reviews the request and responds with the most practical
                next step based on the project type and readiness.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {nextSteps.map((step) => (
                <NextStepCard key={step.title} step={step} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <QuoteFlow />
    </main>
  );
}

function ContactCard({
  icon: Icon,
  title,
  text,
  href,
  external = false,
  onClick,
}) {
  const content = (
    <div className="flex h-full items-start gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-cyan-300 hover:shadow-xl">
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#061A33] text-cyan-300">
        <Icon size={22} />
      </div>

      <div>
        <h3 className="text-lg font-black text-[#020B1F]">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
      </div>
    </div>
  );

  if (!href) return content;

  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      onClick={onClick}
      className="block h-full"
    >
      {content}
    </a>
  );
}

function ServiceExplorerLeadCard({ lead }) {
  return (
    <div className="rounded-[2rem] border border-cyan-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#061A33] text-cyan-300">
          <SearchCheck size={22} />
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#0B7CFF]">
            Service Explorer Handoff
          </p>

          <h3 className="mt-2 text-xl font-black text-[#020B1F]">
            Recommended service included.
          </h3>

          <div className="mt-4 grid gap-3">
            <DetailLine
              label="Recommended Service"
              value={lead.recommendedService}
            />
            <DetailLine label="Service Pillar" value={lead.pillar} />
            <DetailLine label="Readiness Level" value={lead.readiness} />
            <DetailLine label="Supporting Services" value={lead.supporting} />
          </div>

          {lead.answers && (
            <details className="mt-5 rounded-2xl border border-slate-200 bg-[#F8FCFF] p-4">
              <summary className="cursor-pointer text-sm font-black text-[#061A33]">
                View selected answers
              </summary>

              <pre className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
                {lead.answers}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailLine({ label, value }) {
  if (!value) return null;

  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold leading-6 text-slate-700">
        {value}
      </p>
    </div>
  );
}

function FormInput({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}) {
  return (
    <label className="block">
      <span className="text-sm font-black text-[#061A33]">
        {label}
        {required && <span className="text-[#0B7CFF]"> *</span>}
      </span>

      <input
        name={name}
        value={value}
        onChange={onChange}
        type={type}
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-semibold text-[#061A33] outline-none transition placeholder:text-slate-400 focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
      />
    </label>
  );
}

function FormSelect({
  label,
  name,
  value,
  onChange,
  options,
  placeholder,
  required = false,
}) {
  return (
    <label className="block">
      <span className="text-sm font-black text-[#061A33]">
        {label}
        {required && <span className="text-[#0B7CFF]"> *</span>}
      </span>

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-semibold text-[#061A33] outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
      >
        <option value="">{placeholder}</option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function FormTextArea({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
}) {
  return (
    <label className="block">
      <span className="text-sm font-black text-[#061A33]">
        {label}
        {required && <span className="text-[#0B7CFF]"> *</span>}
      </span>

      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={8}
        placeholder={placeholder}
        className="mt-2 w-full resize-y rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-semibold leading-7 text-[#061A33] outline-none transition placeholder:text-slate-400 focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
      />
    </label>
  );
}

function FormStatusMessage({ status }) {
  if (status.type === "idle" || !status.message) return null;

  const isSuccess = status.type === "success";

  return (
    <div
      className={`mt-5 flex items-start gap-3 rounded-2xl border p-4 ${
        isSuccess
          ? "border-emerald-200 bg-emerald-50 text-emerald-900"
          : "border-red-200 bg-red-50 text-red-900"
      }`}
    >
      {isSuccess ? (
        <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
      ) : (
        <AlertCircle size={20} className="mt-0.5 shrink-0" />
      )}

      <p className="text-sm font-bold leading-6">{status.message}</p>
    </div>
  );
}

function NextStepCard({ step }) {
  const Icon = step.icon;

  return (
    <article className="rounded-[2rem] border border-slate-200 bg-[#F8FCFF] p-6 shadow-sm">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#061A33] text-cyan-300">
        <Icon size={22} />
      </div>

      <h3 className="mt-5 text-xl font-black text-[#020B1F]">{step.title}</h3>

      <p className="mt-3 text-sm leading-7 text-slate-600">{step.text}</p>
    </article>
  );
}

function MiniCheck({ text }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-4">
      <CheckCircle2 className="mt-0.5 shrink-0 text-cyan-300" size={18} />
      <p className="text-sm font-semibold leading-6 text-slate-300">{text}</p>
    </div>
  );
}

function validateForm(form) {
  if (!form.fullName.trim()) {
    return ["Please enter your full name."];
  }

  if (!form.email.trim() && !form.phone.trim()) {
    return ["Please enter either your email address or phone number."];
  }

  if (!form.serviceNeeded.trim()) {
    return ["Please choose the service you need."];
  }

  if (!form.projectDetails.trim()) {
    return ["Please describe what you need help with."];
  }

  return [];
}

function normaliseServiceExplorerLead(rawLead) {
  const recommendedService = firstText(
    rawLead?.recommendedService,
    rawLead?.service,
    rawLead?.serviceNeeded,
    rawLead?.title
  );

  const pillar = firstText(
    rawLead?.pillar,
    rawLead?.servicePillar,
    rawLead?.service_pillar
  );

  const readiness = firstText(
    rawLead?.readiness,
    rawLead?.readinessLevel,
    rawLead?.readiness_level
  );

  const supporting = normaliseList(
    rawLead?.supporting,
    rawLead?.supportingServices,
    rawLead?.supporting_services
  );

  const answers = normaliseAnswers(
    rawLead?.answers,
    rawLead?.selectedAnswers,
    rawLead?.selected_answers
  );

  return {
    exists: Boolean(
      recommendedService || pillar || readiness || supporting || answers
    ),
    recommendedService,
    pillar,
    readiness,
    supporting,
    answers,
  };
}

function firstText(...values) {
  const found = values.find(
    (value) => typeof value === "string" && value.trim()
  );

  return found ? found.trim() : "";
}

function normaliseList(...values) {
  const found = values.find((value) => {
    if (Array.isArray(value)) return value.length > 0;
    return typeof value === "string" && value.trim();
  });

  if (!found) return "";

  if (Array.isArray(found)) {
    return found
      .map((item) => {
        if (typeof item === "string") return item;
        return item?.title || item?.name || item?.label || "";
      })
      .filter(Boolean)
      .join(", ");
  }

  return String(found).trim();
}

function normaliseAnswers(...values) {
  const found = values.find((value) => {
    if (Array.isArray(value)) return value.length > 0;
    if (value && typeof value === "object") return Object.keys(value).length > 0;
    return typeof value === "string" && value.trim();
  });

  if (!found) return "";

  if (Array.isArray(found)) {
    return found
      .map((item) => {
        if (typeof item === "string") return item;

        const question =
          item?.question || item?.label || item?.key || "Question";
        const answer = item?.answer || item?.value || item?.selected || "";

        return `${question}: ${answer}`;
      })
      .filter(Boolean)
      .join("\n");
  }

  if (typeof found === "object") {
    return Object.entries(found)
      .map(
        ([key, value]) => `${toReadableLabel(key)}: ${formatAnswerValue(value)}`
      )
      .join("\n");
  }

  return String(found).trim();
}

function formatAnswerValue(value) {
  if (Array.isArray(value)) return value.join(", ");
  if (value && typeof value === "object") {
    return value.answer || value.value || value.label || JSON.stringify(value);
  }
  return String(value || "");
}

function toReadableLabel(value) {
  return value
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function buildPrefillProjectDetails(lead) {
  const lines = [
    "Service Explorer Recommendation:",
    lead.recommendedService && `Recommended Service: ${lead.recommendedService}`,
    lead.pillar && `Service Pillar: ${lead.pillar}`,
    lead.readiness && `Readiness Level: ${lead.readiness}`,
    lead.supporting && `Supporting Services: ${lead.supporting}`,
    lead.answers && "",
    lead.answers && "Selected Answers:",
    lead.answers,
    "",
    "Additional project details:",
  ];

  return lines.filter(Boolean).join("\n");
}

function buildContactWhatsAppMessage(form, lead) {
  const lines = [
    "Hello MKETICS, I would like to request assistance.",
    "",
    "Client Details:",
    `Name: ${form.fullName || "Not provided"}`,
    `Phone: ${form.phone || "Not provided"}`,
    `Email: ${form.email || "Not provided"}`,
    `Business / Organisation: ${form.organisation || "Not provided"}`,
    "",
    "Project Direction:",
    `Service Needed: ${
      form.serviceNeeded || lead.recommendedService || "Not sure yet"
    }`,
    `Budget Direction: ${form.budget || "Not provided"}`,
    `Timeline: ${form.timeline || "Not provided"}`,
    `Preferred Contact: ${form.preferredContact || "WhatsApp"}`,
  ];

  if (lead.exists) {
    lines.push(
      "",
      "Service Explorer Recommendation:",
      `Recommended Service: ${lead.recommendedService || "Not provided"}`,
      `Service Pillar: ${lead.pillar || "Not provided"}`,
      `Readiness Level: ${lead.readiness || "Not provided"}`,
      `Supporting Services: ${lead.supporting || "Not provided"}`
    );

    if (lead.answers) {
      lines.push("", "Selected Answers:", lead.answers);
    }
  }

  lines.push(
    "",
    "Project Details:",
    form.projectDetails || "I need guidance on the right next step."
  );

  return lines.join("\n");
}

function buildEmailLink(form, lead) {
  const subject = `MKETICS Request - ${
    form.serviceNeeded || lead.recommendedService || "General Enquiry"
  }`;

  const body = buildContactWhatsAppMessage(form, lead);

  return `mailto:${contactDetails.email}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;
}