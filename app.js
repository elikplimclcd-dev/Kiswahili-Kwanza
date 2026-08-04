// Kiswahili Kwanza — app logic (v4: expanded vocabulary, mobile-friendly, no audio)
// Progress is stored in localStorage so it works fully offline and persists between visits.

const STORAGE_KEY = "kiswahili-kwanza-progress-v3";
const LEGACY_KEY = "kiswahili-kwanza-progress-v2";
const root = document.getElementById("app");

// ---------- progress model ----------
function freshProgress() {
  return { completed: {}, scores: {}, lastVisit: null, streak: 0, xp: 0, perfectCount: 0, badgesSeen: [] };
}

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return Object.assign(freshProgress(), JSON.parse(raw));
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const old = JSON.parse(legacy);
      const p = freshProgress();
      p.completed = old.completed || {};
      p.scores = old.scores || {};
      p.streak = old.streak || 0;
      p.lastVisit = old.lastVisit || null;
      p.xp = Object.keys(p.completed).length * 20;
      return p;
    }
    return freshProgress();
  } catch (e) {
    return freshProgress();
  }
}

function saveProgress(p) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

function bumpStreak(p) {
  const today = new Date().toDateString();
  if (p.lastVisit === today) return p;
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  p.streak = p.lastVisit === yesterday ? (p.streak || 0) + 1 : 1;
  p.lastVisit = today;
  return p;
}

let progress = bumpStreak(loadProgress());
saveProgress(progress);

function lessonById(id) {
  return COURSE.find((l) => l.id === id);
}

// ---------- levels ----------
const LEVELS = [
  { min: 0, title: "Mtoto wa Simba", en: "Lion Cub" },
  { min: 150, title: "Mwanafunzi", en: "Student" },
  { min: 400, title: "Msomi", en: "Scholar" },
  { min: 800, title: "Fundi wa Kiswahili", en: "Swahili Craftsman" },
  { min: 1400, title: "Bingwa", en: "Champion" },
  { min: 2200, title: "Simba Mkuu", en: "Great Lion" },
];

function levelInfo(xp) {
  let current = LEVELS[0];
  let idx = 0;
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].min) { current = LEVELS[i]; idx = i; }
  }
  const next = LEVELS[idx + 1] || null;
  return { current, next, idx };
}

// ---------- badges ----------
const BADGES = [
  { id: "first", icon: "\u{1F389}", title: "Hatua ya Kwanza", en: "First chapter complete", check: (p) => Object.keys(p.completed).length >= 1 },
  { id: "streak7", icon: "\u{1F525}", title: "Wiki Nzima", en: "7-day streak", check: (p) => (p.streak || 0) >= 7 },
  { id: "perfect", icon: "\u2B50", title: "Alama Kamili", en: "A perfect quiz score", check: (p) => (p.perfectCount || 0) >= 1 },
  { id: "quarter", icon: "\u{1F9E9}", title: "Robo ya Safari", en: "14 chapters complete", check: (p) => Object.keys(p.completed).length >= 14 },
  { id: "half", icon: "\u26F0\uFE0F", title: "Nusu ya Safari", en: "28 chapters complete", check: (p) => Object.keys(p.completed).length >= 28 },
  { id: "all", icon: "\u{1F981}", title: "Simba Mkuu", en: "Whole course complete", check: (p) => Object.keys(p.completed).length >= COURSE.length },
];

function earnedBadges(p) {
  return BADGES.filter((b) => b.check(p));
}

// ---------- confetti (visual only) ----------
function celebrate() {
  const layer = document.createElement("div");
  layer.className = "confetti-layer";
  const colors = ["#e0a83a", "#1c4fb0", "#2f66d6", "#0d2a66", "#ffffff"];
  for (let i = 0; i < 28; i++) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.left = Math.random() * 100 + "%";
    piece.style.background = colors[i % colors.length];
    piece.style.animationDelay = Math.random() * 0.35 + "s";
    piece.style.animationDuration = 1.5 + Math.random() * 0.9 + "s";
    layer.appendChild(piece);
  }
  document.body.appendChild(layer);
  setTimeout(() => layer.remove(), 2600);
}

// ---------- mascot ----------
function mascotSvg(mood) {
  const mouth = mood === "sad" ? "M40,78 Q50,71 60,78" : mood === "big" ? "M36,72 Q50,92 64,72" : "M38,74 Q50,88 62,74";
  const browY = mood === "sad" ? 46 : 44;
  return `
  <svg viewBox="0 0 120 120" class="mascot-svg" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Simba, mascot wa programu">
    <ellipse cx="22" cy="36" rx="17" ry="17" fill="#c1432b"/>
    <ellipse cx="98" cy="36" rx="17" ry="17" fill="#c1432b"/>
    <ellipse cx="22" cy="36" rx="9" ry="9" fill="#e3a625"/>
    <ellipse cx="98" cy="36" rx="9" ry="9" fill="#e3a625"/>
    <circle cx="60" cy="64" r="43" fill="#e3a625"/>
    <ellipse cx="33" cy="76" rx="11" ry="7" fill="#f6efe1" opacity="0.75"/>
    <ellipse cx="87" cy="76" rx="11" ry="7" fill="#f6efe1" opacity="0.75"/>
    <circle cx="45" cy="${browY + 12}" r="5" fill="#211f1a"/>
    <circle cx="75" cy="${browY + 12}" r="5" fill="#211f1a"/>
    <ellipse cx="60" cy="68" rx="6" ry="4" fill="#211f1a"/>
    <path d="${mouth}" stroke="#211f1a" stroke-width="3" fill="none" stroke-linecap="round"/>
  </svg>`;
}

