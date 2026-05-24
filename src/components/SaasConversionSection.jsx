import {
  CheckCircle2,
  Star,
  TrendingUp,
  ShieldCheck,
  MessageCircle,
  Rocket,
  BarChart3,
  Users,
  Zap,
  Crown,
  ArrowRight,
} from "lucide-react";

const stats = [
  {
    label: "Faster Quotes",
    value: "70%",
  },
  {
    label: "Admin Time Saved",
    value: "40+ hrs",
  },
  {
    label: "Client Visibility",
    value: "24/7",
  },
  {
    label: "Automation Ready",
    value: "100%",
  },
];

const trusted = [
  "IT Services",
  "Driving Schools",
  "CCTV Providers",
  "Consultants",
  "Retail SMEs",
  "Startups",
];

const features = [
  "AI proposal generation",
  "Client portal access",
  "Automated invoices",
  "Workspace analytics",
  "Live support workflow",
  "SaaS subscription management",
];

const faqs = [
  {
    question: "Can MKETICS work for my small business?",
    answer:
      "Yes. MKETICS is designed for startups, SMEs, consultants and enterprise service businesses.",
  },
  {
    question: "Can I use MKETICS without technical knowledge?",
    answer:
      "Yes. The platform is designed for normal business owners with simple workflows and automation.",
  },
  {
    question: "Can MKETICS customize the platform?",
    answer:
      "Yes. MKETICS offers enterprise customizations, integrations, branding and automation workflows.",
  },
  {
    question: "Can I start with a trial?",
    answer:
      "Yes. You can start with a free SaaS trial before upgrading.",
  },
];

export default function SaasConversionSection() {
  const whatsappMessage = encodeURIComponent(
    "Hi MKETICS, I want to learn more about your SaaS platform."
  );

  return (
    <section className="relative overflow-hidden px-4 py-24">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute left-10 top-10 h-72 w-72 rounded-full bg-sky-500 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-purple-500 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl md:p-10">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-sky-500/10 px-5 py-2 text-sm font-black text-sky-500">
                <Rocket className="h-4 w-4" />
                SaaS Business Automation
              </div>

              <h2 className="mt-8 text-5xl font-black leading-tight md:text-7xl">
                Scale Your Business With{" "}
                <span className="bg-gradient-to-r from-sky-500 to-cyan-400 bg-clip-text text-transparent">
                  MKETICS SaaS
                </span>
              </h2>

              <p className="mt-8 max-w-3xl text-lg leading-8 app-muted">
                Manage proposals, invoices, clients, payments, support,
                analytics and automation from one premium enterprise SaaS
                platform.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <a
                  href="/start-trial"
                  className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-8 py-4 text-lg font-black text-white shadow-2xl transition hover:scale-105"
                >
                  Start Free Trial
                  <ArrowRight className="h-5 w-5" />
                </a>

                <a
                  href="/pricing"
                  className="rounded-full border border-white/10 bg-white/5 px-8 py-4 text-lg font-black backdrop-blur-xl"
                >
                  View Pricing
                </a>

                <a
                  href={`https://wa.me/27794481569?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-green-500 px-8 py-4 text-lg font-black text-white shadow-2xl transition hover:scale-105"
                >
                  <MessageCircle className="h-5 w-5" />
                  WhatsApp Sales
                </a>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-black/20 p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-2xl bg-sky-500/10 p-4 text-sky-500">
                  <BarChart3 className="h-10 w-10" />
                </div>

                <div>
                  <p className="text-sm font-black uppercase tracking-[0.2em] app-subtle">
                    Live SaaS Preview
                  </p>

                  <h3 className="text-3xl font-black">
                    Enterprise Dashboard
                  </h3>
                </div>
              </div>

              <div className="mt-8 grid gap-4">
                {features.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-3 rounded-2xl bg-white/5 p-4"
                  >
                    <CheckCircle2 className="h-5 w-5 text-green-500" />

                    <span className="font-bold">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/5 p-5">
                  <p className="text-sm font-black uppercase tracking-[0.2em] app-subtle">
                    Active Workspaces
                  </p>

                  <p className="mt-3 text-4xl font-black text-sky-500">
                    120+
                  </p>
                </div>

                <div className="rounded-2xl bg-white/5 p-5">
                  <p className="text-sm font-black uppercase tracking-[0.2em] app-subtle">
                    Automation Rate
                  </p>

                  <p className="mt-3 text-4xl font-black text-purple-500">
                    92%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => (
            <div
              key={item.label}
              className="rounded-[2rem] border border-white/10 bg-white/5 p-6 text-center shadow-xl backdrop-blur-xl"
            >
              <TrendingUp className="mx-auto h-8 w-8 text-green-500" />

              <p className="mt-5 text-5xl font-black text-sky-500">
                {item.value}
              </p>

              <p className="mt-3 font-bold app-muted">{item.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl">
          <p className="text-center text-sm font-black uppercase tracking-[0.25em] app-subtle">
            Trusted By Modern Service Businesses
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {trusted.map((item) => (
              <span
                key={item}
                className="rounded-full bg-sky-500/10 px-5 py-3 text-sm font-black text-sky-500"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-8 w-8 text-sky-500" />

              <h3 className="text-3xl font-black">
                Why Businesses Choose MKETICS
              </h3>
            </div>

            <div className="mt-8 grid gap-4">
              {features.map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-purple-500" />

                  <span className="font-bold">{feature}</span>
                </div>
              ))}
            </div>

            <div className="mt-10 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-400 p-6 text-white shadow-2xl">
              <div className="flex items-center gap-3">
                <Crown className="h-8 w-8" />

                <div>
                  <p className="text-sm font-black uppercase tracking-[0.2em]">
                    Enterprise Ready
                  </p>

                  <h4 className="text-2xl font-black">
                    Premium SaaS Infrastructure
                  </h4>
                </div>
              </div>

              <p className="mt-5 leading-8 text-white/90">
                Designed for scalable client management, enterprise automation
                and digital business growth.
              </p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-purple-500" />

              <h3 className="text-3xl font-black">
                Client Success Feedback
              </h3>
            </div>

            <div className="mt-8 rounded-2xl bg-white/5 p-6">
              <div className="flex gap-1 text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-5 w-5 fill-current" />
                ))}
              </div>

              <p className="mt-5 leading-8 app-muted">
                “MKETICS gives businesses a premium digital infrastructure for
                proposals, automation, projects and enterprise workflow
                management.”
              </p>

              <p className="mt-5 font-black">
                MKETICS Enterprise Client
              </p>
            </div>

            <div className="mt-8 grid gap-4">
              {faqs.map((faq) => (
                <details key={faq.question} className="rounded-2xl bg-white/5 p-5">
                  <summary className="cursor-pointer font-black">
                    {faq.question}
                  </summary>

                  <p className="mt-4 leading-8 app-muted">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-5 right-5 z-50 hidden sm:block">
        <a
          href="/start-trial"
          className="rounded-full bg-sky-500 px-6 py-4 font-black text-white shadow-2xl transition hover:scale-105"
        >
          Start Trial
        </a>
      </div>
    </section>
  );
}
