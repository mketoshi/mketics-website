import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clipboard,
  Eye,
  FileArchive,
  FileCheck2,
  FileText,
  FolderOpen,
  Link as LinkIcon,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

const documentTypes = [
  "project_brief",
  "quote_pdf",
  "signed_agreement",
  "client_logo",
  "content_pack",
  "invoice",
  "proof_of_payment",
  "handover_document",
  "support_document",
  "other",
];

const emptyDocumentForm = {
  title: "",
  documentType: "project_brief",
  clientId: "",
  projectId: "",
  quoteId: "",
  publicUrl: "",
  storagePath: "",
  notes: "",
};

export default function DocumentsDashboard({ isActive }) {
  const [recordsState, setRecordsState] = useState({
    loading: false,
    error: "",
    documents: [],
    clients: [],
    projects: [],
    quotes: [],
  });

  const [form, setForm] = useState(emptyDocumentForm);
  const [saveState, setSaveState] = useState({
    loading: false,
    error: "",
    success: "",
  });

  const [deleteState, setDeleteState] = useState({
    loadingId: "",
    error: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [linkFilter, setLinkFilter] = useState("all");
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);
  const [copyStatus, setCopyStatus] = useState("");

  const clientMap = useMemo(() => buildRecordMap(recordsState.clients), [
    recordsState.clients,
  ]);

  const projectMap = useMemo(() => buildRecordMap(recordsState.projects), [
    recordsState.projects,
  ]);

  const quoteMap = useMemo(() => buildRecordMap(recordsState.quotes), [
    recordsState.quotes,
  ]);

  const selectedDocument = useMemo(() => {
    return (
      recordsState.documents.find(
        (documentRecord) => documentRecord.id === selectedDocumentId
      ) || null
    );
  }, [recordsState.documents, selectedDocumentId]);

  const filteredDocuments = useMemo(() => {
    return recordsState.documents.filter((documentRecord) => {
      const matchesType =
        typeFilter === "all" || documentRecord.document_type === typeFilter;

      const hasExternalLink = Boolean(documentRecord.public_url);
      const hasStoragePath = Boolean(documentRecord.storage_path);

      const matchesLinkFilter =
        linkFilter === "all" ||
        (linkFilter === "with_link" && hasExternalLink) ||
        (linkFilter === "storage_only" && !hasExternalLink && hasStoragePath) ||
        (linkFilter === "missing_link" && !hasExternalLink && !hasStoragePath);

      const client = clientMap.get(documentRecord.client_id);
      const project = projectMap.get(documentRecord.project_id);
      const quote = quoteMap.get(documentRecord.quote_id);

      const searchableText = [
        documentRecord.title,
        documentRecord.document_type,
        documentRecord.public_url,
        documentRecord.storage_path,
        documentRecord.notes,
        client?.full_name,
        client?.organisation,
        client?.email,
        project?.title,
        project?.status,
        quote?.quote_number,
        quote?.title,
        quote?.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !searchTerm.trim() ||
        searchableText.includes(searchTerm.trim().toLowerCase());

      return matchesType && matchesLinkFilter && matchesSearch;
    });
  }, [
    recordsState.documents,
    searchTerm,
    typeFilter,
    linkFilter,
    clientMap,
    projectMap,
    quoteMap,
  ]);

  const stats = useMemo(() => {
    const total = recordsState.documents.length;
    const linkedToClients = recordsState.documents.filter(
      (documentRecord) => documentRecord.client_id
    ).length;
    const linkedToProjects = recordsState.documents.filter(
      (documentRecord) => documentRecord.project_id
    ).length;
    const linkedToQuotes = recordsState.documents.filter(
      (documentRecord) => documentRecord.quote_id
    ).length;
    const withLink = recordsState.documents.filter(
      (documentRecord) => documentRecord.public_url || documentRecord.storage_path
    ).length;

    return { total, linkedToClients, linkedToProjects, linkedToQuotes, withLink };
  }, [recordsState.documents]);

  useEffect(() => {
    if (isActive) {
      fetchDocumentRecords();
    }
  }, [isActive]);

  async function fetchDocumentRecords() {
    if (!supabase) return;

    try {
      setRecordsState((current) => ({
        ...current,
        loading: true,
        error: "",
      }));

      const [documentsResult, clientsResult, projectsResult, quotesResult] =
        await Promise.all([
          supabase
            .from("documents")
            .select(
              `
              id,
              client_id,
              project_id,
              quote_id,
              title,
              document_type,
              storage_path,
              public_url,
              notes,
              created_at,
              updated_at
            `
            )
            .order("created_at", { ascending: false }),
          supabase
            .from("clients")
            .select("id, full_name, email, phone, organisation, created_at")
            .order("created_at", { ascending: false }),
          supabase
            .from("projects")
            .select("id, client_id, title, description, service_type, status, created_at")
            .order("created_at", { ascending: false }),
          supabase
            .from("quotes")
            .select(
              "id, client_id, project_id, quote_number, title, status, amount, currency, created_at"
            )
            .order("created_at", { ascending: false }),
        ]);

      const firstError =
        documentsResult.error ||
        clientsResult.error ||
        projectsResult.error ||
        quotesResult.error;

      if (firstError) throw firstError;

      setRecordsState({
        loading: false,
        error: "",
        documents: documentsResult.data || [],
        clients: clientsResult.data || [],
        projects: projectsResult.data || [],
        quotes: quotesResult.data || [],
      });
    } catch (error) {
      setRecordsState({
        loading: false,
        error:
          error?.message ||
          "Unable to load document records. Check Supabase documents permissions.",
        documents: [],
        clients: [],
        projects: [],
        quotes: [],
      });
    }
  }

  async function handleCreateDocumentRecord(event) {
    event.preventDefault();

    if (!supabase) return;

    if (!form.title.trim()) {
      setSaveState({
        loading: false,
        error: "Document title is required.",
        success: "",
      });
      return;
    }

    if (!form.clientId && !form.projectId && !form.quoteId) {
      setSaveState({
        loading: false,
        error: "Link this document to a client, project or quote before saving.",
        success: "",
      });
      return;
    }

    try {
      setSaveState({
        loading: true,
        error: "",
        success: "",
      });

      const documentRow = {
        title: form.title.trim(),
        document_type: form.documentType,
        client_id: form.clientId || null,
        project_id: form.projectId || null,
        quote_id: form.quoteId || null,
        public_url: form.publicUrl.trim() || null,
        storage_path: form.storagePath.trim() || null,
        notes: form.notes.trim() || null,
      };

      const { data, error } = await supabase
        .from("documents")
        .insert(documentRow)
        .select(
          `
          id,
          client_id,
          project_id,
          quote_id,
          title,
          document_type,
          storage_path,
          public_url,
          notes,
          created_at,
          updated_at
        `
        )
        .single();

      if (error) throw error;

      setRecordsState((current) => ({
        ...current,
        documents: data ? [data, ...current.documents] : current.documents,
      }));

      setForm(emptyDocumentForm);
      setSaveState({
        loading: false,
        error: "",
        success: "Document record saved successfully.",
      });
    } catch (error) {
      setSaveState({
        loading: false,
        error:
          error?.message ||
          "Unable to save this document record. Check Supabase insert permissions.",
        success: "",
      });
    }
  }

  async function handleDeleteDocument(documentId) {
    if (!supabase || !documentId) return;

    const confirmed = window.confirm(
      "Delete this document record? This removes the record only, not the original file."
    );

    if (!confirmed) return;

    try {
      setDeleteState({ loadingId: documentId, error: "" });

      const { error } = await supabase
        .from("documents")
        .delete()
        .eq("id", documentId);

      if (error) throw error;

      setRecordsState((current) => ({
        ...current,
        documents: current.documents.filter(
          (documentRecord) => documentRecord.id !== documentId
        ),
      }));

      if (selectedDocumentId === documentId) {
        setSelectedDocumentId(null);
      }

      setDeleteState({ loadingId: "", error: "" });
    } catch (error) {
      setDeleteState({
        loadingId: "",
        error:
          error?.message ||
          "Unable to delete this document record. Check Supabase delete permissions.",
      });
    }
  }

  async function copyText(value, label = "Text") {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      setCopyStatus(`${label} copied.`);
      window.setTimeout(() => setCopyStatus(""), 2500);
    } catch {
      setCopyStatus("Copy failed. Select and copy manually.");
      window.setTimeout(() => setCopyStatus(""), 3500);
    }
  }

  function updateFormField(event) {
    const { name, value } = event.target;

    setForm((current) => {
      const next = {
        ...current,
        [name]: value,
      };

      if (name === "projectId") {
        const project = recordsState.projects.find(
          (projectRecord) => projectRecord.id === value
        );

        if (project?.client_id && !next.clientId) {
          next.clientId = project.client_id;
        }
      }

      if (name === "quoteId") {
        const quote = recordsState.quotes.find(
          (quoteRecord) => quoteRecord.id === value
        );

        if (quote?.client_id) next.clientId = quote.client_id;
        if (quote?.project_id) next.projectId = quote.project_id;
        if (quote?.quote_number && !next.title.trim()) {
          next.title = `${quote.quote_number} document`;
        }
      }

      return next;
    });

    if (saveState.error || saveState.success) {
      setSaveState({
        loading: false,
        error: "",
        success: "",
      });
    }
  }

  return (
    <section>
      <div className="grid gap-4 md:grid-cols-5">
        <StatCard label="Documents" value={stats.total} />
        <StatCard label="Client Files" value={stats.linkedToClients} />
        <StatCard label="Project Files" value={stats.linkedToProjects} />
        <StatCard label="Quote Files" value={stats.linkedToQuotes} />
        <StatCard label="With Link" value={stats.withLink} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <form
          onSubmit={handleCreateDocumentRecord}
          className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#061A33] text-cyan-300">
            <Plus size={22} />
          </div>

          <h2 className="mt-4 text-2xl font-black text-[#020B1F]">
            Add document record
          </h2>

          <p className="mt-2 text-sm leading-7 text-slate-600">
            Register client files, project briefs, quote PDFs, invoices,
            agreements and handover documents. This stores the file record and
            link; the actual file may live in Google Drive, Supabase Storage or
            another secure folder.
          </p>

          {saveState.error && (
            <StatusMessage type="error" message={saveState.error} />
          )}

          {saveState.success && (
            <StatusMessage type="success" message={saveState.success} />
          )}

          <div className="mt-5 grid gap-4">
            <label className="block">
              <span className="text-sm font-black text-[#061A33]">
                Document Title
              </span>

              <input
                name="title"
                value={form.title}
                onChange={updateFormField}
                placeholder="Example: Signed website agreement"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-semibold outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
              />
            </label>

            <label className="block">
              <span className="text-sm font-black text-[#061A33]">
                Document Type
              </span>

              <select
                name="documentType"
                value={form.documentType}
                onChange={updateFormField}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-black outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
              >
                {documentTypes.map((type) => (
                  <option key={type} value={type}>
                    {toReadableLabel(type)}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-4 lg:grid-cols-2">
              <label className="block">
                <span className="text-sm font-black text-[#061A33]">
                  Client
                </span>

                <select
                  name="clientId"
                  value={form.clientId}
                  onChange={updateFormField}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-black outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
                >
                  <option value="">No client selected</option>
                  {recordsState.clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {formatClientLabel(client)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-black text-[#061A33]">
                  Project
                </span>

                <select
                  name="projectId"
                  value={form.projectId}
                  onChange={updateFormField}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-black outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
                >
                  <option value="">No project selected</option>
                  {recordsState.projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.title} • {toReadableLabel(project.status)}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-black text-[#061A33]">
                Quote / Quotation
              </span>

              <select
                name="quoteId"
                value={form.quoteId}
                onChange={updateFormField}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-black outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
              >
                <option value="">No quote selected</option>
                {recordsState.quotes.map((quote) => (
                  <option key={quote.id} value={quote.id}>
                    {quote.quote_number || "Quote"} • {quote.title}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-black text-[#061A33]">
                Public / Shared URL
              </span>

              <input
                name="publicUrl"
                value={form.publicUrl}
                onChange={updateFormField}
                placeholder="https://drive.google.com/..."
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-semibold outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
              />
            </label>

            <label className="block">
              <span className="text-sm font-black text-[#061A33]">
                Storage Path / Folder Reference
              </span>

              <input
                name="storagePath"
                value={form.storagePath}
                onChange={updateFormField}
                placeholder="clients/client-name/project-folder/file.pdf"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-semibold outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
              />
            </label>

            <label className="block">
              <span className="text-sm font-black text-[#061A33]">Notes</span>

              <textarea
                name="notes"
                value={form.notes}
                onChange={updateFormField}
                rows={5}
                placeholder="Example: Final signed version received from client."
                className="mt-2 w-full resize-y rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-semibold leading-7 outline-none transition placeholder:text-slate-400 focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={saveState.loading}
            className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#0B7CFF] to-[#00AEEF] px-6 py-3 font-black text-white shadow-[0_16px_40px_rgba(0,174,239,0.28)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saveState.loading ? (
              <>
                <Loader2 size={18} className="mr-2 animate-spin" />
                Saving Record
              </>
            ) : (
              <>
                <Save size={18} className="mr-2" />
                Save Document Record
              </>
            )}
          </button>
        </form>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-black text-[#020B1F]">
                Document records
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Search files by client, project, quote number, document type,
                folder path or link.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchDocumentRecords}
              disabled={recordsState.loading}
              className="inline-flex items-center justify-center rounded-full border border-[#0B7CFF]/25 bg-[#EAF6FF] px-5 py-3 text-sm font-black text-[#061A33] transition hover:border-cyan-300 hover:bg-cyan-300 disabled:opacity-70"
            >
              {recordsState.loading ? (
                <Loader2 size={17} className="mr-2 animate-spin" />
              ) : (
                <RefreshCw size={17} className="mr-2" />
              )}
              Refresh
            </button>
          </div>

          <div className="mt-5 grid gap-3 xl:grid-cols-[1fr_190px_190px]">
            <label className="relative block">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search documents, clients, projects, quotes..."
                className="w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] py-3 pl-11 pr-4 text-sm font-semibold outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
              />
            </label>

            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-black outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
            >
              <option value="all">All types</option>
              {documentTypes.map((type) => (
                <option key={type} value={type}>
                  {toReadableLabel(type)}
                </option>
              ))}
            </select>

            <select
              value={linkFilter}
              onChange={(event) => setLinkFilter(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-black outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
            >
              <option value="all">All link states</option>
              <option value="with_link">With URL</option>
              <option value="storage_only">Storage path only</option>
              <option value="missing_link">No link/path</option>
            </select>
          </div>

          {recordsState.error && (
            <StatusMessage type="error" message={recordsState.error} />
          )}

          {deleteState.error && (
            <StatusMessage type="error" message={deleteState.error} />
          )}

          {copyStatus && <StatusMessage type="success" message={copyStatus} />}

          <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-slate-200">
            <div className="overflow-x-auto">
              <table className="min-w-[920px] w-full border-collapse bg-white text-left">
                <thead className="bg-[#F8FCFF]">
                  <tr>
                    <Th>Document</Th>
                    <Th>Linked To</Th>
                    <Th>Location</Th>
                    <Th>Date</Th>
                    <Th>Actions</Th>
                  </tr>
                </thead>

                <tbody>
                  {recordsState.loading && (
                    <tr>
                      <td colSpan="5" className="px-5 py-10 text-center">
                        <Loader2
                          className="mx-auto animate-spin text-[#0B7CFF]"
                          size={28}
                        />
                        <p className="mt-3 text-sm font-black text-slate-500">
                          Loading document records...
                        </p>
                      </td>
                    </tr>
                  )}

                  {!recordsState.loading && filteredDocuments.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-5 py-10 text-center">
                        <FileArchive className="mx-auto text-slate-400" size={28} />
                        <p className="mt-3 text-sm font-black text-slate-500">
                          No document records found.
                        </p>
                      </td>
                    </tr>
                  )}

                  {!recordsState.loading &&
                    filteredDocuments.map((documentRecord) => (
                      <DocumentRow
                        key={documentRecord.id}
                        documentRecord={documentRecord}
                        client={clientMap.get(documentRecord.client_id)}
                        project={projectMap.get(documentRecord.project_id)}
                        quote={quoteMap.get(documentRecord.quote_id)}
                        onView={() => setSelectedDocumentId(documentRecord.id)}
                        onCopy={() =>
                          copyText(
                            documentRecord.public_url || documentRecord.storage_path,
                            "Document location"
                          )
                        }
                        onDelete={() => handleDeleteDocument(documentRecord.id)}
                        deleteLoading={deleteState.loadingId === documentRecord.id}
                      />
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {selectedDocument && (
        <DocumentDetailPanel
          documentRecord={selectedDocument}
          client={clientMap.get(selectedDocument.client_id)}
          project={projectMap.get(selectedDocument.project_id)}
          quote={quoteMap.get(selectedDocument.quote_id)}
          onClose={() => setSelectedDocumentId(null)}
          onCopy={() =>
            copyText(
              selectedDocument.public_url || selectedDocument.storage_path,
              "Document location"
            )
          }
          onDelete={() => handleDeleteDocument(selectedDocument.id)}
          deleteLoading={deleteState.loadingId === selectedDocument.id}
        />
      )}
    </section>
  );
}

function DocumentRow({
  documentRecord,
  client,
  project,
  quote,
  onView,
  onCopy,
  onDelete,
  deleteLoading,
}) {
  const location = documentRecord.public_url || documentRecord.storage_path;

  return (
    <tr className="border-t border-slate-200 align-top transition hover:bg-[#F8FCFF]">
      <Td>
        <p className="font-black text-[#020B1F]">{documentRecord.title}</p>
        <p className="mt-1 text-xs font-black uppercase tracking-[0.12em] text-[#0B7CFF]">
          {toReadableLabel(documentRecord.document_type)}
        </p>
      </Td>

      <Td>
        <LinkedSummary client={client} project={project} quote={quote} />
      </Td>

      <Td>
        {location ? (
          <div className="grid gap-1">
            {documentRecord.public_url && (
              <a
                href={documentRecord.public_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-xs font-black text-[#0B7CFF] hover:underline"
              >
                <LinkIcon size={13} />
                Open URL
              </a>
            )}
            {documentRecord.storage_path && (
              <p className="break-all text-xs font-semibold text-slate-500">
                {documentRecord.storage_path}
              </p>
            )}
          </div>
        ) : (
          "No link saved"
        )}
      </Td>

      <Td>
        <p>{formatDate(documentRecord.created_at)}</p>
        <p className="mt-1 text-xs text-slate-500">
          {formatTime(documentRecord.created_at)}
        </p>
      </Td>

      <Td>
        <div className="flex flex-wrap gap-2">
          <SmallActionButton onClick={onView} icon={Eye} label="View" />
          <SmallActionButton
            onClick={onCopy}
            icon={Clipboard}
            label="Copy"
            disabled={!location}
          />
          <SmallActionButton
            onClick={onDelete}
            icon={deleteLoading ? Loader2 : Trash2}
            label={deleteLoading ? "Deleting" : "Delete"}
            danger
            loading={deleteLoading}
          />
        </div>
      </Td>
    </tr>
  );
}

function DocumentDetailPanel({
  documentRecord,
  client,
  project,
  quote,
  onClose,
  onCopy,
  onDelete,
  deleteLoading,
}) {
  const location = documentRecord.public_url || documentRecord.storage_path;

  return (
    <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#0B7CFF]">
            Document Detail
          </p>

          <h2 className="mt-2 text-2xl font-black text-[#020B1F]">
            {documentRecord.title}
          </h2>

          <p className="mt-2 text-sm font-semibold text-slate-600">
            {toReadableLabel(documentRecord.document_type)} • Added {formatFullDate(documentRecord.created_at)}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-[#F8FCFF] px-5 py-3 text-sm font-black text-[#061A33] transition hover:border-cyan-300 hover:bg-cyan-300"
        >
          <X size={17} className="mr-2" />
          Close
        </button>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.85fr]">
        <article className="rounded-[1.5rem] border border-slate-200 bg-[#F8FCFF] p-5">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#061A33] text-cyan-300">
            <FileCheck2 size={22} />
          </div>

          <h3 className="mt-4 text-xl font-black text-[#020B1F]">
            File record information
          </h3>

          <div className="mt-5 grid gap-4">
            <DetailLine label="Title" value={documentRecord.title} />
            <DetailLine
              label="Document Type"
              value={toReadableLabel(documentRecord.document_type)}
            />
            <DetailLine label="Public URL" value={documentRecord.public_url} />
            <DetailLine label="Storage Path" value={documentRecord.storage_path} />
            <DetailLine label="Notes" value={documentRecord.notes} multiline />
            <DetailLine label="Created" value={formatFullDate(documentRecord.created_at)} />
            <DetailLine label="Updated" value={formatFullDate(documentRecord.updated_at)} />
          </div>
        </article>

        <article className="rounded-[1.5rem] border border-cyan-200 bg-white p-5 shadow-sm">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#061A33] text-cyan-300">
            <FolderOpen size={22} />
          </div>

          <h3 className="mt-4 text-xl font-black text-[#020B1F]">
            Linked records
          </h3>

          <div className="mt-5 grid gap-4">
            <LinkedSummary client={client} project={project} quote={quote} expanded />
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {documentRecord.public_url && (
              <a
                href={documentRecord.public_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#0B7CFF] to-[#00AEEF] px-5 py-3 text-sm font-black text-white shadow-[0_16px_40px_rgba(0,174,239,0.22)] transition hover:-translate-y-0.5"
              >
                <LinkIcon size={17} className="mr-2" />
                Open File
              </a>
            )}

            <button
              type="button"
              onClick={onCopy}
              disabled={!location}
              className="inline-flex items-center justify-center rounded-full border border-[#0B7CFF]/25 bg-[#EAF6FF] px-5 py-3 text-sm font-black text-[#061A33] transition hover:border-cyan-300 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Clipboard size={17} className="mr-2" />
              Copy Location
            </button>

            <button
              type="button"
              onClick={onDelete}
              disabled={deleteLoading}
              className="inline-flex items-center justify-center rounded-full border border-red-200 bg-red-50 px-5 py-3 text-sm font-black text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70 sm:col-span-2"
            >
              {deleteLoading ? (
                <Loader2 size={17} className="mr-2 animate-spin" />
              ) : (
                <Trash2 size={17} className="mr-2" />
              )}
              Delete Record
            </button>
          </div>
        </article>
      </div>
    </section>
  );
}

function LinkedSummary({ client, project, quote, expanded = false }) {
  const lines = [
    client && {
      label: "Client",
      value: formatClientLabel(client),
    },
    project && {
      label: "Project",
      value: `${project.title} • ${toReadableLabel(project.status)}`,
    },
    quote && {
      label: "Quote",
      value: `${quote.quote_number || "Quote"} • ${quote.title} • ${toReadableLabel(
        quote.status
      )}`,
    },
  ].filter(Boolean);

  if (lines.length === 0) {
    return <p className="text-sm font-semibold text-slate-500">Not linked</p>;
  }

  return (
    <div className="grid gap-2">
      {lines.map((line) => (
        <div key={`${line.label}-${line.value}`}>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-[#0B7CFF]">
            {line.label}
          </p>
          <p
            className={`mt-1 font-semibold leading-6 text-slate-700 ${
              expanded ? "text-sm" : "text-xs"
            }`}
          >
            {line.value}
          </p>
        </div>
      ))}
    </div>
  );
}

function SmallActionButton({
  onClick,
  icon: Icon,
  label,
  disabled = false,
  danger = false,
  loading = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center rounded-full border px-3 py-2 text-xs font-black transition disabled:cursor-not-allowed disabled:opacity-50 ${
        danger
          ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
          : "border-[#0B7CFF]/25 bg-[#EAF6FF] text-[#061A33] hover:border-cyan-300 hover:bg-cyan-300"
      }`}
    >
      <Icon size={13} className={`mr-2 ${loading ? "animate-spin" : ""}`} />
      {label}
    </button>
  );
}

function StatCard({ label, value }) {
  return (
    <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-[#0B7CFF]">
        {label}
      </p>
      <p className="mt-3 text-4xl font-black text-[#020B1F]">{value}</p>
    </article>
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

function DetailLine({ label, value, multiline = false }) {
  if (!value) return null;

  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">
        {label}
      </p>
      <p
        className={`mt-1 text-sm font-semibold leading-6 text-slate-700 ${
          multiline ? "whitespace-pre-wrap" : "break-words"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function Th({ children }) {
  return (
    <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.18em] text-slate-500">
      {children}
    </th>
  );
}

function Td({ children }) {
  return (
    <td className="px-5 py-4 text-sm font-semibold leading-6 text-slate-700">
      {children}
    </td>
  );
}

function buildRecordMap(records) {
  return new Map((records || []).map((record) => [record.id, record]));
}

function formatClientLabel(client) {
  if (!client) return "Unknown Client";

  return [client.full_name, client.organisation || client.email]
    .filter(Boolean)
    .join(" • ");
}

function formatDate(value) {
  if (!value) return "Unknown";

  return new Intl.DateTimeFormat("en-ZA", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(value));
}

function formatTime(value) {
  if (!value) return "";

  return new Intl.DateTimeFormat("en-ZA", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatFullDate(value) {
  if (!value) return "Not available";

  return new Intl.DateTimeFormat("en-ZA", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function toReadableLabel(value) {
  if (!value) return "Not provided";

  return String(value)
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