// ---------- progress ring ----------
function progressRing(percent, size) {
  size = size || 104;
  const r = size / 2 - 9;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, percent) / 100) * c;
  return `
  <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" class="progress-ring">
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="#d7e2f5" stroke-width="9"/>
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="#1c4fb0" stroke-width="9" stroke-linecap="round"
      stroke-dasharray="${c}" stroke-dashoffset="${offset}" transform="rotate(-90 ${size / 2} ${size / 2})"/>
    <text x="50%" y="55%" text-anchor="middle" class="progress-ring-text">${Math.round(percent)}%</text>
  </svg>`;
}

// ---------- part theming ----------
const PART_THEME = [
  { accent: "#1c4fb0", icon: "\u{1F5E3}\uFE0F" },
  { accent: "#0e7c86", icon: "\u{1F3DB}\uFE0F" },
  { accent: "#5b3fa0", icon: "\u{1F9E9}" },
  { accent: "#0f6b4f", icon: "\u{1F91D}" },
  { accent: "#2d5f8a", icon: "\u23F3" },
  { accent: "#7a3f8a", icon: "\u{1F524}" },
  { accent: "#1a3f6e", icon: "\u{1F500}" },
  { accent: "#0c7676", icon: "\u{1F517}" },
  { accent: "#4a4f9e", icon: "\u{1F31F}" },
  { accent: "#2f6f9e", icon: "\u{1F3C3}" },
  { accent: "#3f5fa8", icon: "\u{1F3F7}\uFE0F" },
];

// ---------- Course assistant (local search, no API, works offline) ----------
// Answers come from two places, both in this repo: knowledge.js (grammar
// Q&A you can keep adding to) and data.js (every word and sentence in the
// course). Everything runs in the browser — nothing is sent anywhere.

let assistantOpen = false;
let assistantHistory = []; // {role:"user"|"assistant", content:"...", html?:true}
let assistantIndex = null;

const ASSISTANT_STOPWORDS = new Set([
  "what", "is", "are", "the", "a", "an", "does", "do", "did", "mean", "means",
  "in", "of", "to", "how", "for", "i", "you", "can", "could", "please", "tell",
  "me", "about", "this", "that", "it", "on", "with", "my", "and", "or", "when",
  "where", "why", "who",
]);

