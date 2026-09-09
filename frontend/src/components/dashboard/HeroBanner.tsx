import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
export function HeroBanner() {
 return <section className="relative grid overflow-hidden rounded-[24px] bg-[#201a30] text-white md:grid-cols-[1.05fr_1fr]">
  <div className="relative z-10 flex flex-col justify-center p-6 sm:p-8 xl:p-10">
   <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[.12em] text-[#dec4f0]"><BookOpen size={15}/>A little escape, every day</p>
   <h2 className="mt-5 max-w-sm text-[30px] font-semibold leading-[1.15] tracking-[-.035em] sm:text-[38px]">Big worlds.<br/><span className="text-[#f3d59b]">Just press play.</span></h2>
   <p className="mt-4 max-w-sm text-sm leading-6 text-[#c7bed4]">Turn a quiet moment into your next great adventure. Discover stories to read, hear, and keep.</p>
   <Link href="/explore" className="mt-6 inline-flex min-h-11 w-fit items-center gap-3 rounded-xl bg-[#f3d59b] px-5 py-2.5 text-sm font-semibold text-[#302236] transition hover:bg-[#ffe5b6]">Explore stories<ArrowRight size={17}/></Link>
  </div>
  <div className="relative h-52 md:h-full md:min-h-[330px]"><Image src="/images/listening-world.png" alt="An open book unfolds into a moonlit library and a winding path." fill priority sizes="(max-width: 767px) 100vw, 50vw" className="object-cover"/><div className="absolute inset-0 bg-gradient-to-t from-[#201a30]/20 to-transparent md:bg-gradient-to-r md:from-[#201a30] md:via-transparent" /></div>
 </section>;
}
