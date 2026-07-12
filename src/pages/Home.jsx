import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Code2,
  Globe2,
  Headphones,
  Layers3,
  Mail,
  Megaphone,
  MessageCircle,
  Rocket,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  Wifi,
} from "lucide-react";
import SEO from "../components/seo/SEO";
import { seoPages } from "../data/seo";
import Button from "../components/ui/Button";
import LeadCaptureSection from "../components/sections/LeadCaptureSection";
import { siteConfig } from "../data/site";
import { createWhatsAppLink, whatsappMessages } from "../utils/whatsapp";

const serviceChoices = [
  {
    title: "Websites",
    text: "Business websites, landing pages, catalogues and online stores.",
    icon: Globe2,
    href: "/services",
  },
  {
    title: "Custom Systems",
    text: "Client portals, dashboards, booking tools and business systems.",
    icon: Layers3,
    href: "/services",
  },
  {
    title: "IT & Networks",
    text: "IT support, business email, cloud tools, Wi-Fi and office tech.",
    icon: Wifi,
    href: "/services",
  },
  {
    title: "Digital Growth",
    text: "Digital marketing, SEO, Google Business Profile and campaign content.",
    icon: Megaphone,
    href: "/services",
  },
];

const packageOptions = [
  {
    title: "Launch Online",
    text: "For businesses that need a professional website, email and digital foundation.",
    icon: Rocket,
    points: ["Website direction", "Online presence", "Business email guidance"],
  },
  {
    title: "Improve Operations",
    text: "For clients who need better systems, dashboards, portals or internal tools.",
    icon: Code2,
    points: ["System scoping", "Workflow planning", "Custom development"],
  },
  {
    title: "Ongoing Support",
    text: "For businesses that need maintenance, updates, IT help and digital support.",
    icon: Headphones,
    points: ["Monthly support", "Content updates", "Technical assistance"],
  },
];

const processSteps = [
  {
    title: "Choose",
    text: "Select the service direction that best matches your need.",
  },
  {
    title: "Scope",
    text: "MKETICS clarifies the details, budget direction and expected outcome.",
  },
  {
    title: "Quote",
    text: "You receive guidance, pricing direction or a formal quotation.",
  },
  {
    title: "Deliver",
    text: "The project moves into setup, design, development or support.",
  },
];

