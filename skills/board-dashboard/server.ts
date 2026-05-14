import { readdir, readFile, writeFile, watch, stat } from "fs/promises";
import { join } from "path";

const HOME = process.env.HOME!;
const BOARD_DIR = join(HOME, "board");
const ACTIVE_DIR = join(BOARD_DIR, "_active");
const QUICK_FILE = join(BOARD_DIR, "_quick.md");
const IDEAS_FILE = join(BOARD_DIR, "_ideas.md");
const PORT = Number(process.env.PORT) || 3333;

// ── File lock ──
const locks = new Map<string, Promise<void>>();
async function withLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
  while (locks.has(key)) await locks.get(key);
  let resolve: () => void;
  locks.set(key, new Promise<void>((r) => (resolve = r)));
  try { return await fn(); } finally { locks.delete(key); resolve!(); }
}

// ── Types ──
interface Task { text: string; date?: string; due?: string; tags: string[]; notes?: string; sessionId?: string; }
interface Project {
  slug: string; title: string; category: string; status: string;
  created: string; updated: string;
  tasks: { open: Task[]; inProgress: Task[]; done: Task[] };
  context: string; totalOpen: number; totalActive: number; totalDone: number;
}

// ── Auto-tagging ──
// Customize these rules to match your business keywords
const TAG_RULES: [RegExp, string][] = [
  [/\b(workflow|pipeline|CRM|funnel|landing page)\b/i, "crm"],
  [/\b(ad|ads|facebook|meta|campaign|ROAS)\b/i, "ads"],
  [/\b(video|record|film|VSL|YouTube)\b/i, "video"],
  [/\b(hire|replace|team|staff|dev)\b/i, "team"],
  [/\b(venue|workshop|event|conference)\b/i, "events"],
  [/\b(course|module|lesson)\b/i, "course"],
  [/\b(agent|bot|server|deploy|cron|SSH)\b/i, "tech"],
  [/\b(content|post|social|LinkedIn|Instagram)\b/i, "content"],
  [/\b(invoice|payment|Stripe|finance)\b/i, "finance"],
  [/\b(domain|DNS|SSL|hosting)\b/i, "infra"],
];
const CATEGORY_RULES: [RegExp, string][] = [
  [/workshop|event|tour/i, "Business"], [/course|online|skill/i, "Product"],
  [/agent|system|infra|server/i, "Tech"], [/content|strategy|social|growth|website|landing/i, "Marketing"],
  [/finance|invoice|tax/i, "Finance"], [/client|retainer/i, "Clients"],
  [/sales|pipeline|deal/i, "Sales"], [/team|ops|hire/i, "Operations"],
  [/ad.*campaign/i, "Marketing"],
];
function autoTag(text: string): string[] {
  const t: string[] = [];
  for (const [re, tag] of TAG_RULES) if (re.test(text) && !t.includes(tag)) t.push(tag);
  return t;
}
function autoCategory(slug: string, title: string): string {
  for (const [re, cat] of CATEGORY_RULES) if (re.test(`${slug} ${title}`)) return cat;
  return "General";
}

// ── Markdown parser ──
function parseTasks(section: string): Task[] {
  const tasks: Task[] = [];
  const lines = section.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^- \[[ x~]\] (.+)$/);
    if (m) {
      const raw = m[1];
      const duem = raw.match(/\s*\|\s*due:\s*(\d{4}-\d{2}-\d{2})/);
      const dm = raw.match(/\((\d{4}-\d{2}-\d{2})\)\s*$/);
      const sm = raw.match(/<!-- session:([a-f0-9-]+) -->/);
      let text = raw;
      if (duem) text = text.replace(duem[0], "");
      if (dm) text = text.replace(dm[0], "");
      if (sm) text = text.replace(sm[0], "");
      text = text.trim();
      let notes = "";
      while (i + 1 < lines.length && lines[i + 1].startsWith("  > ")) {
        notes += (notes ? "\n" : "") + lines[++i].slice(4);
      }
      tasks.push({ text, date: dm?.[1], due: duem?.[1], tags: autoTag(text), sessionId: sm?.[1], notes: notes || undefined });
    }
  }
  return tasks;
}

