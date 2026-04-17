import { Heart, ShoppingCart } from "lucide-react";

function ItemCard({ item }) {
  return (
    <div className="group overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
      <div className="relative h-56 overflow-hidden bg-slate-100">
        <img
          src={item.image}
          alt={item.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />

        <button className="absolute right-4 top-4 rounded-full bg-white/90 p-2 text-slate-700 shadow-sm backdrop-blur">
          <Heart className="h-4 w-4" />
        </button>

        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
          {item.condition}
        </span>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-orange-500">
              {item.category}
            </p>
            <h3 className="mt-1 text-lg font-semibold text-slate-900">{item.name}</h3>
          </div>
          <p className="text-lg font-bold text-slate-900">${item.price}</p>
        </div>

        <button className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800">
          <ShoppingCart className="h-4 w-4" />
          View Item
        </button>
      </div>
    </div>
  );
}

export default ItemCard;