import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const STATUS_OPTIONS = [
  "Pending",
  "Planning",
  "In Progress",
  "Review",
  "Completed",
  "Closed",
];

export default function AdminProjectTable() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) {
      setProjects(data || []);
    }

    setLoading(false);
  };

  const updateProject = async (id, field, value) => {
    setProjects((prev) =>
      prev.map((project) =>
        project.id === id ? { ...project, [field]: value } : project
      )
    );

    const { error } = await supabase
      .from("projects")
      .update({ [field]: value })
      .eq("id", id);

    if (error) {
      alert("Project update failed. Check Supabase RLS policy.");
      fetchProjects();
    }
  };

  const createProject = async () => {
    const { error } = await supabase.from("projects").insert([
      {
        client_email: "client@example.com",
        project_name: "New MKETICS Project",
        service: "Website Development",
        status: "Pending",
        progress: 0,
        description: "Project description goes here.",
      },
    ]);

    if (error) {
      alert("Could not create project. Check Supabase policy.");
      return;
    }

    fetchProjects();
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.045] p-4 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-black">Project Management</h2>
          <p className="mt-1 text-sm text-slate-400">
            Create and update client projects shown in the client portal.
          </p>
        </div>

        <button
          onClick={createProject}
          className="rounded-full bg-sky-500 px-5 py-3 text-sm font-black text-white hover:bg-sky-400"
        >
          Create Project
        </button>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[1100px] border-separate border-spacing-y-3 text-left text-sm">
          <thead className="text-xs uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-4 py-2">Client Email</th>
              <th className="px-4 py-2">Project</th>
              <th className="px-4 py-2">Service</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Progress</th>
              <th className="px-4 py-2">Description</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="6"
                  className="rounded-2xl bg-white/[0.035] p-8 text-center text-slate-400"
                >
                  Loading projects...
                </td>
              </tr>
            ) : projects.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="rounded-2xl bg-white/[0.035] p-8 text-center text-slate-400"
                >
                  No projects found.
                </td>
              </tr>
            ) : (
              projects.map((project) => (
                <tr key={project.id} className="bg-white/[0.035]">
                  <td className="rounded-l-3xl px-4 py-4">
                    <input
                      value={project.client_email || ""}
                      onChange={(e) =>
                        updateProject(project.id, "client_email", e.target.value)
                      }
                      className="w-64 rounded-xl bg-slate-900 px-3 py-2 text-white outline-none"
                    />
                  </td>

                  <td className="px-4 py-4">
                    <input
                      value={project.project_name || ""}
                      onChange={(e) =>
                        updateProject(project.id, "project_name", e.target.value)
                      }
                      className="w-60 rounded-xl bg-slate-900 px-3 py-2 text-white outline-none"
                    />
                  </td>

                  <td className="px-4 py-4">
                    <input
                      value={project.service || ""}
                      onChange={(e) =>
                        updateProject(project.id, "service", e.target.value)
                      }
                      className="w-56 rounded-xl bg-slate-900 px-3 py-2 text-white outline-none"
                    />
                  </td>

                  <td className="px-4 py-4">
                    <select
                      value={project.status || "Pending"}
                      onChange={(e) =>
                        updateProject(project.id, "status", e.target.value)
                      }
                      className="rounded-xl bg-slate-900 px-3 py-2 text-white outline-none"
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status}>{status}</option>
                      ))}
                    </select>
                  </td>

                  <td className="px-4 py-4">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={project.progress || 0}
                      onChange={(e) =>
                        updateProject(
                          project.id,
                          "progress",
                          Number(e.target.value)
                        )
                      }
                      className="w-24 rounded-xl bg-slate-900 px-3 py-2 text-white outline-none"
                    />
                  </td>

                  <td className="rounded-r-3xl px-4 py-4">
                    <textarea
                      value={project.description || ""}
                      onChange={(e) =>
                        updateProject(project.id, "description", e.target.value)
                      }
                      className="min-h-20 w-80 rounded-xl bg-slate-900 px-3 py-2 text-white outline-none"
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}