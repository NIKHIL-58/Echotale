"use client";
import { useEffect, useState } from "react";
import { Bell, Check } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState, ErrorState } from "@/components/ui/ContentState";
import { getNotifications, markNotificationRead, type Notification } from "@/services/appService";
export default function NotificationsPage() {
 const [items,setItems]=useState<Notification[]>([]),[unread,setUnread]=useState(false),[loading,setLoading]=useState(true),[error,setError]=useState(""),[busy,setBusy]=useState("");
 async function load(filter=unread) {setLoading(true);setError("");try{setItems(await getNotifications(filter));}catch{setError("Unable to load notifications. Please try again.");}finally{setLoading(false);}}
 useEffect(()=>{load(false);},[]);
 async function markRead(item:Notification) {if(item.is_read||busy)return;setBusy(item.id);try{const updated=await markNotificationRead(item.id);setItems(current=>unread?current.filter(e=>e.id!==item.id):current.map(e=>e.id===item.id?updated:e));}catch{setError("Could not mark this notification as read.");}finally{setBusy("");}}
 return <AppLayout><div className="mx-auto max-w-4xl space-y-6"><PageHeader eyebrow="Stay in the loop" title="Notifications" description="Updates about your stories and your account." actions={<button type="button" aria-pressed={unread} className="action-secondary" onClick={()=>{setUnread(!unread);load(!unread);}}>{unread?"Show all":"Unread only"}</button>}/>
 {error&&<ErrorState message={error} onRetry={()=>load()}/>}
 {loading?<div role="status" aria-label="Loading notifications" className="space-y-3">{[0,1,2].map(i=><div key={i} className="h-24 animate-pulse rounded-2xl bg-soft"/>)}</div>:!error&&!items.length?<EmptyState title="You are all caught up" description="New updates will appear here. In the meantime, there is a whole library to explore." compact/>:<div className="surface divide-y divide-borderSoft">{items.map(item=><button type="button" key={item.id} disabled={busy===item.id} onClick={()=>markRead(item)} className="flex w-full items-start gap-4 p-5 text-left transition hover:bg-page disabled:opacity-60"><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${item.is_read?"bg-page text-textMuted":"bg-soft text-primary"}`}><Bell size={18}/></span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{item.title}</span><span className="mt-1 block text-sm text-textMuted">{item.message}</span></span>{item.is_read?<Check size={16} className="text-textMuted"/>:<span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary"><span className="sr-only">Unread. Select to mark read.</span></span>}</button>)}</div>}
 </div></AppLayout>;
}