function normalizeText(str) {
  return (str || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['\u2019]/g, "'")
    .replace(/[^a-z0-9'\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function assistantTokens(str, dropStopwords) {
  const words = normalizeText(str).split(" ").filter(Boolean);
  return dropStopwords ? words.filter((w) => w.length > 1 && !ASSISTANT_STOPWORDS.has(w)) : words;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str == null ? "" : String(str);
  return div.innerHTML;
}

function buildAssistantIndex() {
  if (assistantIndex) return assistantIndex;
  const idx = [];

  (typeof KNOWLEDGE_BANK !== "undefined" ? KNOWLEDGE_BANK : []).forEach((item) => {
    idx.push({
      text: normalizeText(`${item.q} ${(item.tags || []).join(" ")}`),
      weight: 1.5,
      lessonId: item.lessonId || null,
      html: `${escapeHtml(item.a)}${item.lessonId ? assistantLessonLink(item.lessonId) : ""}`,
    });
  });

  COURSE.forEach((lesson) => {
    idx.push({
      text: normalizeText(`${lesson.title} ${lesson.subtitle} ${lesson.note || ""}`),
      weight: 1.1,
      lessonId: lesson.id,
      html: `${escapeHtml(lesson.note || lesson.subtitle)}${assistantLessonLink(lesson.id)}`,
    });
    (lesson.vocab || []).forEach((v) => {
      if (!v.sw || !v.en) return;
      idx.push({
        text: normalizeText(`${v.sw} ${v.en}`),
        weight: 1,
        lessonId: lesson.id,
        html: `<strong>${escapeHtml(v.sw)}</strong> \u2014 ${escapeHtml(v.en)}${assistantLessonLink(lesson.id)}`,
      });
    });
    (lesson.sentences || []).forEach((s) => {
      if (!s.sw || !s.en) return;
      idx.push({
        text: normalizeText(`${s.sw} ${s.en}`),
        weight: 1,
        lessonId: lesson.id,
        html: `<strong>${escapeHtml(s.sw)}</strong> \u2014 ${escapeHtml(s.en)}${assistantLessonLink(lesson.id)}`,
      });
    });
  });

  assistantIndex = idx;
  return idx;
}

function assistantLessonLink(lessonId) {
  const lesson = lessonById(lessonId);
  if (!lesson) return "";
  return `<br><a href="#lesson/${lesson.id}" class="assistant-link">${escapeHtml(lesson.title)} \u2192</a>`;
}

function currentLessonId() {
  const [, lessonId] = currentRoute().split("/");
  return lessonId || null;
}

function searchAssistant(query) {
  const idx = buildAssistantIndex();
  const qTokens = assistantTokens(query, true);
  if (!qTokens.length) return [];
  const qNorm = normalizeText(query);
  const curLesson = currentLessonId();

  const scored = idx.map((item) => {
    let score = 0;
    for (const t of qTokens) {
      if (item.text.includes(` ${t} `) || item.text.startsWith(`${t} `) || item.text.endsWith(` ${t}`) || item.text === t) {
        score += 3;
      } else if (t.length >= 3 && item.text.includes(t)) {
        score += 1.2;
      }
    }
    if (qNorm.length >= 4 && item.text.includes(qNorm)) score += 5;
    score *= item.weight;
    if (curLesson && item.lessonId === curLesson) score += 1;
    return { item, score };
  });

  return scored
    .filter((s) => s.score >= 3)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
}

function renderAssistantMessages() {
  const list = document.getElementById("assistant-messages");
  if (!list) return;
  list.innerHTML = assistantHistory
    .map((m) => {
      const body = m.role === "user" ? escapeHtml(m.content) : m.content;
      return `<div class="assistant-msg assistant-msg-${m.role}">${body}</div>`;
    })
    .join("");
  list.scrollTop = list.scrollHeight;
}

function sendAssistantMessage(text) {
  const trimmed = text.trim();
  if (!trimmed) return;
  assistantHistory.push({ role: "user", content: trimmed });

  const results = searchAssistant(trimmed);
  let html;
  if (results.length) {
    const seen = new Set();
    const parts = [];
    for (const r of results) {
      if (seen.has(r.item.html)) continue;
      seen.add(r.item.html);
      parts.push(r.item.html);
      if (parts.length >= 3) break;
    }
    html = parts.join('<hr class="assistant-sep">');
  } else {
    html =
      'Samahani, sina jibu kwa hilo bado \u2014 jaribu maneno mengine, au angalia <a href="#resources" class="assistant-link">Rasilimali</a>.' +
      '<br><span class="assistant-msg-en">Sorry, I don\u2019t have an answer for that yet. Try different words, or check the Resources page.</span>';
  }
  assistantHistory.push({ role: "assistant", content: html });
  renderAssistantMessages();
}

function mountAssistant() {
  const wrap = document.createElement("div");
  wrap.id = "ai-assistant";
  wrap.innerHTML = `
    <button id="assistant-toggle" class="assistant-fab" aria-label="Uliza Msaidizi wa Kozi" title="Msaidizi wa Kozi">\u{1F981}</button>
    <div id="assistant-panel" class="assistant-panel assistant-hidden">
      <div class="assistant-header">
        <span>Msaidizi wa Kozi <span class="assistant-header-en">Course search assistant</span></span>
        <button id="assistant-close" class="assistant-close" aria-label="Funga">\u2715</button>
      </div>
      <div id="assistant-messages" class="assistant-messages">
        <div class="assistant-msg assistant-msg-assistant">Habari! Niulize kuhusu msamiati au sarufi ya kozi hii \u2014 nitatafuta kwenye sura zote 80.<br><span class="assistant-msg-en">Ask me about vocabulary or grammar from this course \u2014 I search across all 80 chapters. (I'm a local search tool, not a live AI.)</span></div>
      </div>
      <form id="assistant-form" class="assistant-form">
        <input id="assistant-input" type="text" placeholder="Andika swali lako\u2026" autocomplete="off" maxlength="200" />
        <button type="submit" class="assistant-send" aria-label="Tuma">\u2192</button>
      </form>
    </div>
  `;
  document.body.appendChild(wrap);

  const panel = document.getElementById("assistant-panel");

  document.getElementById("assistant-toggle").addEventListener("click", () => {
    assistantOpen = !assistantOpen;
    panel.classList.toggle("assistant-hidden", !assistantOpen);
    if (assistantOpen) document.getElementById("assistant-input").focus();
  });
  document.getElementById("assistant-close").addEventListener("click", () => {
    assistantOpen = false;
    panel.classList.add("assistant-hidden");
  });
  document.getElementById("assistant-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = document.getElementById("assistant-input");
    const text = input.value;
    input.value = "";
    sendAssistantMessage(text);
  });
  panel.addEventListener("click", (e) => {
    if (e.target.closest("a.assistant-link")) {
      assistantOpen = false;
      panel.classList.add("assistant-hidden");
    }
  });
}

window.addEventListener("DOMContentLoaded", mountAssistant);

// ---------- routing ----------
window.addEventListener("hashchange", render);
window.addEventListener("DOMContentLoaded", render);

function currentRoute() {
  const h = window.location.hash.replace("#", "");
  return h || "home";
}

function render() {
  const route = currentRoute();
  window.scrollTo(0, 0);
  if (route === "home") return renderHome();
  if (route === "resources") return renderResources();
  const [kind, lessonId] = route.split("/");
  const lesson = lessonById(lessonId);
  if (!lesson) return renderHome();
  if (kind === "lesson") return renderLesson(lesson);
  if (kind === "quiz") return renderQuiz(lesson);
  renderHome();
}

// ---------- shell ----------
function shell(content, activeNav) {
  const completedCount = Object.keys(progress.completed).length;
  const { current } = levelInfo(progress.xp || 0);
  root.innerHTML = `
    <div class="app-shell">
      <nav class="sidenav">
        <a href="#home" class="brand">
          <span class="brand-mark">KW</span>
          <div>
            <div class="brand-title">Kiswahili Kwanza</div>
            <div class="brand-sub">Sarufi ya Idara \u00b7 based on Mwana Simba</div>
          </div>
        </a>
        <a href="#home" class="nav-link ${activeNav === "home" ? "active" : ""}">Sura Zote <span class="nav-hint">All 80 chapters</span></a>
        <a href="#resources" class="nav-link ${activeNav === "resources" ? "active" : ""}">Rasilimali <span class="nav-hint">Extra resources</span></a>

        <div class="level-chip">
          <span class="level-title">${current.title}</span>
          <span class="level-title-en">${current.en}</span>
        </div>

        <div class="nav-stats">
          <div class="stat"><span class="stat-num">${completedCount}/${COURSE.length}</span><span class="stat-label">Sura zimekamilika</span></div>
          <div class="stat"><span class="stat-num streak-flame">${progress.streak || 0}\u{1F525}</span><span class="stat-label">Siku mfululizo</span></div>
        </div>
        <div class="xp-stat"><span class="xp-num">\u2728 ${progress.xp || 0} XP</span></div>

        <button class="reset-btn" id="reset-progress">Anza upya (Reset progress)</button>
        <div class="offline-note">Inafanya kazi bila intaneti mara ikishapakiwa.<br><span>Works offline once loaded. Content adapted from the Mwana Simba Swahili grammar (Root Stem Leaf).</span></div>
      </nav>
      <main class="main-panel">${content}</main>
      <nav class="mobile-tabbar">
        <a href="#home" class="mobile-tab ${activeNav === "home" ? "active" : ""}">
          <span class="mobile-tab-icon">\u{1F4D6}</span>
          <span class="mobile-tab-label">Sura Zote</span>
        </a>
        <a href="#resources" class="mobile-tab ${activeNav === "resources" ? "active" : ""}">
          <span class="mobile-tab-icon">\u2728</span>
          <span class="mobile-tab-label">Rasilimali</span>
        </a>
      </nav>
    </div>
  `;
  const resetBtn = document.getElementById("reset-progress");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      if (confirm("Futa maendeleo yote? / Clear all progress?")) {
        progress = freshProgress();
        progress = bumpStreak(progress);
        saveProgress(progress);
        render();
      }
    });
  }
}

