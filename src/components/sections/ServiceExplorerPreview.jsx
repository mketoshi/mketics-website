import { useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Cloud,
  Compass,
  FileText,
  Filter,
  Globe2,
  HelpCircle,
  Layers3,
  LifeBuoy,
  Megaphone,
  MessageCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";
import Button from "../ui/Button";
import {
  serviceExplorerCategories,
  serviceExplorerItems,
} from "../../data/serviceExplorer";
import { createWhatsAppLink } from "../../utils/whatsapp";
import GuidedServiceExplorer from "./GuidedServiceExplorer";

const defaultCategory = "All Services";

const categoryIcons = {
  "Websites & Online Presence": Globe2,
  "Custom Systems & Portals": Layers3,
  "Cloud, Email & Productivity": Cloud,
  "IT Support & Infrastructure": Wrench,
  "Digital Marketing": Megaphone,
  "Branding & Business Documents": FileText,
  "Business Readiness & Compliance": BadgeCheck,
  "Security & Smart Technology": ShieldCheck,
  "Maintenance & Monthly Support": LifeBuoy,
  "Packages & Consultation": Compass,
};

export default function ServiceExplorerPreview() {
  const [activeCategory, setActiveCategory] = useState(defaultCategory);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAll, setShowAll] = useState(false);

  const filteredServices = useMemo(() => {
    const normalisedSearch = searchTerm.trim().toLowerCase();

    return serviceExplorerItems.filter((service) => {
      const matchesCategory =
        activeCategory === defaultCategory ||
        service.category === activeCategory;

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
    : filteredServices.slice(0, 18);

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
        <div className="mb-12">
          <GuidedServiceExplorer />
        </div>

        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-white/5 px-4 py-2 text-sm text-cyan-100">
            <Compass size={16} />
            Service Explorer
          </div>

          <h2 className="mx-auto mt-5 max-w-4xl text-3xl font-black tracking-tight sm:text-5xl">
            Explore MKETICS services by category.
          </h2>

          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-300">
            Search through MKETICS services by category, business need or
            keyword. Choose a service tile, request a quote or send the service
            directly to WhatsApp.
          </p>

          <div className="mx-auto mt-7 max-w-3xl rounded-[2rem] border border-cyan-300/20 bg-cyan-300/10 p-5 text-left">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-cyan-300/10 text-cyan-300">
                <HelpCircle size={24} />
              </div>

              <div>
                <h3 className="text-lg font-black text-white">
                  Not sure what to choose?
                </h3>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  Use the guided quiz above or start with “Free Consultation /
                  Needs Assessment”. MKETICS can review your idea, budget
                  direction and business goal before recommending the right
                  service.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[2.2rem] border border-cyan-300/15 bg-[#061A33]/90 p-5 shadow-2xl lg:p-7">
          <div className="grid gap-5 lg:grid-cols-[1fr_0.7fr] lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-cyan-300">
                Service Directory
              </p>
              <h3 className="mt-3 text-2xl font-black text-white">
                {filteredServices.length} service
                {filteredServices.length === 1 ? "" : "s"} available
              </h3>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                Compact MKETICS service tiles designed for fast browsing,
                quoting and WhatsApp enquiries.
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-cyan-300/20 bg-cyan-300/10 p-5">
              <div className="flex items-center gap-3">
                <Sparkles className="text-cyan-300" size={22} />
                <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">
                  Recommended Starting Point
                </p>
              </div>

              <h4 className="mt-3 text-xl font-black text-white">
                {featuredService.title}
              </h4>

              <p className="mt-2 text-sm leading-6 text-slate-300">
                {featuredService.summary}
              </p>
            </div>
          </div>

          <div className="mt-7 grid gap-4">
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

          <div className="mt-7 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {visibleServices.map((service) => (
              <ServiceTile key={service.id} service={service} />
            ))}
          </div>

          {filteredServices.length === 0 && (
            <div className="mt-7 rounded-[1.5rem] border border-cyan-300/20 bg-cyan-300/10 p-6 text-center">
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

          {filteredServices.length > 18 && (
            <div className="mt-7 flex justify-center">
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
    </section>
  );
}

function ServiceTile({ service }) {
  const Icon = categoryIcons[service.category] || Compass;

  return (
    <article className="group overflow-hidden rounded-none border border-cyan-300/10 bg-[#1B8E9B]/85 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-cyan-200 hover:bg-[#20A7B6] hover:shadow-[0_16px_40px_rgba(0,174,239,0.18)]">
      <div className="flex min-h-[88px] items-center">
        <div className="grid h-full min-h-[88px] w-[86px] shrink-0 place-items-center border-r border-white/20 text-white">
          <Icon size={32} strokeWidth={2.2} />
        </div>

        <div className="min-w-0 flex-1 px-5 py-4">
          <p className="line-clamp-2 text-base font-bold leading-snug text-white">
            {service.title}
          </p>
          <p className="mt-1 line-clamp-1 text-xs font-semibold text-cyan-50/80">
            {service.category}
          </p>
        </div>

        <div className="hidden pr-4 sm:block">
          <span className="grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-white/10 text-xs font-black text-white">
            {service.id}
          </span>
        </div>
      </div>

      <div className="border-t border-white/10 bg-[#061A33]/70 p-4">
        <p className="line-clamp-2 text-sm leading-6 text-slate-200">
          {service.summary}
        </p>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <a
            href="/contact"
            className="inline-flex w-full items-center justify-center rounded-full bg-cyan-300 px-4 py-2.5 text-xs font-black text-[#061A33] transition hover:bg-white"
          >
            Quote
            <ArrowRight size={14} className="ml-2" />
          </a>

          <a
            href={createWhatsAppLink(
              `Hello MKETICS, I am interested in ${service.title}. Please assist me with more information and pricing.`
            )}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-full items-center justify-center rounded-full border border-cyan-300/30 bg-white/[0.04] px-4 py-2.5 text-xs font-black text-white transition hover:border-cyan-300 hover:bg-cyan-300 hover:text-[#061A33]"
          >
            <MessageCircle size={14} className="mr-2" />
            WhatsApp
          </a>
        </div>
      </div>
    </article>
  );
}