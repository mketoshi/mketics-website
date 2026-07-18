import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarCheck,
  CheckCircle2,
  Clipboard,
  ClipboardList,
  Clock,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

const taskBoardSettingKey = "project_task_board_v1";

const taskStatuses = [
  { id: "backlog", label: "Backlog" },
  { id: "todo", label: "To Do" },
  { id: "in_progress", label: "In Progress" },
  { id: "review", label: "Review" },
  { id: "blocked", label: "Blocked" },
  { id: "done", label: "Done" },
];

const priorityOptions = ["low", "normal", "high", "urgent"];

const categoryOptions = [
  "Discovery",
  "Content",
  "Design",
  "Development",
  "Testing",
  "Handover",
  "Support",
  "Admin",
];

const deliveryChecklistTemplates = [
  {
    title: "Confirm client requirements and success criteria",
    category: "Discovery",
    priority: "high",
    description:
      "Review the accepted quote, confirm deliverables, timelines, content needs and final approval process.",
  },
  {
    title: "Collect required content, branding and access details",
    category: "Content",
    priority: "high",
    description:
      "Request logos, images, copy, product details, domain access, hosting access or account credentials needed for delivery.",
  },
  {
    title: "Prepare first delivery draft or working version",
    category: "Development",
    priority: "normal",
    description:
      "Build the first version of the website, system, support solution or technical deliverable for internal review.",
  },
  {
    title: "Run quality checks and client review preparation",
    category: "Testing",
    priority: "normal",
    description:
      "Check layout, links, forms, spelling, responsiveness, integrations, data records and handover readiness.",
  },
  {
    title: "Send client review update and collect feedback",
    category: "Handover",
    priority: "normal",
    description:
      "Send the client a clear update, explain what has been completed and request final changes or approval.",
  },
  {
    title: "Complete handover and support notes",
    category: "Support",
    priority: "normal",
    description:
      "Document credentials, support expectations, maintenance notes, training points and next recommended actions.",
  },
];

