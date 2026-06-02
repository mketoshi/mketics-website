import { useMemo, useState } from "react";
import {
  Calculator,
  CheckCircle2,
  Mail,
  MessageSquare,
  MapPin,
  CalendarDays,
  Wallet,
  Contact,
  Phone,
  Search,
  Send,
  User,
} from "lucide-react";

const SERVICE_GROUPS = [
  {
    category: "Websites & Digital Presence",
    services: [
      "Website Starter / Landing Page",
      "Business Website",
      "Online Store / E-commerce",
      "Company Profile Website",
      "Website Redesign",
      "SEO & Google Business Setup",
    ],
  },
  {
    category: "Software & Business Systems",
    services: [
      "Custom Business System",
      "Client Portal",
      "Invoice / Quote Management System",
      "CRM / Leads Management System",
      "Project Tracking Dashboard",
      "School / College IT Support System",
      "Loan / Mashonisa Management System",
    ],
  },
  {
    category: "IT, Network & CCTV",
    services: [
      "IT Support / Troubleshooting",
      "Network Installation",
      "Wi-Fi Setup / Upgrade",
      "CCTV Installation Planning",
      "Cloud Backup Setup",
      "Microsoft 365 / Email Setup",
      "Computer Setup / Office IT Setup",
    ],
  },
  {
    category: "Digital Hub Services",
    services: [
      "Business Registration Support",
      "Company Profile Design",
      "Business Proposal Document",
      "Invoice / Document Template",
      "CV / LinkedIn Profile Support",
      "Branding / Poster / Social Media Design",
    ],
  },
];

const allServices = SERVICE_GROUPS.flatMap((group) =>
  group.services.map((service) => ({ service, category: group.category }))
);

export default function QuoteForm({
  form,
  handleChange,
  handleSubmit,
  estimatedPrice,
  submitting,
  notice,
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Services");

  const filteredServices = useMemo(() => {
    return allServices.filter((item) => {
      const matchesCategory = category === "All Services" || item.category === category;
      const query = search.trim().toLowerCase();
      const matchesSearch =
        !query ||
        item.service.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [category, search]);

  const currentServiceAvailable = filteredServices.some(
    (item) => item.service === form.service
  );

  const selectService = (service) => {
    handleChange({ target: { name: "service", value: service } });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-card overflow-hidden rounded-[2rem] shadow-2xl"
    >
      <div className="border-b border-slate-200/70 bg-white/50 p-6 dark:border-white/10 dark:bg-white/[0.03] sm:p-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-sky-500/10 px-4 py-2 text-sm font-black text-sky-500">
          <Calculator className="h-4 w-4" />
          Quote Request
        </div>

        <h3 className="mt-4 text-3xl font-black">
          Choose a service and request a quote
        </h3>

        <p className="mt-3 leading-7 app-muted">
          Search MKETICS services, select the closest match, and describe what you need.
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

        <div className="grid gap-4 rounded-[1.5rem] border border-sky-400/20 bg-sky-500/5 p-4">
          <label className="grid gap-2">
            <span className="flex items-center gap-2 text-sm font-black app-muted">
              <Search className="h-4 w-4 text-sky-500" />
              Search Services
            </span>
            <input
              className="app-input w-full rounded-2xl px-4 py-4 outline-none"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search website, CCTV, network, invoice system, proposal..."
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-black app-muted">Service Group</span>
              <select
                className="app-input w-full rounded-2xl px-4 py-4 outline-none"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option>All Services</option>
                {SERVICE_GROUPS.map((group) => (
                  <option key={group.category}>{group.category}</option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-black app-muted">Specific Service</span>
              <select
                className="app-input w-full rounded-2xl px-4 py-4 outline-none"
                name="service"
                value={currentServiceAvailable ? form.service : ""}
                onChange={handleChange}
                required
              >
                {!currentServiceAvailable && <option value="">Select a service</option>}
                {filteredServices.map((item) => (
                  <option key={item.service} value={item.service}>
                    {item.service}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {filteredServices.slice(0, 6).map((item) => (
              <button
                key={item.service}
                type="button"
                onClick={() => selectService(item.service)}
                className={`rounded-2xl border px-4 py-3 text-left text-sm font-bold transition ${
                  form.service === item.service
                    ? "border-sky-400 bg-sky-500 text-white"
                    : "border-slate-200/70 bg-white/50 app-muted hover:border-sky-400 dark:border-white/10 dark:bg-white/[0.03]"
                }`}
              >
                {item.service}
              </button>
            ))}
          </div>
        </div>

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
            <span className="text-sm font-black app-muted">Project Size</span>
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

          <label className="grid gap-2">
            <span className="flex items-center gap-2 text-sm font-black app-muted">
              <MapPin className="h-4 w-4 text-sky-500" />
              Location / Site
            </span>
            <input
              className="app-input w-full rounded-2xl px-4 py-4 outline-none"
              type="text"
              name="location"
              placeholder="Town, site, school, company or area"
              value={form.location}
              onChange={handleChange}
            />
          </label>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <label className="grid gap-2">
            <span className="flex items-center gap-2 text-sm font-black app-muted">
              <CalendarDays className="h-4 w-4 text-sky-500" />
              Timeline
            </span>
            <select
              className="app-input w-full rounded-2xl px-4 py-4 outline-none"
              name="timeline"
              value={form.timeline}
              onChange={handleChange}
            >
              <option value="">Select timeline</option>
              <option>Urgent</option>
              <option>This week</option>
              <option>This month</option>
              <option>Flexible</option>
            </select>
          </label>

          <label className="grid gap-2">
            <span className="flex items-center gap-2 text-sm font-black app-muted">
              <Wallet className="h-4 w-4 text-sky-500" />
              Budget Range
            </span>
            <select
              className="app-input w-full rounded-2xl px-4 py-4 outline-none"
              name="budgetRange"
              value={form.budgetRange}
              onChange={handleChange}
            >
              <option value="">Select range</option>
              <option>Below R2,500</option>
              <option>R2,500 - R5,000</option>
              <option>R5,000 - R10,000</option>
              <option>R10,000 - R25,000</option>
              <option>R25,000+</option>
              <option>Not sure yet</option>
            </select>
          </label>

          <label className="grid gap-2">
            <span className="flex items-center gap-2 text-sm font-black app-muted">
              <Contact className="h-4 w-4 text-sky-500" />
              Contact Method
            </span>
            <select
              className="app-input w-full rounded-2xl px-4 py-4 outline-none"
              name="contactMethod"
              value={form.contactMethod}
              onChange={handleChange}
            >
              <option>WhatsApp</option>
              <option>Phone Call</option>
              <option>Email</option>
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
            placeholder="Explain what you need, your location, deadline, number of users/devices, and any existing problem."
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
              This is only a starting estimate. Final pricing depends on confirmed scope, site visits, integrations, equipment and support requirements.
            </p>
          </div>

          <div className="grid gap-3 rounded-2xl bg-white/50 p-4 dark:bg-black/20">
            {["Service match", "Scope review", "Final quote"].map((step) => (
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
          {submitting ? "Submitting Request..." : "Submit Quote Request"}
          <Send className="h-5 w-5" />
        </button>

        <p className="text-center text-xs app-subtle">
          By submitting, you allow MKETICS to contact you about your project request.
        </p>
      </div>
    </form>
  );
}
