export function buildServiceExplorerContactUrl(recommendation) {
  const primaryService = recommendation.primaryService?.title || "";

  const supportingServices = recommendation.supportingServices
    ?.map((service) => service.title)
    .join(", ");

  const selectedAnswers = recommendation.selectedAnswerLabels
    ?.map((item) => `${item.question}: ${item.answer}`)
    .join(" | ");

  const projectNotes = [
    "Service Explorer Recommendation",
    "",
    `Recommended Service: ${primaryService}`,
    `Service Pillar: ${recommendation.servicePillar}`,
    `Readiness Level: ${recommendation.readinessLevel}`,
    supportingServices ? `Supporting Services: ${supportingServices}` : "",
    "",
    "Selected Answers:",
    ...(recommendation.selectedAnswerLabels || []).map(
      (item) => `- ${item.question}: ${item.answer}`
    ),
  ]
    .filter(Boolean)
    .join("\n");

  const params = new URLSearchParams();

  params.set("source", "service-explorer");
  params.set("service", primaryService);
  params.set("pillar", recommendation.servicePillar || "");
  params.set("readiness", recommendation.readinessLevel || "");
  params.set("supporting", supportingServices || "");
  params.set("answers", selectedAnswers || "");
  params.set("notes", projectNotes);

  return `/contact?${params.toString()}`;
}

export function getServiceExplorerLeadFromSearch(searchParams) {
  const source = searchParams.get("source");

  if (source !== "service-explorer") {
    return null;
  }

  return {
    source,
    service: searchParams.get("service") || "",
    pillar: searchParams.get("pillar") || "",
    readiness: searchParams.get("readiness") || "",
    supporting: searchParams.get("supporting") || "",
    answers: searchParams.get("answers") || "",
    notes: searchParams.get("notes") || "",
  };
}