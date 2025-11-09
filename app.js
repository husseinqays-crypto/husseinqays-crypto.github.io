// === عناصر DOM ===
const $ = (s) => document.querySelector(s);
const listEl  = $("#exams");
const emptyEl = $("#empty");

let exams = [];

// قراءة بارامتر الفرع ?b=mansour
const params = new URLSearchParams(location.search);
const branchSlug = params.get("b");
const branch = getBranchBySlug(branchSlug);

// تحديث عنوان الصفحة حسب الفرع
const titleEl = $("#branchTitle");
const noteEl  = $("#branchNote");
if (titleEl) titleEl.textContent = branch ? `امتحانات — ${branch.label}` : "امتحانات";
if (noteEl && branch?.note) noteEl.textContent = branch.note;

// زر التحديث
const reloadBtn = $("#reloadBtn");
if (reloadBtn) reloadBtn.addEventListener("click", () => load());

// --------- أدوات التاريخ ---------

/**
 * يقبل صيغ مثل:
 *  "14-11-2025" أو "14-11-2025 الجمعة" أو "14-11-2025  Friday"
 * يعيد كائن Date صحيحًا أو null.
 */
function parseDmy(dateStr) {
  if (!dateStr || typeof dateStr !== "string") return null;
  // التقط dd-mm-yyyy في بداية السلسلة، وتجاهل أي نص لاحق (اسم اليوم مثلاً)
  const m = dateStr.trim().match(/^(\d{1,2})-(\d{1,2})-(\d{4})/);
  if (!m) return null;
  const d = parseInt(m[1], 10);
  const mo = parseInt(m[2], 10);
  const y = parseInt(m[3], 10);
  const jsDate = new Date(y, mo - 1, d);
  // تحقّق من صحة التاريخ (مثلاً 31-02 غير صالح)
  if (jsDate.getFullYear() !== y || (jsDate.getMonth()+1) !== mo || jsDate.getDate() !== d) return null;
  return jsDate;
}

/** يولّد اسم اليوم بالعربية من تاريخ JS صالح */
function weekdayAr(dateObj){
  try {
    return dateObj.toLocaleDateString("ar-SA", { weekday: "long" });
  } catch {
    return "";
  }
}

// --------- الجلب والعرض ---------

// جلب البيانات ثم العرض
async function load() {
  // تحقق من وجود الفرع
  if (!branch) {
    listEl.innerHTML = `<li class="error">لم يتم تحديد فرع صحيح في الرابط. ارجع للصفحة الرئيسية واختر فرعًا.</li>`;
    emptyEl.hidden = true;
    return;
  }

  try {
    // مسار ملف JSON الخاص بالفرع
    const url = `./data/${branch.slug}/exams.json?v=${Date.now()}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    if (!Array.isArray(data)) throw new Error("صيغة JSON غير صحيحة: نتوقع مصفوفة");

    exams = data;
    render(exams);
  } catch (e) {
    listEl.innerHTML = `<li class="error">تعذر تحميل البيانات: ${e.message}</li>`;
    emptyEl.hidden = true;
    console.error(e);
  }
}

// عرض البطاقات
function render(items) {
  listEl.innerHTML = items.map((ex) => {
    const title   = ex?.title ?? "—";
    const rawDate = ex?.date ?? "";            // قد تكون "14-11-2025 الجمعة"
    const parsed  = parseDmy(rawDate);         // نحاول استخراج dd-mm-yyyy
    const dayName = parsed ? weekdayAr(parsed) : ""; // اسم اليوم إن أمكن

    const dateText = parsed
      ? `${dayName} ${parsed.toLocaleDateString("ar-SA")}` // ١٤‏/٠١‏/٢٠٢٥ مثلاً
      : rawDate || "—"; // إن لم نستطع التحويل، نعرض النص الأصلي

    const start   = ex?.start_time ?? ex?.time ?? "—";
    const end     = ex?.end_time ? ` – ${ex.end_time}` : "";
    const loc     = ex?.location ?? "—";
    const grade   = ex?.grade ?? "—";
    const desc    = ex?.description ?? "";
    const notes   = ex?.notes ?? "";
    const moreURL = ex?.more_info_url ?? "";
    const fromLec = ex?.lecture_from ?? null;
    const toLec   = ex?.lecture_to ?? null;

    return `
      <li class="card">
        <h3>${title}</h3>
        <div class="meta">
          <span class="badge">🆔 رقم الامتحان: ${ex?.exam_number ?? "—"}</span>
          <span class="badge">📅 ${dateText}</span>
          <span class="badge">⏰ ${start}${end}</span>
          <span class="badge">📍 ${loc}</span>
          <span class="badge">🎓 ${grade}</span>
          ${fromLec && toLec ? `<span class="badge">📖 من المحاضرة ${fromLec} إلى ${toLec}</span>` : ""}
        </div>
        ${desc ? `<p>${desc}</p>` : ""}
        ${notes ? `<p class="notes">ملاحظات: ${notes}</p>` : ""}
        ${moreURL ? `<p><a href="${moreURL}" target="_blank" rel="noopener">تفاصيل إضافية</a></p>` : ""}
      </li>
    `;
  }).join("");

  emptyEl.hidden = items.length !== 0;
}

// تشغيل
if (listEl) {
  load();
}
