import Link from "next/link";
import { Castle, Gem, Heart, Rocket, ShieldQuestion, Shapes, Zap } from "lucide-react";
import { categories } from "@/lib/constants";

const icons = [Rocket, Heart, ShieldQuestion, Gem, Zap, Castle];
const accents = [
  "bg-amber-50 text-amber-700", "bg-rose-50 text-rose-600", "bg-indigo-50 text-indigo-600",
  "bg-cyan-50 text-cyan-700", "bg-orange-50 text-orange-600", "bg-violet-50 text-violet-600",
];

export function Categories() {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#eee8ff] text-primary"><Shapes size={17} /></span>
        <div>
          <h2 className="text-base font-extrabold text-text">Browse by mood</h2>
          <p className="text-xs text-textMuted">Find the right story for this moment</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {categories.map((category, index) => {
          const Icon = icons[index];
          return (
            <Link href={`/explore/${category.toLowerCase()}`} key={category} className="group flex min-h-16 items-center gap-3 rounded-2xl border border-[#ebe7ef] bg-white px-3.5 py-3 shadow-[0_8px_22px_rgba(28,20,55,.05)] transition hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-[0_12px_28px_rgba(77,52,150,.1)]">
              <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${accents[index]}`}><Icon size={18} /></span>
              <span className="text-sm font-bold text-text transition group-hover:text-primary">{category}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
