export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020617]">
      <div className="text-center">
        <img
          src="/images/logo-icon.png"
          alt="MKETICS"
          className="mx-auto h-28 w-28 animate-pulse object-contain"
        />

        <h2 className="mt-6 text-3xl font-black text-white">
          MKETICS
        </h2>

        <p className="mt-2 text-sky-300">
          Loading business system...
        </p>
      </div>
    </div>
  );
}