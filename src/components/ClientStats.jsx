import { Users, FolderKanban, FileText } from "lucide-react";

export default function ClientStats() {
  const stats = [
    {
      label: "Clients",
      value: "120+",
      icon: Users,
    },
    {
      label: "Projects",
      value: "85+",
      icon: FolderKanban,
    },
    {
      label: "Invoices",
      value: "240+",
      icon: FileText,
    },
  ];

  return (
    <section className="grid gap-6 md:grid-cols-3">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.label}
            className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-sky-500/10 p-4">
                <Icon className="h-7 w-7 text-sky-300" />
              </div>

              <div>
                <h3 className="text-3xl font-black">
                  {stat.value}
                </h3>

                <p className="text-slate-400">
                  {stat.label}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}