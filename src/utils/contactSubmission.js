import emailjs from "@emailjs/browser";
import { storeLeadSubmission } from "./leadSubmission";

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

export async function submitContactForm(payload) {
  const databaseResult = await storeLeadSubmission(payload);
  const emailResult = await sendEmailNotification(payload);

  return {
    database: databaseResult,
    email: emailResult,
  };
}

async function sendEmailNotification(payload) {
  console.log("EmailJS config check:", {
    serviceId: EMAILJS_SERVICE_ID,
    templateId: EMAILJS_TEMPLATE_ID,
    hasPublicKey: Boolean(EMAILJS_PUBLIC_KEY),
  });

  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
    throw new Error(
      "EmailJS is not configured. Check VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID and VITE_EMAILJS_PUBLIC_KEY."
    );
  }

  const templateParams = {
    form_name: payload.formName || "MKETICS Website Contact Form",
    lead_source: payload.leadSource || "Contact Page",
    submitted_at: payload.submittedAt || new Date().toISOString(),
    page_url: payload.pageUrl || "",

    full_name: payload.fullName || "",
    phone: payload.phone || "",
    email: payload.email || "",
    organisation: payload.organisation || "",
    service_needed: payload.serviceNeeded || "",
    budget: payload.budget || "",
    timeline: payload.timeline || "",
    preferred_contact: payload.preferredContact || "",
    project_details: payload.projectDetails || "",

    recommended_service:
      payload.serviceExplorer?.recommendedService ||
      payload.serviceNeeded ||
      "",
    service_pillar: payload.serviceExplorer?.pillar || "",
    readiness_level: payload.serviceExplorer?.readiness || "",
    supporting_services: payload.serviceExplorer?.supporting || "",
    selected_answers: payload.serviceExplorer?.answers || "",

    reply_to: payload.email || "",
    to_email: "services@mketics.co.za",
  };

  try {
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      {
        publicKey: EMAILJS_PUBLIC_KEY,
      }
    );

    console.log("EmailJS success:", response);
    return response;
  } catch (error) {
    console.error("EmailJS submission failed:", {
      status: error?.status,
      text: error?.text,
      message: error?.message,
      fullError: error,
    });

    throw new Error(
      error?.text ||
        error?.message ||
        "EmailJS failed. Check Service ID, Template ID, Public Key and template settings."
    );
  }
}