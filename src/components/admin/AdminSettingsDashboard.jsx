import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Clipboard,
  Copy,
  Loader2,
  Mail,
  RefreshCw,
  RotateCcw,
  Save,
  Settings,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

const adminSettingsKey = "mketics_admin_settings";

const defaultSettings = {
  company: {
    legalName: "MKETICS (PTY) LTD",
    tradingName: "MKETICS",
    meaning: "Modern Knowledge Engineering, Technology & Innovative Commercial Solutions",
    tagline: "Speak Innovation. Deliver Value.",
    registrationNumber: "2026/290708/07",
    enterpriseNumber: "K2026290708",
    email: "services@mketics.co.za",
    phone: "+27 72 286 4367",
    whatsapp: "+27 72 286 4367",
    website: "https://mketics.co.za",
    province: "South Africa",
    municipality: "",
    address: "",
  },
  documents: {
    quotePrefix: "MKQ",
    invoicePrefix: "MKI",
    receiptPrefix: "MKR",
    defaultCurrency: "ZAR",
    quoteValidityDays: "14",
    invoiceDueDays: "7",
    vatMode: "Not VAT registered",
    paymentTerms:
      "Payment is required according to the agreed invoice due date. Work may start after deposit or payment confirmation where applicable.",
    bankingNote:
      "Use official MKETICS business banking details only on client-facing invoices and receipts.",
  },
  admin: {
    preferredStartTab: "overview",
    defaultReportPeriod: "month",
    defaultLeadStatus: "new",
    reminderLeadDays: "2",
    reminderQuoteExpiryDays: "3",
    reminderProjectDueDays: "3",
    documentBucket: "mketics-documents",
    emailFooter:
      "Regards,\nMKETICS (PTY) LTD\nSpeak Innovation. Deliver Value.",
    whatsappSignature:
      "Regards, MKETICS (PTY) LTD — Speak Innovation. Deliver Value.",
  },
};

const startTabOptions = [
  "overview",
  "notifications",
  "leads",
  "projects",
  "documents",
  "finance",
  "invoices",
  "reports",
  "kpis",
  "executive",
  "ai",
  "planner",
  "tasks",
  "time",
];

const periodOptions = ["month", "quarter", "year", "all"];
const leadStatusOptions = ["new", "reviewed", "contacted", "quoted", "won", "lost", "archived"];

