import ServiceCard from "./ServiceCard";

export default function ServicesSection() {
  return (
    <section
      id="services"
      className="relative mx-auto w-full max-w-[1600px] overflow-hidden px-4 py-10 sm:px-6 sm:py-20 lg:px-8 lg:py-24"
    >
      <img
        src="/images/logo-icon.png"
        alt=""
        className="logo-watermark absolute right-[-100px] top-10 w-[320px]"
      />

      <div className="mb-7 max-w-3xl sm:mb-12">
        <p className="font-bold uppercase tracking-[0.3em] text-sky-300">
          Services
        </p>

        <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl md:text-5xl">
          Complete IT solutions for homes, businesses, and growing companies.
        </h2>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <ServiceCard
          title="WiFi & Network Installation"
          description="Reliable home and business WiFi, routers, switches, structured cabling, and point-to-point links."
          image="/images/logo-icon.png"
          icon={<span className="text-3xl">📶</span>}
        />

        <ServiceCard
          title="CCTV & Security Systems"
          description="Camera installations, remote viewing, monitoring-ready setups, and maintenance."
          image="/images/logo-icon.png"
          icon={<span className="text-3xl">📷</span>}
        />

        <ServiceCard
          title="Web & App Development"
          description="Modern websites, dashboards, portals, quote systems, and business automation."
          image="/images/logo-icon.png"
          icon={<span className="text-3xl">💻</span>}
        />

        <ServiceCard
          title="Cloud, Hosting & IT Support"
          description="Cloud storage, backups, hosting, technical support, migrations, and monitoring."
          image="/images/logo-icon.png"
          icon={<span className="text-3xl">☁️</span>}
        />
      </div>
    </section>
  );
}