// ---------- home ----------
function groupByPart(lessons) {
  const parts = [];
  let current = null;
  lessons.forEach((l) => {
    if (!current || current.part !== l.part) {
      current = { part: l.part, partTitle: l.partTitle, partTitleEn: l.partTitleEn, lessons: [], theme: PART_THEME[parts.length % PART_THEME.length] };
      parts.push(current);
    }
    current.lessons.push(l);
  });
  return parts;
}

function renderHome() {
  const parts = groupByPart(COURSE);
  const completedCount = Object.keys(progress.completed).length;
  const overallPct = (completedCount / COURSE.length) * 100;
  const { current, next } = levelInfo(progress.xp || 0);
  const badges = BADGES.map((b) => ({ ...b, earned: b.check(progress) }));

  const badgeRow = badges.map((b) => `
    <div class="badge-chip ${b.earned ? "earned" : "locked"}" title="${b.title} \u2014 ${b.en}">
      <span class="badge-icon">${b.icon}</span>
      <span class="badge-label">${b.title}</span>
    </div>`).join("");

  const sections = parts.map((p) => {
    const doneInPart = p.lessons.filter((l) => progress.completed[l.id]).length;
    const cards = p.lessons.map((lesson) => {
      const done = progress.completed[lesson.id];
      const score = progress.scores[lesson.id];
      return `
        <a class="lesson-card ${done ? "done" : ""}" href="#lesson/${lesson.id}" style="--accent:${p.theme.accent}">
          <div class="lesson-num">${String(lesson.number).padStart(2, "0")}</div>
          <div class="lesson-info">
            <div class="lesson-title">${lesson.title}</div>
            <div class="lesson-sub">${lesson.subtitle}</div>
          </div>
          <div class="lesson-status">${done ? `\u2713 ${score}%` : "Anza \u2192"}</div>
        </a>`;
    }).join("");
    return `
      <section class="part-section" style="--accent:${p.theme.accent}">
        <div class="part-header">
          <h2><span class="part-icon">${p.theme.icon}</span> ${p.part} \u2014 ${p.partTitle}</h2>
          <span class="part-header-en">${p.partTitleEn} \u00b7 ${doneInPart}/${p.lessons.length}</span>
        </div>
        <div class="lesson-grid">${cards}</div>
      </section>`;
  }).join("");

  shell(`
    <header class="hero hero-game">
      <div class="hero-mascot">${mascotSvg("happy")}</div>
      <div class="hero-text">
        <p class="eyebrow">Sarufi Kamili ya Kiswahili \u00b7 Chapters 1\u201380</p>
        <h1>Karibu, mwanafunzi.</h1>
        <p class="hero-copy">Kozi hii imejengwa kutoka kwenye kitabu cha sarufi cha Mwana Simba. Kila sura ina msamiati mwingi, mifano, na jaribio fupi.</p>
        <p class="hero-copy-en">Every chapter has a full vocabulary set, example sentences, and a short quiz. Learn online or offline — progress is saved on your device.</p>
      </div>
      <div class="hero-progress">
        ${progressRing(overallPct)}
        <div class="hero-progress-label">${current.title}${next ? `<span class="hero-progress-next">${next.min - (progress.xp || 0) > 0 ? (next.min - (progress.xp || 0)) + " XP hadi " + next.title : ""}</span>` : "<span class=\"hero-progress-next\">Kiwango cha juu kabisa!</span>"}</div>
      </div>
    </header>

    <section class="badges-row">${badgeRow}</section>

    ${sections}
  `, "home");
}

// ---------- external resources (Rasilimali) ----------
function wikiSearchUrl(name) { return "https://en.wikipedia.org/wiki/Special:Search?search=" + encodeURIComponent(name); }
function ytSearchUrl(name) { return "https://www.youtube.com/results?search_query=" + encodeURIComponent(name); }

