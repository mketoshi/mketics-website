import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Code2,
  FileCheck2,
  Globe2,
  Layers3,
  MessageCircle,
  Network,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";
import SEO from "../components/seo/SEO";
import Button from "../components/ui/Button";
import { seoPages } from "../data/seo";
import { createWhatsAppLink } from "../utils/whatsapp";

const projectProofs = [
  {
    title: "MKETICS Website & Lead Flow",
    status: "Live internal project",
    icon: Globe2,
    text: "A premium business website built to guide visitors from service discovery to quote request.",
    highlights: [
      "Responsive website structure",
      "Service and pricing guidance",
      "Contact form lead capture",
      "EmailJS enquiry flow",
    ],
  },
  {
    title: "Business System Planning",
    status: "Solution design",
    icon: Layers3,
    text: "Planning and scoping for dashboards, portals, booking flows, invoice systems and business tools.",
    highlights: [
      "Requirements discovery",
      "Workflow mapping",
      "System modules",
      "Phased development planning",
    ],
  },
  {
    title: "IT & Network Support",
    status: "Technical support",
    icon: Network,
    text: "Support direction for connectivity, office technology, email setup, device support and network improvement.",
    highlights: [
      "Wi-Fi and network assessment",
      "Office technology support",
      "Cloud and email guidance",
      "Technical documentation",
    ],
  },
  {
    title: "Digital Business Readiness",
    status: "Business support",
    icon: FileCheck2,
    text: "Support for businesses that need stronger presentation, better documents and clearer digital readiness.",
    highlights: [
      "Company profile direction",
      "Business proposal support",
      "Digital readiness guidance",
      "Online visibility planning",
    ],
  },
];

const deliverySteps = [
  {
    title: "Understand",
    text: "MKETICS starts by understanding the client’s goal, current challenge, users and expected outcome.",
    icon: SearchCheck,
  },
  {
    title: "Scope",
    text: "The work is converted into a clearer scope, service path, phase plan or quotation direction.",
    icon: ClipboardList,
  },
  {
    title: "Build",
    text: "The solution moves into design, setup, development, configuration or technical implementation.",
    icon: Code2,
  },
  {
    title: "Support",
    text: "Where needed, MKETICS supports the client after delivery with updates, maintenance or improvements.",
    icon: Wrench,
  },
];

const capabilityProof = [
  {
    title: "Digital Presence",
    text: "Websites, landing pages, online stores, product catalogues and lead-capture pages.",
    icon: Globe2,
  },
  {
    title: "Custom Systems",
    text: "Dashboards, portals, booking systems, invoice tools and business workflow systems.",
    icon: Layers3,
  },
  {
    title: "Technical Support",
    text: "IT support, network guidance, cloud tools, business email and office technology support.",
    icon: ShieldCheck,
  },
];

