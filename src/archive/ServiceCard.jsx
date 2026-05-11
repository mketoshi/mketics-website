export default function ServiceCard({
  title,
  description,
  icon,
  image,
}) {
  return (
    <div className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 transition duration-500 hover:-translate-y-2 hover:border-sky-400/40 hover:bg-sky-500/[0.08]">
      {/* Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.15),transparent_60%)] opacity-0 transition duration-500 group-hover:opacity-100" />

      {/* Logo */}
      <img
        src={image || "/images/logo-icon.png"}
        alt="MKETICS"
        className="mb-6 h-14 w-14 rounded-2xl border border-sky-400/20 object-cover shadow-[0_0_25px_rgba(14,165,233,0.35)]"
      />

      {/* Icon */}
      <div className="mb-6 inline-flex rounded-2xl bg-slate-800 p-4 text-sky-300">
        {icon}
      </div>

      {/* Title */}
      <h3 className="text-2xl font-black text-white">
        {title}
      </h3>

      {/* Description */}
      <p className="mt-4 leading-8 text-slate-300">
        {description}
      </p>

      {/* Button */}
      <a
        href="/#quote"
        className="mt-8 inline-flex items-center gap-2 text-sm font-black text-sky-300 transition hover:text-white"
      >
        Request this service →
      </a>
    </div>
  );
}