const RESOURCES = [
  {
    icon: "\u{1F4DA}", title: "Rasilimali za Jumla", titleEn: "General Kiswahili Resources",
    links: [
      { label: "kiswahili.net", url: "https://www.kiswahili.net" },
      { label: "Kamusi (kamusi.org)", url: "https://kamusi.org" },
      { label: "Glosbe", url: "https://glosbe.com" },
      { label: "Wiktionary", url: "https://en.wiktionary.org" },
      { label: "Omniglot", url: "https://www.omniglot.com" },
      { label: "Learn Swahili", url: "https://learnswahili.org" },
      { label: "SwahiliProf resources", url: "https://swahiliprof.com/swahili-resources/" },
    ],
  },
  {
    icon: "\u{1F393}", title: "Makusanyo ya Vyuo Vikuu", titleEn: "University Resource Collections",
    note: "These university pages link out to many more textbooks, dictionaries, and videos.",
    links: [
      { label: "University of Iowa \u2014 CLCL", url: "https://clcl.uiowa.edu/language-resources/swahili-language-and-culture-resources" },
      { label: "University of Illinois Linguistics", url: "https://linguistics.illinois.edu/languages/swahili/swahili-language-culture-resources" },
      { label: "Iowa French & Italian", url: "https://french-italian.uiowa.edu/areas/swahili/resources" },
      { label: "University of Kansas \u2014 Hujambo", url: "https://olrc.ku.edu/hujambo" },
      { label: "St. Lawrence University", url: "https://www.stlawu.edu/offices/world-languages-cultures-and-media/swahili-resources" },
      { label: "Baylor University", url: "https://imlc.artsandsciences.baylor.edu/student-resources/language-resources/swahili-resources" },
    ],
  },
  {
    icon: "\u{1F4D6}", title: "Sarufi na Kamusi", titleEn: "Grammar & Dictionaries",
    links: [
      { label: "Kamusi.org", url: "https://kamusi.org" },
      { label: "Glosbe", url: "https://glosbe.com" },
      { label: "Wiktionary", url: "https://en.wiktionary.org" },
      { label: "African Languages", url: "https://www.africanlanguages.com" },
      { label: "kiswahili.net", url: "https://www.kiswahili.net" },
    ],
  },
  {
    icon: "\u{1F4D5}", title: "Vitabu na PDF Bila Malipo", titleEn: "Free Textbooks & PDFs",
    links: [
      { label: "Maktaba.org", url: "https://www.maktaba.org" },
      { label: "Kenya Education Cloud (LMS)", url: "https://lms.kec.ac.ke" },
      { label: "Peace Corps", url: "https://peacecorps.gov" },
      { label: "FSI Language Courses", url: "https://fsi-languages.yojik.eu" },
      { label: "Internet Archive", url: "https://archive.org" },
      { label: "Open Library", url: "https://openlibrary.org" },
    ],
  },
  {
    icon: "\u{1F9D2}", title: "Vitabu vya Watoto", titleEn: "Children's Storybooks",
    links: [
      { label: "Storybooks Kiswahili (GitHub)", url: "https://global-asp.github.io/storybooks-swahili/" },
      { label: "African Storybook", url: "https://www.africanstorybook.org" },
      { label: "Maktaba.org", url: "https://www.maktaba.org" },
    ],
  },
  {
    icon: "\u{1F3FA}", title: "Historia ya Kiswahili na Pwani", titleEn: "History of Kiswahili & the Swahili Coast",
    links: [
      { label: "World History Encyclopedia \u2014 Swahili Coast", url: "https://www.worldhistory.org/Swahili_Coast/" },
      { label: "UNESCO World Heritage", url: "https://whc.unesco.org" },
      { label: "National Geographic Education", url: "https://education.nationalgeographic.org" },
      { label: "Britannica", url: "https://www.britannica.com" },
      { label: "Wikipedia \u2014 Swahili culture", url: "https://en.wikipedia.org/wiki/Swahili_culture" },
    ],
  },
  {
    icon: "\u{1F30D}", title: "Makabila Yanayozungumza Kiswahili", titleEn: "Swahili-Region Tribes & Ethnic Groups",
    note: "No fixed links for these \u2014 tap a name to search Wikipedia.",
    generated: ["Swahili", "Mijikenda", "Chaga", "Sukuma", "Nyamwezi", "Haya", "Zaramo", "Gogo", "Hehe", "Makonde", "Maasai", "Sambaa", "Pare", "Taita", "Pokomo", "Yao", "Makua", "Luo", "Kikuyu", "Kamba"],
    genFn: wikiSearchUrl,
  },
  {
    icon: "\u{1F5FA}\uFE0F", title: "Nchi Zinazozungumza Kiswahili", titleEn: "Countries Where Kiswahili is Spoken",
    note: "Tanzania \u00b7 Kenya \u00b7 Uganda \u00b7 Rwanda \u00b7 Burundi \u00b7 DR Congo \u00b7 Comoros \u00b7 northern Mozambique \u00b7 parts of Malawi & Zambia. Tourism boards:",
    links: [
      { label: "Tanzania Tourism", url: "https://www.tanzaniatourism.go.tz" },
      { label: "Tanzania National Parks", url: "https://www.tanzaniaparks.go.tz" },
      { label: "Magical Kenya", url: "https://magicalkenya.com" },
      { label: "Visit Uganda", url: "https://www.visituganda.com" },
      { label: "Visit Rwanda", url: "https://www.visitrwanda.com" },
    ],
  },
  {
    icon: "\u{1F3DB}\uFE0F", title: "Makumbusho", titleEn: "Museums & Cultural Collections",
    links: [
      { label: "British Museum", url: "https://www.britishmuseum.org" },
      { label: "Smithsonian", url: "https://www.si.edu" },
      { label: "The Met", url: "https://www.metmuseum.org" },
      { label: "Google Arts & Culture", url: "https://artsandculture.google.com" },
    ],
  },
  {
    icon: "\u{1F5BC}\uFE0F", title: "Picha Bila Malipo", titleEn: "Free Images",
    links: [
      { label: "Wikimedia Commons", url: "https://commons.wikimedia.org" },
      { label: "Unsplash", url: "https://unsplash.com" },
      { label: "Pexels", url: "https://www.pexels.com" },
      { label: "Pixabay", url: "https://pixabay.com" },
      { label: "Flickr Commons", url: "https://www.flickr.com/commons" },
    ],
  },
  {
    icon: "\u{1F5FA}\uFE0F", title: "Ramani za Kihistoria", titleEn: "Historical Maps",
    links: [
      { label: "Library of Congress Maps", url: "https://www.loc.gov/maps" },
      { label: "David Rumsey Map Collection", url: "https://www.davidrumsey.com" },
    ],
  },
  {
    icon: "\u{1F393}", title: "Majarida ya Kitaaluma", titleEn: "Academic Journals",
    links: [
      { label: "Google Scholar", url: "https://scholar.google.com" },
      { label: "JSTOR", url: "https://www.jstor.org" },
      { label: "ResearchGate", url: "https://www.researchgate.net" },
      { label: "Academia.edu", url: "https://www.academia.edu" },
      { label: "SpringerLink", url: "https://link.springer.com" },
      { label: "Taylor & Francis Online", url: "https://www.tandfonline.com" },
    ],
  },
  {
    icon: "\u{1F4F0}", title: "Habari (Kiingereza)", titleEn: "News (English)",
    links: [
      { label: "BBC Africa", url: "https://www.bbc.com/news/world/africa" },
      { label: "Nation.africa", url: "https://nation.africa" },
      { label: "The Citizen (Tanzania)", url: "https://www.thecitizen.co.tz" },
      { label: "The East African", url: "https://www.theeastafrican.co.ke" },
      { label: "AllAfrica", url: "https://allafrica.com" },
    ],
  },
  {
    icon: "\u{1F4F0}", title: "Habari (Kiswahili)", titleEn: "News (Kiswahili)",
    links: [
      { label: "BBC Swahili", url: "https://www.bbc.com/swahili" },
      { label: "DW Kiswahili", url: "https://www.dw.com/sw" },
      { label: "VOA Swahili", url: "https://www.voaswahili.com" },
      { label: "RFI Kiswahili", url: "https://www.rfi.fr/sw" },
      { label: "IPP Media (Kiswahili)", url: "https://www.ippmedia.com/sw" },
    ],
  },
  {
    icon: "\u{1F4FB}", title: "Redio", titleEn: "Radio",
    links: [
      { label: "VOA Swahili", url: "https://www.voaswahili.com" },
      { label: "BBC Swahili", url: "https://www.bbc.com/swahili" },
      { label: "DW Kiswahili", url: "https://www.dw.com/sw" },
      { label: "Clouds FM", url: "https://www.cloudsfm.co.tz" },
      { label: "Radio Garden", url: "https://radio.garden" },
    ],
  },
  {
    icon: "\u25B6\uFE0F", title: "YouTube", titleEn: "YouTube Channels",
    note: "Channel names \u2014 tap to search YouTube.",
    generated: ["BBC News Swahili", "VOA Swahili", "DW Kiswahili", "Swahili101", "Kiswahili na Abdulkarim", "Language Crush Swahili", "Easy Swahili"],
    genFn: ytSearchUrl,
  },
  {
    icon: "\u{1F3AC}", title: "Filamu na Televisheni", titleEn: "Movies & TV",
    note: "Names \u2014 tap to search YouTube.",
    generated: ["Swahiliwood", "Swahiliflix", "East Africa TV", "Azam TV", "Wasafi TV"],
    genFn: ytSearchUrl,
  },
  {
    icon: "\u{1F3B5}", title: "Muziki", titleEn: "Music",
    note: "Streaming platforms, and genres worth searching for.",
    links: [
      { label: "Boomplay", url: "https://www.boomplay.com" },
      { label: "Spotify", url: "https://www.spotify.com" },
      { label: "Apple Music", url: "https://music.apple.com" },
      { label: "Audiomack", url: "https://audiomack.com" },
    ],
    generated: ["Taarab", "Bongo Flava", "Singeli", "Zilizopendwa", "Gospel Kiswahili"],
    genFn: ytSearchUrl,
  },
  {
    icon: "\u{1F4AC}", title: "Methali na Misemo", titleEn: "Proverbs & Idioms",
    links: [
      { label: "kiswahili.net", url: "https://www.kiswahili.net" },
      { label: "Wikiquote", url: "https://en.wikiquote.org" },
      { label: "Wiktionary", url: "https://en.wiktionary.org" },
    ],
  },
  {
    icon: "\u{1F916}", title: "Rasilimali za AI na NLP", titleEn: "AI & NLP Resources",
    note: "Datasets and tools behind Swahili speech recognition and translation research.",
    links: [
      { label: "Mozilla Common Voice", url: "https://commonvoice.mozilla.org" },
      { label: "Hugging Face", url: "https://huggingface.co" },
      { label: "OPUS", url: "https://opus.nlpl.eu" },
      { label: "Masakhane", url: "https://www.masakhane.io" },
      { label: "Zenodo", url: "https://zenodo.org" },
    ],
  },
  {
    icon: "\u{1F4C2}", title: "Rasilimali Huria za Elimu", titleEn: "Open Educational Resources",
    links: [
      { label: "Maktaba.org", url: "https://www.maktaba.org" },
      { label: "Storybooks Kiswahili", url: "https://global-asp.github.io/storybooks-swahili/" },
      { label: "Kenya Education Cloud", url: "https://lms.kec.ac.ke" },
      { label: "OER Commons", url: "https://www.oercommons.org" },
    ],
  },
];

