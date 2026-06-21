import {
  ArrowRight,
  Sparkles,
  Target,
  Eye,
  HeartHandshake,
  Lightbulb,
  ShieldCheck,
  Users,
  Cpu,
  CheckCircle2,
  Building2,
  Globe2,
  Workflow,
} from "lucide-react";
import Button from "../components/ui/Button";
import SEO from "../components/seo/SEO";

const values = [
  {
    icon: Lightbulb,
    title: "Innovation",
    text: "We create modern and practical technology solutions that support business growth and digital transformation.",
  },
  {
    icon: Users,
    title: "Ubuntu",
    text: "We believe technology should support people, unity, community progress and shared value.",
  },
  {
    icon: ShieldCheck,
    title: "Excellence",
    text: "We aim to deliver professional, reliable and high-quality work that clients can trust.",
  },
  {
    icon: Building2,
    title: "Integrity",
    text: "We communicate clearly, work honestly and respect every client relationship.",
  },
];

const approach = [
  {
    title: "Understand",
    text: "We begin by understanding the client’s business, needs, challenges, goals and operating environment.",
  },
  {
    title: "Design",
    text: "We plan the right solution based on the client’s operations, budget, workflow and future growth.",
  },
  {
    title: "Deliver",
    text: "We build, configure, document, test and hand over the final solution.",
  },
  {
    title: "Support",
    text: "We maintain professional relationships and provide guidance after delivery where required.",
  },
];

const helpItems = [
  "Professional websites, landing pages and online stores.",
  "Custom systems, client portals, dashboards and workflow tools.",
  "IT infrastructure, networks, Wi-Fi, devices and cloud support.",
  "Digital documents, company profiles, proposals and business tools.",
  "Compliance support, business readiness and digital transformation guidance.",
  "Smart security planning, IP camera concepts and monitoring support.",
];

