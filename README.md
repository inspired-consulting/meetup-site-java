A small GitHub Pages site for our Java User Group (JUG) meetups.

## Editing events

Events live in [data/events.csv](data/events.csv) — open it in Excel, Numbers, or Google Sheets to add, remove, or update meetups. Columns: `date` (YYYY-MM-DD), `time` (e.g. `18:00–20:00`), `title`, `speaker`. If a title contains a comma, wrap it in double quotes, e.g. `"Java 8, 11, and 17"`.

## Local testing

The page loads `data/events.csv` via `fetch()`, which browsers block when opening `index.html` directly as a `file://` URL. Serve the folder locally instead, e.g.:

```sh
python3 -m http.server 8000
```

then open `http://localhost:8000`.
