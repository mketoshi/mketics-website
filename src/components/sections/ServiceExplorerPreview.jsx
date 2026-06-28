import { useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Compass,
  Filter,
  HelpCircle,
  MessageCircle,
  Search,
  Sparkles,
} from "lucide-react";
import Button from "../ui/Button";
import {
  serviceExplorerCategories,
  serviceExplorerItems,
} from "../../data/serviceExplorer";
import { createWhatsAppLink } from "../../utils/whatsapp";

const defaultCategory = "All Services";

export default function ServiceExplorerPreview() {
  const [activeCategory, setActiveCategory] = useState(defaultCategory);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAll, setShowAll] = useState(false);

  const filteredServices = useMemo(() => {
    const normalisedSearch = searchTerm.trim().toLowerCase();

    return serviceExplorerItems.filter((service) => {
      const matchesCategory =
        activeCategory === defaultCategory || service.category === activeCategory;

      const searchableText = [
        service.title,
        service.category,
        service.summary,
        service.recommendedFor,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        normalisedSearch.length === 0 ||
        searchableText.includes(normalisedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchTerm]);

  const visibleServices = showAll
    ? filteredServices
    : filteredServices.slice(0, 12);

  const featuredService = filteredServices[0] || serviceExplorerItems[0];

  function handleCategoryChange(category) {
    setActiveCategory(category);
    setShowAll(false);
  }

  function handleSearchChange(event) {
    setSearchTerm(event.target.value);
    setShowAll(false);
  }

  return (
    <section className="bg-[#020B1F] px-5 py-16 text-white lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-white/5 px-4 py-2 text-sm text-cyan-100">
              <Compass size={16} />
              Service Explorer
            </div>

            <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-5xl">
              Find the MKETICS service that fits your need.
            </h2>

            <p className="mt-5 text-lg leading-8 text-slate-300">
              Search through MKETICS services by category, business need or
              keyword. This helps you choose a clear starting point before
              requesting a quote or consultation.
            </p>

            <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-cyan-300/10 text-cyan-300">
                  <HelpCircle size={24} />
                </div>

                <div>
                  <h3 className="text-lg font-black text-white">
                    Not sure what to choose?
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-slate-300">
                    Start with “Free Consultation / Needs Assessment”. MKETICS
                    can review your idea, problem, budget direction and business
                    goal before recommending the right service.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-[2rem] border border-cyan-300/20 bg-cyan-300/10 p-6">
              <div className="flex items-center gap-3">
                <Sparkles className="text-cyan-300" size={22} />
                <p className="text-sm font-black uppercase tracking-[0.22em] text-cyan-200">
                  Recommended Starting Point
                </p>
              </div>

              <h3 className="mt-4 text-2xl font-black text-white">
                {featuredService.title}
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-300">
                {featuredService.summary}
              </p>

              <div className="mt-4 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <CheckCircle2
                  className="mt-0.5 shrink-0 text-cyan-300"
                  size={18}
                />
                <p className="text-sm leading-6 text-slate-300">
                  <span className="font-bold text-white">Best for: </span>
                  {featuredService.recommendedFor}
                </p>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Button to="/contact">
                  Request a Quote
                  <ArrowRight size={16} className="ml-2" />
                </Button>

                <a
                  href={createWhatsAppLink(
                    `Hello MKETICS, I need help with ${featuredService.title}. Please guide me on pricing and the next step.`
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-full border border-cyan-300/40 bg-white/[0.06] px-6 py-3 text-sm font-black text-white transition hover:border-cyan-300 hover:bg-cyan-300 hover:text-[#061A33]"
                >
                  <MessageCircle size={17} className="mr-2" />
                  WhatsApp MKETICS
                </a>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-[#061A33]/90 p-5 shadow-2xl lg:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.25em] text-cyan-300">
                  Explore Services
                </p>
                <p className="mt-2 text-sm text-slate-300">
                  {filteredServices.length} service
                  {filteredServices.length === 1 ? "" : "s"} found
                </p>
              </div>

              <Button to="/services" variant="secondary">
                View Service Page
              </Button>
            </div>

            <div className="mt-6 grid gap-4">
              <label htmlFor="service-search" className="sr-only">
                Search MKETICS services
              </label>

              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-cyan-200"
                  size={18}
                />

                <input
                  id="service-search"
                  name="service-search"
                  type="search"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Search website, CCTV, Google Workspace, marketing..."
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-12 py-4 text-sm font-semibold text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300"
                />
              </div>

              <div>
                <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                  <Filter size={15} />
                  Categories
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2">
                  {serviceExplorerCategories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => handleCategoryChange(category)}
                      className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold transition ${
                        activeCategory === category
                          ? "border-cyan-300 bg-cyan-300 text-[#061A33]"
                          : "border-white/10 bg-white/[0.04] text-slate-300 hover:border-cyan-300/60 hover:text-white"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {visibleServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>

            {filteredServices.length === 0 && (
              <div className="mt-6 rounded-[1.5rem] border border-cyan-300/20 bg-cyan-300/10 p-6 text-center">
                <p className="text-lg font-black text-white">
                  No service matched your search.
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  Try a different keyword or request a free consultation so
                  MKETICS can guide you.
                </p>

                <Button to="/contact" className="mt-5">
                  Book a Consultation
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </div>
            )}

            {filteredServices.length > 12 && (
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowAll((current) => !current)}
                  className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-6 py-3 text-sm font-black text-cyan-100 transition hover:border-cyan-300 hover:bg-cyan-300 hover:text-[#061A33]"
                >
                  {showAll
                    ? "Show fewer services"
                    : `Show all ${filteredServices.length} services`}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function ServiceCard({ service }) {
  return (
    <article className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 transition hover:-translate-y-1 hover:border-cyan-300/50 hover:bg-white/[0.07]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">
            {service.category}
          </p>

          <h3 className="mt-3 text-lg font-black leading-snug text-white">
            {service.title}
          </h3>
        </div>

        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-cyan-300/20 bg-cyan-300/10 text-xs font-black text-cyan-200">
          {service.id}
        </span>
      </div>

      <p className="mt-3 text-sm leading-7 text-slate-300">
        {service.summary}
      </p>

      <div className="mt-4 rounded-2xl border border-white/10 bg-[#020B1F]/45 p-4">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
          Recommended for
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          {service.recommendedFor}
        </p>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Button to="/contact" className="w-full justify-center text-sm">
          Quote
          <ArrowRight size={15} className="ml-2" />
        </Button>

        <a
          href={createWhatsAppLink(
            `Hello MKETICS, I am interested in ${service.title}. Please assist me with more information and pricing.`
          )}
          target="_blank"
          rel="noreferrer"
          className="inline-flex w-full items-center justify-center rounded-full border border-cyan-300/30 bg-white/[0.04] px-5 py-3 text-sm font-black text-white transition hover:border-cyan-300 hover:bg-cyan-300 hover:text-[#061A33]"
        >
          <MessageCircle size={16} className="mr-2" />
          WhatsApp
        </a>
      </div>
    </article>
  );
}