import {
  Calculator,
  CheckCircle2,
  Mail,
  MessageSquare,
  Phone,
  Send,
  User,
} from "lucide-react";

export default function QuoteForm({
  form,
  handleChange,
  handleSubmit,
  estimatedPrice,
  submitting,
  notice,
}) {
  return (
    <form
      onSubmit={handleSubmit}
      className="glass-card overflow-hidden rounded-[2rem] shadow-2xl"
    >
      <div className="border-b border-slate-200/70 bg-white/50 p-6 dark:border-white/10 dark:bg-white/[0.03] sm:p-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-sky-500/10 px-4 py-2 text-sm font-black text-sky-500">
          <Calculator className="h-4 w-4" />
          Instant Estimate
        </div>

        <h3 className="mt-4 text-3xl font-black">
          Request a Professional Quote
        </h3>

        <p className="mt-3 leading-7 app-muted">
          Tell us what you need and MKETICS will prepare a professional response.
        </p>
      </div>

      <div className="grid gap-5 p-6 sm:p-8">
        {notice?.message && (
          <div
            className={`rounded-2xl px-4 py-3 text-sm font-bold ${
              notice.type === "success"
                ? "border border-green-400/30 bg-green-500/10 text-green-600 dark:text-green-200"
                : "border border-red-400/30 bg-red-500/10 text-red-500 dark:text-red-200"
            }`}
          >
            {notice.message}
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="flex items-center gap-2 text-sm font-black app-muted">
              <User className="h-4 w-4 text-sky-500" />
              Full Name
            </span>

            <input
              className="app-input w-full rounded-2xl px-4 py-4 outline-none"
              type="text"
              name="name"
              placeholder="Your full name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </label>

          <label className="grid gap-2">
            <span className="flex items-center gap-2 text-sm font-black app-muted">
              <Phone className="h-4 w-4 text-sky-500" />
              Phone Number
            </span>

            <input
              className="app-input w-full rounded-2xl px-4 py-4 outline-none"
              type="tel"
              name="phone"
              placeholder="072 000 0000"
              value={form.phone}
              onChange={handleChange}
              required
            />
          </label>
        </div>

        <label className="grid gap-2">
          <span className="flex items-center gap-2 text-sm font-black app-muted">
            <Mail className="h-4 w-4 text-sky-500" />
            Email Address
          </span>

          <input
            className="app-input w-full rounded-2xl px-4 py-4 outline-none"
            type="email"
            name="email"
            placeholder="you@company.co.za"
            value={form.email}
            onChange={handleChange}
            required
          />
        </label>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-black app-muted">
              Service Category
            </span>

            <select
              className="app-input w-full rounded-2xl px-4 py-4 outline-none"
              name="service"
              value={form.service}
              onChange={handleChange}
            >
              <option>System Design & Development</option>
              <option>IT & Network Infrastructure</option>
              <option>Digital Hub</option>
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-black app-muted">
              Project Size
            </span>

            <select
              className="app-input w-full rounded-2xl px-4 py-4 outline-none"
              name="size"
              value={form.size}
              onChange={handleChange}
            >
              <option>Startup</option>
              <option>Business</option>
              <option>Enterprise</option>
            </select>
          </label>
        </div>

        <label className="grid gap-2">
          <span className="flex items-center gap-2 text-sm font-black app-muted">
            <MessageSquare className="h-4 w-4 text-sky-500" />
            Project Details
          </span>

          <textarea
            className="app-input min-h-[150px] w-full rounded-2xl px-4 py-4 outline-none"
            name="message"
            placeholder="Example: I need a website, client portal, payment system, email setup, network support, CCTV or business automation..."
            value={form.message}
            onChange={handleChange}
          />
        </label>

        <div className="grid gap-5 rounded-[2rem] border border-sky-400/20 bg-sky-500/10 p-5 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-sky-600 dark:text-sky-300">
              Estimated Starting Budget
            </p>

            <h2 className="mt-3 text-4xl font-black text-sky-500">
              R{estimatedPrice.toLocaleString()}
            </h2>

            <p className="mt-3 text-sm leading-6 app-subtle">
              Final pricing depends on confirmed scope, integrations,
              infrastructure requirements and deployment complexity.
            </p>
          </div>

          <div className="grid gap-3 rounded-2xl bg-white/50 p-4 dark:bg-black/20">
            {["Consultation", "Scope Review", "Final Quote"].map((step) => (
              <div key={step} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm font-bold app-muted">{step}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 inline-flex items-center justify-center gap-3 rounded-full bg-sky-500 px-6 py-4 font-black text-white transition hover:bg-sky-400 disabled:opacity-60"
        >
          {submitting ? "Submitting Request..." : "Request Professional Quote"}
          <Send className="h-5 w-5" />
        </button>

        <p className="text-center text-xs app-subtle">
          By submitting, you allow MKETICS to contact you about your project request.
        </p>
      </div>
    </form>
  );
}
