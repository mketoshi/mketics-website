import { ArrowRight, MessageCircle, Sparkles } from "lucide-react";
import Button from "../ui/Button";
import { siteConfig } from "../../data/site";

export default function ConversionCTA({
  eyebrow = "Ready to start?",
  title = "Let’s turn your idea into a clear technology solution.",
  description = "Tell MKETICS what you want to build, improve or fix. We will help you choose the right starting point, scope and service path.",
  primaryLabel = "Request a Quote",
  primaryHref = "/contact",
  secondaryLabel = "Chat on WhatsApp",
  secondaryHref = siteConfig.whatsapp,
}) {
  return (
    <section className="bg-[#020B1F] px-5 py-16 text-white lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-cyan-300/20 bg-cyan-400/10 p-8 md:p-14">
          <div className="absolute -right-10 -top-10 h-72 w-72 rounded-full bg-cyan-300/20 blur-[100px]" />
          <div className="absolute -bottom-20 left-10 h-72 w-72 rounded-full bg-blue-600/20 blur-[120px]" />

          <div className="relative grid gap-10 lg:grid-cols-[1fr_0.7fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-white/[0.05] px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-cyan-200">
                <Sparkles size={16} />
                {eyebrow}
              </div>

              <h2 className="mt-6 max-w-4xl text-3xl font-black leading-tight tracking-tight sm:text-5xl">
                {title}
              </h2>

              <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-200">
                {description}
              </p>
            </div>

            <div className="flex flex-col gap-4 rounded-[2rem] border border-cyan-300/15 bg-[#020B1F]/60 p-6 backdrop-blur-xl">
              <Button to={primaryHref} className="w-full justify-center">
                {primaryLabel}
                <ArrowRight size={18} className="ml-2" />
              </Button>

              <Button
                href={secondaryHref}
                variant="secondary"
                className="w-full justify-center"
              >
                <MessageCircle size={18} className="mr-2" />
                {secondaryLabel}
              </Button>

              <p className="text-center text-xs leading-6 text-slate-400">
                MKETICS will guide you from idea to clear scope, price and next
                steps.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}