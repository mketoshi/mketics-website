export default function DashboardStatCard({
  icon: Icon,
  title,
  value,
}) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-6">
      <Icon className="h-8 w-8 text-sky-300" />

      <p className="mt-4 text-sm text-slate-400">
        {title}
      </p>

      <h2 className="mt-1 text-xl font-black">
        {value}
      </h2>
    </div>
  );
}