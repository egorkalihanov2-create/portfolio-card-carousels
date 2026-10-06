# Design QA — Perspective Carousel

- Source visual truth: `C:\Users\77FE78~1\AppData\Local\Temp\codex-clipboard-7d2a54ae-4a26-46ab-9ba2-77bf9a0b6efe.png`
- Source pixels: 1215 × 655
- Implementation: `http://127.0.0.1:5173/`, section `03 / perspective`
- Implementation screenshot evidence: Codex in-app Browser capture emitted in the task (the browser surface does not expose a persistent screenshot path)
- Desktop viewport: 1215 × 655 CSS px, DPR 1; rendered content width 1200 px after scrollbar
- Mobile viewport: 430 × 884 CSS px, DPR 1; rendered content width 415 px after scrollbar
- State: CityDrive centered, adjacent cards visible on both sides

## Full-view comparison evidence

The desktop implementation matches the source composition: a front-facing central card at approximately 47% viewport width, adjacent cards entering from both edges, inward Y-axis rotation, visible depth reduction, light neutral background, and clipped overflow. The existing site label system and desktop navigation arrows are retained intentionally because this is a third variation inside the same page rather than a standalone recreation.

## Focused region comparison evidence

The central and adjacent-card region was checked at desktop and mobile widths. On desktop the central card measures about 560 px wide against the source's approximately 570 px. On mobile, the nearest side cards remain partially visible by roughly one quarter of their transformed width, preserving the coverflow cue without competing with the centered case.

## Required fidelity surfaces

- Fonts and typography: existing Object Sans is preserved; card title, tag hierarchy, truncation and footer proportions match the other site sections and the reference character.
- Spacing and layout rhythm: central-card width, side spacing, footer height, radii and section centering match the source closely; page labels follow the established site rhythm.
- Colors and visual tokens: neutral off-white background and light card chrome remain consistent with version 02; project imagery supplies the intended saturated contrast.
- Image quality and asset fidelity: original supplied project assets are reused with their existing crop and resolution; no placeholders or generated substitutes are present.
- Copy and content: the same project titles and tags are reused without modification.

## Comparison history

### Pass 1

- [P2] Mobile side cards were visible only as narrow slivers (about 11% of card width), weakening the perspective cue.
- Fix: reduced mobile horizontal step from 103% to 88% and mobile Y rotation from 32° to 25°.

### Pass 2

- Post-fix evidence: both side cards remain visibly present on mobile, the center card stays dominant, and desktop proportions remain aligned with the reference.
- No remaining P0, P1 or P2 findings.

## Interaction and runtime checks

- Eight consecutive forward drags completed a full cycle and continued into the next cycle.
- Reverse drags returned through the sequence.
- Keyboard left/right navigation works.
- The centered card opens the existing project modal; the modal closes normally.
- Browser console errors checked: none.
- Production build completed successfully.

## Follow-up polish

- [P3] The desktop arrows intentionally remain visible to match version 02; they can be removed later if a cleaner, reference-only presentation is preferred.

final result: passed
