import LegalPage from "../components/sections/LegalPage";

export default function RefundCancellationPolicy() {
  return (
    <LegalPage
      eyebrow="Refunds"
      title="Refund & Cancellation Policy"
      intro="This Refund & Cancellation Policy explains general principles for cancellations, refunds and service changes for MKETICS services."
      sections={[
        {
          title: "General principle",
          text: "Refunds or cancellations depend on the agreed service, work already completed, costs already incurred, third-party charges and whether the client has approved the work to begin.",
        },
        {
          title: "Deposits and upfront payments",
          items: [
            "Some services may require a deposit or upfront payment before work begins.",
            "A deposit may secure project time, planning, consultation, design preparation, account setup or development work.",
            "Once work has started, deposits may be partly or fully non-refundable depending on work already completed and costs incurred.",
          ],
        },
        {
          title: "Cancellation before work starts",
          text: "If a client cancels before MKETICS has started work or incurred costs, MKETICS may consider a refund after deducting reasonable administrative, banking, consultation or third-party costs where applicable.",
        },
        {
          title: "Cancellation after work starts",
          text: "If work has already started, MKETICS may charge for completed work, planning, consultation, design, development, configuration, documentation, meetings, administrative time, third-party fees and any agreed deliverables already prepared.",
        },
        {
          title: "Custom digital work",
          text: "Custom websites, systems, graphics, documents, configurations, Google Workspace setup, portals, dashboards and technical planning services are often tailored to a specific client. Once custom work has begun or drafts have been delivered, refunds may be limited or unavailable depending on the completed scope.",
        },
        {
          title: "Third-party costs",
          items: [
            "Domain fees, hosting fees, software subscriptions, paid plugins, payment gateway charges, Google Workspace subscriptions or third-party services may be non-refundable once purchased, activated or paid to a third party.",
            "MKETICS is not responsible for refund rules imposed by third-party providers.",
          ],
        },
      ]}
    />
  );
}