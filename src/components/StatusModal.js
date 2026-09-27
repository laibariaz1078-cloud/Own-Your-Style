"use client";

export default function StatusModal({
  isOpen,
  type = "error", // "success" | "error"
  title,
  message,
  confirmLabel = "OK",
  onConfirm,
  onClose,
}) {
  if (!isOpen) return null;

  const isSuccess = type === "success";
  const accent = isSuccess ? "#22A55A" : "#DB4444";
  const accentSoft = isSuccess ? "#EAF9EF" : "#FDECEC";

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-lg bg-white p-6 text-center shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-full"
          style={{ backgroundColor: accentSoft }}
        >
          {isSuccess ? (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 13l4 4L19 7"
                stroke={accent}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 8v5m0 3.5h.01M12 3l9 16H3L12 3z"
                stroke={accent}
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>

        <h3 className="mt-4 font-inter text-lg font-medium text-black">
          {title || (isSuccess ? "Success" : "Something went wrong")}
        </h3>

        {message && (
          <p className="mt-2 font-poppins text-sm leading-relaxed text-black/60">
            {message}
          </p>
        )}

        <button
          type="button"
          onClick={onConfirm || onClose}
          className="mt-6 h-[48px] w-full rounded font-poppins text-[15px] font-medium text-white transition-colors"
          style={{ backgroundColor: accent }}
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  );
}