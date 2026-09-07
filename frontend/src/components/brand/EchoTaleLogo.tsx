import { cn } from "@/lib/utils";

export function EchoTaleLogo({ compact = false, inverse = false, className }: { compact?: boolean; inverse?: boolean; className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-[14px] bg-[#181331] shadow-[0_10px_24px_rgba(8,5,27,.22)] ring-1 ring-white/10">
        <svg viewBox="0 0 44 44" className="h-7 w-7" aria-hidden="true">
          <path d="M8.5 11.5c5.2-1.1 9.7.1 13.5 3.6v18c-3.8-3.5-8.3-4.7-13.5-3.6v-18Z" fill="none" stroke="#F1C96B" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M35.5 11.5c-5.2-1.1-9.7.1-13.5 3.6v18c3.8-3.5 8.3-4.7 13.5-3.6v-18Z" fill="none" stroke="#F1C96B" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M13 23v-3m4 5v-7m10 7v-7m4 5v-3" stroke="#A98AF5" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#a98af5] shadow-[0_0_10px_#a98af5]" />
      </span>
      {!compact && <span><span className={cn("block text-[20px] font-extrabold tracking-[-.045em]", inverse ? "text-white" : "text-[#17132a]")}>EchoTale</span><span className={cn("block text-[9px] font-bold tracking-[.12em]", inverse ? "text-white/45" : "text-[#777181]")}>STORIES THAT STAY</span></span>}
    </div>
  );
}