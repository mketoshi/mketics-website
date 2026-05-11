import ProgressBar from "./ProgressBar";

export default function ProjectCard({ project }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="text-2xl font-black">
            {project.project_name}
          </h3>

          <p className="mt-2 text-sm text-sky-300">
            {project.service}
          </p>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
            {project.description}
          </p>
        </div>

        <div className="rounded-full bg-sky-500/10 px-4 py-2 text-sm font-bold text-sky-200">
          {project.status}
        </div>
      </div>

      <ProgressBar progress={project.progress} />
    </div>
  );
}