function renderResources() {
  const cards = RESOURCES.map((cat, i) => {
    const linkItems = (cat.links || []).map((l) => `
      <li><a href="${l.url}" target="_blank" rel="noopener noreferrer">${l.label} <span class="ext-arrow">\u2197</span></a></li>`).join("");
    const genItems = cat.generated ? cat.generated.map((name) => `
      <li><a href="${cat.genFn(name)}" target="_blank" rel="noopener noreferrer">${name} <span class="ext-arrow">\u2197</span></a></li>`).join("") : "";
    return `
      <details class="resource-card" ${i < 2 ? "open" : ""}>
        <summary><span class="resource-icon">${cat.icon}</span> <span class="resource-title">${cat.title}</span><span class="resource-title-en">${cat.titleEn}</span></summary>
        <div class="resource-body">
          ${cat.note ? `<p class="resource-note">${cat.note}</p>` : ""}
          <ul class="resource-links">${linkItems}${genItems}</ul>
        </div>
      </details>`;
  }).join("");

  shell(`
    <header class="hero">
      <p class="eyebrow">Zaidi ya Kozi \u00b7 Beyond the Course</p>
      <h1>Rasilimali</h1>
      <p class="hero-copy">Viungo vya ziada kwa wanafunzi wanaotaka kwenda mbali zaidi \u2014 kamusi, vitabu, habari, historia, na muziki.</p>
      <p class="hero-copy-en">Extra links for students who want to go further \u2014 dictionaries, textbooks, news, history, and music.</p>
      <p class="resource-disclaimer">\u26A0\uFE0F Viungo hivi vinaelekeza nje ya programu na vinahitaji intaneti; havijahifadhiwa kwa matumizi nje ya mtandao. Vimekusanywa na jamii, hivyo baadhi vinaweza kubadilika \u2014 tafadhali ripoti kiungo kilichovunjika.
      <br><span>These links lead outside the app and need an internet connection; they are not available offline. They're community-curated, so a few may move or go stale over time.</span></p>
    </header>
    <section class="resources-list">${cards}</section>
  `, "resources");
}


