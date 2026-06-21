import {
  ArrowRight,
  CheckCircle2,
  Info,
  Sparkles,
  WalletCards,
} from "lucide-react";
import Button from "../components/ui/Button";
import SEO from "../components/seo/SEO";
import TrustCredibility from "../components/sections/TrustCredibility";
import { pricingNotes, pricingPackages } from "../data/pricing";

export default function Pricing() {
  return (
    <>
      <SEO
        title="MKETICS Pricing | Website, IT Support & Digital Business Packages"
        description="View MKETICS starting prices for websites, business systems, IT support, digital business services, smart security planning and business readiness packages."
        path="/pricing"
      />

      <section className="relative isolate overflow-hidden bg-[#020B1F] px-5 py-16 text-white lg:py-24">
        <div className="absolute inset-0 -z-10">
          <img
            src="/assets/mketics-bg5.png"
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover object-center opacity-35"
          />
          <div className="absolute inset-0 bg-[#020B1F]/75" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#020B1F] via-[#020B1F]/85 to-[#020B1F]/45" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#020B1F]/30 via-transparent to-[#020B1F]" />
          <div className="absolute left-1/2 top-0 h-[540px] w-[540px] -translate-x-1/2 rounded-full bg-cyan-400/15 blur-[130px]" />
          <div className="absolute right-0 top-24 h-[420px] w-[420px] rounded-full bg-blue-600/15 blur-[120px]" />
        </div>

        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.85fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-cyan-300/20 bg-white/[0.04] px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-cyan-200">
              <WalletCards size={16} />
              Service Packages
            </div>

            <h1 className="mt-7 max-w-5xl text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              Transparent starting prices for{" "}
              <span className="bg-gradient-to-r from-cyan-200 via-white to-cyan-300 bg-clip-text text-transparent">
                smart digital solutions.
              </span>
            </h1>

            <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-300">
              MKETICS provides starting prices to help clients plan. Final
              pricing depends on scope, urgency, content, integrations, features
              and support requirements.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Button to="/contact">
                Request a Custom Quote
                <ArrowRight size={18} className="ml-2" />
              </Button>
              <Button to="/services" variant="secondary">
                Explore Services
              </Button>
            </div>
          </div>

          <div className="rounded-[2rem] border border-cyan-300/20 bg-white/[0.05] p-6 backdrop-blur-xl">
            <div className="flex items-start gap-4">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-cyan-400/10 text-cyan-200">
                <Sparkles size={26} />
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-300">
                  Pricing Principle
                </p>
                <h2 className="mt-3 text-2xl font-black text-white">
                  Start clear. Grow when ready.
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  Not every project needs to start big. MKETICS can begin with a
                  focused solution and expand as your business grows.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-5">
              <p className="text-sm font-semibold text-cyan-100">
                Best next step
              </p>
              <p className="mt-2 text-xl font-black text-white">
                Share your need, budget and timeline.
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                MKETICS will recommend the most practical package or phased
                approach.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#EAF6FF] px-5 py-16 text-[#061A33] lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-[#0B7CFF]">
              Starting Prices
            </p>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
              Choose a package that matches your starting point.
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-700">
              These packages help you understand the typical entry point for
              MKETICS services. A final quotation is prepared after confirming
              the real scope.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {pricingPackages.map((item) => (
              <PricingCard key={item.name} item={item} />
            ))}
          </div>
        </div>
      </section>

      <TrustCredibility
        variant="dark"
        title="Pricing should feel clear, professional and safe."
        description="MKETICS uses starting prices to help clients understand the investment range, while final quotations are based on scope, complexity, timelines and required deliverables."
      />

      <section className="bg-white px-5 py-16 text-[#061A33] lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#EAF6FF] px-4 py-2 text-sm font-bold text-[#0B7CFF]">
              <Info size={16} />
              Important Pricing Notes
            </div>

            <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-5xl">
              Clear scope protects both MKETICS and the client.
            </h2>

            <p className="mt-5 text-lg leading-8 text-slate-700">
              Website prices are helpful for planning, but custom work must be
              confirmed in writing. Scope, timeline, integrations and third-party
              costs can change the final price.
            </p>

            <Button to="/contact" className="mt-8">
              Request a Quote
              <ArrowRight size={18} className="ml-2" />
            </Button>
          </div>

          <div className="grid gap-4">
            {pricingNotes.map((note) => (
              <div
                key={note}
                className="flex gap-4 rounded-3xl border border-slate-200 bg-[#F8FCFF] p-5"
              >
                <CheckCircle2
                  className="mt-1 shrink-0 text-[#0B7CFF]"
                  size={20}
                />
                <p className="leading-7 text-slate-700">{note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#020B1F] px-5 pb-20 text-white lg:pb-28">
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-cyan-300/20 bg-cyan-400/10 p-8 md:p-14">
            <div className="absolute inset-0 -z-0">
              <img
                src="/assets/mketics-bg1.png"
                alt=""
                aria-hidden="true"
                className="h-full w-full object-cover object-center opacity-25"
              />
              <div className="absolute inset-0 bg-[#020B1F]/80" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#020B1F] via-[#020B1F]/75 to-transparent" />
            </div>

            <div className="relative max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-200">
                Need help choosing?
              </p>
              <h2 className="mt-4 text-3xl font-black leading-tight sm:text-5xl">
                Tell MKETICS what you want to achieve.
              </h2>
              <p className="mt-5 text-lg leading-8 text-slate-200">
                You do not need to know the exact technical solution. Share your
                business need, and MKETICS will guide you toward the right
                package, scope or phased plan.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Button to="/contact">
                  Request a Custom Quote
                  <ArrowRight size={18} className="ml-2" />
                </Button>
                <Button to="/services" variant="secondary">
                  View All Services
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function PricingCard({ item }) {
  const Icon = item.icon;

  return (
    <article className="group flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-cyan-300 hover:shadow-xl">
      <div className="flex items-start justify-between gap-4">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#061A33] text-cyan-300 shadow-[0_0_30px_rgba(0,174,239,0.18)]">
          <Icon size={28} />
        </div>

        <span className="rounded-full bg-[#EAF6FF] px-3 py-1 text-xs font-bold text-[#0B7CFF]">
          {item.timeline}
        </span>
      </div>

      <h3 className="mt-6 text-2xl font-black text-[#020B1F]">{item.name}</h3>

      <p className="mt-3 text-3xl font-black text-[#0B7CFF]">{item.price}</p>

      <p className="mt-3 text-sm leading-7 text-slate-600">
        {item.description}
      </p>

      <div className="mt-5 rounded-2xl bg-[#EAF6FF] p-4">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">
          Best for
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-700">{item.bestFor}</p>
      </div>

      <div className="mt-5 grid gap-3">
        {item.features.map((feature) => (
          <div key={feature} className="flex gap-3">
            <CheckCircle2
              className="mt-0.5 shrink-0 text-[#0B7CFF]"
              size={18}
            />
            <p className="text-sm leading-6 text-slate-700">{feature}</p>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-6">
        <Button to="/contact" className="w-full">
          Request This Package
          <ArrowRight size={16} className="ml-2" />
        </Button>
      </div>
    </article>
  );
}