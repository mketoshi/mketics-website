import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { mainNav, siteConfig } from "../../data/site";
import Button from "../ui/Button";

export default function Header() {
  const [open, setOpen] = useState(false);

  const navClass = ({ isActive }) =>
    `text-sm font-medium transition ${
      isActive ? "text-cyan-300" : "text-slate-200 hover:text-cyan-300"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#020B1F]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl border border-cyan-300/30 bg-cyan-400/10 text-lg font-black text-cyan-200 shadow-[0_0_35px_rgba(25,217,255,0.22)]">
            M
          </div>

          <div>
            <p className="text-lg font-black tracking-wide text-white">
              {siteConfig.name}
            </p>
            <p className="hidden text-xs text-slate-400 sm:block">
              {siteConfig.tagline}
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {mainNav.map((item) => (
            <NavLink key={item.href} to={item.href} className={navClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:block">
          <Button to="/contact">Request a Quote</Button>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="rounded-xl border border-white/10 p-2 text-white lg:hidden"
          aria-label="Toggle navigation menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-[#020B1F] px-5 py-5 lg:hidden">
          <nav className="flex flex-col gap-4">
            {mainNav.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={() => setOpen(false)}
                className={navClass}
              >
                {item.label}
              </NavLink>
            ))}
            <Button to="/contact" className="mt-2">
              Request a Quote
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}