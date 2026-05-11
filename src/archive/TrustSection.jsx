import { CheckCircle2 } from "lucide-react";

export default function TrustSection({ trustPoints }) {
  return (
    <section
      id="trust"
      className="relative mx-auto w-full max-w-[1600px] overflow-hidden px-4 py-10 sm:px-6 sm:py-20 lg:px-8 lg:py-24"
    >
      <img
        src="/images/logo-clean.png"
        alt=""
        className="logo-watermark absolute bottom-[-50px] left-[-100px] w-[350px]"
      />

      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="font-bold uppercase tracking-[0.3em] text-sky-300">
            Why Choose MKETICS
          </p>

          <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl md:text-5xl">
            Qualified experience, not guesswork.
          </h2>

          <p className="mt-5 leading-8 text-slate-300">
            MKETICS is built on real enterprise IT experience across
            government and education environments, backed by formal ICT
            training and hands-on technical delivery.
          </p>
        </div>

        <div className="glass-card rounded-[2rem] p-6">
          <div className="grid gap-4">
            {trustPoints.map((point) => (
              <div
                key={point}
                className="flex gap-3 rounded-2xl bg-white/5 p-4 text-sm leading-6 text-slate-200"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-sky-300" />
                {point}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}