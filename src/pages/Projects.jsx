import { useMemo, useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Filter,
  Lightbulb,
  Sparkles,
} from "lucide-react";
import Button from "../components/ui/Button";
import { caseStudies, projectFilters } from "../data/caseStudies";

export default function Projects() {
  const [activeFilter, setActiveFilter] = useState("All");

  const filteredProjects = useMemo(() => {
    if (activeFilter === "All") return caseStudies;
    return caseStudies.filter((project) => project.service === activeFilter);
  }, [activeFilter]);

  return (
    <>
      <section className="relative isolate overflow-hidden bg-[#020B1F] px-5 py-16 text-white lg:py-24">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[540px] w-[540px] -translate-x-1/2 rounded-full bg-cyan-400/15 blur-[130px]" />
          <div className="absolute right-0 top-24 h-[420px] w-[420px] rounded-full bg-blue-600/15 blur-[120px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(25,217,255,0.10),transparent_38%),linear-gradient(180deg,rgba(2,11,31,0.1),#020B1F_92%)]" />
        </div>

        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.85fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-cyan-300/20 bg-white/[0.04] px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-cyan-200">
              <BriefcaseBusiness size={16} />
              Projects & Case Studies
            </div>

            <h1 className="mt-7 max-w-5xl text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-7xl">
              Practical technology projects built for{" "}
              <span className="bg-gradient-to-r from-cyan-200 via-white to-cyan-300 bg-clip-text text-transparent">
                real business needs.
              </span>
            </h1>

            <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-300">
              Explore selected MKETICS work across websites, IT infrastructure,
              business systems, digital documents and smart technology planning.
              Each project focuses on solving a real operational problem with a
              clear, useful and supportable solution.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Button to="/contact">
                Start a Project
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
                <Sparkles size={28} />
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-cyan-300">
                  Project Method
                </p>
                <h2 className="mt-3 text-2xl font-black text-white">
                  Problem. Solution. Result.
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  MKETICS presents projects in a simple structure so clients can
                  understand the value, not just the design or technology used.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              {[
                "Understand the client’s real need.",
                "Design a practical technology solution.",
                "Deliver something useful and supportable.",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2
                    className="mt-1 shrink-0 text-cyan-300"
                    size={20}
                  />
                  <p className="text-sm leading-6 text-slate-300">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#EAF6FF] px-5 py-16 text-[#061A33] lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-black uppercase tracking-[0.25em] text-[#0B7CFF]">
                Selected Work
              </p>
              <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
                Filter projects by service area.
              </h2>
              <p className="mt-5 text-lg leading-8 text-slate-700">
                These case studies can start as approved examples and be updated
                later with screenshots, client names and testimonials when ready.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-[#0B7CFF] shadow-sm">
              <Filter size={16} />
              {filteredProjects.length} project
              {filteredProjects.length === 1 ? "" : "s"} shown
            </div>
          </div>

          <div className="mb-8 flex flex-wrap gap-3">
            {projectFilters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`rounded-full px-5 py-3 text-sm font-bold transition ${
                  activeFilter === filter
                    ? "bg-[#061A33] text-cyan-200 shadow-[0_0_30px_rgba(0,174,239,0.16)]"
                    : "bg-white text-slate-700 hover:bg-[#061A33] hover:text-cyan-200"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.title} project={project} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-16 text-[#061A33] lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#EAF6FF] px-4 py-2 text-sm font-bold text-[#0B7CFF]">
              <Lightbulb size={16} />
              Why This Matters
            </div>

            <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-5xl">
              Projects should show business value, not only visuals.
            </h2>

            <p className="mt-5 text-lg leading-8 text-slate-700">
              MKETICS focuses on practical technology outcomes: better
              communication, stronger operations, clearer presentation, improved
              infrastructure and long-term digital readiness.
            </p>

            <Button to="/contact" className="mt-8">
              Discuss Your Project
              <ArrowRight size={18} className="ml-2" />
            </Button>
          </div>

          <div className="grid gap-4">
            {[
              "Clearer digital presence for businesses and organisations.",
              "Better workflows through portals, dashboards and digital systems.",
              "Stronger technology foundations through IT and network support.",
              "Professional documents and branded business presentation.",
              "Smart security and monitoring concepts before implementation.",
            ].map((item) => (
              <div
                key={item}
                className="flex gap-4 rounded-3xl border border-slate-200 bg-[#F8FCFF] p-5"
              >
                <CheckCircle2
                  className="mt-1 shrink-0 text-[#0B7CFF]"
                  size={20}
                />
                <p className="leading-7 text-slate-700">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#020B1F] px-5 pb-20 text-white lg:pb-28">
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-cyan-300/20 bg-cyan-400/10 p-8 md:p-14">
            <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-cyan-300/20 blur-[100px]" />

            <div className="relative max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-200">
                Your project can be next
              </p>
              <h2 className="mt-4 text-3xl font-black leading-tight sm:text-5xl">
                Let’s turn your idea into a clear technology plan.
              </h2>
              <p className="mt-5 text-lg leading-8 text-slate-200">
                Share your business need, challenge or idea. MKETICS will help
                you choose the right solution, scope and development path.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Button to="/contact">
                  Request a Quote
                  <ArrowRight size={18} className="ml-2" />
                </Button>
                <Button to="/pricing" variant="secondary">
                  View Starting Prices
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function ProjectCard({ project }) {
  const Icon = project.icon;

  return (
    <article className="group overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-cyan-300 hover:shadow-xl">
      <div className="border-b border-slate-100 bg-[#061A33] p-6 text-white">
        <div className="flex items-start justify-between gap-4">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-cyan-300/10 text-cyan-300">
            <Icon size={28} />
          </div>

          <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-bold text-cyan-100">
            {project.status}
          </span>
        </div>

        <h3 className="mt-6 text-2xl font-black">{project.title}</h3>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-slate-200">
            {project.sector}
          </span>
          <span className="rounded-full bg-cyan-300/10 px-3 py-1 text-xs font-bold text-cyan-100">
            {project.service}
          </span>
        </div>
      </div>

      <div className="grid gap-4 p-6">
        <CaseBlock label="Challenge" text={project.problem} />
        <CaseBlock label="Solution" text={project.solution} />
        <CaseBlock label="Result" text={project.result} />
      </div>
    </article>
  );
}

function CaseBlock({ label, text }) {
  return (
    <div className="rounded-3xl bg-[#F8FCFF] p-5">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-[#0B7CFF]">
        {label}
      </p>
      <p className="mt-2 text-sm leading-7 text-slate-700">{text}</p>
    </div>
  );
}