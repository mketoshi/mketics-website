import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";

import {
  CheckCircle2,
  Rocket,
  ShieldCheck,
  Building2,
  Mail,
  Phone,
  User,
  CreditCard,
  ArrowRight,
  Sparkles,
  LockKeyhole,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const plans = [
  {
    name: "Starter",
    code: "starter",
    price: "R299 / month",
    description: "For small businesses starting with MKETICS client systems.",
    features: [
      "2 users",
      "5 projects",
      "10 AI quotes",
      "2GB storage",
      "Standard support",
    ],
  },
  {
    name: "Business",
    code: "business",
    price: "R799 / month",
    description:
      "For growing teams needing automation, CRM and client workflows.",
    features: [
      "5 users",
      "20 projects",
      "50 AI quotes",
      "10GB storage",
      "Priority support",
    ],
  },
  {
    name: "Enterprise",
    code: "enterprise",
    price: "R1,999 / month",
    description:
      "For serious operations requiring full SaaS workspace control.",
    features: [
      "20 users",
      "100 projects",
      "500 AI quotes",
      "100GB storage",
      "Dedicated support",
    ],
  },
];

export default function PublicSaasSignup() {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("starter");

  const [form, setForm] = useState({
    fullName: "",
    companyName: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    document.title = "Start MKETICS SaaS Trial | MKETICS";
  }, []);

  const updateForm = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const slugify = (value) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

  const createTrialWorkspace = async () => {
    if (!form.fullName || !form.companyName || !form.email) {
      alert("Please complete your name, company name and email.");
      return;
    }

    setLoading(true);

    try {
      const cleanSlug = slugify(form.companyName);
      const trialExpiry = new Date();
      trialExpiry.setDate(trialExpiry.getDate() + 14);

      const { data: workspace, error: workspaceError } = await supabase
        .from("workspaces")
        .insert([
          {
            workspace_name: form.companyName,
            subscription_plan: selectedPlan,
          },
        ])
        .select()
        .single();

      if (workspaceError) {
        console.error(workspaceError);
        toast.error("Workspace creation failed.");
        setLoading(false);
        return;
      }

      await supabase.from("public_saas_registrations").insert([
        {
          full_name: form.fullName,
          company_name: form.companyName,
          email: form.email,
          phone: form.phone,
          selected_plan: selectedPlan,
          onboarding_status: "Trial Created",
          workspace_id: workspace.id,
        },
      ]);

      await supabase.from("company_workspaces").insert([
        {
          company_name: form.companyName,
          company_slug: cleanSlug || `workspace-${Date.now()}`,
          owner_email: form.email,
          plan_type:
            selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1),
          status: "Trial",
        },
      ]);

      await supabase.from("workspace_members").insert([
        {
          workspace_id: workspace.id,
          email: form.email,
          role: "client",
          status: "Pending Account",
        },
      ]);

      await supabase.from("saas_trials").insert([
        {
          workspace_id: workspace.id,
          trial_plan:
            selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1),
          expires_at: trialExpiry.toISOString(),
          status: "Active",
        },
      ]);

      await supabase.from("workspace_activity_feed").insert([
        {
          workspace_id: workspace.id,
          actor_email: form.email,
          activity_type: "signup",
          activity_title: "SaaS trial workspace created",
          activity_message: `${form.companyName} started a ${selectedPlan} trial.`,
          related_table: "public_saas_registrations",
          visibility: "client",
        },
      ]);

      await supabase.from("admin_notifications").insert([
        {
          title: "New SaaS Trial Registration",
          message: `${form.companyName} registered for the ${selectedPlan} plan.`,
          type: "saas",
          is_read: false,
        },
      ]);

      toast.success("Trial workspace created");

      alert(
        `Trial workspace created successfully.\n\nNext step: create your client account using the same email address:\n${form.email}`
      );

      window.location.href = `/client-register?email=${encodeURIComponent(
        form.email
      )}`;
    } catch (error) {
      console.error(error);
      toast.error("Unexpected SaaS signup error.");
    } finally {
      setLoading(false);
    }
  };

  const selectedPlanData =
    plans.find((plan) => plan.code === selectedPlan) || plans[0];

  return (
    <main className="min-h-screen app-bg">
      <Toaster position="top-right" />
      <Navbar />

      <section className="relative overflow-hidden px-4 pb-16 pt-32">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute left-10 top-10 h-72 w-72 rounded-full bg-sky-500 blur-3xl" />
          <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-purple-500 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl">
          <div className="glass-card rounded-[2.5rem] p-8 shadow-2xl md:p-12">
            <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-green-500/10 px-5 py-2 text-sm font-black text-green-500">
                  <Rocket className="h-4 w-4" />
                  Launch Your SaaS Workspace
                </div>

                <h1 className="mt-7 text-5xl font-black leading-tight md:text-7xl">
                  Start Your{" "}
                  <span className="bg-gradient-to-r from-sky-500 to-cyan-400 bg-clip-text text-transparent">
                    MKETICS
                  </span>{" "}
                  Trial
                </h1>

                <p className="mt-7 max-w-3xl text-lg leading-8 app-muted">
                  Create a secure client workspace for projects, invoices, AI
                  proposals, support, files, analytics and SaaS automation.
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  {[
                    "14-day trial",
                    "Workspace isolation",
                    "AI proposal tools",
                  ].map((item) => (
                    <div key={item} className="rounded-2xl app-surface p-4">
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                      <p className="mt-3 font-black">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] border border-sky-400/20 bg-sky-500/10 p-6">
                <ShieldCheck className="h-12 w-12 text-sky-500" />

                <h2 className="mt-5 text-3xl font-black">
                  Secure SaaS Onboarding
                </h2>

                <p className="mt-4 leading-8 app-muted">
                  Your workspace is created with enterprise-ready isolation and
                  can later be connected to billing, payment gateways and staff
                  roles.
                </p>

                <div className="mt-6 grid gap-3">
                  {[
                    "Secure account flow",
                    "Workspace setup",
                    "Trial activation",
                    "Client portal access",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <LockKeyhole className="h-4 w-4 text-sky-500" />
                      <span className="font-bold app-muted">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {plans.map((plan) => {
              const active = selectedPlan === plan.code;

              return (
                <button
                  key={plan.code}
                  onClick={() => setSelectedPlan(plan.code)}
                  className={`text-left rounded-[2rem] p-6 transition hover:-translate-y-1 ${
                    active
                      ? "bg-sky-500 text-white shadow-2xl"
                      : "glass-card"
                  }`}
                >
                  <p className="text-sm font-black uppercase tracking-[0.2em]">
                    {plan.name}
                  </p>

                  <h3 className="mt-4 text-3xl font-black">
                    {plan.price}
                  </h3>

                  <p
                    className={`mt-4 leading-7 ${
                      active ? "text-white/80" : "app-muted"
                    }`}
                  >
                    {plan.description}
                  </p>

                  <div className="mt-6 grid gap-3">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5" />
                        <span className="font-bold">{feature}</span>
                      </div>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-24">
        <div className="glass-card rounded-[2.5rem] p-6 shadow-2xl sm:p-8">
          <div className="flex flex-col gap-6 border-b border-slate-200 pb-6 dark:border-white/10 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="font-black uppercase tracking-[0.2em] text-sky-500">
                Create Workspace
              </p>

              <h2 className="mt-3 text-3xl font-black">
                Business Details
              </h2>
            </div>

            <div className="rounded-2xl bg-sky-500/10 p-4">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-sky-500">
                Selected Plan
              </p>

              <p className="mt-2 text-xl font-black">
                {selectedPlanData.name}
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="flex items-center gap-2 text-sm font-black app-subtle">
                <User className="h-4 w-4" />
                Full Name
              </span>

              <input
                value={form.fullName}
                onChange={(e) => updateForm("fullName", e.target.value)}
                placeholder="Your full name"
                className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5"
              />
            </label>

            <label className="grid gap-2">
              <span className="flex items-center gap-2 text-sm font-black app-subtle">
                <Building2 className="h-4 w-4" />
                Company Name
              </span>

              <input
                value={form.companyName}
                onChange={(e) => updateForm("companyName", e.target.value)}
                placeholder="Company name"
                className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5"
              />
            </label>

            <label className="grid gap-2">
              <span className="flex items-center gap-2 text-sm font-black app-subtle">
                <Mail className="h-4 w-4" />
                Email Address
              </span>

              <input
                type="email"
                value={form.email}
                onChange={(e) => updateForm("email", e.target.value)}
                placeholder="you@company.co.za"
                className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5"
              />
            </label>

            <label className="grid gap-2">
              <span className="flex items-center gap-2 text-sm font-black app-subtle">
                <Phone className="h-4 w-4" />
                Phone
              </span>

              <input
                value={form.phone}
                onChange={(e) => updateForm("phone", e.target.value)}
                placeholder="Optional phone number"
                className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none dark:border-white/10 dark:bg-white/5"
              />
            </label>
          </div>

          <div className="mt-8 rounded-2xl app-surface p-5">
            <div className="flex items-center gap-3">
              <CreditCard className="h-6 w-6 text-green-500" />

              <div>
                <p className="font-black">
                  Trial activation: {selectedPlanData.name}
                </p>

                <p className="text-sm app-muted">
                  Billing checkout can be connected in the next phase.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={createTrialWorkspace}
            disabled={loading}
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-500 px-6 py-5 text-lg font-black text-white transition hover:bg-sky-400 disabled:opacity-60"
          >
            {loading ? "Creating Workspace..." : "Start Free Trial"}
            <ArrowRight className="h-5 w-5" />
          </button>

          <p className="mt-4 text-center text-sm app-subtle">
            After submission, you will create your client account using the same
            email address.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
