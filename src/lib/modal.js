export function showModal(options) {
  if (typeof window === "undefined") return Promise.resolve(null);

  return new Promise((resolve) => {
    window.dispatchEvent(new CustomEvent("app:modal", { detail: { ...options, resolve } }));
  });
}