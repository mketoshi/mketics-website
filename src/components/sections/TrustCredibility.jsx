import {
  BadgeCheck,
  Building2,
  CheckCircle2,
  FileCheck2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { siteConfig } from "../../data/site";

const trustItems = [
  {
    title: "Registered South African Company",
    description:
      "MKETICS operates as a registered private company with official company registration details.",
    icon: Building2,
  },
  {
    title: "Level 1 B-BBEE Contributor",
    description:
      "MKETICS holds Level 1 B-BBEE contributor status, supporting business readiness and supplier credibility.",
    icon: BadgeCheck,
  },
  {
    title: "Clear Scope Before Work Starts",
    description:
      "Projects are guided by clear service expectations, agreed deliverables, pricing direction and communication.",
    icon: FileCheck2,
  },
  {
    title: "Professional Technology Approach",
    description:
      "Services are structured around practical outcomes, security awareness, documentation and long-term value.",
    icon: ShieldCheck,
  },
];

const proofPoints = [
  "Company registration details available",
  "Legal and policy pages included",
  "Structured pricing and service packages",
  "Professional quote and consultation flow",
  "Support for businesses, schools and organisations",
];

export default function TrustCredibility({
  variant = "light",
  title = "Built to earn trust before the first conversation.",
  description = "MKETICS combines professional presentation, clear service structure and official business credibility so clients can engage with confidence.",
}) {
  const isDark = variant === "dark";

  return (
    <section
      className={`px-5 py-16 lg:py-24 ${
        isDark ? "bg-[#020B1F] text-white" : "bg-white text-[#061A33]"
      }`}
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <div
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.25em] ${
                isDark
                  ? "border border-cyan-300/20 bg-white/[0.05] text-cyan-200"
                  : "bg-[#EAF6FF] text-[#0B7CFF]"
              }`}
            >
              <Sparkles size={16} />
              Trust & Credibility
            </div>

            <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-5xl">
              {title}
            </h2>

            <p
              className={`mt-5 text-lg leading-8 ${
                isDark ? "text-slate-300" : "text-slate-700"
              }`}
            >
              {description}
            </p>
          </div>

          <div
            className={`rounded-[2rem] border p-6 ${
              isDark
                ? "border-cyan-300/15 bg-white/[0.04]"
                : "border-slate-200 bg-[#F8FCFF]"
            }`}
          >
            <p
              className={`text-sm font-black uppercase tracking-[0.25em] ${
                isDark ? "text-cyan-300" : "text-[#0B7CFF]"
              }`}
            >
              Company Snapshot
            </p>

            <div className="mt-5 grid gap-3">
              <SnapshotRow label="Legal Name" value={siteConfig.legalName} />
              <SnapshotRow
                label="Registration No."
                value={siteConfig.registrationNumber}
              />
              <SnapshotRow
                label="Enterprise No."
                value={siteConfig.enterpriseNumber}
              />
              <SnapshotRow label="B-BBEE" value={siteConfig.beeStatus} />
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {trustItems.map((item) => (
            <TrustCard key={item.title} item={item} isDark={isDark} />
          ))}
        </div>

        <div
          className={`mt-8 rounded-[2rem] border p-6 ${
            isDark
              ? "border-cyan-300/15 bg-cyan-300/10"
              : "border-slate-200 bg-[#EAF6FF]"
          }`}
        >
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {proofPoints.map((point) => (
              <div key={point} className="flex items-start gap-3">
                <CheckCircle2
                  className={`mt-0.5 shrink-0 ${
                    isDark ? "text-cyan-300" : "text-[#0B7CFF]"
                  }`}
                  size={18}
                />
                <p
                  className={`text-sm font-semibold leading-6 ${
                    isDark ? "text-slate-200" : "text-slate-700"
                  }`}
                >
                  {point}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function SnapshotRow({ label, value }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl bg-white/10 p-4 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">
        {label}
      </span>
      <span className="text-sm font-bold text-inherit">{value}</span>
    </div>
  );
}

function TrustCard({ item, isDark }) {
  const Icon = item.icon;

  return (
    <article
      className={`rounded-[2rem] border p-6 transition duration-300 hover:-translate-y-1 ${
        isDark
          ? "border-cyan-300/15 bg-white/[0.04] hover:border-cyan-300/40"
          : "border-slate-200 bg-[#F8FCFF] hover:border-cyan-300 hover:shadow-xl"
      }`}
    >
      <div
        className={`grid h-14 w-14 place-items-center rounded-2xl ${
          isDark
            ? "bg-cyan-300/10 text-cyan-300"
            : "bg-[#061A33] text-cyan-300"
        }`}
      >
        <Icon size={28} />
      </div>

      <h3 className="mt-5 text-xl font-black">{item.title}</h3>

      <p
        className={`mt-3 text-sm leading-7 ${
          isDark ? "text-slate-300" : "text-slate-600"
        }`}
      >
        {item.description}
      </p>
    </article>
  );
}