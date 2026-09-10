"use client";
import { useState } from "react";
import { FileText, Loader2, ScanText } from "lucide-react";
import { getNarrationPreview, type NarrationPreview, type Story } from "@/services/storyService";

export function NarrationSetup({ story, busy, onGenerate }: {
  story: Story; busy: boolean; onGenerate: (page: number | null) => Promise<void>;
}) {
  const [manual, setManual] = useState(story.narration_start_page != null);
  const [page, setPage] = useState(String(story.narration_start_page || story.narration_info?.start_page || 1));
  const [preview, setPreview] = useState<NarrationPreview | null>(null);
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const hasAudio = !!story.audio_url || !!story.audio_parts?.length;
  const validPage = !manual || (/^[1-9]\d*$/.test(page) && Number.isSafeInteger(Number(page)));
  const changed = () => { setPreview(null); setConfirmed(false); setMessage(""); };
  async function check() {
    setChecking(true); setMessage("");
    try { setPreview(await getNarrationPreview(story.id, manual ? Number(page) : null)); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Unable to preview this PDF."); }
    finally { setChecking(false); }
  }
  return <details className="mt-5 rounded-2xl border border-borderSoft bg-page p-4 sm:p-5">
    <summary className="cursor-pointer text-sm font-bold text-textMain">Narration setup · choose where the story begins</summary>
    <p className="mt-3 max-w-2xl text-sm leading-6 text-textMuted">Skip covers, copyright pages and contents. Automatic detection looks for the prologue or opening chapter; use a PDF page number if it needs adjusting.</p>
    <div className="mt-4 flex flex-wrap items-end gap-3">
      <label className="grid gap-1.5 text-sm font-semibold">Start mode
        <select value={manual ? "manual" : "auto"} onChange={e => { setManual(e.target.value === "manual"); changed(); }} disabled={busy || checking} className="h-11 rounded-xl border border-borderSoft bg-white px-3">
          <option value="auto">Detect story opening</option><option value="manual">Choose PDF page</option>
        </select>
      </label>
      {manual && <label className="grid gap-1.5 text-sm font-semibold">PDF page number
        <input type="number" min={1} max={preview?.total_pages} value={page} disabled={busy || checking} onChange={e => { setPage(e.target.value); changed(); }} className="h-11 w-32 rounded-xl border border-borderSoft bg-white px-3" />
      </label>}
      <button onClick={check} disabled={busy || checking || !validPage} className="action-secondary disabled:opacity-50">{checking ? <Loader2 size={17} className="animate-spin" /> : <ScanText size={17} />}Preview start</button>
    </div>
    <p className="mt-2 text-xs text-textMuted">Use the page number shown by your PDF viewer, not the printed book page number.</p>
    {message && <p role="alert" className="mt-3 text-sm text-red-700">{message}</p>}
    {preview && <div className="mt-4 rounded-xl border border-borderSoft bg-white p-4">
      <p className="flex items-center gap-2 text-sm font-bold"><FileText size={17} className="text-primary" />Starts on PDF page {preview.start_page} of {preview.total_pages}</p>
      <p className="mt-2 text-sm text-textMuted">{preview.reason}</p>
      <p className="mt-3 max-h-44 overflow-auto border-l-2 border-primary/30 pl-4 text-sm leading-7">{preview.preview || "This page contains no readable text. Choose the first page of story text."}</p>
      {preview.limited && <p className="mt-3 text-xs text-amber-800">The current server limit processes up to 100 PDF pages per generation, through page {preview.end_page}. Longer books will be marked as partial.</p>}
      {hasAudio && <label className="mt-4 flex items-start gap-2 text-sm text-textMuted"><input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} className="mt-1 accent-primary" /><span>Replace the existing audio with narration from this page. Saved positions and offline copies may need resetting. Audio generation can use provider credits.</span></label>}
      {!hasAudio && <p className="mt-3 text-xs text-textMuted">Generating narration may use your configured audio provider credits.</p>}
      <button onClick={() => onGenerate(manual ? Number(page) : null)} disabled={busy || checking || preview.confidence === "low" || !preview.preview || (hasAudio && !confirmed)} className="action-primary mt-4 disabled:opacity-50">{busy ? <Loader2 size={17} className="animate-spin" /> : <ScanText size={17} />}{hasAudio ? "Regenerate from this page" : "Generate narration"}</button>
    </div>}
  </details>;
}

