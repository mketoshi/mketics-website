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
      className="glass-card rounded-[2rem] p-8 shadow-2xl"
    >
      <div className="grid gap-5">
        {notice?.message && (
          <div
            className={`rounded-2xl px-4 py-3 text-sm font-medium ${
              notice.type === "success"
                ? "border border-green-400/30 bg-green-500/10 text-green-600 dark:text-green-200"
                : "border border-red-400/30 bg-red-500/10 text-red-500 dark:text-red-200"
            }`}
          >
            {notice.message}
          </div>
        )}

        <div>
          <label className="mb-2 block text-sm font-bold app-muted">
            Full Name
          </label>

          <input
            className="app-input w-full rounded-2xl px-4 py-4 outline-none"
            type="text"
            name="name"
            placeholder="Your full name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold app-muted">
            Phone Number
          </label>

          <input
            className="app-input w-full rounded-2xl px-4 py-4 outline-none"
            type="tel"
            name="phone"
            placeholder="Phone number"
            value={form.phone}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold app-muted">
            Email Address
          </label>

          <input
            className="app-input w-full rounded-2xl px-4 py-4 outline-none"
            type="email"
            name="email"
            placeholder="Email address"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold app-muted">
            Service Category
          </label>

          <select
            className="app-input w-full rounded-2xl px-4 py-4 outline-none"
            name="service"
            value={form.service}
            onChange={handleChange}
          >
            <option>
              System Design & Development
            </option>

            <option>
              IT & Network Infrastructure
            </option>

            <option>
              Digital Hub
            </option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold app-muted">
            Project Size
          </label>

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
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold app-muted">
            Project Details
          </label>

          <textarea
            className="app-input min-h-[150px] w-full rounded-2xl px-4 py-4 outline-none"
            name="message"
            placeholder="Tell us about your project..."
            value={form.message}
            onChange={handleChange}
          />
        </div>

        <div className="rounded-2xl border border-sky-400/20 bg-sky-500/10 p-5">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-sky-600 dark:text-sky-300">
            Estimated Starting Budget
          </p>

          <h2 className="mt-3 text-4xl font-black text-sky-500">
            R{estimatedPrice.toLocaleString()}
          </h2>

          <p className="mt-3 text-sm app-subtle">
            Final pricing depends on project scope,
            integrations, infrastructure requirements,
            and deployment complexity.
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-3 rounded-full bg-sky-500 px-6 py-4 text-sm font-black text-white transition hover:bg-sky-400 disabled:opacity-60"
        >
          {submitting
            ? "Submitting Request..."
            : "Request Professional Quote"}
        </button>
      </div>
    </form>
  );
}