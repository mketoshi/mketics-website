import { useEffect } from "react";
import {
CheckCircle2,
Rocket,
ShieldCheck,
Building2,
Zap,
Crown,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const plans = [
{
name: "Starter",
price: "R299",
period: "/month",
color: "from-sky-500 to-cyan-400",
icon: Rocket,
description:
"Perfect for startups and small businesses beginning their digital transformation.",
features: [
"2 Users",
"5 Projects",
"10 AI Quotes",
"2GB Storage",
"Client Portal",
"Basic Analytics",
"Standard Support",
],
},

{
name: "Business",
price: "R799",
period: "/month",
color: "from-purple-500 to-pink-500",
icon: Zap,
popular: true,
description:
"Advanced automation, CRM systems and enterprise workflows for growing teams.",
features: [
"5 Users",
"20 Projects",
"50 AI Quotes",
"10GB Storage",
"Advanced CRM",
"Workspace Analytics",
"Priority Support",
"Invoice Automation",
],
},

{
name: "Enterprise",
price: "R1999",
period: "/month",
color: "from-amber-500 to-orange-500",
icon: Crown,
description:
"Enterprise-grade infrastructure with advanced SaaS operations and scalability.",
features: [
"20 Users",
"100 Projects",
"500 AI Quotes",
"100GB Storage",
"Dedicated Workspace",
"Enterprise Analytics",
"Advanced Security",
"Dedicated Support",
"Custom Integrations",
],
},
];

export default function Pricing() {
useEffect(() => {
document.title = "Pricing | MKETICS SaaS";


const meta = document.querySelector(
  'meta[name="description"]'
);

if (meta) {
  meta.setAttribute(
    "content",
    "Compare MKETICS SaaS plans for AI proposals, CRM systems, invoices, automation and enterprise workspace management."
  );
}


}, []);

return ( <main className="min-h-screen app-bg"> <Navbar />


  <section className="relative overflow-hidden px-4 pb-24 pt-32">
    <div className="absolute inset-0 opacity-20">
      <div className="absolute left-10 top-10 h-72 w-72 rounded-full bg-sky-500 blur-3xl" />
      <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-purple-500 blur-3xl" />
    </div>

    <div className="relative mx-auto max-w-7xl">
      <div className="mx-auto max-w-4xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-sky-500/10 px-5 py-2 text-sm font-black text-sky-500">
          <ShieldCheck className="h-4 w-4" />
          Enterprise SaaS Pricing
        </div>

        <h1 className="mt-8 text-5xl font-black md:text-7xl">
          Scale Your Business With{" "}
          <span className="bg-gradient-to-r from-sky-500 to-cyan-400 bg-clip-text text-transparent">
            MKETICS
          </span>
        </h1>

        <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 app-muted">
          AI proposals, enterprise CRM, client portals, workspace automation,
          analytics and commercial SaaS infrastructure — all in one platform.
        </p>
      </div>

      <div className="mt-20 grid gap-8 lg:grid-cols-3">
        {plans.map((plan) => {
          const Icon = plan.icon;

          return (
            <div
              key={plan.name}
              className={`relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl transition hover:-translate-y-2 ${
                plan.popular ? "scale-105 border-purple-500/50" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute right-5 top-5 rounded-full bg-purple-500 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-white">
                  Most Popular
                </div>
              )}

              <div
                className={`inline-flex rounded-2xl bg-gradient-to-r ${plan.color} p-4 text-white`}
              >
                <Icon className="h-8 w-8" />
              </div>

              <h2 className="mt-8 text-3xl font-black">
                {plan.name}
              </h2>

              <div className="mt-6 flex items-end gap-2">
                <span className="text-6xl font-black">
                  {plan.price}
                </span>

                <span className="pb-2 text-lg font-bold app-muted">
                  {plan.period}
                </span>
              </div>

              <p className="mt-6 leading-8 app-muted">
                {plan.description}
              </p>

              <div className="mt-8 grid gap-4">
                {plan.features.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle2 className="h-5 w-5 text-green-500" />

                    <span className="font-semibold">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <a
                href="/start-trial"
                className={`mt-10 inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r ${plan.color} px-6 py-4 text-lg font-black text-white shadow-xl`}
              >
                Start Free Trial
              </a>
            </div>
          );
        })}
      </div>

      <div className="mt-24 rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center backdrop-blur-xl md:p-14">
        <Building2 className="mx-auto h-16 w-16 text-sky-500" />

        <h2 className="mt-8 text-4xl font-black">
          Need Custom Enterprise Infrastructure?
        </h2>

        <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 app-muted">
          MKETICS also provides custom enterprise software systems,
          networking infrastructure, cloud architecture, CCTV integrations,
          AI automation and digital transformation consulting.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-5">
          <a
            href="/contact"
            className="rounded-full bg-sky-500 px-8 py-4 text-lg font-black text-white shadow-xl"
          >
            Contact MKETICS
          </a>

          <a
            href="/start-trial"
            className="rounded-full border border-white/10 bg-white/5 px-8 py-4 text-lg font-black backdrop-blur-xl"
          >
            Launch SaaS Trial
          </a>
        </div>
      </div>
    </div>
  </section>

  <Footer />
</main>


);
}
