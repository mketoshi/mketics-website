import { ShieldCheck } from "lucide-react";

export default function RegisteredBusinessSection({ businessTrust }) {
  return (
    <section
      id="registered"
      className="mx-auto w-full max-w-[1600px] px-4 py-10 sm:px-6 sm:py-20 lg:px-8 lg:py-24"
    >
      <div className="glass-card overflow-hidden rounded-[2rem]">
        <div className="grid gap-8 p-7 lg:grid-cols-[0.9fr_1.1fr] lg:p-10">
          <div>
            <img
              src="/images/logo-clean.png"
              alt="MKETICS"
              className="logo-glow mb-6 h-24 object-contain"
            />

            <p className="font-bold uppercase tracking-[0.3em] text-sky-300">
              Registered Business
            </p>

            <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl md:text-5xl">
              Professional company. Accountable service.
            </h2>

            <p className="mt-5 leading-8 text-slate-300">
              MKETICS (Pty) Ltd operates as a registered South African
              business, giving clients confidence when requesting quotes,
              approving projects, and making payments.
            </p>

            <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/50 p-5">
              <p className="text-sm text-slate-400">Registered Company</p>
              <p className="mt-1 text-2xl font-black">MKETICS (Pty) Ltd</p>
              <p className="mt-2 text-sm text-sky-300">
                Reg No: 2026/290708/07
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            {businessTrust.map((point) => (
              <div
                key={point}
                className="flex gap-3 rounded-2xl bg-white/5 p-4 text-sm leading-6 text-slate-200"
              >
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-sky-300" />
                {point}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}