export default function About() {
  return (
    <>
    <SEO
    title="About MKETICS | Purpose-Driven Technology Company"
    description="Learn about MKETICS, a purpose-driven South African technology company built on innovation, Ubuntu, professional service and long-term digital value."
    path="/about"
    />
      <section className="relative isolate overflow-hidden bg-[#020B1F] px-5 py-16 text-white lg:py-24">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-cyan-400/10 blur-[130px]" />
          <div className="absolute right-0 top-32 h-[420px] w-[420px] rounded-full bg-blue-500/10 blur-[120px]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.04)_1px,transparent_1px)] bg-[size:72px_72px]" />
        </div>

        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_0.85fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-cyan-300/20 bg-white/[0.04] px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-cyan-200">
              <Sparkles size={16} />
              About MKETICS
            </div>

            <h1 className="mt-7 max-w-5xl text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-7xl">
              Technology built with{" "}
              <span className="bg-gradient-to-r from-cyan-200 via-white to-cyan-300 bg-clip-text text-transparent">
                purpose, pride and Ubuntu.
              </span>
            </h1>

            <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-300">
              MKETICS is a South African technology solutions company focused on
              building practical digital systems, reliable IT infrastructure and
              professional business technology support.
            </p>

            <p className="mt-4 max-w-3xl text-base leading-7 text-cyan-100/90">
              We create smart digital systems, strengthen businesses, connect
              people and inspire unity through innovation, Ubuntu and long-term
              value.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Button to="/services">
                Explore Services
                <ArrowRight size={18} className="ml-2" />
              </Button>
              <Button to="/contact" variant="secondary">
                Contact MKETICS
              </Button>
            </div>
          </div>

          <div className="rounded-[2rem] border border-cyan-300/20 bg-white/[0.05] p-6 backdrop-blur-xl">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-cyan-300">
              Company Meaning
            </p>

            <h2 className="mt-4 text-3xl font-black leading-tight">
              Modern Knowledge Engineering, Technology & Innovative Commercial
              Solutions
            </h2>

            <p className="mt-5 leading-8 text-slate-300">
              The name MKETICS reflects a company built around knowledge,
              engineering, technology, innovation and commercial value.
            </p>

            <div className="mt-6 grid gap-4">
              <MeaningItem icon={Cpu} text="Modern digital systems" />
              <MeaningItem
                icon={Lightbulb}
                text="Knowledge-driven innovation"
              />
              <MeaningItem
                icon={Globe2}
                text="Commercial solutions for growth"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#EAF6FF] px-5 py-16 text-[#061A33] lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-3">
            <PurposeCard
              icon={Target}
              title="Our Purpose"
              text="To create smart digital systems, strengthen businesses, connect people and inspire unity through innovation, Ubuntu and long-term value."
            />
            <PurposeCard
              icon={Eye}
              title="Our Vision"
              text="To become a trusted and influential technology company that transforms how businesses, institutions and communities use digital systems to work, connect and grow."
            />
            <PurposeCard
              icon={HeartHandshake}
              title="Our Mission"
              text="To design, develop and deliver reliable technology solutions that improve operations, strengthen business performance, connect people and create long-term value."
            />
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-16 text-[#061A33] lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-[#0B7CFF]">
              What We Stand For
            </p>
            <h2 className="mt-4 text-3xl font-black leading-tight sm:text-5xl">
              A serious technology company with a people-first foundation.
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-700">
              MKETICS combines technical skill, business understanding and
              Ubuntu-inspired thinking to help clients move from ideas to
              working digital solutions.
            </p>
          </div>

          <div className="grid gap-5">
            {values.map((value) => (
              <ValueRow key={value.title} {...value} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#020B1F] px-5 py-16 text-white lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-white/5 px-4 py-2 text-sm text-cyan-100">
              <Workflow size={16} />
              Our Approach
            </div>

            <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-5xl">
              Clear process. Practical delivery. Long-term value.
            </h2>

            <p className="mt-5 text-lg leading-8 text-slate-300">
              MKETICS follows a practical process designed to reduce confusion,
              understand real needs and deliver solutions that work in the
              client’s environment.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {approach.map((item, index) => (
              <div
                key={item.title}
                className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6"
              >
                <p className="text-sm font-black text-cyan-300">
                  0{index + 1}
                </p>
                <h3 className="mt-3 text-2xl font-black text-white">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#EAF6FF] px-5 py-16 text-[#061A33] lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[2rem] border border-cyan-200 bg-white p-8 shadow-xl md:p-10">
            <div className="mb-10 max-w-3xl">
              <p className="text-sm font-black uppercase tracking-[0.25em] text-[#0B7CFF]">
                How MKETICS Helps
              </p>
              <h2 className="mt-4 text-3xl font-black sm:text-5xl">
                From digital presence to full business systems.
              </h2>
              <p className="mt-5 leading-8 text-slate-700">
                MKETICS supports clients across different stages of their
                digital journey, whether they are starting, improving,
                automating or scaling.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {helpItems.map((item) => (
                <HelpItem key={item} text={item} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#020B1F] px-5 pb-20 text-white lg:pb-28">
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-cyan-300/20 bg-cyan-400/10 p-8 md:p-14">
            <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-cyan-300/20 blur-[100px]" />
            <div className="relative max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-200">
                Work With MKETICS
              </p>
              <h2 className="mt-4 text-3xl font-black leading-tight sm:text-5xl">
                Let’s build technology that supports real growth.
              </h2>
              <p className="mt-5 text-lg leading-8 text-slate-200">
                Whether you need a website, business system, infrastructure
                support or digital business solution, MKETICS can help you plan
                and build with clarity.
              </p>

              <Button to="/contact" className="mt-8">
                Start a Conversation
                <ArrowRight size={18} className="ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function MeaningItem({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-cyan-300/25 bg-cyan-400/10 text-cyan-200">
        <Icon size={22} />
      </span>
      <span className="font-bold text-slate-100">{text}</span>
    </div>
  );
}

function PurposeCard({ icon: Icon, title, text }) {
  return (
    <article className="rounded-[2rem] border border-cyan-100 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-cyan-300 hover:shadow-xl">
      <div className="mb-6 inline-flex rounded-2xl bg-[#061A33] p-4 text-cyan-300">
        <Icon size={28} />
      </div>
      <h3 className="text-2xl font-black text-[#020B1F]">{title}</h3>
      <p className="mt-4 leading-7 text-slate-700">{text}</p>
    </article>
  );
}

function ValueRow({ icon: Icon, title, text }) {
  return (
    <div className="flex gap-5 rounded-3xl border border-slate-200 bg-[#F8FCFF] p-6 transition hover:border-cyan-300">
      <div className="grid h-13 w-13 shrink-0 place-items-center rounded-2xl bg-[#061A33] p-3 text-cyan-300">
        <Icon size={24} />
      </div>
      <div>
        <h3 className="text-xl font-black text-[#020B1F]">{title}</h3>
        <p className="mt-2 leading-7 text-slate-700">{text}</p>
      </div>
    </div>
  );
}

function HelpItem({ text }) {
  return (
    <div className="flex gap-4 rounded-3xl border border-slate-200 bg-[#F8FCFF] p-5">
      <CheckCircle2 className="mt-1 shrink-0 text-[#0B7CFF]" size={20} />
      <p className="leading-7 text-slate-700">{text}</p>
    </div>
  );
}