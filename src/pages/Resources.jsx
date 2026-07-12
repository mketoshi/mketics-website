import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  FileText,
  Globe2,
  Layers3,
  Lightbulb,
  Mail,
  MessageCircle,
  Rocket,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";
import SEO from "../components/seo/SEO";
import Button from "../components/ui/Button";
import { seoPages } from "../data/seo";
import { createWhatsAppLink } from "../utils/whatsapp";

const featuredResources = [
  {
    title: "Website Readiness Guide",
    category: "Online Presence",
    icon: Globe2,
    text: "Understand what your business should prepare before requesting a website or online store.",
    points: ["Business details", "Services or products", "Images and content"],
  },
  {
    title: "Custom System Scoping Checklist",
    category: "Systems",
    icon: Layers3,
    text: "Plan what your portal, dashboard, booking system or business tool should include.",
    points: ["Users and roles", "Main features", "Reports and workflows"],
  },
  {
    title: "IT & Email Setup Guide",
    category: "IT Support",
    icon: Wrench,
    text: "Prepare for professional email, cloud tools, device support and basic office technology setup.",
    points: ["Email accounts", "Devices", "Access and support needs"],
  },
  {
    title: "Digital Business Readiness",
    category: "Business Support",
    icon: FileText,
    text: "Check whether your business has the basic digital documents and online visibility needed to look professional.",
    points: ["Company profile", "Google Business Profile", "Proposal readiness"],
  },
];

const quickTips = [
  {
    title: "Before requesting a website",
    text: "Prepare your business name, services, contact details, logo, images and the main action you want visitors to take.",
    icon: Globe2,
  },
  {
    title: "Before requesting a system",
    text: "Write down the manual process, who uses it, what data is captured and what reports you need.",
    icon: ClipboardList,
  },
  {
    title: "Before requesting IT support",
    text: "List the devices, users, internet setup, email accounts and the problems affecting daily work.",
    icon: ShieldCheck,
  },
];

const readinessChecklist = [
  "Do you have clear business contact details?",
  "Do you know the main service or product you want to promote?",
  "Do you have a logo, brand colours or company profile?",
  "Do you know what action visitors should take on your website?",
  "Do you have business email or need help setting it up?",
  "Do you need once-off work, monthly support or a phased project?",
];

const resourcePaths = [
  "Website or online presence",
  "Custom system or portal",
  "IT support or business email",
  "Digital marketing or visibility",
  "Business documents or readiness support",
];

export default function Resources() {
  return (
    <main className="bg-white text-[#061A33]">
      <SEO {...seoPages.resources} />

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
              MKETICS Resources
            </div>

            <h1 className="mt-6 max-w-5xl text-4xl font-black leading-[1.05] tracking-tight text-[#020B1F] sm:text-5xl lg:text-6xl">
              Helpful guidance before you{" "}
              <span className="bg-gradient-to-r from-[#0B7CFF] via-[#00AEEF] to-[#061A33] bg-clip-text text-transparent">
                build, launch or improve.
              </span>
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-700">
              Use these resources to understand what to prepare before
              requesting a website, custom system, IT support or digital
              business solution from MKETICS.
            </p>

            <div className="mt-7 flex flex-col gap-4 sm:flex-row">
              <Button to="/contact">
                Ask for Guidance
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
                Resource Purpose
              </p>

              <h2 className="mt-3 text-3xl font-black">
                Prepare better. Scope better.
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-300">
                Better preparation makes it easier to quote, plan and deliver
                digital work properly.
              </p>

              <div className="mt-6 grid gap-3">
                <MiniCheck text="Understand your need" />
                <MiniCheck text="Prepare project information" />
                <MiniCheck text="Request the right service" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-12 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-[#0B7CFF]">
              Featured Resources
            </p>

            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
              Start with the right guide.
            </h2>

            <p className="mt-5 text-lg leading-8 text-slate-700">
              These resource areas help clients prepare before requesting a
              quote or starting a project.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {featuredResources.map((resource) => (
              <ResourceCard key={resource.title} resource={resource} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#EAF6FF] px-5 py-12 lg:py-14">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-[#0B7CFF]">
                Quick Tips
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                What to prepare first.
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {quickTips.map((tip) => (
                <TipCard key={tip.title} tip={tip} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-12 lg:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-[#0B7CFF]">
              Readiness Check
            </p>

            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
              Check if your business is ready to start.
            </h2>

            <p className="mt-5 text-lg leading-8 text-slate-700">
              You do not need everything perfect before contacting MKETICS, but
              these points help speed up scoping and pricing.
            </p>

            <div className="mt-7">
              <Button to="/contact">
                Request Readiness Help
                <ArrowRight size={18} className="ml-2" />
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {readinessChecklist.map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-[#F8FCFF] p-4"
              >
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
        </div>
      </section>

      <section className="bg-[#EAF6FF] px-5 py-12 lg:py-14">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 rounded-[2rem] border border-cyan-100 bg-white p-6 shadow-sm lg:grid-cols-[0.8fr_1.2fr] lg:p-8">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-[#0B7CFF]">
                Service Direction
              </p>

              <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                Not sure which service fits?
              </h2>
            </div>

            <div>
              <p className="text-lg leading-8 text-slate-700">
                Start by choosing the closest direction. MKETICS can help refine
                the final scope.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {resourcePaths.map((path) => (
                  <div key={path} className="flex items-start gap-3">
                    <SearchCheck
                      className="mt-0.5 shrink-0 text-[#0B7CFF]"
                      size={18}
                    />
                    <p className="text-sm font-semibold leading-6 text-slate-700">
                      {path}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-7">
                <Button to="/contact">
                  Help Me Choose
                  <ArrowRight size={18} className="ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#020B1F] px-5 py-14 text-white lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-6 rounded-[2rem] border border-cyan-300/20 bg-white/[0.05] p-6 lg:grid-cols-[0.85fr_1.15fr] lg:p-8">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-cyan-300">
              Need Personal Guidance?
            </p>

            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
              Tell MKETICS what you want to prepare.
            </h2>
          </div>

          <div>
            <p className="text-lg leading-8 text-slate-300">
              Share what you want to build, fix or improve. MKETICS can help
              you understand the right starting point before quoting.
            </p>

            <div className="mt-7 flex flex-col gap-4 sm:flex-row">
              <Button to="/contact">
                Start Guidance Request
                <ArrowRight size={18} className="ml-2" />
              </Button>

              <a
                href={createWhatsAppLink(
                  "Hello MKETICS, I need guidance before starting a digital project. Please help me understand the right next step."
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

function ResourceCard({ resource }) {
  const Icon = resource.icon;

  return (
    <article className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-cyan-300 hover:shadow-xl">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#061A33] text-cyan-300">
        <Icon size={28} />
      </div>

      <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">
        {resource.category}
      </p>

      <h3 className="mt-3 text-2xl font-black text-[#020B1F]">
        {resource.title}
      </h3>

      <p className="mt-3 text-sm leading-7 text-slate-600">{resource.text}</p>

      <div className="mt-5 hidden gap-3 sm:grid">
        {resource.points.map((point) => (
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
    </article>
  );
}

function TipCard({ tip }) {
  const Icon = tip.icon;

  return (
    <article className="rounded-2xl border border-cyan-100 bg-white p-5 shadow-sm">
      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#061A33] text-cyan-300">
        <Icon size={22} />
      </div>

      <h3 className="mt-4 text-lg font-black text-[#020B1F]">{tip.title}</h3>

      <p className="mt-2 text-sm leading-6 text-slate-600">{tip.text}</p>
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