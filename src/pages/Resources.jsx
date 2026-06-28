import { useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Filter,
  Lightbulb,
  Mail,
  Sparkles,
} from "lucide-react";
import Button from "../components/ui/Button";
import {
  featuredGuides,
  resourceCategories,
  resources,
} from "../data/resources";
import { siteConfig } from "../data/site";
import SEO from "../components/seo/SEO";
import { seoPages } from "../data/seo";

export default function Resources() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredResources = useMemo(() => {
    if (activeCategory === "All") return resources;
    return resources.filter((item) => item.category === activeCategory);
  }, [activeCategory]);

  return (
    <>
    <SEO {...seoPages.resources} />
    
      <section className="relative isolate overflow-hidden bg-[#020B1F] px-5 py-16 text-white lg:py-24">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[540px] w-[540px] -translate-x-1/2 rounded-full bg-cyan-400/15 blur-[130px]" />
          <div className="absolute right-0 top-24 h-[420px] w-[420px] rounded-full bg-blue-600/15 blur-[120px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(25,217,255,0.10),transparent_38%),linear-gradient(180deg,rgba(2,11,31,0.1),#020B1F_92%)]" />
        </div>

        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.85fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-cyan-300/20 bg-white/[0.04] px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-cyan-200">
              <BookOpen size={16} />
              Technology Resources
            </div>

            <h1 className="mt-7 max-w-5xl text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-7xl">
              Practical technology insights for{" "}
              <span className="bg-gradient-to-r from-cyan-200 via-white to-cyan-300 bg-clip-text text-transparent">
                smarter businesses.
              </span>
            </h1>

            <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-300">
              Learn how to improve your digital presence, strengthen IT
              operations, protect your business and use technology with
              confidence.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Button to="/contact">
                Ask MKETICS
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
                <Lightbulb size={28} />
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-cyan-300">
                  Resource Focus
                </p>
                <h2 className="mt-3 text-2xl font-black text-white">
                  Education before selling.
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  MKETICS resources should help clients understand technology,
                  prepare better and make practical business decisions.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              {featuredGuides.map((guide) => (
                <div key={guide} className="flex items-start gap-3">
                  <CheckCircle2
                    className="mt-1 shrink-0 text-cyan-300"
                    size={20}
                  />
                  <p className="text-sm leading-6 text-slate-300">{guide}</p>
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
                Insights & Guides
              </p>
              <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
                Browse practical business technology topics.
              </h2>
              <p className="mt-5 text-lg leading-8 text-slate-700">
                These resource cards can later become full blog posts, guides,
                downloadable PDFs or lead magnets.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-[#0B7CFF] shadow-sm">
              <Filter size={16} />
              {filteredResources.length} resource
              {filteredResources.length === 1 ? "" : "s"} shown
            </div>
          </div>

          <div className="mb-8 flex flex-wrap gap-3">
            {resourceCategories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`rounded-full px-5 py-3 text-sm font-bold transition ${
                  activeCategory === category
                    ? "bg-[#061A33] text-cyan-200 shadow-[0_0_30px_rgba(0,174,239,0.16)]"
                    : "bg-white text-slate-700 hover:bg-[#061A33] hover:text-cyan-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {filteredResources.map((item) => (
              <ResourceCard key={item.title} item={item} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-16 text-[#061A33] lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#EAF6FF] px-4 py-2 text-sm font-bold text-[#0B7CFF]">
              <Mail size={16} />
              MKETICS Newsletter
            </div>

            <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-5xl">
              Get practical tech and business tips from MKETICS.
            </h2>

            <p className="mt-5 text-lg leading-8 text-slate-700">
              Subscribe for useful insights on websites, business systems, IT
              support, digital tools, cybersecurity, Google Workspace, smart
              technology and business readiness.
            </p>

            <div className="mt-6 grid gap-3">
              {[
                "No spam. Just practical guidance.",
                "Useful tips for becoming more professional and digitally ready.",
                "Future guides, checklists and service updates.",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2
                    className="mt-1 shrink-0 text-[#0B7CFF]"
                    size={20}
                  />
                  <p className="leading-7 text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <form
            className="rounded-[2rem] border border-slate-200 bg-[#F8FCFF] p-6 shadow-xl"
            onSubmit={(event) => event.preventDefault()}
          >
            <div>
              <label className="text-sm font-bold text-[#061A33]">Name</label>
              <input
                type="text"
                placeholder="Your name"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
              />
            </div>

            <div className="mt-4">
              <label className="text-sm font-bold text-[#061A33]">
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
              />
            </div>

            <div className="mt-4">
              <label className="text-sm font-bold text-[#061A33]">
                Interest Area
              </label>
              <select className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100">
                {resourceCategories
                  .filter((category) => category !== "All")
                  .map((category) => (
                    <option key={category}>{category}</option>
                  ))}
              </select>
            </div>

            <Button href={`mailto:${siteConfig.email}`} className="mt-6 w-full">
              Join the MKETICS Newsletter
              <ArrowRight size={16} className="ml-2" />
            </Button>

            <p className="mt-4 text-xs leading-6 text-slate-500">
              Newsletter automation will be added later. You can unsubscribe at
              any time once email campaigns are active.
            </p>
          </form>
        </div>
      </section>

      <section className="bg-[#020B1F] px-5 pb-20 text-white lg:pb-28">
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-cyan-300/20 bg-cyan-400/10 p-8 md:p-14">
            <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-cyan-300/20 blur-[100px]" />

            <div className="relative max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-200">
                Need personal guidance?
              </p>
              <h2 className="mt-4 text-3xl font-black leading-tight sm:text-5xl">
                Talk to MKETICS before starting your digital project.
              </h2>
              <p className="mt-5 text-lg leading-8 text-slate-200">
                You do not need to know all the technical details. Share your
                business need and MKETICS will help you choose the right
                starting point.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Button to="/contact">
                  Request Guidance
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

function ResourceCard({ item }) {
  const Icon = item.icon;

  return (
    <article className="group flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-cyan-300 hover:shadow-xl">
      <div className="flex items-start justify-between gap-4">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#061A33] text-cyan-300 shadow-[0_0_30px_rgba(0,174,239,0.18)]">
          <Icon size={28} />
        </div>

        <span className="rounded-full bg-[#EAF6FF] px-3 py-1 text-xs font-bold text-[#0B7CFF]">
          {item.type}
        </span>
      </div>

      <p className="mt-6 text-xs font-black uppercase tracking-[0.2em] text-[#0B7CFF]">
        {item.category}
      </p>

      <h3 className="mt-3 text-xl font-black text-[#020B1F]">{item.title}</h3>

      <p className="mt-3 text-sm leading-7 text-slate-600">{item.excerpt}</p>

      <div className="mt-auto pt-6">
        <div className="flex items-center justify-between border-t border-slate-100 pt-5">
          <span className="text-xs font-bold text-slate-500">
            {item.readTime}
          </span>

          <a
            href="/contact"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#0B7CFF] transition hover:text-[#00AEEF]"
          >
            Ask about this
            <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </article>
  );
}