function parseProject(content: string, slug: string): Project {
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  const fm: Record<string, string> = {};
  if (fmMatch) for (const line of fmMatch[1].split("\n")) { const [k, ...v] = line.split(":"); if (k && v.length) fm[k.trim()] = v.join(":").trim(); }
  const body = fmMatch ? content.slice(fmMatch[0].length) : content;
  const title = body.match(/^#\s+(.+)$/m)?.[1] || slug;
  const sec = (n: string) => { const m = body.match(new RegExp(`## ${n}\\n([\\s\\S]*?)(?=\\n## |$)`)); return m ? m[1] : ""; };
  const tasks = { open: parseTasks(sec("Open")), inProgress: parseTasks(sec("In Progress")), done: parseTasks(sec("Done")) };
  return { slug, title, category: fm.category || autoCategory(slug, title), status: fm.status || "active", created: fm.created || "", updated: fm.updated || "", tasks, context: sec("Context").trim(), totalOpen: tasks.open.length, totalActive: tasks.inProgress.length, totalDone: tasks.done.length };
}

async function loadBoard() {
  const files = await readdir(ACTIVE_DIR).catch(() => []);
  const projects: Project[] = [];
  for (const f of files.filter(f => f.endsWith(".md"))) {
    projects.push(parseProject(await readFile(join(ACTIVE_DIR, f), "utf-8"), f.replace(".md", "")));
  }
  projects.sort((a, b) => (a.totalActive !== b.totalActive) ? b.totalActive - a.totalActive : (b.totalOpen + b.totalActive) - (a.totalOpen + a.totalActive));
  const quick = parseProject(await readFile(QUICK_FILE, "utf-8").catch(() => ""), "_quick");
  quick.category = "Quick";
  const ideas = parseProject(await readFile(IDEAS_FILE, "utf-8").catch(() => ""), "_ideas");
  ideas.category = "Ideas";
  const allTags = new Set<string>(), allCats = new Set<string>();
  for (const p of [...projects, quick, ideas]) { allCats.add(p.category); for (const l of [p.tasks.open, p.tasks.inProgress, p.tasks.done]) for (const t of l) t.tags.forEach(tg => allTags.add(tg)); }
  return { projects, quick, ideas, tags: [...allTags].sort(), categories: [...allCats].sort(), summary: { totalProjects: projects.length, totalOpen: projects.reduce((s, p) => s + p.totalOpen, 0) + quick.totalOpen, totalActive: projects.reduce((s, p) => s + p.totalActive, 0) + quick.totalActive, totalDone: projects.reduce((s, p) => s + p.totalDone, 0) + quick.totalDone } };
}

function taskLine(prefix: string, t: Task, includeDate: boolean): string {
  let line = `${prefix} ${t.text}`;
  if (t.due) line += ` | due: ${t.due}`;
  if (includeDate && t.date) line += ` (${t.date})`;
  if (t.sessionId) line += ` <!-- session:${t.sessionId} -->`;
  return line + "\n";
}

function rewriteProject(p: Project): string {
  let md = `---\nstatus: ${p.status}\n`;
  if (p.category && p.category !== "General") md += `category: ${p.category}\n`;
  md += `created: ${p.created}\nupdated: ${new Date().toISOString().slice(0, 10)}\n---\n\n# ${p.title}\n\n## Open\n`;
  for (const t of p.tasks.open) { md += taskLine("- [ ]", t, false); if (t.notes) for (const l of t.notes.split("\n")) md += `  > ${l}\n`; }
  md += `\n## In Progress\n`;
  for (const t of p.tasks.inProgress) { md += taskLine("- [~]", t, false); if (t.notes) for (const l of t.notes.split("\n")) md += `  > ${l}\n`; }
  md += `\n## Done\n`;
  for (const t of p.tasks.done) { md += taskLine("- [x]", t, true); if (t.notes) for (const l of t.notes.split("\n")) md += `  > ${l}\n`; }
  if (p.context) md += `\n## Context\n${p.context}\n`;
  return md;
}

// ── SSE ──
const clients = new Set<ReadableStreamDefaultController>();
function broadcast(evt = "updated") {
  for (const c of clients) { try { c.enqueue(`data: ${evt}\n\n`); } catch { clients.delete(c); } }
}
setInterval(() => { for (const c of clients) { try { c.enqueue(`: heartbeat\n\n`); } catch { clients.delete(c); } } }, 15000);
let debounce: ReturnType<typeof setTimeout> | null = null;
function debouncedBroadcast() { if (debounce) clearTimeout(debounce); debounce = setTimeout(() => broadcast(), 200); }

// Watch all three sources
(async () => { try { for await (const _ of watch(ACTIVE_DIR, { recursive: true })) debouncedBroadcast(); } catch {} })();
(async () => { try { for await (const _ of watch(QUICK_FILE)) debouncedBroadcast(); } catch {} })();
(async () => { try { for await (const _ of watch(IDEAS_FILE)) debouncedBroadcast(); } catch {} })();

const HTML_PATH = join(import.meta.dir, "index.html");

const server = Bun.serve({
  port: PORT, hostname: "localhost",
  async fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === "/" || url.pathname === "/index.html")
      return new Response(await Bun.file(HTML_PATH).text(), { headers: { "Content-Type": "text/html" } });

    if (url.pathname === "/api/board") return Response.json(await loadBoard());

    if (url.pathname === "/api/events") {
      const stream = new ReadableStream({ start(c) { clients.add(c); c.enqueue(`: connected\n\n`); }, cancel(c) { clients.delete(c); } });
      return new Response(stream, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" } });
    }

    if (req.method === "POST" && url.pathname === "/api/task/move") {
      const { projectSlug, taskText, from, to } = await req.json();
      const filePath = projectSlug === "_quick" ? QUICK_FILE : projectSlug === "_ideas" ? IDEAS_FILE : join(ACTIVE_DIR, `${projectSlug}.md`);
      return await withLock(filePath, async () => {
        const project = parseProject(await readFile(filePath, "utf-8"), projectSlug);
        const fk = from as keyof typeof project.tasks, tk = to as keyof typeof project.tasks;
        const idx = project.tasks[fk].findIndex(t => t.text === taskText);
        if (idx === -1) return Response.json({ error: "Task not found" }, { status: 404 });
        const [task] = project.tasks[fk].splice(idx, 1);
        if (tk === "done" && !task.date) task.date = new Date().toISOString().slice(0, 10);
        if (tk !== "done") task.date = undefined;
        project.tasks[tk].push(task);
        await writeFile(filePath, rewriteProject(project));
        return Response.json({ ok: true });
      });
    }

    if (req.method === "POST" && url.pathname === "/api/task/add") {
      const { projectSlug, text, sessionId } = await req.json();
      const filePath = projectSlug === "_quick" ? QUICK_FILE : projectSlug === "_ideas" ? IDEAS_FILE : join(ACTIVE_DIR, `${projectSlug}.md`);
      if (projectSlug !== "_quick" && projectSlug !== "_ideas") { const exists = await Bun.file(filePath).exists(); if (!exists) return Response.json({ error: "Project not found" }, { status: 404 }); }
      return await withLock(filePath, async () => {
        const project = parseProject(await readFile(filePath, "utf-8"), projectSlug);
        project.tasks.open.push({ text, tags: autoTag(text), sessionId });
        await writeFile(filePath, rewriteProject(project));
        return Response.json({ ok: true });
      });
    }

    if (req.method === "POST" && url.pathname === "/api/task/delete") {
      const { projectSlug, taskText, column } = await req.json();
      const filePath = projectSlug === "_quick" ? QUICK_FILE : projectSlug === "_ideas" ? IDEAS_FILE : join(ACTIVE_DIR, `${projectSlug}.md`);
      return await withLock(filePath, async () => {
        const project = parseProject(await readFile(filePath, "utf-8"), projectSlug);
        const k = column as keyof typeof project.tasks;
        const idx = project.tasks[k].findIndex(t => t.text === taskText);
        if (idx !== -1) project.tasks[k].splice(idx, 1);
        await writeFile(filePath, rewriteProject(project));
        return Response.json({ ok: true });
      });
    }

    if (req.method === "POST" && url.pathname === "/api/task/note") {
      const { projectSlug, taskText, column, note } = await req.json();
      const filePath = projectSlug === "_quick" ? QUICK_FILE : projectSlug === "_ideas" ? IDEAS_FILE : join(ACTIVE_DIR, `${projectSlug}.md`);
      return await withLock(filePath, async () => {
        const project = parseProject(await readFile(filePath, "utf-8"), projectSlug);
        const k = column as keyof typeof project.tasks;
        const task = project.tasks[k].find(t => t.text === taskText);
        if (!task) return Response.json({ error: "Task not found" }, { status: 404 });
        task.notes = note || undefined;
        await writeFile(filePath, rewriteProject(project));
        return Response.json({ ok: true });
      });
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Board dashboard running on port ${PORT}`);