export default function AdminSettingsDashboard({ isActive, profile }) {
  const [settings, setSettings] = useState(defaultSettings);
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    organisation: "",
  });
  const [status, setStatus] = useState({
    loading: false,
    saving: false,
    error: "",
    success: "",
  });

  const companySummary = useMemo(() => buildCompanySummary(settings), [settings]);

  useEffect(() => {
    if (!isActive) return;

    setProfileForm({
      fullName: profile?.full_name || "",
      email: profile?.email || "",
      phone: profile?.phone || "",
      organisation: profile?.organisation || "MKETICS (PTY) LTD",
    });

    loadSettings();
  }, [isActive, profile?.id]);

  async function loadSettings() {
    if (!supabase) return;

    try {
      setStatus({ loading: true, saving: false, error: "", success: "" });

      const { data, error } = await supabase
        .from("settings")
        .select("setting_value")
        .eq("setting_key", adminSettingsKey)
        .maybeSingle();

      if (error) throw error;

      setSettings(mergeSettings(defaultSettings, data?.setting_value || {}));

      setStatus({
        loading: false,
        saving: false,
        error: "",
        success: "Settings loaded.",
      });
    } catch (error) {
      setStatus({
        loading: false,
        saving: false,
        error: error?.message || "Unable to load admin settings.",
        success: "",
      });
    }
  }

  async function handleSaveSettings(event) {
    event.preventDefault();

    if (!supabase) return;

    try {
      setStatus({ loading: false, saving: true, error: "", success: "" });

      const payload = {
        ...settings,
        updatedAt: new Date().toISOString(),
        updatedBy: profile?.id || null,
      };

      const { error: settingsError } = await supabase.from("settings").upsert(
        {
          setting_key: adminSettingsKey,
          setting_value: payload,
          description:
            "MKETICS admin console preferences, company profile and document defaults.",
        },
        { onConflict: "setting_key" }
      );

      if (settingsError) throw settingsError;

      if (profile?.id) {
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            full_name: profileForm.fullName.trim() || null,
            email: profileForm.email.trim() || null,
            phone: profileForm.phone.trim() || null,
            organisation: profileForm.organisation.trim() || null,
          })
          .eq("id", profile.id);

        if (profileError) throw profileError;
      }

      setStatus({
        loading: false,
        saving: false,
        error: "",
        success: "Company profile and admin preferences saved.",
      });
    } catch (error) {
      setStatus({
        loading: false,
        saving: false,
        error:
          error?.message ||
          "Unable to save settings. Check Supabase settings and profiles permissions.",
        success: "",
      });
    }
  }

  async function copyCompanySummary() {
    try {
      await navigator.clipboard.writeText(companySummary);
      setStatus((current) => ({
        ...current,
        error: "",
        success: "Company profile summary copied.",
      }));
    } catch {
      setStatus((current) => ({
        ...current,
        error: "Unable to copy company profile summary.",
        success: "",
      }));
    }
  }

  function resetDefaults() {
    setSettings(defaultSettings);
    setStatus({
      loading: false,
      saving: false,
      error: "",
      success: "Default MKETICS settings restored. Click Save Settings to store them.",
    });
  }

  function updateSetting(section, field, value) {
    setSettings((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [field]: value,
      },
    }));

    if (status.error || status.success) {
      setStatus({ loading: false, saving: false, error: "", success: "" });
    }
  }

  function updateProfileField(field, value) {
    setProfileForm((current) => ({ ...current, [field]: value }));

    if (status.error || status.success) {
      setStatus({ loading: false, saving: false, error: "", success: "" });
    }
  }

  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-cyan-200 bg-[#EAF6FF] px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-[#0B7CFF]">
              <Settings size={16} />
              Console settings
            </div>

            <h2 className="mt-4 text-3xl font-black tracking-tight text-[#020B1F]">
              Company profile and admin preferences.
            </h2>

            <p className="mt-3 max-w-3xl text-sm font-semibold leading-7 text-slate-600">
              Manage the MKETICS business identity used across quotes, invoices,
              reports, documents and admin workflows.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={loadSettings}
              disabled={status.loading || status.saving}
              className="inline-flex items-center justify-center rounded-full border border-[#0B7CFF]/25 bg-[#EAF6FF] px-5 py-3 text-sm font-black text-[#061A33] transition hover:border-cyan-300 hover:bg-cyan-300 disabled:opacity-70"
            >
              {status.loading ? (
                <Loader2 size={17} className="mr-2 animate-spin" />
              ) : (
                <RefreshCw size={17} className="mr-2" />
              )}
              Refresh
            </button>

            <button
              type="button"
              onClick={copyCompanySummary}
              className="inline-flex items-center justify-center rounded-full border border-[#0B7CFF]/25 bg-white px-5 py-3 text-sm font-black text-[#061A33] transition hover:border-cyan-300 hover:bg-cyan-300"
            >
              <Copy size={17} className="mr-2" />
              Copy Profile
            </button>
          </div>
        </div>

        {status.error && <StatusMessage type="error" message={status.error} />}
        {status.success && <StatusMessage type="success" message={status.success} />}
      </div>

      <form onSubmit={handleSaveSettings} className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-6">
          <SettingsCard title="Company Profile" icon={Building2}>
            <div className="grid gap-4 md:grid-cols-2">
              <TextField label="Legal Name" value={settings.company.legalName} onChange={(value) => updateSetting("company", "legalName", value)} />
              <TextField label="Trading Name" value={settings.company.tradingName} onChange={(value) => updateSetting("company", "tradingName", value)} />
              <TextField label="Registration Number" value={settings.company.registrationNumber} onChange={(value) => updateSetting("company", "registrationNumber", value)} />
              <TextField label="Enterprise Number" value={settings.company.enterpriseNumber} onChange={(value) => updateSetting("company", "enterpriseNumber", value)} />
              <TextField label="Email" value={settings.company.email} onChange={(value) => updateSetting("company", "email", value)} />
              <TextField label="Phone" value={settings.company.phone} onChange={(value) => updateSetting("company", "phone", value)} />
              <TextField label="WhatsApp" value={settings.company.whatsapp} onChange={(value) => updateSetting("company", "whatsapp", value)} />
              <TextField label="Website" value={settings.company.website} onChange={(value) => updateSetting("company", "website", value)} />
              <TextField label="Province / Country" value={settings.company.province} onChange={(value) => updateSetting("company", "province", value)} />
              <TextField label="Municipality" value={settings.company.municipality} onChange={(value) => updateSetting("company", "municipality", value)} />
            </div>

            <TextField label="Company Meaning" value={settings.company.meaning} onChange={(value) => updateSetting("company", "meaning", value)} />
            <TextField label="Tagline" value={settings.company.tagline} onChange={(value) => updateSetting("company", "tagline", value)} />
            <TextArea label="Address" value={settings.company.address} onChange={(value) => updateSetting("company", "address", value)} rows={3} />
          </SettingsCard>

          <SettingsCard title="Document and Billing Defaults" icon={Clipboard}>
            <div className="grid gap-4 md:grid-cols-3">
              <TextField label="Quote Prefix" value={settings.documents.quotePrefix} onChange={(value) => updateSetting("documents", "quotePrefix", value)} />
              <TextField label="Invoice Prefix" value={settings.documents.invoicePrefix} onChange={(value) => updateSetting("documents", "invoicePrefix", value)} />
              <TextField label="Receipt Prefix" value={settings.documents.receiptPrefix} onChange={(value) => updateSetting("documents", "receiptPrefix", value)} />
              <TextField label="Default Currency" value={settings.documents.defaultCurrency} onChange={(value) => updateSetting("documents", "defaultCurrency", value)} />
              <TextField label="Quote Validity Days" value={settings.documents.quoteValidityDays} onChange={(value) => updateSetting("documents", "quoteValidityDays", value)} />
              <TextField label="Invoice Due Days" value={settings.documents.invoiceDueDays} onChange={(value) => updateSetting("documents", "invoiceDueDays", value)} />
            </div>

            <TextField label="VAT Mode" value={settings.documents.vatMode} onChange={(value) => updateSetting("documents", "vatMode", value)} />
            <TextArea label="Payment Terms" value={settings.documents.paymentTerms} onChange={(value) => updateSetting("documents", "paymentTerms", value)} rows={4} />
            <TextArea label="Banking Note" value={settings.documents.bankingNote} onChange={(value) => updateSetting("documents", "bankingNote", value)} rows={3} />
          </SettingsCard>
        </div>

        <div className="grid gap-6 content-start">
          <SettingsCard title="Admin Profile" icon={UserRound}>
            <TextField label="Full Name" value={profileForm.fullName} onChange={(value) => updateProfileField("fullName", value)} />
            <TextField label="Email" value={profileForm.email} onChange={(value) => updateProfileField("email", value)} />
            <TextField label="Phone" value={profileForm.phone} onChange={(value) => updateProfileField("phone", value)} />
            <TextField label="Organisation" value={profileForm.organisation} onChange={(value) => updateProfileField("organisation", value)} />

            <div className="rounded-2xl border border-cyan-200 bg-[#EAF6FF] p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">
                Access Role
              </p>
              <p className="mt-1 text-sm font-bold text-slate-700">
                {profile?.role || "Not available"}
              </p>
            </div>
          </SettingsCard>

          <SettingsCard title="Admin Preferences" icon={ShieldCheck}>
            <SelectField label="Preferred Start Tab" value={settings.admin.preferredStartTab} options={startTabOptions} onChange={(value) => updateSetting("admin", "preferredStartTab", value)} />
            <SelectField label="Default Report Period" value={settings.admin.defaultReportPeriod} options={periodOptions} onChange={(value) => updateSetting("admin", "defaultReportPeriod", value)} />
            <SelectField label="Default Lead Status" value={settings.admin.defaultLeadStatus} options={leadStatusOptions} onChange={(value) => updateSetting("admin", "defaultLeadStatus", value)} />

            <div className="grid gap-4 md:grid-cols-3">
              <TextField label="Lead Follow-up Days" value={settings.admin.reminderLeadDays} onChange={(value) => updateSetting("admin", "reminderLeadDays", value)} />
              <TextField label="Quote Expiry Alert Days" value={settings.admin.reminderQuoteExpiryDays} onChange={(value) => updateSetting("admin", "reminderQuoteExpiryDays", value)} />
              <TextField label="Project Due Alert Days" value={settings.admin.reminderProjectDueDays} onChange={(value) => updateSetting("admin", "reminderProjectDueDays", value)} />
            </div>

            <TextField label="Document Bucket" value={settings.admin.documentBucket} onChange={(value) => updateSetting("admin", "documentBucket", value)} />
            <TextArea label="Email Footer" value={settings.admin.emailFooter} onChange={(value) => updateSetting("admin", "emailFooter", value)} rows={5} />
            <TextArea label="WhatsApp Signature" value={settings.admin.whatsappSignature} onChange={(value) => updateSetting("admin", "whatsappSignature", value)} rows={3} />
          </SettingsCard>

          <SettingsCard title="Settings Summary" icon={Mail}>
            <pre className="whitespace-pre-wrap rounded-2xl border border-slate-200 bg-[#F8FCFF] p-4 text-sm font-semibold leading-7 text-slate-700">
              {companySummary}
            </pre>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={resetDefaults}
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-black text-[#061A33] transition hover:border-cyan-300 hover:bg-cyan-300"
              >
                <RotateCcw size={17} className="mr-2" />
                Reset Defaults
              </button>

              <button
                type="submit"
                disabled={status.saving}
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#0B7CFF] to-[#00AEEF] px-5 py-3 text-sm font-black text-white shadow-[0_16px_40px_rgba(0,174,239,0.28)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {status.saving ? (
                  <Loader2 size={17} className="mr-2 animate-spin" />
                ) : (
                  <Save size={17} className="mr-2" />
                )}
                Save Settings
              </button>
            </div>
          </SettingsCard>
        </div>
      </form>
    </section>
  );
}

