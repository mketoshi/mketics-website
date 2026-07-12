import {
  ArrowRight,
  CheckCircle2,
  Code2,
  FileText,
  Globe2,
  Headphones,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  WalletCards,
} from "lucide-react";
import SEO from "../components/seo/SEO";
import Button from "../components/ui/Button";
import { seoPages } from "../data/seo";
import { createWhatsAppLink } from "../utils/whatsapp";

const pricingOptions = [
  {
    title: "Business Readiness",
    price: "From R750",
    text: "For small admin, compliance direction, business documents or readiness support.",
    icon: FileText,
    points: ["Business guidance", "Document support", "Next-step advice"],
  },
  {
    title: "Website Launch",
    price: "From R2,500",
    text: "For a simple professional website or online presence.",
    icon: Globe2,
    points: ["Mobile-friendly layout", "Basic online presence", "Quote based on scope"],
  },
  {
    title: "Business Website / Store",
    price: "From R5,000",
    text: "For a stronger website, product catalogue, online store or lead-capture flow.",
    icon: WalletCards,
    points: ["More sections", "Product or service presentation", "Enquiry flow"],
  },
  {
    title: "Custom System",
    price: "Scoped Quote",
    text: "For dashboards, portals, booking systems, invoice systems and custom tools.",
    icon: Code2,
    points: ["Requirements discovery", "System planning", "Development roadmap"],
  },
];

const pricingModels = [
  "Once-off project",
  "Monthly support",
  "Phased build",
];

const pricingFactors = [
  "Number of pages, screens or system modules",
  "Content, images and branding readiness",
  "Payment, email, WhatsApp or third-party integrations",
  "Urgency and support level",
  "Hosting, domain, email or third-party costs",
  "Once-off, monthly or phased project structure",
];

