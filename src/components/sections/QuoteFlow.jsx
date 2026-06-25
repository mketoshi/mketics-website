import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  FileText,
  MessageCircle,
  SearchCheck,
} from "lucide-react";
import Button from "../ui/Button";
import { createWhatsAppLink, whatsappMessages } from "../../utils/whatsapp";

const steps = [
  {
    title: "Share your need",
    text: "Tell MKETICS what you want to build, fix, improve or prepare.",
    icon: MessageCircle,
  },
  {
    title: "Scope the work",
    text: "We clarify the service type, timeline, budget range, users, content and requirements.",
    icon: SearchCheck,
  },
  {
    title: "Receive direction",
    text: "You receive guidance, a pricing direction or a formal quotation depending on the request.",
    icon: ClipboardList,
  },
  {
    title: "Start properly",
    text: "Work begins after scope, payment terms and delivery expectations are confirmed.",
    icon: FileText,
  },
];

export default function QuoteFlow({
  variant = "light",
  title = "How the MKETICS quote process works.",
  description = "A clear quote process helps avoid confusion, protects the client and helps MKETICS recommend the right service path.",
}) {
  const isDark = variant === "dark";

  return (
    <section
      className={`px-5 py-16 lg:py-24 ${
        isDark ? "bg-[#020B1F] text-white" : "bg-[#EAF6FF] text-[#061A33]"
      }`}
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <div>
            <p
              className={`text-sm font-black uppercase tracking-[0.25em] ${
                isDark ? "text-cyan-300" : "text-[#0B7CFF]"
              }`}
            >
              Quote Flow
            </p>

            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
              {title}
            </h2>
          </div>

          <p
            className={`text-lg leading-8 ${
              isDark ? "text-slate-300" : "text-slate-700"
            }`}
          >
            {description}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {steps.map((step, index) => (
            <QuoteStep
              key={step.title}
              step={step}
              index={index}
              isDark={isDark}
            />
          ))}
        </div>

        <div
          className={`mt-8 rounded-[2rem] border p-6 ${
            isDark
              ? "border-cyan-300/15 bg-cyan-300/10"
              : "border-slate-200 bg-white"
          }`}
        >
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h3 className="text-2xl font-black">
                Ready to request a proper quote?
              </h3>
              <p
                className={`mt-3 leading-7 ${
                  isDark ? "text-slate-300" : "text-slate-700"
                }`}
              >
                Include your service need, budget range, timeline, business name
                and what outcome you expect.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button to="/contact">
                Request Quote
                <ArrowRight size={18} className="ml-2" />
              </Button>

              <a
                href={createWhatsAppLink(whatsappMessages.general)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-cyan-300 bg-white px-6 py-3 font-black text-[#061A33] transition hover:bg-[#061A33] hover:text-cyan-200"
              >
                <MessageCircle size={18} />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function QuoteStep({ step, index, isDark }) {
  const Icon = step.icon;

  return (
    <article
      className={`rounded-[2rem] border p-6 transition duration-300 hover:-translate-y-1 ${
        isDark
          ? "border-cyan-300/15 bg-white/[0.04] hover:border-cyan-300/40"
          : "border-slate-200 bg-white hover:border-cyan-300 hover:shadow-xl"
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div
          className={`grid h-14 w-14 place-items-center rounded-2xl ${
            isDark
              ? "bg-cyan-300/10 text-cyan-300"
              : "bg-[#061A33] text-cyan-300"
          }`}
        >
          <Icon size={28} />
        </div>

        <span
          className={`text-sm font-black ${
            isDark ? "text-cyan-300" : "text-[#0B7CFF]"
          }`}
        >
          0{index + 1}
        </span>
      </div>

      <h3 className="mt-5 text-xl font-black">{step.title}</h3>

      <p
        className={`mt-3 text-sm leading-7 ${
          isDark ? "text-slate-300" : "text-slate-600"
        }`}
      >
        {step.text}
      </p>

      <div className="mt-5 flex items-start gap-2">
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
          Clear next step
        </p>
      </div>
    </article>
  );
}