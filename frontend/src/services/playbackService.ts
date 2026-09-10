import {apiClient} from "@/lib/axios";
type Envelope<T>={success:boolean;message:string;data:T};
export type ListeningProgress={id?:string;story_id:string;chapter_id:string;current_time:number;duration:number;percentage:number;completed:boolean;last_played_at?:string};
export type TimestampNote={id:string;story_id:string;chapter_id:string;timestamp:number;note:string;created_at:string};
export type DownloadRecord={id:string;story_id:string;chapter_ids:string[];total_bytes:number;downloaded_at:string};
const data=<T>(r:{data:Envelope<T>})=>r.data.data;
export async function getProgress(storyId:string){return data<ListeningProgress|null>(await apiClient.get('/audio/progress/',{params:{story_id:storyId}}))}
export async function saveProgress(value:Omit<ListeningProgress,'id'|'last_played_at'>){return data<ListeningProgress>(await apiClient.post('/audio/progress/',value))}
export async function syncProgress(entries:Omit<ListeningProgress,'id'|'last_played_at'>[]){return data<ListeningProgress[]>(await apiClient.post('/audio/progress/sync/',{entries}))}
export async function getTimestampNotes(storyId:string){return data<TimestampNote[]>(await apiClient.get('/audio/notes/',{params:{story_id:storyId}}))}
export async function addTimestampNote(value:{story_id:string;chapter_id?:string;timestamp:number;note:string}){return data<TimestampNote>(await apiClient.post('/audio/notes/',value))}
export async function deleteTimestampNote(id:string){await apiClient.delete(`/audio/notes/${id}/`)}
export async function syncDownload(value:{story_id:string;chapter_ids:string[];total_bytes:number}){return data<DownloadRecord>(await apiClient.post('/audio/downloads/',value))}
export async function removeDownloadRecord(storyId:string){await apiClient.delete(`/audio/downloads/${storyId}/`)}
const QUEUE_KEY='echotale-pending-progress';
function pending(): ListeningProgress[] {
  try { const items = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]'); return Array.isArray(items) ? items : []; } catch { return []; }
}
export function queueProgress(value:Omit<ListeningProgress,'id'|'last_played_at'>) {
  try { localStorage.setItem(QUEUE_KEY, JSON.stringify([...pending().filter(i => i.story_id !== value.story_id), value])); } catch {}
}
let syncing: Promise<void> | null = null;
export async function syncPendingProgress() {
  if (syncing) return syncing;
  syncing = (async () => {
    const items = pending(); if (!items.length) return;
    await syncProgress(items);
    // Preserve progress saved while the request was in flight.
    const newer = pending().filter(value => !items.some(sent => JSON.stringify(sent) === JSON.stringify(value)));
    try { localStorage.setItem(QUEUE_KEY, JSON.stringify(newer)); } catch {}
  })().finally(() => { syncing = null; });
  return syncing;
}
