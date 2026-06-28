import { Send, ShieldCheck, MessageCircle } from "lucide-react";
import Button from "../ui/Button";
import { siteConfig } from "../../data/site";
import { createWhatsAppLink, whatsappMessages } from "../../utils/whatsapp";

export default function LeadCaptureSection() {
  const whatsappLink = createWhatsAppLink(whatsappMessages.general);

  return (
    <section className="bg-white px-5 py-16 text-[#061A33] lg:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.25em] text-[#0B7CFF]">
            Start with clarity
          </p>

          <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
            Tell us what you need. We’ll help you find the right solution.
          </h2>

          <p className="mt-5 text-lg leading-8 text-slate-700">
            You do not need to know all the technical details before reaching
            out. Share your business need, challenge or idea, and MKETICS will
            help you understand what is possible, what is practical and what
            solution fits your budget and goals.
          </p>

          <div className="mt-8 rounded-[2rem] bg-[#EAF6FF] p-6">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#061A33] text-cyan-300">
                <ShieldCheck size={24} />
              </div>

              <div>
                <h3 className="font-black text-[#020B1F]">
                  Your information is handled responsibly.
                </h3>

                <p className="mt-2 text-sm leading-7 text-slate-700">
                  Your information is used only to respond to your request and
                  provide relevant MKETICS service guidance.
                </p>
              </div>
            </div>
          </div>
        </div>

        <form
          className="rounded-[2rem] border border-slate-200 bg-[#F8FCFF] p-6 shadow-lg lg:shadow-xl"
          onSubmit={(event) => event.preventDefault()}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Full Name"
              name="lead-full-name"
              placeholder="Your name"
              autoComplete="name"
            />

            <Field
              label="Company / Organisation"
              name="lead-company-organisation"
              placeholder="Business name"
              autoComplete="organization"
            />

            <Field
              label="Phone / WhatsApp"
              name="lead-phone-whatsapp"
              placeholder="+27..."
              type="tel"
              autoComplete="tel"
            />

            <Field
              label="Email Address"
              name="lead-email-address"
              placeholder="you@example.com"
              type="email"
              autoComplete="email"
            />
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Select
              label="Service Needed"
              name="lead-service-needed"
              options={[
                "Website / business system",
                "IT support",
                "Digital business tools",
                "Security / cameras",
                "Google Workspace",
                "Not sure yet",
              ]}
            />

            <Select
              label="Budget Range"
              name="lead-budget-range"
              options={[
                "Starter",
                "Standard",
                "Premium",
                "Enterprise / custom",
                "Not sure yet",
              ]}
            />
          </div>

          <div className="mt-4">
            <label
              htmlFor="lead-project-description"
              className="text-sm font-bold text-[#061A33]"
            >
              Project Description
            </label>

            <textarea
              id="lead-project-description"
              name="lead-project-description"
              rows="5"
              placeholder="Briefly describe what you need help with..."
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
            />
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button href={`mailto:${siteConfig.email}`} className="sm:w-auto">
              Submit My Request
              <Send size={16} className="ml-2" />
            </Button>

            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-cyan-300 bg-white px-6 py-3 font-black text-[#061A33] transition hover:bg-[#061A33] hover:text-cyan-200"
            >
              <MessageCircle size={16} />
              WhatsApp MKETICS
            </a>
          </div>

          <p className="mt-4 text-xs leading-6 text-slate-500">
            Form connection will be added in the lead generation phase. For now,
            use email or WhatsApp to send your request.
          </p>
        </form>
      </div>
    </section>
  );
}

function Field({
  label,
  name,
  placeholder,
  type = "text",
  autoComplete = "off",
}) {
  return (
    <div>
      <label htmlFor={name} className="text-sm font-bold text-[#061A33]">
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
      />
    </div>
  );
}

function Select({ label, name, options }) {
  return (
    <div>
      <label htmlFor={name} className="text-sm font-bold text-[#061A33]">
        {label}
      </label>

      <select
        id={name}
        name={name}
        defaultValue=""
        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
      >
        <option value="" disabled>
          Select an option
        </option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}