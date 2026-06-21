import { Link } from "react-router-dom";

export default function Button({
  children,
  to,
  href,
  variant = "primary",
  className = "",
}) {
  const base =
    "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-slate-950";

  const styles = {
    primary:
      "bg-gradient-to-r from-[#0B7CFF] to-[#00AEEF] text-white shadow-[0_0_30px_rgba(0,174,239,0.28)] hover:scale-[1.02]",
    secondary:
      "border border-cyan-300/40 bg-white/5 text-white hover:bg-white/10",
    light:
      "bg-white text-[#061A33] hover:bg-[#EAF6FF]",
  };

  const classes = `${base} ${styles[variant]} ${className}`;

  if (to) {
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} className={classes}>
      {children}
    </a>
  );
}