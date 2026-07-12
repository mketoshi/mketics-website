import { isSupabaseConfigured, supabase } from "../lib/supabaseClient";

export async function storeLeadSubmission(payload) {
  if (!isSupabaseConfigured || !supabase) {
    console.warn("Supabase is not configured. Lead was not stored.");
    return {
      success: false,
      skipped: true,
      reason: "Supabase is not configured.",
    };
  }

  const leadRow = mapContactPayloadToLeadRow(payload);

  const { error } = await supabase.from("leads").insert(leadRow);

  if (error) {
    console.error("Supabase lead insert failed:", error);

    throw new Error(
      error?.message ||
        "The request could not be stored in the MKETICS lead database."
    );
  }

  return {
    success: true,
    skipped: false,
  };
}

function mapContactPayloadToLeadRow(payload) {
  const serviceExplorer = payload.serviceExplorer || {};

  return {
    full_name: cleanRequiredText(payload.fullName, "Website Visitor"),
    email: cleanOptionalText(payload.email),
    phone: cleanOptionalText(payload.phone),
    organisation: cleanOptionalText(payload.organisation),

    service_needed: cleanRequiredText(
      payload.serviceNeeded,
      serviceExplorer.recommendedService || "General Enquiry"
    ),
    budget: cleanOptionalText(payload.budget),
    timeline: cleanOptionalText(payload.timeline),
    preferred_contact: cleanOptionalText(payload.preferredContact) || "WhatsApp",
    project_details: cleanRequiredText(
      payload.projectDetails,
      "No project details provided."
    ),

    lead_source: normalizeLeadSource(payload.leadSource),
    status: "new",

    recommended_service: cleanOptionalText(serviceExplorer.recommendedService),
    service_pillar: cleanOptionalText(serviceExplorer.pillar),
    readiness_level: cleanOptionalText(serviceExplorer.readiness),
    supporting_services: cleanOptionalText(serviceExplorer.supporting),
    selected_answers: cleanOptionalText(serviceExplorer.answers),

    page_url: cleanOptionalText(payload.pageUrl),

    metadata: {
      form_name: payload.formName || "MKETICS Website Contact Form",
      submitted_at: payload.submittedAt || new Date().toISOString(),
      website: "mketics.co.za",
      has_service_explorer_data: Boolean(payload.serviceExplorer),
    },
  };
}

function cleanRequiredText(value, fallback) {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  return fallback;
}

function cleanOptionalText(value) {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  return null;
}

function normalizeLeadSource(value) {
  if (!value || typeof value !== "string") {
    return "website_contact_form";
  }

  return value.trim().toLowerCase().replace(/\s+/g, "_");
}