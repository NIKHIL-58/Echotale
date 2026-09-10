"""Deterministic PDF narration boundaries. Never infer or rewrite the story's prose."""
import re
from dataclasses import dataclass

OPENING = re.compile(
    r"^(?:prologue|प्रोलॉग|प्राक्कथन|chapter\s+(?:1|one|i)|"
    r"अध्याय\s*(?:1|१|एक|पहला)|पहला\s+अध्याय|"
    r"part\s+(?:1|one|i))\s*(?:[:.\-–—].*)?$", re.I
)
FRONT = re.compile(
    r"^(?:copyright\b|©|all rights reserved\b|no part of this book\b|"
    r"this (?:book|novel) is a work of fiction\b|isbn\b|published by\b|"
    r"table of contents\b|contents$|also by\b|about the author$|"
    r"acknowledg(?:e)?ments$|dedication$|विषय[ -]?सूची|अनुक्रमणिका|"
    r"सर्वाधिकार|प्रकाशक\s*[:：])", re.I
)
CHAPTER_ENTRY = re.compile(r"^(?:chapter|part|prologue|epilogue|अध्याय)\b", re.I)


@dataclass(frozen=True)
class StoryStart:
    page: int
    confidence: str
    reason: str


def lines(text):
    return [line.strip() for line in text.splitlines() if line.strip() and not re.fullmatch(r"[\d०-९]+", line.strip())]


def is_front_matter(text):
    rows = lines(text)
    if any(FRONT.search(row) for row in rows[:12]):
        return True
    # Contents lists can mention the prologue without actually being the prologue.
    return sum(bool(CHAPTER_ENTRY.search(row)) for row in rows) >= 4


def detect_story_start(pages):
    """Inspect opening pages in order; preserve unmarked prose before later chapters."""
    for index, text in enumerate(pages):
        rows = lines(text)
        if not rows or is_front_matter(text):
            continue
        heading = next((row for row in rows[:6] if OPENING.fullmatch(row)), None)
        body_words = len(text.split())
        if heading and (body_words >= 20 or (
            index + 1 < len(pages) and len(pages[index + 1].split()) >= 60
            and not is_front_matter(pages[index + 1])
        )):
            return StoryStart(index + 1, "high", "Found a prologue or opening chapter heading.")
        # Do not skip a real opening simply because a later page has a chapter label.
        if body_words >= 70 and len(re.findall(r"[.!?।॥]", text)) >= 2:
            return StoryStart(index + 1, "medium", "Found the first substantial page of prose. Check the preview before generating.")
    return StoryStart(1, "low", "Could not confidently identify the story opening. Choose its PDF page number manually.")


def split_narration(text, max_chars=4500):
    """Bound every TTS input, including long sentences, without dropping text."""
    if max_chars < 20:
        raise ValueError("max_chars must be at least 20")
    text = re.sub(r"\s+", " ", text or "").strip()
    chunks = []
    while len(text) > max_chars:
        # Leave a usable final fragment even when the remaining text is only just over the limit.
        limit = min(max_chars, len(text) - min(20, max_chars // 2))
        window = text[:limit + 1]
        sentence_ends = list(re.finditer(r"[.!?।॥]\s+", window))
        boundary = sentence_ends[-1].start() + 1 if sentence_ends else -1
        if boundary < max_chars // 2:
            boundary = window.rfind(" ")
        if boundary <= 0:
            boundary = limit
        chunks.append(text[:boundary].strip())
        text = text[boundary:].lstrip()
    if text:
        chunks.append(text)
    return chunks
