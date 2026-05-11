export default function CTASection() {
  return (
    <section className="rounded-[2rem] border border-sky-500/20 bg-gradient-to-r from-sky-500/10 to-blue-500/10 p-10 text-center">
      <h2 className="text-4xl font-black">
        Ready to build with MKETICS?
      </h2>

      <p className="mx-auto mt-4 max-w-2xl text-slate-300">
        Professional websites, networking, cloud systems,
        automation and software engineering solutions.
      </p>

      <a
        href="#quote"
        className="mt-8 inline-flex rounded-full bg-sky-500 px-8 py-4 text-sm font-black text-white transition hover:bg-sky-400"
      >
        Request Quote
      </a>
    </section>
  );
}