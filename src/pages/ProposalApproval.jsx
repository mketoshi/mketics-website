import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { CheckCircle2, XCircle, FileText } from "lucide-react";
import toast from "react-hot-toast";
import { autoGenerateInvoiceFromProposal } from "../utils/autoGenerateInvoice";
import { createPaymentLink } from "../utils/createPaymentLink";

export default function ProposalApproval() {
  const [loading, setLoading] = useState(true);
  const [proposal, setProposal] = useState(null);
  const [approvalRecord, setApprovalRecord] = useState(null);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState("");

  const params = new URLSearchParams(window.location.search);

  const token = params.get("token");

  useEffect(() => {
    loadProposal();
  }, []);

  const loadProposal = async () => {
    try {
      if (!token) {
        setStatus("Invalid approval link.");
        setLoading(false);
        return;
      }

      const { data: tokenData, error: tokenError } = await supabase
        .from("proposal_access_tokens")
        .select("*")
        .eq("access_token", token)
        .single();

      if (tokenError || !tokenData) {
        setStatus("Approval token not found.");
        setLoading(false);
        return;
      }

      const { data: proposalData } = await supabase
        .from("premium_proposals")
        .select("*")
        .eq("id", tokenData.proposal_id)
        .single();

      const { data: approvalData } = await supabase
        .from("proposal_approvals")
        .select("*")
        .eq("proposal_id", tokenData.proposal_id)
        .single();

      setProposal(proposalData);
      setApprovalRecord(approvalData);

      if (approvalData?.approval_status) {
        setStatus(approvalData.approval_status);
      }

      setLoading(false);
    } catch (error) {
      console.error(error);
      setStatus("Failed to load proposal.");
      setLoading(false);
    }
  };

  const updateApproval = async (approvalStatus) => {
    try {
      if (!approvalRecord) return;

      const { error } = await supabase
        .from("proposal_approvals")
        .update({
          approval_status: approvalStatus,
          client_comment: comment,
          approved_at: new Date().toISOString(),
        })
        .eq("id", approvalRecord.id);

      if (error) {
        toast.error("Failed to update approval.");
        return;
      }

      await supabase
        .from("premium_proposals")
        .update({
          proposal_status: approvalStatus,
          approved_by_client: approvalStatus === "Approved",
        })
        .eq("id", proposal.id);

setStatus(approvalStatus);

if (approvalStatus === "Approved") {
  const generatedInvoice =
    await autoGenerateInvoiceFromProposal(proposal);

  if (generatedInvoice) {
    toast.success(
      `Proposal approved and invoice ${generatedInvoice.invoice_number} created`
    );
  } else {
    toast.success("Proposal approved");
  }
} else {
  toast.success(`Proposal ${approvalStatus}`);
}
    } catch (error) {
      console.error(error);
      toast.error("Unexpected approval error.");
    }
  };

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-950 text-white">
        <p className="text-xl font-black">Loading Proposal...</p>
      </main>
    );
  }

  if (!proposal) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-950 text-white">
        <div className="rounded-3xl bg-white/5 p-10 text-center">
          <XCircle className="mx-auto h-16 w-16 text-red-500" />
          <h1 className="mt-6 text-3xl font-black">
            Proposal Not Found
          </h1>
          <p className="mt-4 text-slate-400">{status}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-5xl rounded-[2rem] bg-white/5 p-8 shadow-2xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <FileText className="h-10 w-10 text-sky-400" />

              <div>
                <p className="text-sm font-black uppercase tracking-[0.3em] text-sky-400">
                  MKETICS Proposal Approval
                </p>

                <h1 className="mt-2 text-4xl font-black">
                  {proposal.proposal_title}
                </h1>
              </div>
            </div>

            <p className="mt-5 text-slate-400">
              Prepared for:
              <span className="ml-2 font-bold text-white">
                {proposal.company_name}
              </span>
            </p>

            <p className="mt-2 text-slate-400">
              Client:
              <span className="ml-2 font-bold text-white">
                {proposal.client_email}
              </span>
            </p>
          </div>

          <div className="rounded-2xl bg-sky-500/10 px-6 py-4 text-center">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-sky-400">
              Current Status
            </p>

            <p className="mt-2 text-2xl font-black">
              {status || "Pending"}
            </p>
          </div>
        </div>

        <div className="mt-10 rounded-3xl bg-black/30 p-8">
          <pre className="whitespace-pre-wrap font-sans text-sm leading-7 text-slate-200">
            {proposal.proposal_content}
          </pre>
        </div>

        <div className="mt-10">
          <label className="block text-sm font-black uppercase tracking-[0.2em] text-slate-400">
            Client Comment
          </label>

          <textarea
            rows={5}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add comments or requested changes..."
            className="mt-4 w-full rounded-3xl border border-white/10 bg-white/5 p-5 outline-none"
          />
        </div>

        <div className="mt-10 flex flex-wrap gap-4">
          <button
            onClick={() => updateApproval("Approved")}
            className="flex items-center gap-3 rounded-full bg-green-500 px-8 py-4 font-black text-white"
          >
            <CheckCircle2 className="h-5 w-5" />
            Approve Proposal
          </button>

          <button
            onClick={() => updateApproval("Rejected")}
            className="flex items-center gap-3 rounded-full bg-red-500 px-8 py-4 font-black text-white"
          >
            <XCircle className="h-5 w-5" />
            Reject Proposal
          </button>
        </div>
      </div>
    </main>
  );
}