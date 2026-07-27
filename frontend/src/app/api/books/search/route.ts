import { NextRequest, NextResponse } from "next/server";

type OpenLibraryDoc = {
  key?: string; title?: string; author_name?: string[]; cover_i?: number;
  first_publish_year?: number; edition_count?: number; subject?: string[];
  language?: string[]; ia?: string[]; public_scan_b?: boolean; ebook_access?: string;
};

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() || "";
  if (query.length < 2) return NextResponse.json({ books: [], suggestions: [] });
  const fields = "key,title,author_name,cover_i,first_publish_year,edition_count,subject,language,ia,public_scan_b,ebook_access";
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=12&fields=${encodeURIComponent(fields)}`;
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "EchoTale/1.0 (educational book discovery app)" },
      next: { revalidate: 3600 },
    });
    if (!response.ok) throw new Error(`Open Library returned ${response.status}`);
    const payload = (await response.json()) as { docs?: OpenLibraryDoc[] };
    const docs = payload.docs || [];
    const books = docs.filter((doc) => doc.key && doc.title).map((doc) => {
      const archiveId = doc.public_scan_b ? doc.ia?.[0] : undefined;
      return {
        id: doc.key!.replace("/works/", ""), title: doc.title!, author: doc.author_name?.slice(0, 2).join(", ") || "Unknown author",
        coverUrl: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg` : "",
        year: doc.first_publish_year || null, editionCount: doc.edition_count || 0,
        subjects: doc.subject?.slice(0, 4) || [], language: doc.language?.[0] || "",
        detailsUrl: `https://openlibrary.org${doc.key}`,
        readUrl: archiveId ? `https://archive.org/details/${archiveId}` : "",
        pdfUrl: archiveId ? `https://archive.org/download/${archiveId}/${archiveId}_text.pdf` : "",
        freeToRead: Boolean(archiveId), availability: doc.ebook_access || "metadata only",
      };
    });
    const suggestions = Array.from(new Set(docs.flatMap((doc) => doc.subject || []).filter((subject) => subject.length < 35))).slice(0, 8);
    return NextResponse.json({ books, suggestions }, { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } });
  } catch {
    return NextResponse.json({ books: [], suggestions: [], warning: "The free library is temporarily unavailable." }, { status: 200 });
  }
}
