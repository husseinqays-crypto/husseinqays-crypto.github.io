const $ = (sel) => document.querySelector(sel);
const listEl = $("#exams");
const emptyEl = $("#empty");
const qEl = $("#q"), fromEl = $("#from"), toEl = $("#to"), gradeEl = $("#grade");
const clearBtn = $("#clear");

let exams = [];

async function load() {
  try {
    const res = await fetch("./data/exams.json", { cache: "no-store" });
    if (!res.ok) throw new Error("خطأ في تحميل البيانات");
    exams = await res.json();
    render(exams);
    bind();
  } catch (e) {
    listEl.innerHTML = `<li class="error">تعذر تحميل البيانات: ${e.message}</li>`;
  }
}

function bind() {
  [qEl, fromEl, toEl, gradeEl].forEach(el => el.addEventListener("input", applyFilters));
  clearBtn.addEventListener("click", () => {
    qEl.value = ""; fromEl.value = ""; toEl.value = ""; gradeEl.value = "";
    render(exams);
  });
}

function applyFilters() {
  const q = qEl.value.trim().toLowerCase();
  const from = fromEl.value;
  const to = toEl.value;
  const grade = gradeEl.value;

  const filtered = exams.filter(ex => {
    const hay = (ex.title + " " + ex.description + " " + (ex.notes||"")).toLowerCase();
    if (q && !hay.includes(q)) return false;
    if (from && ex.date < from) return false;
    if (to && ex.date > to) return false;
    if (grade && ex.grade !== grade) return false;
    return true;
  }).sort((a,b) => (a.date+a.time).localeCompare(b.date+b.time));

  render(filtered);
}

function render(items) {
  listEl.innerHTML = items.map(ex => `
    <li class="card">
      <h3>${ex.title}</h3>
      <div class="meta">
        <span class="badge">📅 ${ex.date}</span>
        <span class="badge">⏰ ${ex.time || "—"}</span>
        <span class="badge">⌛ ${ex.duration_minutes} دقيقة</span>
        <span class="badge">📍 ${ex.location}</span>
        <span class="badge">🎓 ${ex.grade}</span>
      </div>
      <p>${ex.description}</p>
      ${ex.notes ? `<p class="notes">ملاحظات: ${ex.notes}</p>` : ""}
      ${ex.more_info_url ? `<p><a href="${ex.more_info_url}" target="_blank" rel="noopener">تفاصيل إضافية</a></p>` : ""}
    </li>
  `).join("");

  emptyEl.hidden = items.length !== 0;
}

load();
