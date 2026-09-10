# Continuous playback and narration boundaries

## User-facing behavior

- Selecting an audiobook part loads the complete available playlist, in part-number order.
- Autoplay is on by default and follows the saved **Autoplay** preference. You can change it in the story page, listening room, or Settings.
- Automatic next-part playback starts at zero. Explicit selections can restore that part's saved position.
- The last available part stops; **Repeat part** repeats only the current part.
- The audio element lives in the root layout, so navigation does not replace it.
- Story and player screens show the active part, next part, accessible controls, playback errors, and mobile-friendly layouts.
- Timestamp notes jump to their own part before seeking.

## Starting at the actual story

New PDF uploads use deterministic opening-page detection. It looks for a prologue/opening chapter, rejects copyright/contents pages, and supports English and Hindi opening headings. Unmarked prose is preserved; low-confidence detection stops generation and requests a manual page instead of guessing.

The uploader or an admin can open **Narration setup** on the existing story page:
1. Select automatic detection or enter a physical PDF page number.
2. Choose **Preview start**.
3. Check the opening text.
4. Confirm replacement, then generate/regenerate.

For the screenshots provided, use **PDF page 7**, where the prologue begins. This number is a choice for that book, not a global default. No real book audio has been regenerated as part of this code change.

A chosen start page changes only newly generated audio. Existing audio is retained until the first replacement part succeeds. If a later part fails, generation stops and reports that part instead of silently skipping it. Re-download offline copies after regeneration; old saved positions refer to the previous recording.

### Current processing limits

The existing backend limits remain **100 PDF pages from the selected start / 80 audio parts per generation**. A longer book is now clearly marked **partial**, not complete. This change does not increase automatic provider spending or implement resumable long-book background jobs.

## Backend/API

MongoEngine optional fields require no SQL migration:
- `narration_start_page`: nullable 1-based manual override (null = auto).
- `narration_info`: actual start/end page, confidence, preview, and limit information.
- Story serialization includes `can_manage` to gate owner controls.

Endpoints:
- `GET /api/stories/{id}/narration-preview/?start_page=7` — owner/admin only, no TTS or AI calls.
- `POST /api/stories/{id}/regenerate-audio-parts/` — accepts `start_page: 7` or `start_page: null` and the existing voice.
- `POST /api/stories/create/` — optional `narration_start_page` field.

Concurrent regeneration is rejected through an atomic status claim. Narration previews are excluded from the shared service-worker API cache. The service-worker version is bumped without deleting the dedicated download cache.

## Verification

Run:
- Frontend: `node scripts/test-playback.cjs`
- Frontend typecheck: `npx tsc --noEmit`
- Backend: `python -m unittest tests.test_narration tests.test_core`

Tests use synthetic prose, mocked audio events, and mocked PDF/provider functions; they do not use user credentials, uploaded books, real TTS, or external paid APIs.

A real-browser check is still needed on desktop and mobile (including Media Session and background playback). Production build was attempted but the environment blocked a build worker with `spawn EPERM`. Browser verification was unavailable because approval credits were exhausted. No deployment was performed.

