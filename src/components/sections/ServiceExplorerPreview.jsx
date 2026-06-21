import { useState } from "react";
import { ArrowRight, Compass, HelpCircle } from "lucide-react";
import Button from "../ui/Button";
import { explorerOptions } from "../../data/serviceExplorer";

export default function ServiceExplorerPreview() {
  const [selected, setSelected] = useState(explorerOptions[0]);

  return (
    <section className="bg-[#020B1F] px-5 py-16 text-white lg:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-white/5 px-4 py-2 text-sm text-cyan-100">
            <Compass size={16} />
            Service Explorer
          </div>

          <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-5xl">
            Not sure what service you need?
          </h2>

          <p className="mt-5 text-lg leading-8 text-slate-300">
            Answer one simple question and MKETICS will point you toward the
            service area that best fits your situation. This gives you a clearer
            starting point before requesting a quote.
          </p>

          <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-cyan-300/10 text-cyan-300">
                <HelpCircle size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">
                  You do not need to have everything figured out.
                </h3>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  Many clients start with only an idea, a problem or a business
                  need. MKETICS helps turn that into a clear scope, practical
                  features and a step-by-step plan.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-[#061A33]/90 p-6 shadow-2xl">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-cyan-300">
            What do you need help with?
          </p>

          <div className="mt-5 grid gap-3">
            {explorerOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setSelected(option)}
                className={`rounded-2xl border px-5 py-4 text-left text-sm font-semibold transition ${
                  selected.id === option.id
                    ? "border-cyan-300 bg-cyan-300/15 text-white shadow-[0_0_30px_rgba(25,217,255,0.16)]"
                    : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-cyan-300/50 hover:bg-white/[0.06]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="mt-6 rounded-[1.5rem] border border-cyan-300/20 bg-cyan-300/10 p-5">
            <p className="text-sm text-cyan-100">Recommended:</p>
            <h3 className="mt-2 text-2xl font-black text-white">
              {selected.resultTitle}
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              {selected.result}
            </p>

            <Button to={selected.href} className="mt-5">
              {selected.cta}
              <ArrowRight size={16} className="ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}