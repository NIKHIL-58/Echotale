"use client";

import { useEffect, useState } from "react";
import { BookOpenText, ChevronDown, ChevronUp, Lightbulb, ListChecks, Loader2, MessageCircleQuestion, RefreshCw, Sparkles } from "lucide-react";
import { getStoryInsights, type StoryInsights as InsightData } from "@/services/storyService";

export function StoryInsights({ storyId }: { storyId: string }) {
  const [data, setData] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(true);
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function load(regenerate = false) {
    try {
      setLoading(true);
      setError("");
      setData(await getStoryInsights(storyId, regenerate));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load story insights.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [storyId]);

  return (
    <section className="overflow-hidden rounded-[30px] border border-[#e6dcae] bg-[#17122e] text-white shadow-[0_24px_60px_rgba(31,20,76,.18)]">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-6 py-5 sm:px-8">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#e7c478] text-[#241a09]"><Sparkles size={21}/></span>
          <div><h2 className="text-xl font-extrabold">Story insights</h2><p className="text-xs text-white/55">Summary, important points, themes, and reading questions</p></div>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={()=>load(true)} disabled={loading} title="Regenerate insights" className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-white/70 transition hover:bg-white/15 hover:text-white disabled:opacity-50"><RefreshCw size={17} className={loading?"animate-spin":""}/></button>
          <button type="button" onClick={()=>setExpanded(value=>!value)} className="inline-flex h-10 items-center gap-2 rounded-xl bg-white/10 px-4 text-xs font-bold">{expanded?"Show less":"Show insights"}{expanded?<ChevronUp size={16}/>:<ChevronDown size={16}/>}</button>
        </div>
      </header>

      {expanded && <div className="p-6 sm:p-8">
        {loading && !data && <div className="flex min-h-40 items-center justify-center gap-3 text-white/65"><Loader2 className="animate-spin text-[#e7c478]"/><span className="font-semibold">Preparing your reading guide...</span></div>}
        {error && !data && <div className="rounded-2xl border border-red-300/20 bg-red-400/10 p-5 text-sm text-red-100">{error}<button onClick={()=>load()} className="ml-3 font-bold underline">Try again</button></div>}
        {data && <div className="grid gap-7 xl:grid-cols-[1.15fr_.85fr]">
          <div className="space-y-6">
            <article className="rounded-[24px] bg-white/[.07] p-5 sm:p-6">
              <div className="flex items-center gap-2 text-[#e7c478]"><BookOpenText size={19}/><h3 className="font-extrabold uppercase tracking-[.12em] text-xs">Plot summary</h3></div>
              <div className="mt-4 space-y-4 text-[15px] leading-7 text-white/78">{data.summary.split(/\n\s*\n/).filter(Boolean).map((paragraph,index)=><p key={index}>{paragraph}</p>)}</div>
            </article>
            <article className="rounded-[24px] bg-white p-5 text-[#1c1729] sm:p-6">
              <div className="flex items-center gap-2 text-primary"><ListChecks size={19}/><h3 className="font-extrabold">Key points</h3></div>
              <ul className="mt-4 space-y-3">{data.key_points.map((point,index)=><li key={index} className="flex gap-3 text-sm leading-6 text-[#625d6c]"><span className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-soft text-[10px] font-black text-primary">{index+1}</span><span>{point}</span></li>)}</ul>
            </article>
          </div>
          <div className="space-y-6">
            <article className="rounded-[24px] border border-[#e7c478]/20 bg-[#241b45] p-5 sm:p-6">
              <div className="flex items-center gap-2 text-[#e7c478]"><Lightbulb size={19}/><h3 className="font-extrabold">Themes to notice</h3></div>
              <div className="mt-4 flex flex-wrap gap-2">{data.themes.map(theme=><span key={theme} className="rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs font-bold text-white/75">{theme}</span>)}</div>
            </article>
            <article className="rounded-[24px] bg-[#f8f5ff] p-5 text-[#1c1729] sm:p-6">
              <div className="flex items-center gap-2 text-primary"><MessageCircleQuestion size={19}/><h3 className="font-extrabold">Suggested questions</h3></div>
              <p className="mt-1 text-xs text-textMuted">Select a question to reveal a quick answer.</p>
              <div className="mt-4 space-y-2">{data.questions.map((item,index)=><div key={index} className="overflow-hidden rounded-2xl border border-[#e8e2f1] bg-white"><button type="button" onClick={()=>setActiveQuestion(activeQuestion===index?null:index)} className="flex w-full items-center justify-between gap-3 p-4 text-left text-sm font-bold"><span>{item.question}</span>{activeQuestion===index?<ChevronUp size={16} className="shrink-0 text-primary"/>:<ChevronDown size={16} className="shrink-0 text-primary"/>}</button>{activeQuestion===index&&<p className="border-t border-[#eee8f5] px-4 py-4 text-sm leading-6 text-textMuted">{item.answer}</p>}</div>)}</div>
            </article>
          </div>
        </div>}
      </div>}
    </section>
  );
}