function SettingsCard({ title, icon: Icon, children }) {
  return (
    <article className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#061A33] text-cyan-300">
          <Icon size={21} />
        </div>
        <h3 className="text-xl font-black text-[#020B1F]">{title}</h3>
      </div>
      <div className="mt-5 grid gap-4">{children}</div>
    </article>
  );
}

function TextField({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="text-sm font-black text-[#061A33]">{label}</span>
      <input
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-semibold outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
      />
    </label>
  );
}

function TextArea({ label, value, onChange, rows = 4 }) {
  return (
    <label className="block">
      <span className="text-sm font-black text-[#061A33]">{label}</span>
      <textarea
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        className="mt-2 w-full resize-y rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-semibold leading-7 outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
      />
    </label>
  );
}

function SelectField({ label, value, options, onChange }) {
  return (
    <label className="block">
      <span className="text-sm font-black text-[#061A33]">{label}</span>
      <select
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-black outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {toReadableLabel(option)}
          </option>
        ))}
      </select>
    </label>
  );
}

function StatusMessage({ type, message }) {
  const isError = type === "error";

  return (
    <div
      className={`mt-5 flex items-start gap-3 rounded-2xl border p-4 ${
        isError
          ? "border-red-200 bg-red-50 text-red-900"
          : "border-emerald-200 bg-emerald-50 text-emerald-900"
      }`}
    >
      {isError ? (
        <AlertCircle size={20} className="mt-0.5 shrink-0" />
      ) : (
        <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
      )}
      <p className="text-sm font-bold leading-6">{message}</p>
    </div>
  );
}

function mergeSettings(base, saved) {
  return {
    company: { ...base.company, ...(saved.company || {}) },
    documents: { ...base.documents, ...(saved.documents || {}) },
    admin: { ...base.admin, ...(saved.admin || {}) },
  };
}

function buildCompanySummary(settings) {
  return [
    settings.company.legalName,
    settings.company.meaning,
    `Tagline: ${settings.company.tagline}`,
    `Registration Number: ${settings.company.registrationNumber}`,
    `Enterprise Number: ${settings.company.enterpriseNumber}`,
    `Email: ${settings.company.email}`,
    `Phone: ${settings.company.phone}`,
    `Website: ${settings.company.website}`,
    `Default Currency: ${settings.documents.defaultCurrency}`,
    `Quote Prefix: ${settings.documents.quotePrefix}`,
    `Invoice Prefix: ${settings.documents.invoicePrefix}`,
    `Receipt Prefix: ${settings.documents.receiptPrefix}`,
    `VAT Mode: ${settings.documents.vatMode}`,
  ].join("\n");
}

function toReadableLabel(value) {
  if (!value) return "Not provided";

  return String(value)
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
