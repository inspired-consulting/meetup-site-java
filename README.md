A small GitHub Pages site for our Java User Group (JUG) meetups.

## Editing events

Events live in [data/events.csv](data/events.csv) — open it in Excel, Numbers, or Google Sheets to add, remove, or update meetups. Columns: `date` (YYYY-MM-DD), `time` (e.g. `18:00–20:00`), `title`, `speaker`. If a value contains a comma, wrap it in double quotes, e.g. `"Java 8, 11, and 17"`.

Each event gets its own detail page at `event.html?date=YYYY-MM-DD`, so the date must be unique. The Register button is shown only for the next upcoming meetup.

## Editing abstracts

An event's abstract goes in `data/abstracts/YYYY-MM-DD.md`, named after the event's date, e.g. `data/abstracts/2026-08-20.md`. Without a file, the detail page shows "Abstract coming soon." Supported Markdown: paragraphs separated by a blank line, a line break within a paragraph by ending the line with `\`, list items starting with `-`, `**bold**`, `*italic*` or `_italic_` (use `_italic_` inside bold: `**bold with _italic_**`) and `[links](https://…)`. The first paragraph is also used as the page description for search engines.

## Local testing

The page loads `data/events.csv` via `fetch()`, which browsers block when opening `index.html` directly as a `file://` URL. Serve the folder locally instead, e.g.:

```sh
python3 -m http.server 8000
```

then open `http://localhost:8000`.
