export type LibraryBook = { id:string; title:string; author:string; coverUrl:string; year:number|null; editionCount:number; subjects:string[]; language:string; detailsUrl:string; readUrl:string; pdfUrl:string; freeToRead:boolean; availability:string };
export async function searchOpenLibrary(query:string, signal?:AbortSignal):Promise<{books:LibraryBook[];suggestions:string[];warning?:string}>{
  const response=await fetch(`/api/books/search?q=${encodeURIComponent(query)}`,{signal});
  if(!response.ok) throw new Error("Free library search failed");
  return response.json();
}
