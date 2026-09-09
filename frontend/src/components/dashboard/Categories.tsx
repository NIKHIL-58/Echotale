import Link from "next/link";
import { Castle, Gem, Heart, Rocket, ShieldQuestion, Zap } from "lucide-react";
import { categories } from "@/lib/constants";
const icons = [Rocket, Heart, ShieldQuestion, Gem, Zap, Castle];
export function Categories() {
 return <section><div className="mb-4"><h2 className="section-title">A story for every mood</h2><p className="mt-1 text-sm text-textMuted">Explore by genre.</p></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">{categories.map((category,i) => {const Icon=icons[i]; return <Link href={`/explore/${category.toLowerCase()}`} key={category} className="group flex min-h-20 flex-col justify-center gap-2 rounded-xl border border-borderSoft bg-white px-4 py-3 transition hover:border-primary/30 hover:bg-soft"><Icon size={20} strokeWidth={1.6} className="text-primary"/><span className="text-sm font-semibold">{category}</span></Link>;})}</div></section>;
}