export default function Projects() {
  return (
    <main className="bg-white text-[#061A33]">
      <SEO {...seoPages.projects} />

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
              MKETICS Projects
            </div>

            <h1 className="mt-6 max-w-5xl text-4xl font-black leading-[1.05] tracking-tight text-[#020B1F] sm:text-5xl lg:text-6xl">
              Proof of digital thinking,{" "}
              <span className="bg-gradient-to-r from-[#0B7CFF] via-[#00AEEF] to-[#061A33] bg-clip-text text-transparent">
                structure and delivery.
              </span>
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-700">
              MKETICS projects focus on practical outcomes: better online
              presence, clearer operations, stronger digital communication and
              technology that supports real business needs.
            </p>

            <div className="mt-7 flex flex-col gap-4 sm:flex-row">
              <Button to="/contact">
                Start a Project
                <ArrowRight size={18} className="ml-2" />
              </Button>

              <Link
                to="/services"
                className="inline-flex items-center justify-center rounded-full border border-[#0B7CFF]/25 bg-white px-6 py-3 font-black text-[#061A33] shadow-sm transition hover:border-cyan-300 hover:bg-cyan-300"
              >
                View Services
              </Link>
            </div>
          </div>

          <div className="hidden rounded-[2.5rem] border border-white bg-white p-5 shadow-2xl lg:block">
            <div className="rounded-[2rem] bg-[#020B1F] p-6 text-white">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
                Project Approach
              </p>

              <h2 className="mt-3 text-3xl font-black">
                Build with purpose, not guesswork.
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-300">
                A good project starts with clear requirements, realistic scope,
                proper communication and a delivery path that matches the
                client’s budget and readiness.
              </p>

              <div className="mt-6 grid gap-3">
                <MiniCheck text="Clear business problem" />
                <MiniCheck text="Practical technology solution" />
                <MiniCheck text="Structured delivery path" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-12 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-[#0B7CFF]">
              Project Proof
            </p>

            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
              Selected areas of execution.
            </h2>

            <p className="mt-5 text-lg leading-8 text-slate-700">
              This page highlights the types of work MKETICS can plan, build or
              support without overwhelming visitors with a long portfolio.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {projectProofs.map((project) => (
              <ProjectCard key={project.title} project={project} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#EAF6FF] px-5 py-12 lg:py-14">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-[#0B7CFF]">
                Capabilities
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                What MKETICS can deliver.
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {capabilityProof.map((item) => (
                <CapabilityCard key={item.title} item={item} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-12 lg:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-[#0B7CFF]">
              Delivery Method
            </p>

            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
              A simple path from idea to implementation.
            </h2>

            <p className="mt-5 text-lg leading-8 text-slate-700">
              MKETICS avoids rushing into development without understanding the
              problem. The project journey should be clear before execution
              starts.
            </p>

            <div className="mt-7">
              <Button to="/contact">
                Discuss a Project
                <ArrowRight size={18} className="ml-2" />
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {deliverySteps.map((step) => (
              <StepCard key={step.title} step={step} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#020B1F] px-5 py-14 text-white lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-6 rounded-[2rem] border border-cyan-300/20 bg-white/[0.05] p-6 lg:grid-cols-[0.85fr_1.15fr] lg:p-8">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-cyan-300">
              Have a Project?
            </p>

            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
              Tell MKETICS what you want to build or improve.
            </h2>
          </div>

          <div>
            <p className="text-lg leading-8 text-slate-300">
              Share your idea, challenge, budget direction and timeline.
              MKETICS will help you confirm the right scope and next step.
            </p>

            <div className="mt-7 flex flex-col gap-4 sm:flex-row">
              <Button to="/contact">
                Start Project Request
                <ArrowRight size={18} className="ml-2" />
              </Button>

              <a
                href={createWhatsAppLink(
                  "Hello MKETICS, I would like to discuss a project idea. Please help me confirm the right scope and next step."
                )}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-cyan-300 bg-white px-6 py-3 font-black text-[#061A33] transition hover:bg-cyan-300"
              >
                <MessageCircle size={18} className="mr-2" />
                WhatsApp Project
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function ProjectCard({ project }) {
  const Icon = project.icon;

  return (
    <article className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-cyan-300 hover:shadow-xl">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#061A33] text-cyan-300">
        <Icon size={28} />
      </div>

      <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">
        {project.status}
      </p>

      <h3 className="mt-3 text-2xl font-black text-[#020B1F]">
        {project.title}
      </h3>

      <p className="mt-3 text-sm leading-7 text-slate-600">{project.text}</p>

      <div className="mt-5 hidden gap-3 sm:grid">
        {project.highlights.map((item) => (
          <div key={item} className="flex items-start gap-3">
            <CheckCircle2
              className="mt-0.5 shrink-0 text-[#0B7CFF]"
              size={18}
            />
            <p className="text-sm font-semibold leading-6 text-slate-700">
              {item}
            </p>
          </div>
        ))}
      </div>
    </article>
  );
}

function CapabilityCard({ item }) {
  const Icon = item.icon;

  return (
    <article className="rounded-2xl border border-cyan-100 bg-white p-5 shadow-sm">
      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#061A33] text-cyan-300">
        <Icon size={22} />
      </div>

      <h3 className="mt-4 text-lg font-black text-[#020B1F]">{item.title}</h3>

      <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
    </article>
  );
}

function StepCard({ step }) {
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