export default function ProjectTaskBoard({ isActive }) {
  const [dataState, setDataState] = useState({
    loading: false,
    error: "",
    projects: [],
    clients: [],
    tasks: [],
  });

  const [filters, setFilters] = useState({
    projectId: "all",
    status: "all",
    search: "",
  });

  const [taskForm, setTaskForm] = useState({
    projectId: "",
    title: "",
    description: "",
    status: "todo",
    priority: "normal",
    category: "Development",
    dueDate: "",
  });

  const [saveState, setSaveState] = useState({
    loading: false,
    error: "",
    success: "",
  });

  useEffect(() => {
    if (isActive) {
      fetchBoardData();
    }
  }, [isActive]);

  const selectedProject = useMemo(() => {
    if (!taskForm.projectId) return null;
    return dataState.projects.find((project) => project.id === taskForm.projectId) || null;
  }, [dataState.projects, taskForm.projectId]);

  const visibleTasks = useMemo(() => {
    return dataState.tasks.filter((task) => {
      const matchesProject = filters.projectId === "all" || task.projectId === filters.projectId;
      const matchesStatus = filters.status === "all" || task.status === filters.status;

      const project = dataState.projects.find((item) => item.id === task.projectId);
      const client = dataState.clients.find((item) => item.id === project?.client_id);

      const searchableText = [
        task.title,
        task.description,
        task.category,
        task.priority,
        task.status,
        project?.title,
        project?.service_type,
        client?.full_name,
        client?.organisation,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !filters.search.trim() ||
        searchableText.includes(filters.search.trim().toLowerCase());

      return matchesProject && matchesStatus && matchesSearch;
    });
  }, [dataState.clients, dataState.projects, dataState.tasks, filters]);

  const taskStats = useMemo(() => {
    const total = dataState.tasks.length;
    const done = dataState.tasks.filter((task) => task.status === "done").length;
    const blocked = dataState.tasks.filter((task) => task.status === "blocked").length;
    const inProgress = dataState.tasks.filter((task) => task.status === "in_progress").length;
    const urgent = dataState.tasks.filter((task) => task.priority === "urgent").length;
    const today = startOfDay(new Date());
    const overdue = dataState.tasks.filter((task) => {
      if (!task.dueDate || task.status === "done") return false;
      return startOfDay(new Date(task.dueDate)) < today;
    }).length;

    return {
      total,
      done,
      blocked,
      inProgress,
      urgent,
      overdue,
      completion: total ? Math.round((done / total) * 100) : 0,
    };
  }, [dataState.tasks]);

  async function fetchBoardData() {
    if (!supabase) return;

    try {
      setDataState((current) => ({
        ...current,
        loading: true,
        error: "",
      }));

      const [projectsResponse, clientsResponse, tasksResponse] = await Promise.all([
        supabase
          .from("projects")
          .select(
            "id, client_id, lead_id, title, description, service_type, status, start_date, due_date, completed_at, created_at, updated_at"
          )
          .order("updated_at", { ascending: false }),
        supabase
          .from("clients")
          .select("id, full_name, email, phone, organisation, notes, created_at, updated_at")
          .order("updated_at", { ascending: false }),
        supabase
          .from("settings")
          .select("setting_value")
          .eq("setting_key", taskBoardSettingKey)
          .maybeSingle(),
      ]);

      const firstError = [
        projectsResponse.error,
        clientsResponse.error,
        tasksResponse.error,
      ].find(Boolean);

      if (firstError) throw firstError;

      const projects = projectsResponse.data || [];
      const tasks = normaliseTasks(tasksResponse.data?.setting_value?.tasks);

      setDataState({
        loading: false,
        error: "",
        projects,
        clients: clientsResponse.data || [],
        tasks,
      });

      setTaskForm((current) => ({
        ...current,
        projectId: current.projectId || projects[0]?.id || "",
      }));
    } catch (error) {
      setDataState({
        loading: false,
        error:
          error?.message ||
          "Unable to load project task board. Check Supabase projects, clients and settings permissions.",
        projects: [],
        clients: [],
        tasks: [],
      });
    }
  }

  async function saveTasks(nextTasks, successMessage) {
    if (!supabase) return;

    const cleanTasks = normaliseTasks(nextTasks);

    const { error } = await supabase.from("settings").upsert(
      {
        setting_key: taskBoardSettingKey,
        setting_value: {
          tasks: cleanTasks,
        },
        description: "MKETICS project task board and delivery checklist records.",
      },
      { onConflict: "setting_key" }
    );

    if (error) throw error;

    setDataState((current) => ({
      ...current,
      tasks: cleanTasks,
    }));

    setSaveState({
      loading: false,
      error: "",
      success: successMessage,
    });
  }

  async function handleAddTask(event) {
    event.preventDefault();

    if (!taskForm.projectId) {
      setSaveState({
        loading: false,
        error: "Choose a project before adding a task.",
        success: "",
      });
      return;
    }

    if (!taskForm.title.trim()) {
      setSaveState({
        loading: false,
        error: "Task title is required.",
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

      const newTask = {
        id: createId(),
        projectId: taskForm.projectId,
        title: taskForm.title.trim(),
        description: taskForm.description.trim(),
        status: taskForm.status,
        priority: taskForm.priority,
        category: taskForm.category,
        dueDate: taskForm.dueDate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completedAt: taskForm.status === "done" ? new Date().toISOString() : "",
      };

      await saveTasks([newTask, ...dataState.tasks], "Task added to delivery board.");

      setTaskForm((current) => ({
        ...current,
        title: "",
        description: "",
        status: "todo",
        priority: "normal",
        category: "Development",
        dueDate: "",
      }));
    } catch (error) {
      setSaveState({
        loading: false,
        error:
          error?.message ||
          "Unable to add task. Check Supabase settings permission.",
        success: "",
      });
    }
  }

  async function handleTaskStatusChange(taskId, status) {
    try {
      setSaveState({ loading: true, error: "", success: "" });

      const nextTasks = dataState.tasks.map((task) => {
        if (task.id !== taskId) return task;

        return {
          ...task,
          status,
          updatedAt: new Date().toISOString(),
          completedAt: status === "done" ? task.completedAt || new Date().toISOString() : "",
        };
      });

      await saveTasks(nextTasks, "Task status updated.");
    } catch (error) {
      setSaveState({
        loading: false,
        error: error?.message || "Unable to update task status.",
        success: "",
      });
    }
  }

  async function handleDeleteTask(taskId) {
    try {
      setSaveState({ loading: true, error: "", success: "" });

      const nextTasks = dataState.tasks.filter((task) => task.id !== taskId);

      await saveTasks(nextTasks, "Task removed from delivery board.");
    } catch (error) {
      setSaveState({
        loading: false,
        error: error?.message || "Unable to delete task.",
        success: "",
      });
    }
  }

  async function handleAddChecklistTemplate() {
    if (!taskForm.projectId) {
      setSaveState({
        loading: false,
        error: "Choose a project before adding the delivery checklist.",
        success: "",
      });
      return;
    }

    try {
      setSaveState({ loading: true, error: "", success: "" });

      const createdAt = new Date().toISOString();
      const project = dataState.projects.find((item) => item.id === taskForm.projectId);
      const baseDate = project?.due_date ? new Date(project.due_date) : new Date();

      const templateTasks = deliveryChecklistTemplates.map((item, index) => ({
        id: createId(),
        projectId: taskForm.projectId,
        title: item.title,
        description: item.description,
        status: index === 0 ? "todo" : "backlog",
        priority: item.priority,
        category: item.category,
        dueDate: getTemplateDueDate(baseDate, index),
        createdAt,
        updatedAt: createdAt,
        completedAt: "",
      }));

      await saveTasks(
        [...templateTasks, ...dataState.tasks],
        "Delivery checklist added to this project."
      );
    } catch (error) {
      setSaveState({
        loading: false,
        error: error?.message || "Unable to add delivery checklist.",
        success: "",
      });
    }
  }

  function updateTaskForm(event) {
    const { name, value } = event.target;

    setTaskForm((current) => ({
      ...current,
      [name]: value,
    }));

    clearMessages();
  }

  function updateFilters(event) {
    const { name, value } = event.target;

    setFilters((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function clearMessages() {
    if (saveState.error || saveState.success) {
      setSaveState({ loading: false, error: "", success: "" });
    }
  }

  async function copyBoardSummary() {
    const lines = [
      "MKETICS Project Task Board Summary",
      "",
      `Total tasks: ${taskStats.total}`,
      `Completion: ${taskStats.completion}%`,
      `In progress: ${taskStats.inProgress}`,
      `Blocked: ${taskStats.blocked}`,
      `Overdue: ${taskStats.overdue}`,
      "",
      ...visibleTasks.map((task) => {
        const project = dataState.projects.find((item) => item.id === task.projectId);
        return `- [${toReadableLabel(task.status)}] ${task.title} (${project?.title || "No project"})`;
      }),
    ];

    await navigator.clipboard.writeText(lines.join("\n"));

    setSaveState({
      loading: false,
      error: "",
      success: "Task board summary copied.",
    });
  }

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#0B7CFF]">
            MKETICS Delivery Board
          </p>

          <h2 className="mt-2 text-3xl font-black text-[#020B1F]">
            Project task board & checklist
          </h2>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
            Track project tasks, delivery checklists, blocked work and handover readiness in one admin view.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={copyBoardSummary}
            disabled={visibleTasks.length === 0}
            className="inline-flex items-center justify-center rounded-full border border-[#0B7CFF]/25 bg-[#EAF6FF] px-5 py-3 text-sm font-black text-[#061A33] transition hover:border-cyan-300 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Clipboard size={17} className="mr-2" />
            Copy Summary
          </button>

          <button
            type="button"
            onClick={fetchBoardData}
            disabled={dataState.loading}
            className="inline-flex items-center justify-center rounded-full border border-[#0B7CFF]/25 bg-[#EAF6FF] px-5 py-3 text-sm font-black text-[#061A33] transition hover:border-cyan-300 hover:bg-cyan-300 disabled:opacity-70"
          >
            {dataState.loading ? (
              <Loader2 size={17} className="mr-2 animate-spin" />
            ) : (
              <RefreshCw size={17} className="mr-2" />
            )}
            Refresh
          </button>
        </div>
      </div>

      {dataState.error && <StatusMessage type="error" message={dataState.error} />}
      {saveState.error && <StatusMessage type="error" message={saveState.error} />}
      {saveState.success && <StatusMessage type="success" message={saveState.success} />}

      <div className="mt-6 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Tasks" value={taskStats.total} />
        <StatCard label="Done" value={taskStats.done} />
        <StatCard label="Progress" value={`${taskStats.completion}%`} />
        <StatCard label="In Progress" value={taskStats.inProgress} />
        <StatCard label="Blocked" value={taskStats.blocked} />
        <StatCard label="Overdue" value={taskStats.overdue} />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[0.82fr_1.18fr]">
        <div className="grid gap-5 content-start">
          <form
            onSubmit={handleAddTask}
            className="rounded-[1.5rem] border border-cyan-200 bg-[#F8FCFF] p-5"
          >
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#061A33] text-cyan-300">
              <Plus size={22} />
            </div>

            <h3 className="mt-4 text-xl font-black text-[#020B1F]">
              Add project task
            </h3>

            <p className="mt-2 text-sm leading-7 text-slate-600">
              Add delivery tasks for the selected project and move them through the board as work progresses.
            </p>

            <label className="mt-5 block">
              <span className="text-sm font-black text-[#061A33]">Project</span>
              <select
                name="projectId"
                value={taskForm.projectId}
                onChange={updateTaskForm}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
              >
                <option value="">Choose project</option>
                {dataState.projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.title}
                  </option>
                ))}
              </select>
            </label>

            {selectedProject && (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                <DetailLine label="Selected Project" value={selectedProject.title} />
                <DetailLine label="Project Status" value={toReadableLabel(selectedProject.status)} />
                <DetailLine label="Due Date" value={formatDate(selectedProject.due_date)} />
              </div>
            )}

            <label className="mt-4 block">
              <span className="text-sm font-black text-[#061A33]">Task Title</span>
              <input
                name="title"
                value={taskForm.title}
                onChange={updateTaskForm}
                placeholder="Example: Collect client logo and website content"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
              />
            </label>

            <label className="mt-4 block">
              <span className="text-sm font-black text-[#061A33]">Description</span>
              <textarea
                name="description"
                value={taskForm.description}
                onChange={updateTaskForm}
                rows={5}
                placeholder="Add delivery notes, access needs, client expectations or handover details."
                className="mt-2 w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold leading-7 outline-none transition placeholder:text-slate-400 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
              />
            </label>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-black text-[#061A33]">Status</span>
                <select
                  name="status"
                  value={taskForm.status}
                  onChange={updateTaskForm}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
                >
                  {taskStatuses.map((status) => (
                    <option key={status.id} value={status.id}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-black text-[#061A33]">Priority</span>
                <select
                  name="priority"
                  value={taskForm.priority}
                  onChange={updateTaskForm}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
                >
                  {priorityOptions.map((priority) => (
                    <option key={priority} value={priority}>
                      {toReadableLabel(priority)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-black text-[#061A33]">Category</span>
                <select
                  name="category"
                  value={taskForm.category}
                  onChange={updateTaskForm}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
                >
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-black text-[#061A33]">Due Date</span>
                <input
                  name="dueDate"
                  value={taskForm.dueDate}
                  onChange={updateTaskForm}
                  type="date"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
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
                  Saving
                </>
              ) : (
                <>
                  <Save size={18} className="mr-2" />
                  Add Task
                </>
              )}
            </button>
          </form>

          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#061A33] text-cyan-300">
              <ClipboardList size={22} />
            </div>

            <h3 className="mt-4 text-xl font-black text-[#020B1F]">
              Delivery checklist template
            </h3>

            <p className="mt-2 text-sm leading-7 text-slate-600">
              Add the standard MKETICS delivery checklist to the selected project.
            </p>

            <div className="mt-4 grid gap-2">
              {deliveryChecklistTemplates.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-slate-200 bg-[#F8FCFF] p-3"
                >
                  <p className="text-sm font-black text-[#061A33]">{item.title}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#0B7CFF]">
                    {item.category} • {toReadableLabel(item.priority)}
                  </p>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddChecklistTemplate}
              disabled={saveState.loading || !taskForm.projectId}
              className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-[#061A33] px-6 py-3 font-black text-white transition hover:bg-[#0B7CFF] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <CalendarCheck size={18} className="mr-2" />
              Add Delivery Checklist
            </button>
          </div>
        </div>

        <div className="grid gap-5 content-start">
          <div className="rounded-[1.5rem] border border-slate-200 bg-[#F8FCFF] p-5">
            <div className="grid gap-3 lg:grid-cols-[1fr_220px_220px]">
              <label className="relative block">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  name="search"
                  value={filters.search}
                  onChange={updateFilters}
                  placeholder="Search tasks, projects, clients..."
                  className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm font-semibold outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
                />
              </label>

              <select
                name="projectId"
                value={filters.projectId}
                onChange={updateFilters}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
              >
                <option value="all">All projects</option>
                {dataState.projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.title}
                  </option>
                ))}
              </select>

              <select
                name="status"
                value={filters.status}
                onChange={updateFilters}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
              >
                <option value="all">All statuses</option>
                {taskStatuses.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            {taskStatuses.map((status) => (
              <TaskColumn
                key={status.id}
                status={status}
                tasks={visibleTasks.filter((task) => task.status === status.id)}
                projects={dataState.projects}
                clients={dataState.clients}
                onStatusChange={handleTaskStatusChange}
                onDelete={handleDeleteTask}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TaskColumn({ status, tasks, projects, clients, onStatusChange, onDelete }) {
  return (
    <article className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-black uppercase tracking-[0.18em] text-[#061A33]">
          {status.label}
        </h3>
        <span className="rounded-full bg-[#EAF6FF] px-3 py-1 text-xs font-black text-[#0B7CFF]">
          {tasks.length}
        </span>
      </div>

      <div className="mt-4 grid gap-3">
        {tasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-[#F8FCFF] p-4">
            <p className="text-sm font-bold text-slate-500">No tasks here.</p>
          </div>
        ) : (
          tasks.map((task) => {
            const project = projects.find((item) => item.id === task.projectId);
            const client = clients.find((item) => item.id === project?.client_id);

            return (
              <div
                key={task.id}
                className="rounded-2xl border border-slate-200 bg-[#F8FCFF] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-black leading-6 text-[#020B1F]">
                      {task.title}
                    </p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#0B7CFF]">
                      {task.category || "Delivery"} • {toReadableLabel(task.priority)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDelete(task.id)}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-red-100 bg-red-50 text-red-700 transition hover:bg-red-100"
                    aria-label="Delete task"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                {task.description && (
                  <p className="mt-3 whitespace-pre-wrap text-sm font-semibold leading-7 text-slate-700">
                    {task.description}
                  </p>
                )}

                <div className="mt-4 grid gap-2 text-xs font-semibold text-slate-600">
                  <span className="inline-flex items-center gap-2">
                    <ShieldCheck size={14} />
                    {project?.title || "Project not found"}
                  </span>
                  {client && (
                    <span className="inline-flex items-center gap-2">
                      <ClipboardList size={14} />
                      {client.full_name || client.organisation}
                    </span>
                  )}
                  {task.dueDate && (
                    <span className="inline-flex items-center gap-2">
                      <Clock size={14} />
                      Due {formatDate(task.dueDate)}
                    </span>
                  )}
                </div>

                <label className="mt-4 block">
                  <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                    Move Task
                  </span>
                  <select
                    value={task.status}
                    onChange={(event) => onStatusChange(task.id, event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-black outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
                  >
                    {taskStatuses.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            );
          })
        )}
      </div>
    </article>
  );
}

function StatCard({ label, value }) {
  return (
    <article className="rounded-[1.5rem] border border-slate-200 bg-[#F8FCFF] p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-[#0B7CFF]">
        {label}
      </p>
      <p className="mt-3 text-3xl font-black text-[#020B1F]">{value}</p>
    </article>
  );
}

function DetailLine({ label, value }) {
  if (!value) return null;

  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0B7CFF]">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold leading-6 text-slate-700">
        {value}
      </p>
    </div>
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

function normaliseTasks(value) {
  if (!Array.isArray(value)) return [];

  return value
    .filter((task) => task && typeof task === "object")
    .map((task) => ({
      id: task.id || createId(),
      projectId: task.projectId || task.project_id || "",
      title: String(task.title || "Untitled Task"),
      description: String(task.description || ""),
      status: taskStatuses.some((status) => status.id === task.status) ? task.status : "todo",
      priority: priorityOptions.includes(task.priority) ? task.priority : "normal",
      category: task.category || "Development",
      dueDate: task.dueDate || task.due_date || "",
      createdAt: task.createdAt || task.created_at || new Date().toISOString(),
      updatedAt: task.updatedAt || task.updated_at || new Date().toISOString(),
      completedAt: task.completedAt || task.completed_at || "",
    }));
}

function getTemplateDueDate(baseDate, index) {
  const date = new Date(baseDate);

  if (Number.isNaN(date.getTime())) {
    date.setDate(new Date().getDate() + index + 1);
  } else {
    date.setDate(date.getDate() - Math.max(0, deliveryChecklistTemplates.length - index - 1));
  }

  return date.toISOString().slice(0, 10);
}

function startOfDay(date) {
  const nextDate = new Date(date);
  nextDate.setHours(0, 0, 0, 0);
  return nextDate;
}

function createId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function formatDate(value) {
  if (!value) return "Not set";

  return new Intl.DateTimeFormat("en-ZA", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(value));
}

function toReadableLabel(value) {
  if (!value) return "Not provided";

  return String(value)
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
