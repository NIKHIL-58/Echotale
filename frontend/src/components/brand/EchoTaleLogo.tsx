import { cn } from "@/lib/utils";
export function EchoTaleLogo({ compact = false, inverse = false, className }: { compact?: boolean; inverse?: boolean; className?: string }) {
  return <span className={cn("inline-flex items-center gap-3", className)}>
    <img src="/echotale-mark.svg" alt={compact ? "EchoTale" : ""} width={40} height={40} className="h-10 w-10 shrink-0 rounded-xl" />
    {!compact && <span><span className={cn("block text-xl font-bold tracking-[-.04em]", inverse ? "text-white" : "text-textMain")}>EchoTale</span><span className={cn("block text-[10px] font-medium tracking-[.12em]", inverse ? "text-white/55" : "text-textMuted")}>STORIES THAT STAY</span></span>}
  </span>;
}
