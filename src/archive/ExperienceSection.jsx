import { motion } from "framer-motion";
import { BriefcaseBusiness } from "lucide-react";

export default function ExperienceSection({
  experienceHighlights,
}) {
  return (
    <section
      id="experience"
      className="relative mx-auto w-full max-w-[1600px] overflow-hidden px-4 py-10 sm:px-6 sm:py-20 lg:px-8 lg:py-24"
    >
      <img
        src="/images/logo-icon.png"
        alt=""
        className="logo-watermark absolute right-[-80px] top-10 w-[280px]"
      />

      <div className="mb-7 max-w-3xl sm:mb-12">
        <p className="font-bold uppercase tracking-[0.3em] text-sky-300">
          Experience Highlights
        </p>

        <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl md:text-5xl">
          Enterprise background clients can trust.
        </h2>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {experienceHighlights.map((item) => (
          <motion.div
            whileHover={{ y: -6 }}
            key={item.role}
            className="glass-card rounded-3xl p-5 sm:p-6"
          >
            <img
              src="/images/logo-icon.png"
              alt="MKETICS"
              className="logo-glow mb-5 h-12 w-12 object-contain"
            />

            <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-white/10">
              <BriefcaseBusiness className="h-7 w-7 text-sky-300" />
            </div>

            <h3 className="text-xl font-black">
              {item.role}
            </h3>

            <p className="mt-1 text-sm font-bold text-sky-300">
              {item.place}
            </p>

            <p className="mt-4 text-sm leading-7 text-slate-300">
              {item.detail}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}