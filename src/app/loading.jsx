export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fffaf7] px-4">
      <div className="flex flex-col items-center gap-5 rounded-[28px] border border-[#DB4444]/15 bg-white/80 px-8 py-10 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm">
        <div className="relative flex h-20 w-20 items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-full border-4 border-[#DB4444]/20" />
          <div className="absolute inset-2 animate-spin rounded-full border-4 border-[#DB4444] border-t-transparent" />
          <div className="absolute inset-5 rounded-full bg-[#DB4444]/10" />
        </div>

        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#DB4444]">
            Loading
          </p>
          <p className="mt-2 text-sm font-medium text-slate-600">
            Preparing your shopping experience...
          </p>
        </div>
      </div>
    </div>
  );
}
