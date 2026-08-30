# /assets

Static, non-code project assets.

## /assets/data
The reference Excel files this app was scoped around:

- `Afternoon_Shift_Data.xlsx` — real student roster (shift, class, father's name, contact info)
- `Case_History.xlsx` — Health and Case History Form template/headings
- `Daily_Log_Sheet_-_10062026.xlsx` — per-student daily log notes + department matrix

`database/seed/import-excel.ts` reads directly from this folder. Column header
names can drift between exports of these sheets — open each file and confirm
the exact headers before trusting the mapping in that script; it's written
defensively (skips rows it can't map) but isn't guaranteed to match your
copy's exact column names on the first run.

## /assets/branding (add as needed)
Drop a logo, favicon, or any other static brand assets here. Wire them into
`frontend/public/` (for files that need to be served as-is, like a favicon)
or import them directly into components for anything bundled.
