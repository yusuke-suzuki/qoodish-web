export const STYLES = `
:root {
  color-scheme: light dark;
  --fg: #1f2328;
  --muted: #59636e;
  --bg: #ffffff;
  --surface: #f6f8fa;
  --border: #d1d9e0;
  --accent: #0969da;
  --warning: #9a6700;
  --danger: #cf222e;
  --success: #1a7f37;
}

@media (prefers-color-scheme: dark) {
  :root {
    --fg: #e6edf3;
    --muted: #9198a1;
    --bg: #0d1117;
    --surface: #151b23;
    --border: #3d444d;
    --accent: #4493f8;
    --warning: #d29922;
    --danger: #f85149;
    --success: #3fb950;
  }
}

* { box-sizing: border-box; }

body {
  margin: 0;
  font-family: system-ui, -apple-system, "Segoe UI", "Hiragino Sans", "Noto Sans JP", sans-serif;
  line-height: 1.6;
  color: var(--fg);
  background: var(--bg);
}

a { color: var(--accent); }

.site-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
}

.brand { font-weight: 700; color: inherit; text-decoration: none; }

main { max-width: 760px; margin: 0 auto; padding: 16px; }

h1 { font-size: 1.5rem; margin: 8px 0 16px; overflow-wrap: anywhere; }
h2 { font-size: 1.125rem; margin: 0 0 8px; }

.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

dl { margin: 0; display: grid; gap: 12px; }
dt { font-size: 0.8125rem; color: var(--muted); }
dd { margin: 0; overflow-wrap: anywhere; }

.prewrap { white-space: pre-wrap; margin: 0; overflow-wrap: anywhere; }
.muted { color: var(--muted); font-size: 0.875rem; }
.warning { color: var(--warning); font-size: 0.875rem; }

.report-list { list-style: none; margin: 0; padding: 0; }
.report-list li + li { border-top: 1px solid var(--border); }
.report-list a {
  display: flex;
  flex-direction: column;
  padding: 12px 4px;
  text-decoration: none;
  color: inherit;
}
.report-title { font-weight: 600; }

.history { margin: 0; padding-left: 20px; }
.history li + li { margin-top: 12px; }
.history p { margin: 0; }

.badge {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid currentColor;
  vertical-align: middle;
}
.badge-pending { color: var(--warning); }
.badge-kept { color: var(--success); }
.badge-removed { color: var(--danger); }
.badge-unavailable { color: var(--muted); }

.notice {
  padding: 12px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--surface);
}
.notice-warning { border-color: var(--warning); }
.notice-error { border-color: var(--danger); color: var(--danger); }

fieldset { border: 0; margin: 0 0 12px; padding: 0; }
legend { padding: 0; }
.choice { display: flex; align-items: center; gap: 8px; padding: 6px 0; }
.stacked { display: block; font-weight: 600; margin-bottom: 4px; }

textarea {
  width: 100%;
  font: inherit;
  padding: 8px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg);
  color: inherit;
}

button {
  font: inherit;
  font-weight: 600;
  padding: 10px 20px;
  border: 0;
  border-radius: 6px;
  background: var(--accent);
  color: #ffffff;
  cursor: pointer;
}
`;
