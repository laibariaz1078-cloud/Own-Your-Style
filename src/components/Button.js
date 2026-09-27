const variantStyles = {
  primary: "bg-brand text-black hover:bg-brand-dark",
  outline: "border border-black text-black hover:bg-black hover:text-black",
  dark: "bg-black text-white hover:bg-ink-soft",
};

export default function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}) {
  return (
    <button
      className={`rounded px-8 py-3 text-sm font-medium transition-colors ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}