// ---------- lesson ----------
function renderLesson(lesson) {
  const vocabCards = lesson.vocab.map((v) => `
    <div class="flip-card" tabindex="0" role="button" aria-label="Geuza kadi">
      <div class="flip-inner">
        <div class="flip-face flip-front"><span>${v.sw}</span></div>
        <div class="flip-face flip-back"><span>${v.en}</span></div>
      </div>
    </div>`).join("");

  const vocabHtml = lesson.vocab.length ? `
    <section class="block">
      <h2>Msamiati na Mifumo <span class="block-en">Vocabulary & patterns</span></h2>
      <p class="block-hint">Gusa kadi kuona tafsiri. <span class="block-hint-en">Tap a card to flip it.</span></p>
      <div class="flip-grid">${vocabCards}</div>
    </section>` : "";

  const sentencesHtml = lesson.sentences.length ? `
    <section class="block">
      <h2>Mifano <span class="block-en">Examples</span></h2>
      <div class="sentence-list">${lesson.sentences.map((s) => `
        <div class="sentence-row">
          <span class="sw">${s.sw}</span>
          <span class="en">${s.en}</span>
        </div>`).join("")}</div>
    </section>` : "";

  const idx = COURSE.findIndex((l) => l.id === lesson.id);
  const prevLesson = COURSE[idx - 1];
  const nextLesson = COURSE[idx + 1];

  shell(`
    <a class="back-link" href="#home">\u2190 Sura Zote</a>
    <header class="lesson-header">
      <p class="eyebrow">${lesson.part} \u00b7 Sura ${String(lesson.number).padStart(2, "0")} / ${COURSE.length}</p>
      <h1>${lesson.title}</h1>
      <p class="hero-copy-en">${lesson.subtitle}</p>
    </header>

    <section class="block">
      <p class="grammar-note">${lesson.note}</p>
    </section>

    ${vocabHtml}

    ${sentencesHtml}

    <div class="lesson-nav-row">
      ${prevLesson ? `<a class="ghost-btn" href="#lesson/${prevLesson.id}">\u2190 ${prevLesson.title}</a>` : "<span></span>"}
      <a class="primary-btn small" href="#quiz/${lesson.id}">Anza Jaribio \u2192</a>
      ${nextLesson ? `<a class="ghost-btn" href="#lesson/${nextLesson.id}">${nextLesson.title} \u2192</a>` : "<span></span>"}
    </div>
  `, "home");

  document.querySelectorAll(".flip-card").forEach((card) => {
    const toggle = () => card.classList.toggle("flipped");
    card.addEventListener("click", toggle);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
    });
  });
}

// ---------- quiz generation ----------
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function dedupeBySw(items) {
  const seen = new Set();
  const out = [];
  for (const it of items) {
    if (!it.sw || !it.en || seen.has(it.sw)) continue;
    seen.add(it.sw);
    out.push(it);
  }
  return out;
}

const QUIZ_MIN = 20;
const QUIZ_MAX = 25;

function buildQuiz(lesson) {
  let pool = dedupeBySw(shuffle([...lesson.vocab, ...lesson.sentences]));

  // Chapters with fewer than QUIZ_MIN of their own items get topped up with
  // extra questions from related chapters (same part first, then any),
  // so every exercise still has at least QUIZ_MIN questions.
  if (pool.length < QUIZ_MIN) {
    const usedSw = new Set(pool.map((p) => p.sw));
    const samePart = shuffle(COURSE.filter((l) => l.id !== lesson.id && l.part === lesson.part));
    const others = shuffle(COURSE.filter((l) => l.id !== lesson.id && l.part !== lesson.part));
    for (const src of [...samePart, ...others]) {
      if (pool.length >= QUIZ_MIN + 5) break;
      for (const it of shuffle([...(src.vocab || []), ...(src.sentences || [])])) {
        if (pool.length >= QUIZ_MIN + 5) break;
        if (!it.sw || !it.en || usedSw.has(it.sw)) continue;
        usedSw.add(it.sw);
        pool.push(it);
      }
    }
  }

  const count = Math.min(QUIZ_MAX, pool.length);
  const chosen = shuffle(pool).slice(0, count);
  const allAnswers = pool.map((p) => p.en);

  return chosen.map((item) => {
    const wrongPool = shuffle(allAnswers.filter((a) => a !== item.en));
    const distractors = wrongPool.slice(0, 3);
    const options = shuffle([item.en, ...distractors]);
    return {
      type: "mcq",
      q: item.sw,
      qHint: "Chagua tafsiri sahihi \u2014 choose the correct translation",
      options,
      answer: options.indexOf(item.en),
    };
  });
}

