export default function ProgressBar({ progress = 0 }) {
  return (
    <div className="mt-6">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-slate-400">
          Progress
        </span>

        <span className="font-bold text-sky-300">
          {progress}%
        </span>
      </div>

      <div className="h-4 overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-sky-500 to-blue-500"
          style={{
            width: `${progress}%`,
          }}
        />
      </div>
    </div>
  );
}