export default function Home() {
  return (
    <>
      <SEO {...seoPages.home} />

      <main className="bg-white text-[#061A33]">
        <section className="relative isolate overflow-hidden bg-[#EAF6FF] px-5 py-14 lg:py-20">
          <div className="absolute inset-0 -z-10">
            <div className="absolute left-[-12rem] top-[-12rem] h-[34rem] w-[34rem] rounded-full bg-cyan-300/40 blur-[140px]" />
            <div className="absolute right-[-14rem] top-10 h-[36rem] w-[36rem] rounded-full bg-blue-500/20 blur-[150px]" />
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white/80 to-transparent" />
          </div>

          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-3 rounded-full border border-cyan-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-[#0B7CFF] shadow-sm">
                <Sparkles size={16} />
                {siteConfig.tagline}
              </div>

              <h1 className="mt-7 max-w-5xl text-4xl font-black leading-[1.05] tracking-tight text-[#020B1F] sm:text-5xl lg:text-7xl">
                Simple digital solutions for{" "}
                <span className="bg-gradient-to-r from-[#0B7CFF] via-[#00AEEF] to-[#061A33] bg-clip-text text-transparent">
                  serious business growth.
                </span>
              </h1>

              <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-700">
                MKETICS helps businesses, schools and organisations build better
                websites, systems, IT setups and digital business solutions.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Button to="/contact">
                  Request a Quote
                  <ArrowRight size={18} className="ml-2" />
                </Button>

                <Button to="/services" variant="secondary">
                  View Services
                </Button>

                <a
                  href={createWhatsAppLink(whatsappMessages.general)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-full border border-[#0B7CFF]/20 bg-white px-6 py-3 font-black text-[#061A33] shadow-sm transition hover:border-cyan-300 hover:bg-cyan-300"
                >
                  <MessageCircle size={18} className="mr-2" />
                  WhatsApp
                </a>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <TrustItem text="Registered technology company" />
                <TrustItem text="Software, IT and digital support" />
              </div>
            </div>

            <div className="rounded-[2.5rem] border border-white bg-white p-5 shadow-2xl">
              <div className="rounded-[2rem] bg-[#020B1F] p-6 text-white">
                <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
                  Start Here
                </p>

                <h2 className="mt-3 text-3xl font-black">
                  What do you need?
                </h2>

                <div className="mt-6 grid gap-3">
                  <HeroChoice text="I need a website or online store" />
                  <HeroChoice text="I need a custom system or portal" />
                  <HeroChoice text="I need IT, email or network support" />
                  <HeroChoice text="I need digital marketing or business support" />
                </div>

                <Button to="/contact" className="mt-6 w-full justify-center">
                  Help Me Choose
                  <SearchCheck size={18} className="ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 py-14 lg:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="text-sm font-black uppercase tracking-[0.25em] text-[#0B7CFF]">
                Main Services
              </p>

              <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
                Choose one clear starting point.
              </h2>

              <p className="mt-5 text-lg leading-8 text-slate-700">
                You do not need to understand every technical detail. Start with
                the area closest to your need.
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {serviceChoices.map((service) => (
                <ServiceCard key={service.title} service={service} />
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#EAF6FF] px-5 py-14 lg:py-20">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-[#0B7CFF]">
                Not Sure?
              </p>

              <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
                Tell MKETICS your problem. We will guide the service.
              </h2>

              <p className="mt-5 text-lg leading-8 text-slate-700">
                Instead of showing every service on the homepage, we keep the
                decision simple. Send your request and MKETICS will recommend
                the right direction.
              </p>

              <div className="mt-7 flex flex-col gap-4 sm:flex-row">
                <Button to="/contact">
                  Start Request
                  <ArrowRight size={18} className="ml-2" />
                </Button>

                <Button to="/services" variant="secondary">
                  Browse Full Services
                </Button>
              </div>
            </div>

            <div className="rounded-[2rem] border border-cyan-100 bg-white p-6 shadow-sm">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#061A33] text-cyan-300">
                <ShieldCheck size={28} />
              </div>

              <h3 className="mt-5 text-2xl font-black text-[#020B1F]">
                Better enquiries. Better quotes.
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-600">
                A clean request helps MKETICS understand your goal, budget,
                timeline and expected outcome before giving pricing direction.
              </p>

              <div className="mt-5 grid gap-3">
                <CheckLine text="Clear service direction" />
                <CheckLine text="Better scope before pricing" />
                <CheckLine text="Professional communication" />
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 py-14 lg:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-black uppercase tracking-[0.25em] text-[#0B7CFF]">
                Package Direction
              </p>

              <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
                Three simple ways to start.
              </h2>

              <p className="mt-5 text-lg leading-8 text-slate-700">
                MKETICS can assist with once-off projects, custom builds or
                ongoing digital and technical support.
              </p>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              {packageOptions.map((item) => (
                <PackageCard key={item.title} item={item} />
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#020B1F] px-5 py-14 text-white lg:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.25em] text-cyan-300">
                  Process
                </p>

                <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
                  Clear steps from enquiry to delivery.
                </h2>

                <p className="mt-5 text-lg leading-8 text-slate-300">
                  The homepage should lead visitors to action quickly. The full
                  detail can stay on the Services page.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {processSteps.map((step, index) => (
                  <ProcessCard
                    key={step.title}
                    number={`0${index + 1}`}
                    step={step}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <LeadCaptureSection />
      </main>
    </>
  );
}

function TrustItem({ text }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-cyan-100 bg-white p-4 shadow-sm">
      <CheckCircle2 className="mt-0.5 shrink-0 text-[#0B7CFF]" size={18} />
      <p className="text-sm font-bold leading-6 text-slate-700">{text}</p>
    </div>
  );
}

function HeroChoice({ text }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-4">
      <CheckCircle2 className="shrink-0 text-cyan-300" size={18} />
      <p className="text-sm font-bold text-slate-200">{text}</p>
    </div>
  );
}

function ServiceCard({ service }) {
  const Icon = service.icon;

  return (
    <article className="group rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-cyan-300 hover:shadow-xl">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#061A33] text-cyan-300">
        <Icon size={28} />
      </div>

      <h3 className="mt-6 text-2xl font-black text-[#020B1F]">
        {service.title}
      </h3>

      <p className="mt-3 text-sm leading-7 text-slate-600">{service.text}</p>

      <a
        href={service.href}
        className="mt-6 inline-flex items-center gap-2 text-sm font-black text-[#0B7CFF] transition group-hover:text-[#00AEEF]"
      >
        View Services
        <ArrowRight size={16} />
      </a>
    </article>
  );
}

function PackageCard({ item }) {
  const Icon = item.icon;

  return (
    <article className="rounded-[2rem] border border-slate-200 bg-[#F8FCFF] p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-cyan-300 hover:bg-white hover:shadow-xl">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#061A33] text-cyan-300">
        <Icon size={28} />
      </div>

      <h3 className="mt-6 text-2xl font-black text-[#020B1F]">
        {item.title}
      </h3>

      <p className="mt-3 text-sm leading-7 text-slate-600">{item.text}</p>

      <div className="mt-5 grid gap-3">
        {item.points.map((point) => (
          <CheckLine key={point} text={point} />
        ))}
      </div>

      <Button to="/contact" className="mt-6">
        Request This
        <ArrowRight size={16} className="ml-2" />
      </Button>
    </article>
  );
}

function CheckLine({ text }) {
  return (
    <div className="flex items-start gap-3">
      <CheckCircle2 className="mt-0.5 shrink-0 text-[#0B7CFF]" size={18} />
      <p className="text-sm font-semibold leading-6 text-slate-700">{text}</p>
    </div>
  );
}

function ProcessCard({ number, step }) {
  return (
    <article className="rounded-[2rem] border border-cyan-300/15 bg-white/[0.05] p-6">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-300 text-lg font-black text-[#061A33]">
        {number}
      </div>

      <h3 className="mt-5 text-xl font-black text-white">{step.title}</h3>

      <p className="mt-3 text-sm leading-7 text-slate-300">{step.text}</p>
    </article>
  );
}