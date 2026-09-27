"use client";

const money = (value) => `$${Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

export default function VendorSupplyChart({ products = [] }) {
  const stock = products.reduce((total, product) => total + Number(product.stock || 0), 0);
  const paid = products.reduce((total, product) => total + Number(product.paid || 0), 0);
  const due = products.reduce((total, product) => total + Number(product.due || 0), 0);
  const maxValue = Math.max(stock, paid, due, 1);
  const values = [
    { label: "Stock units", value: stock, color: "bg-amber-400", display: stock.toLocaleString() },
    { label: "Paid", value: paid, color: "bg-emerald-500", display: money(paid) },
    { label: "Remaining", value: due, color: "bg-rose-500", display: money(due) },
  ];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-slate-900">Supply and payment overview</h2>
        <p className="text-sm text-slate-500">A quick comparison of your supplied stock and payment balance.</p>
      </div>
      {products.length === 0 ? (
        <div className="flex h-44 items-center justify-center text-sm text-slate-400">No supply data yet.</div>
      ) : (
        <div className="space-y-5">
          {values.map((item) => (
            <div key={item.label}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-600">{item.label}</span>
                <span className="font-bold text-slate-900">{item.display}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div className={`h-full rounded-full ${item.color}`} style={{ width: `${Math.max(item.value ? 8 : 0, Math.round((item.value / maxValue) * 100))}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
