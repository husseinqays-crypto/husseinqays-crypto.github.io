// app.js (نسخة آمنة محسّنة)
const $ = (sel) => document.querySelector(sel);
const listEl  = $("#exams");
const emptyEl = $("#empty");
const qEl     = $("#q");
const fromEl  = $("#from");
const toEl    = $("#to");
const gradeEl = $("#grade");
const clearBtn = $("#clear"); // قد يكون غير موجود

let exams = [];

// تحويل تاريخ/وقت إلى سلسلة قابلة للفرز مثل 2025-12-15T09:00
const toSortKey = (ex) => {
  const d = ex?.date ?? "";
  const t = (ex?.time ?? "00:00").padStart(5, "0");
  return `${d}T${t}`;
};

function render(items) {
  listEl.innerHTML = items.map((ex) => {
    const title   = ex?.title ?? "—";
    const date    = ex?.date ?? "—";
    const time    = ex?.time ?? "—";
    const dur     = ex?.duration_minutes ?? 0;
    const loc     = ex?.location ?? "—";
    const grade   = ex?.grade ?? "—";
    const desc    = ex?.description ?? "";
    const notes   = ex?.notes ?? "";
    const moreURL = ex?.more_info_url ?? "";

    return `
      <li class="card">
        <h3>${title}</h3>
        <div class="meta">
          <span class="badge">📅 ${date}</span>
          <span class="badge">⏰ ${time}</span>
          <span class="badge">⌛ ${dur} دقيقة</span>
          <span class="badge">📍 ${loc}</span>
          <span class="badge">🎓 ${grade}</span>
        </div>
        <p>${desc}</p>
        ${notes ? `<p class="notes">ملاحظات: ${notes}</p>` : ""}
        ${moreURL ? `<p><a href="${moreURL}" target="_blank" rel="noopener">تفاصيل إضافية</a></p>` : ""}
      </li>
    `;
  }).join("");

  // إظهار/إخفاء رسالة "لا توجد نتائج"
  emptyEl.hidden = items.length !== 0;
}

function applyFilters() {
  const q      = (qEl.value || "").trim().toLowerCase();
  const from   = fromEl.value || null;
  const to     = toEl.value || null;
  const grade  = gradeEl.value || "";

  const filtered = exams.filter((ex) => {
    const hay = [
      ex?.title, ex?.description, ex?.notes, ex?.location, ex?.grade
    ].filter(Boolean).join(" ").toLowerCase();

    if (q && !hay.includes(q)) return false;
    if (from && (ex?.date ?? "") < from) return false;
    if (to && (ex?.date ?? "") > to) return false;
    if (grade && (ex?.grade ?? "") !== grade) return false;
    return true;
  }).sort((a, b) => toSortKey(a).localeCompare(toSortKey(b)));

  render(filtered);
}

function bind() {
  [qEl, fromEl, toEl, gradeEl].forEach((el) => {
    if (el) el.addEventListener("input", applyFilters);
  });

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (qEl) qEl.value = "";
      if (fromEl) fromEl.value = "";
      if (toEl) toEl.value = "";
      if (gradeEl) gradeEl.value = "";
      render(exams);
    });
  }
}

async function load() {
  try {
    // كسر الكاش + منع التخزين
    const res = await fetch(`./data/exams.json?v=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    if (!Array.isArray(data)) throw new Error("صيغة JSON غير صحيحة: نتوقع مصفوفة");

    exams = data;
    render(exams);
    bind();
  } catch (e) {
    listEl.innerHTML = `<li class="error">تعذر تحميل البيانات: ${e.message}</li>`;
    emptyEl.hidden = true; // أخفِ رسالة "لا توجد نتائج" بما أن لدينا رسالة خطأ
    console.error(e);
  }
}

load();
