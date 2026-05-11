import { CheckCircle2 } from "lucide-react";

export default function QuoteRequestCard({ lead }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-xl font-black">
            {lead.service}
          </h3>

          <p className="mt-1 text-sm text-slate-400">
            {lead.size}
          </p>

          <p className="mt-4 text-sm leading-7 text-slate-300">
            {lead.message}
          </p>
        </div>

        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-sky-500/10 px-4 py-2 text-sm font-bold text-sky-200">
          <CheckCircle2 className="h-4 w-4" />
          {lead.status || "New"}
        </span>
      </div>
    </div>
  );
}