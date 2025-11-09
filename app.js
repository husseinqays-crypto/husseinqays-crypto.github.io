function render(items) {
  listEl.innerHTML = items.map((ex) => {
    const title   = ex?.title ?? "—";
    const date    = ex?.date ?? "—";
    const start   = ex?.start_time ?? ex?.time ?? "—";
    const end     = ex?.end_time ?? "";
    const dur     = ex?.duration_minutes ?? 0;
    const loc     = ex?.location ?? "—";
    const grade   = ex?.grade ?? "—";
    const desc    = ex?.description ?? "";
    const notes   = ex?.notes ?? "";
    const moreURL = ex?.more_info_url ?? "";
    const fromLec = ex?.lecture_from ?? null;
    const toLec   = ex?.lecture_to ?? null;

    // تحويل التاريخ إلى اسم اليوم بالعربية
    const dayName = date !== "—" 
      ? new Date(date).toLocaleDateString("ar-SA", { weekday: "long" }) 
      : "—";

    return `
      <li class="card">
        <h3>${title}</h3>
        <div class="meta">
          <span class="badge">📅 ${dayName} ${date}</span>
          <span class="badge">⏰ ${start}${end ? " – " + end : ""}</span>
          <span class="badge">⌛ ${dur} دقيقة</span>
          <span class="badge">📍 ${loc}</span>
          <span class="badge">🎓 ${grade}</span>
          ${
            fromLec && toLec
              ? `<span class="badge">📖 من الوحدة ${fromLec} إلى ${toLec}</span>`
              : ""
          }
        </div>
        <p>${desc}</p>
        ${notes ? `<p class="notes">ملاحظات: ${notes}</p>` : ""}
        ${
          moreURL
            ? `<p><a href="${moreURL}" target="_blank" rel="noopener">تفاصيل إضافية</a></p>`
            : ""
        }
      </li>
    `;
  }).join("");

  emptyEl.hidden = items.length !== 0;
}
