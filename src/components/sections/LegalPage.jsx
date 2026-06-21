import { ShieldCheck, CheckCircle2 } from "lucide-react";
import Button from "../ui/Button";

export default function LegalPage({
  eyebrow = "Website Legal Page",
  title,
  intro,
  sections = [],
}) {
  return (
    <>
      <section className="relative isolate overflow-hidden bg-[#020B1F] px-5 py-16 text-white lg:py-24">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-cyan-400/15 blur-[130px]" />
          <div className="absolute right-0 top-24 h-[420px] w-[420px] rounded-full bg-blue-600/10 blur-[120px]" />
        </div>

        <div className="mx-auto max-w-5xl">
          <div className="inline-flex items-center gap-3 rounded-full border border-cyan-300/20 bg-white/[0.04] px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-cyan-200">
            <ShieldCheck size={16} />
            {eyebrow}
          </div>

          <h1 className="mt-7 text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            {title}
          </h1>

          <p className="mt-6 max-w-4xl text-lg leading-8 text-slate-300">
            {intro}
          </p>

          <div className="mt-8">
            <Button to="/contact">Contact MKETICS</Button>
          </div>
        </div>
      </section>

      <section className="bg-[#EAF6FF] px-5 py-16 text-[#061A33] lg:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-6">
            {sections.map((section) => (
              <article
                key={section.title}
                className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8"
              >
                <h2 className="text-2xl font-black text-[#020B1F]">
                  {section.title}
                </h2>

                {section.text && (
                  <p className="mt-4 leading-8 text-slate-700">
                    {section.text}
                  </p>
                )}

                {section.items && (
                  <div className="mt-5 grid gap-3">
                    {section.items.map((item) => (
                      <div key={item} className="flex gap-3">
                        <CheckCircle2
                          className="mt-1 shrink-0 text-[#0B7CFF]"
                          size={20}
                        />
                        <p className="leading-7 text-slate-700">{item}</p>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}