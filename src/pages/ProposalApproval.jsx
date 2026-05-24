import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  CheckCircle2,
  XCircle,
  FileText,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { autoGenerateInvoiceFromProposal } from "../utils/autoGenerateInvoice";

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
        <div className="text-center">
          <img
            src="/images/logo-icon.webp?v=2"
            alt="MKETICS"
            className="mx-auto h-16 w-16 animate-pulse object-contain"
          />

          <p className="mt-5 text-xl font-black">
            Loading Proposal...
          </p>
        </div>
      </main>
    );
  }

  if (!proposal) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-950 px-4 text-white">
        <div className="rounded-[2rem] bg-white/5 p-10 text-center shadow-2xl">
          <XCircle className="mx-auto h-16 w-16 text-red-500" />

          <h1 className="mt-6 text-3xl font-black">
            Proposal Not Found
          </h1>

          <p className="mt-4 text-slate-400">
            {status}
          </p>

          <a
            href="/"
            className="mt-8 inline-flex rounded-full bg-sky-500 px-6 py-3 font-black text-white"
          >
            Back to MKETICS
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-10 text-white">
      <Toaster position="top-right" />

      <div className="absolute inset-0 opacity-20">
        <div className="absolute left-10 top-10 h-72 w-72 rounded-full bg-sky-500 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-purple-500 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <img
              src="/images/logo-icon.webp?v=2"
              alt="MKETICS"
              className="h-12 w-12 object-contain"
            />

            <div>
              <p className="text-lg font-black">
                MKETICS
              </p>

              <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-400">
                Proposal Approval
              </p>
            </div>
          </a>

          <div className="hidden rounded-full bg-white/5 px-5 py-3 text-sm font-black text-sky-300 sm:block">
            Secure Client Review
          </div>
        </div>

        <div className="rounded-[2.5rem] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-sky-500/10 px-4 py-2 text-sm font-black text-sky-400">
                <FileText className="h-4 w-4" />
                MKETICS Proposal Approval
              </div>

              <h1 className="mt-6 text-4xl font-black leading-tight md:text-6xl">
                {proposal.proposal_title}
              </h1>

              <div className="mt-6 grid gap-3 text-slate-400">
                <p>
                  Prepared for:
                  <span className="ml-2 font-bold text-white">
                    {proposal.company_name}
                  </span>
                </p>

                <p>
                  Client:
                  <span className="ml-2 font-bold text-white">
                    {proposal.client_email}
                  </span>
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-sky-500/10 px-6 py-5 text-center">
              <ShieldCheck className="mx-auto h-8 w-8 text-sky-400" />

              <p className="mt-3 text-xs font-black uppercase tracking-[0.2em] text-sky-400">
                Current Status
              </p>

              <p className="mt-2 text-2xl font-black">
                {status || "Pending"}
              </p>
            </div>
          </div>

          <div className="mt-10 rounded-[2rem] border border-white/10 bg-black/30 p-6 sm:p-8">
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
              className="inline-flex items-center gap-3 rounded-full bg-green-500 px-8 py-4 font-black text-white"
            >
              <CheckCircle2 className="h-5 w-5" />
              Approve Proposal
              <ArrowRight className="h-5 w-5" />
            </button>

            <button
              onClick={() => updateApproval("Rejected")}
              className="inline-flex items-center gap-3 rounded-full bg-red-500 px-8 py-4 font-black text-white"
            >
              <XCircle className="h-5 w-5" />
              Reject Proposal
            </button>
          </div>

          <div className="mt-10 rounded-2xl border border-sky-400/20 bg-sky-500/10 p-5">
            <p className="font-black text-sky-300">
              Approval note
            </p>

            <p className="mt-2 leading-7 text-slate-300">
              If approved, MKETICS may automatically generate the related invoice
              and continue with project onboarding.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
