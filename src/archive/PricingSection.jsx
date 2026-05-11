import { CheckCircle2 } from "lucide-react";

export default function PricingSection({ packages }) {
  return (
    <section
      id="pricing"
      className="mx-auto w-full max-w-[1600px] px-4 py-10 sm:px-6 sm:py-20 lg:px-8 lg:py-24"
    >
      <div className="mb-7 text-center sm:mb-12">
        <p className="font-bold uppercase tracking-[0.3em] text-sky-300">
          Packages
        </p>

        <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl md:text-5xl">
          Clear options. Premium delivery.
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {packages.map((pkg) => (
          <div
            key={pkg.name}
            className={`relative rounded-[2rem] p-7 ${
              pkg.popular ? "brand-gradient text-white" : "glass-card"
            }`}
          >
            {pkg.popular && (
              <div className="absolute right-6 top-6 rounded-full bg-white/20 px-3 py-1 text-xs font-black">
                MOST POPULAR
              </div>
            )}

            <img
              src="/images/logo-icon.png"
              alt="MKETICS"
              className="logo-glow mb-5 h-14 w-14 object-contain"
            />

            <h3 className="text-2xl font-black">{pkg.name}</h3>

            <p className="mt-3 text-sm leading-7 opacity-85">
              {pkg.desc}
            </p>

            <p className="mt-6 text-3xl font-black">
              {pkg.price}
            </p>

            <div className="mt-7 space-y-3">
              {pkg.features.map((feature) => (
                <div key={feature} className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="h-5 w-5" />
                  {feature}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}