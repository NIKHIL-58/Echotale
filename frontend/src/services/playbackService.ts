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
export function queueProgress(value:Omit<ListeningProgress,'id'|'last_played_at'>){const items=JSON.parse(localStorage.getItem(QUEUE_KEY)||'[]') as typeof value[];const filtered=items.filter(i=>i.story_id!==value.story_id);localStorage.setItem(QUEUE_KEY,JSON.stringify([...filtered,value]))}
export async function syncPendingProgress(){const items=JSON.parse(localStorage.getItem(QUEUE_KEY)||'[]');if(!items.length)return;await syncProgress(items);localStorage.removeItem(QUEUE_KEY)}