export default function Pricing() {
  return (
    <main className="bg-white text-[#061A33]">
      <SEO {...seoPages.pricing} />

      <section className="relative isolate overflow-hidden bg-[#EAF6FF] px-5 py-10 lg:py-14">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-[-12rem] top-[-12rem] h-[34rem] w-[34rem] rounded-full bg-cyan-300/40 blur-[140px]" />
          <div className="absolute right-[-14rem] top-10 h-[36rem] w-[36rem] rounded-full bg-blue-500/20 blur-[150px]" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white/80 to-transparent" />
        </div>

        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-cyan-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-[#0B7CFF] shadow-sm">
              <WalletCards size={16} />
              MKETICS Pricing
            </div>

            <h1 className="mt-6 max-w-5xl text-4xl font-black leading-[1.05] tracking-tight text-[#020B1F] sm:text-5xl lg:text-6xl">
              Clear pricing direction before the{" "}
              <span className="bg-gradient-to-r from-[#0B7CFF] via-[#00AEEF] to-[#061A33] bg-clip-text text-transparent">
                final quote.
              </span>
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-700">
              Use these starting points to plan your budget. Final pricing is
              confirmed after MKETICS understands the real scope, timeline and
              support required.
            </p>

            <div className="mt-7 flex flex-col gap-4 sm:flex-row">
              <Button to="/contact">
                Request a Quote
                <ArrowRight size={18} className="ml-2" />
              </Button>

              <a
                href={createWhatsAppLink(
                  "Hello MKETICS, I would like help choosing the right pricing option. Please guide me on the next step."
                )}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-[#0B7CFF]/20 bg-white px-6 py-3 font-black text-[#061A33] shadow-sm transition hover:border-cyan-300 hover:bg-cyan-300"
              >
                <MessageCircle size={18} className="mr-2" />
                WhatsApp
              </a>
            </div>
          </div>

          <div className="rounded-[2.5rem] border border-white bg-white p-5 shadow-2xl">
            <div className="rounded-[2rem] bg-[#020B1F] p-6 text-white">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
                Pricing Principle
              </p>

              <h2 className="mt-3 text-3xl font-black">
                Start simple. Quote properly.
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-300">
                A serious quote should be based on clear requirements, not
                guessing. MKETICS can start small, support monthly or phase
                larger work.
              </p>

              <div className="mt-6 grid gap-3">
                <MiniCheck text="Starting prices guide planning" />
                <MiniCheck text="Final quotes follow confirmed scope" />
                <MiniCheck text="Large projects can be phased" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-14 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-[#0B7CFF]">
              Starting Points
            </p>

            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
              Choose a pricing direction.
            </h2>

            <p className="mt-5 text-lg leading-8 text-slate-700">
              These are not fixed quotes for every situation. They help you
              understand where your project may start.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {pricingOptions.map((item) => (
              <PricingCard key={item.title} item={item} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#EAF6FF] px-5 py-12 lg:py-14">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-[#0B7CFF]">
                Payment Structure
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                Once-off, monthly or phased.
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {pricingModels.map((model) => (
                <div
                  key={model}
                  className="rounded-2xl border border-cyan-100 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2
                      className="shrink-0 text-[#0B7CFF]"
                      size={18}
                    />
                    <p className="text-sm font-black text-[#061A33]">
                      {model}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-14 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-[#0B7CFF]">
              What Affects Price
            </p>

            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
              Scope comes before final pricing.
            </h2>

            <p className="mt-5 text-lg leading-8 text-slate-700">
              Two projects can sound similar but require different work.
              MKETICS confirms the final price after checking what must be
              delivered.
            </p>

            <div className="mt-7">
              <Button to="/contact">
                Request Formal Quote
                <ArrowRight size={18} className="ml-2" />
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {pricingFactors.map((factor) => (
              <div
                key={factor}
                className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-[#F8FCFF] p-4"
              >
                <CheckCircle2
                  className="mt-0.5 shrink-0 text-[#0B7CFF]"
                  size={18}
                />
                <p className="text-sm font-semibold leading-6 text-slate-700">
                  {factor}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#020B1F] px-5 py-14 text-white lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-6 rounded-[2rem] border border-cyan-300/20 bg-white/[0.05] p-6 lg:grid-cols-[0.85fr_1.15fr] lg:p-8">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-cyan-300">
              Need Help Choosing?
            </p>

            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
              Tell MKETICS your budget direction and goal.
            </h2>
          </div>

          <div>
            <p className="text-lg leading-8 text-slate-300">
              Share what you want to build, improve or fix, and MKETICS will
              recommend the right pricing path.
            </p>

            <div className="mt-7 flex flex-col gap-4 sm:flex-row">
              <Button to="/contact">
                Start Request
                <ArrowRight size={18} className="ml-2" />
              </Button>

              <a
                href={createWhatsAppLink(
                  "Hello MKETICS, I need help choosing the right package or custom quote. Please guide me on the next step."
                )}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-cyan-300 bg-white px-6 py-3 font-black text-[#061A33] transition hover:bg-cyan-300"
              >
                <MessageCircle size={18} className="mr-2" />
                WhatsApp Guidance
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function PricingCard({ item }) {
  const Icon = item.icon;

  return (
    <article className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-cyan-300 hover:shadow-xl">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#061A33] text-cyan-300">
        <Icon size={28} />
      </div>

      <h3 className="mt-6 text-2xl font-black text-[#020B1F]">
        {item.title}
      </h3>

      <p className="mt-3 text-3xl font-black text-[#0B7CFF]">
        {item.price}
      </p>

      <p className="mt-3 text-sm leading-7 text-slate-600">{item.text}</p>

      <div className="mt-5 grid gap-3">
        {item.points.map((point) => (
          <div key={point} className="flex items-start gap-3">
            <CheckCircle2
              className="mt-0.5 shrink-0 text-[#0B7CFF]"
              size={18}
            />
            <p className="text-sm font-semibold leading-6 text-slate-700">
              {point}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-6">
        <Button to="/contact" className="w-full justify-center">
          Request This
          <ArrowRight size={16} className="ml-2" />
        </Button>
      </div>
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