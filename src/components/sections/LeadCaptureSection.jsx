import { Send, ShieldCheck } from "lucide-react";
import Button from "../ui/Button";
import { siteConfig } from "../../data/site";

export default function LeadCaptureSection() {
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
          className="rounded-[2rem] border border-slate-200 bg-[#F8FCFF] p-6 shadow-xl"
          onSubmit={(event) => event.preventDefault()}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full Name" placeholder="Your name" />
            <Field label="Company / Organisation" placeholder="Business name" />
            <Field label="Phone / WhatsApp" placeholder="+27..." />
            <Field label="Email Address" placeholder="you@example.com" />
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Select
              label="Service Needed"
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
            <label className="text-sm font-bold text-[#061A33]">
              Project Description
            </label>
            <textarea
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

            <Button href={siteConfig.whatsapp} variant="light">
              WhatsApp MKETICS
            </Button>
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

function Field({ label, placeholder }) {
  return (
    <div>
      <label className="text-sm font-bold text-[#061A33]">{label}</label>
      <input
        type="text"
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
      />
    </div>
  );
}

function Select({ label, options }) {
  return (
    <div>
      <label className="text-sm font-bold text-[#061A33]">{label}</label>
      <select className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100">
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}