// ---------- quiz ----------
function renderQuiz(lesson) {
  const quiz = buildQuiz(lesson);
  let index = 0;
  let correct = 0;
  const answers = new Array(quiz.length).fill(null);

  function renderQuestion() {
    const q = quiz[index];
    const progressPct = Math.round((index / quiz.length) * 100);
    const inputHtml = `<div class="options">${q.options.map((opt, i) => `<button class="option-btn" data-i="${i}">${opt}</button>`).join("")}</div>`;

    root.querySelector(".main-panel").innerHTML = `
      <a class="back-link" href="#lesson/${lesson.id}">\u2190 ${lesson.title}</a>
      <div class="quiz-progress-track"><div class="quiz-progress-fill" style="width:${progressPct}%"></div></div>
      <p class="eyebrow">Swali ${index + 1} / ${quiz.length}</p>
      <p class="quiz-hint">${q.qHint}</p>
      <h2 class="quiz-q">${q.q}</h2>
      <div id="quiz-input-area">${inputHtml}</div>
      <div id="quiz-feedback" class="quiz-feedback"></div>
    `;

    root.querySelectorAll(".option-btn").forEach((btn) => {
      btn.addEventListener("click", () => handleAnswer(q, parseInt(btn.dataset.i, 10) === q.answer));
    });
  }

  function handleAnswer(q, isCorrect) {
    if (answers[index] !== null) return;
    answers[index] = isCorrect;
    if (isCorrect) {
      correct++;
      progress.xp = (progress.xp || 0) + 5;
      saveProgress(progress);
    }
    document.querySelectorAll(".option-btn").forEach((b) => (b.disabled = true));

    const feedback = document.getElementById("quiz-feedback");
    feedback.innerHTML = `
      <p class="${isCorrect ? "correct" : "incorrect"}">${isCorrect ? "Sahihi! \u2713 Correct! +5 XP" : `Sio sahihi. Jibu ni: <strong>${q.options[q.answer]}</strong>`}</p>
      <button class="primary-btn small" id="next-q">${index + 1 < quiz.length ? "Endelea \u2192" : "Maliza \u2192 Finish"}</button>
    `;
    document.getElementById("next-q").addEventListener("click", () => {
      index++;
      if (index >= quiz.length) {
        finishQuiz();
      } else {
        renderQuestion();
      }
    });
  }

  function finishQuiz() {
    const pct = Math.round((correct / quiz.length) * 100);
    const passed = pct >= 70;
    const alreadyDone = !!progress.completed[lesson.id];
    const badgesBefore = new Set(earnedBadges(progress).map((b) => b.id));

    if (passed && !alreadyDone) progress.xp = (progress.xp || 0) + 20;
    if (passed) progress.completed[lesson.id] = true;
    if (pct === 100) progress.perfectCount = (progress.perfectCount || 0) + 1;
    progress.scores[lesson.id] = pct;

    const badgesAfter = earnedBadges(progress);
    const newBadges = badgesAfter.filter((b) => !badgesBefore.has(b.id));
    progress.badgesSeen = badgesAfter.map((b) => b.id);
    saveProgress(progress);

    if (passed) celebrate();

    const idx = COURSE.findIndex((l) => l.id === lesson.id);
    const nextLesson = COURSE[idx + 1];
    const newBadgeHtml = newBadges.length ? `
      <div class="new-badge-banner">
        <span>Beji Mpya! / New badge${newBadges.length > 1 ? "s" : ""}:</span>
        ${newBadges.map((b) => `<span class="badge-chip earned"><span class="badge-icon">${b.icon}</span><span class="badge-label">${b.title}</span></span>`).join("")}
      </div>` : "";

    root.querySelector(".main-panel").innerHTML = `
      <div class="result-wrap">
        <div class="result-mascot">${mascotSvg(passed ? "big" : "sad")}</div>
        <p class="eyebrow">${lesson.title} \u00b7 Matokeo</p>
        <h1 class="result-score">${pct}%</h1>
        <p class="result-msg">${passed ? "Hongera! Umepita sura hii." : "Karibu! Jaribu tena ili kupita (70%+)."}</p>
        ${passed ? `<p class="result-xp">+${!alreadyDone ? 20 : 0} XP ya ziada kwa kumaliza sura \u00b7 Jumla: ${progress.xp} XP</p>` : ""}
        ${newBadgeHtml}
        <div class="kanga-card">
          <div class="kanga-border"></div>
          <p class="kanga-sw">${lesson.title} \u2014 ${lesson.subtitle}</p>
          <p class="kanga-en">${lesson.note}</p>
          <div class="kanga-border"></div>
        </div>
        <div class="result-actions">
          <a class="ghost-btn" href="#quiz/${lesson.id}">Jaribu Tena / Retry</a>
          ${nextLesson ? `<a class="primary-btn small" href="#lesson/${nextLesson.id}">Sura Ifuatayo \u2192</a>` : `<a class="primary-btn small" href="#home">Sura Zote \u2192</a>`}
        </div>
      </div>
    `;
  }

  shell("", "home");
  renderQuestion();
}
