import { Link } from "react-router-dom";
import { legalNav, mainNav, siteConfig } from "../../data/site";
import Button from "../ui/Button";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#020B1F]">
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-12 lg:grid-cols-[1.4fr_1fr_1fr] lg:py-14">
        <div>
          <p className="text-2xl font-black text-white">{siteConfig.name}</p>

          <p className="mt-2 max-w-xl text-sm leading-7 text-slate-300">
            {siteConfig.meaning}. Purpose-driven technology built with
            innovation, Ubuntu and long-term value.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button to="/contact">Request a Quote</Button>

            <Button href={siteConfig.whatsapp} variant="secondary">
              WhatsApp MKETICS
            </Button>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-300">
            Navigation
          </h3>

          <div className="mt-5 grid gap-3">
            {mainNav.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="text-sm text-slate-300 transition hover:text-cyan-300"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-300">
            Legal
          </h3>

          <div className="mt-5 grid gap-3">
            {legalNav.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="text-sm text-slate-300 transition hover:text-cyan-300"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="border-t border-white/10 px-5 py-5">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 text-xs leading-6 text-slate-400 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {siteConfig.legalName}. All rights
            reserved.
          </p>

          <p>
            Reg No. {siteConfig.registrationNumber} | Enterprise No.{" "}
            {siteConfig.enterpriseNumber}
          </p>
        </div>
      </div>
    </footer>
  );
}