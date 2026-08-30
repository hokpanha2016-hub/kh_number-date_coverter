/* =========================================================
   NUMBER → KHMER WORDS
   ========================================================= */

const ones = [
  "",
  "មួយ",
  "ពីរ",
  "បី",
  "បួន",
  "ប្រាំ",
  "ប្រាំមួយ",
  "ប្រាំពីរ",
  "ប្រាំបី",
  "ប្រាំបួន",
];

const tens = [
  "",
  "",
  "ម្ភៃ",
  "សាមសិប",
  "សែសិប",
  "ហាសិប",
  "ហុកសិប",
  "ចិតសិប",
  "ប៉ែតសិប",
  "កៅសិប",
];

const scales = [
  "",
  "ពាន់",
  "លាន",
  "ពាន់លាន",
  "លានលាន",
  "ពាន់លានលាន",
  "លានលានលាន",
];

function khmerBelow100(n) {
  if (n === 0) return "";

  if (n < 10) {
    return ones[n];
  }

  if (n < 20) {
    return n === 10 ? "ដប់" : "ដប់" + ones[n - 10];
  }

  const t = Math.floor(n / 10);
  const r = n % 10;

  return tens[t] + (r ? ones[r] : "");
}

function khmerBelow1000(n) {
  if (n === 0) return "";

  const h = Math.floor(n / 100);
  const r = n % 100;

  let s = h ? ones[h] + "រយ" : "";

  if (r) {
    s += khmerBelow100(r);
  }

  return s;
}

function numberToKhmer(value) {
  value = String(value).replace(/,/g, "").trim();

  if (!/^\d+$/.test(value)) {
    return "";
  }

  value = value.replace(/^0+(?=\d)/, "");

  if (value === "0") {
    return "សូន្យ";
  }

  if (value.length > 21) {
    return "លេខធំពេកសម្រាប់កម្មវិធីនេះ";
  }

  const groups = [];

  for (let i = value.length; i > 0; i -= 3) {
    groups.unshift(value.slice(Math.max(0, i - 3), i));
  }

  const parts = [];
  const groupCount = groups.length;

  groups.forEach((g, idx) => {
    const n = parseInt(g, 10);

    if (!n) return;

    const scaleIndex = groupCount - 1 - idx;

    let text = khmerBelow1000(n);

    if (scaleIndex > 0) {
      text += scales[scaleIndex] || "ថ្នាក់" + scaleIndex;
    }

    parts.push(text);
  });

  return parts.join("");
}

/* =========================================================
   NUMBER INPUT NORMALIZER
   គាំទ្រលេខសកល + លេខខ្មែរ + comma + space
   ========================================================= */

function normalizeNumberInput(value) {
  if (value == null) return "";

  const khmerDigits = "០១២៣៤៥៦៧៨៩";
  const arabicDigits = "0123456789";

  return String(value)
    .replace(/[០-៩]/g, (ch) => arabicDigits[khmerDigits.indexOf(ch)])
    .replace(/[，,\s]/g, "")
    .replace(/[^\d]/g, "");
}

/* =========================================================
   OUTPUT ELEMENTS
   ========================================================= */

const numberInput = document.getElementById("numberInput");
const numberOutput = document.getElementById("numberOutput");

/* =========================================================
   NUMBER INPUT
   ========================================================= */

numberInput.addEventListener("input", () => {
  const raw = numberInput.value.trim();

  if (!raw) {
    numberOutput.textContent = "លទ្ធផលនឹងបង្ហាញនៅទីនេះ";

    numberOutput.classList.remove("has-result");

    updateRielOutput("");

    return;
  }

  const clean = normalizeNumberInput(raw);

  if (!clean) {
    numberOutput.textContent = "សូមបញ្ចូលជាលេខ";

    numberOutput.classList.remove("has-result");

    updateRielOutput("");

    return;
  }

  const n = Number(clean);

  if (!Number.isSafeInteger(n) || n < 0 || n > 999999999999) {
    numberOutput.textContent = "សូមបញ្ចូលលេខ 0 ដល់ 999,999,999,999";

    numberOutput.classList.remove("has-result");

    updateRielOutput("");

    return;
  }

  const words = numberToKhmer(n);

  numberOutput.textContent = words;

  numberOutput.classList.add("has-result");

  updateRielOutput(words);
});

/* =========================================================
   RIEL OUTPUT
   ========================================================= */

let rielOutput = null;
let rielCopyStatus = null;
let rielCopyButton = null;

function initRielOutput() {
  const existing = document.getElementById("rielOutput");

  if (existing) {
    rielOutput = existing;

    rielCopyButton =
      existing.closest(".output-row")?.querySelector(".copy-icon") || null;

    rielCopyStatus = document.getElementById("copyRielStatus");

    if (rielCopyButton && !rielCopyButton.dataset.rielBound) {
      rielCopyButton.dataset.rielBound = "true";

      rielCopyButton.addEventListener("click", () =>
        copyText("rielOutput", "copyRielStatus", rielCopyButton),
      );
    }

    return;
  }

  const row = document.createElement("div");

  row.className = "output-row riel-output-row";

  rielOutput = document.createElement("div");

  rielOutput.id = "rielOutput";
  rielOutput.className = "output riel-output";

  rielOutput.textContent = "លទ្ធផលជារៀលគត់នឹងបង្ហាញនៅទីនេះ";

  rielCopyButton = document.createElement("button");

  rielCopyButton.className = "copy-icon";
  rielCopyButton.type = "button";
  rielCopyButton.title = "Copy រៀលគត់";
  rielCopyButton.setAttribute("aria-label", "Copy រៀលគត់");

  rielCopyButton.innerHTML = '<i class="fi fi-dr-copy"></i>';

  rielCopyStatus = document.createElement("span");

  rielCopyStatus.className = "status";
  rielCopyStatus.id = "copyRielStatus";

  row.appendChild(rielOutput);
  row.appendChild(rielCopyButton);

  const numberRow = numberOutput.closest(".output-row");

  if (numberRow) {
    numberRow.insertAdjacentElement("afterend", row);

    row.insertAdjacentElement("afterend", rielCopyStatus);
  } else {
    numberOutput.insertAdjacentElement("afterend", row);

    row.insertAdjacentElement("afterend", rielCopyStatus);
  }

  rielCopyButton.addEventListener("click", () =>
    copyText("rielOutput", "copyRielStatus", rielCopyButton),
  );
}

function updateRielOutput(words) {
  if (!rielOutput) {
    initRielOutput();
  }

  if (!rielOutput) return;

  const value = String(words || "").trim();

  if (value) {
    rielOutput.textContent = `${value}រៀលគត់`;

    rielOutput.classList.add("has-result");
  } else {
    rielOutput.textContent = "លទ្ធផលជារៀលគត់នឹងបង្ហាញនៅទីនេះ";

    rielOutput.classList.remove("has-result");
  }
}

initRielOutput();

/* =========================================================
   PASTE SUPPORT
   ========================================================= */

numberInput.addEventListener("paste", () => {
  setTimeout(() => {
    numberInput.dispatchEvent(
      new Event("input", {
        bubbles: true,
      }),
    );
  }, 0);
});

/* =========================================================
   DATE / CUSTOM CALENDAR
   ========================================================= */

const khDays = [
  "ចន្ទ",
  "អង្គារ",
  "ពុធ",
  "ព្រហស្បតិ៍",
  "សុក្រ",
  "សៅរ៍",
  "អាទិត្យ",
];

const khMonths = [
  "មករា",
  "កុម្ភៈ",
  "មីនា",
  "មេសា",
  "ឧសភា",
  "មិថុនា",
  "កក្កដា",
  "សីហា",
  "កញ្ញា",
  "តុលា",
  "វិច្ឆិកា",
  "ធ្នូ",
];

const khMonthShort = [
  "មករា",
  "កុម្ភៈ",
  "មីនា",
  "មេសា",
  "ឧសភា",
  "មិថុនា",
  "កក្កដា",
  "សីហា",
  "កញ្ញា",
  "តុលា",
  "វិច្ឆិកា",
  "ធ្នូ",
];

let calendarDate = new Date();
let selectedDate = null;

/* =========================================================
   HOLIDAYS
   ========================================================= */

const holidays = {
  "2026-01-01": "ចូលឆ្នាំសកល",
  "2026-01-07": "ទិវាជ័យជម្នះ ៧ មករា",
  "2026-03-08": "ទិវានារីអន្តរជាតិ",

  "2026-04-14": "ចូលឆ្នាំខ្មែរ",
  "2026-04-15": "ចូលឆ្នាំខ្មែរ",
  "2026-04-16": "ចូលឆ្នាំខ្មែរ",

  "2026-05-01": "ទិវាពលកម្មអន្តរជាតិ",
  "2026-05-05": "ពិសាខបូជា",
  "2026-06-18": "ព្រះរាជពិធីចម្រើនព្រះជន្ម",

  "2026-09-24": "ទិវារដ្ឋធម្មនុញ្ញ",

  "2026-10-15": "ព្រះរាជពិធីបុណ្យភ្ជុំបិណ្ឌ",
  "2026-10-16": "ព្រះរាជពិធីបុណ្យភ្ជុំបិណ្ឌ",
  "2026-10-17": "ព្រះរាជពិធីបុណ្យភ្ជុំបិណ្ឌ",

  "2026-11-09": "បុណ្យឯករាជ្យជាតិ",

  "2026-11-23": "ព្រះរាជពិធីបុណ្យអុំទូក",
  "2026-11-24": "ព្រះរាជពិធីបុណ្យអុំទូក",
  "2026-11-25": "ព្រះរាជពិធីបុណ្យអុំទូក",
};

/* =========================================================
   DATE HELPERS
   ========================================================= */

function pad2(n) {
  return String(n).padStart(2, "0");
}

function formatKhmerDateDay(n) {
  return toKhmerDigits(String(n).padStart(2, "0"));
}

function toISODate(y, m, d) {
  return `${y}-${pad2(m + 1)}-${pad2(d)}`;
}

function parseISO(v) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) {
    return null;
  }

  const [y, m, d] = v.split("-").map(Number);

  const dt = new Date(y, m - 1, d, 12, 0, 0);

  if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) {
    return null;
  }

  return {
    d,
    mo: m,
    y,
    dt,
  };
}

function toKhmerDigits(s) {
  return String(s).replace(/\d/g, (d) => "០១២៣៤៥៦៧៨៩"[d]);
}

/* =========================================================
   RENDER CALENDAR
   ========================================================= */

function renderCalendar() {
  const y = calendarDate.getFullYear();
  const m = calendarDate.getMonth();

  document.getElementById("calTitle").textContent =
    `${khMonths[m]} ${toKhmerDigits(y)}`;

  const grid = document.getElementById("calGrid");

  grid.innerHTML = "";

  // Monday-first calendar
  const first = (new Date(y, m, 1).getDay() + 6) % 7;

  const daysInMonth = new Date(y, m + 1, 0).getDate();

  const prevDays = new Date(y, m, 0).getDate();

  const today = new Date();

  const todayISO = toISODate(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  for (let i = 0; i < 42; i++) {
    const cell = document.createElement("button");

    cell.type = "button";
    cell.className = "cal-day";

    let day;
    let cm = m;
    let cy = y;

    if (i < first) {
      day = prevDays - first + i + 1;

      cm = m - 1;

      if (cm < 0) {
        cm = 11;
        cy = y - 1;
      }

      cell.classList.add("muted");
    } else if (i >= first + daysInMonth) {
      day = i - (first + daysInMonth) + 1;

      cm = m + 1;

      if (cm > 11) {
        cm = 0;
        cy = y + 1;
      }

      cell.classList.add("muted");
    } else {
      day = i - first + 1;
    }

    const iso = toISODate(cy, cm, day);

    const dow = new Date(cy, cm, day, 12, 0, 0).getDay();

    if (dow === 0) {
      cell.classList.add("sunday");
    }

    if (holidays[iso]) {
      cell.classList.add("holiday");
      cell.title = holidays[iso];
    }

    if (iso === todayISO) {
      cell.classList.add("today");
    }

    if (selectedDate === iso) {
      cell.classList.add("selected");
    }

    cell.textContent = toKhmerDigits(day);

    cell.onclick = () => selectDate(iso);

    grid.appendChild(cell);
  }
}

/* =========================================================
   OPEN / CLOSE CALENDAR
   ========================================================= */

function openCalendar() {
  const popup = document.getElementById("calendarPopup");

  const display = document.getElementById("dateDisplay");

  popup.classList.add("show");

  display.classList.add("open");

  display.setAttribute("aria-expanded", "true");

  renderCalendar();
}

function closeCalendar() {
  const popup = document.getElementById("calendarPopup");

  const display = document.getElementById("dateDisplay");

  popup.classList.remove("show");

  display.classList.remove("open");

  display.setAttribute("aria-expanded", "false");
}

/* =========================================================
   CHANGE CALENDAR MONTH
   ========================================================= */

function changeCalendarMonth(delta) {
  calendarDate.setMonth(calendarDate.getMonth() + delta);

  renderCalendar();
}

/* =========================================================
   SELECT DATE
   ========================================================= */

function selectDate(iso) {
  const x = parseISO(iso);

  if (!x) return;

  selectedDate = iso;

  calendarDate = new Date(x.y, x.mo - 1, 1, 12, 0, 0);

  document.getElementById("dateInput").value = iso;

  const val = document.getElementById("dateValue");

  val.textContent = `${formatKhmerDateDay(x.d)} ${khMonths[x.mo - 1]} ${toKhmerDigits(x.y)}`;

  val.classList.remove("date-placeholder");

  closeCalendar();

  renderCalendar();

  // Convert immediately
  showSolar();
  showLunar();
}

/* =========================================================
   SELECT TODAY
   ========================================================= */

function selectToday() {
  const now = new Date();

  selectDate(toISODate(now.getFullYear(), now.getMonth(), now.getDate()));
}

/* =========================================================
   PARSE SELECTED DATE
   ========================================================= */

function parseDate() {
  return parseISO(document.getElementById("dateInput").value.trim());
}

/* =========================================================
   DATE DISPLAY EVENTS
   ========================================================= */

document.getElementById("dateDisplay").addEventListener("click", openCalendar);

document.getElementById("dateDisplay").addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    openCalendar();
  }
});

/* =========================================================
   CLOSE CALENDAR WHEN CLICKING OUTSIDE
   ========================================================= */

document.addEventListener("click", (e) => {
  const picker = document.getElementById("datePicker");

  if (!picker.contains(e.target)) {
    closeCalendar();
  }
});

/* =========================================================
   SOLAR OUTPUT
   ========================================================= */

function showSolar() {
  const x = parseDate();

  const out = document.getElementById("solarOutput");

  if (!x) {
    out.textContent = "សូមជ្រើសរើសកាលបរិច្ឆេទត្រឹមត្រូវ";

    out.classList.remove("has-result");

    return;
  }

  out.textContent = `ថ្ងៃទី${formatKhmerDateDay(x.d)} ខែ${khMonths[x.mo - 1]} ឆ្នាំ${toKhmerDigits(x.y)}`;

  out.classList.add("has-result");
}

/* =========================================================
   MOMENTKH
   ========================================================= */

let momentKHReady = null;

function loadMomentKH() {
  if (typeof momentkh !== "undefined") {
    return Promise.resolve(momentkh);
  }

  if (momentKHReady) {
    return momentKHReady;
  }

  momentKHReady = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-momentkh="3.0.3"]');

    if (existing) {
      existing.addEventListener(
        "load",
        () => {
          typeof momentkh !== "undefined"
            ? resolve(momentkh)
            : reject(new Error("MomentKH global not found."));
        },
        { once: true },
      );

      existing.addEventListener(
        "error",
        () => reject(new Error("MomentKH failed to load.")),
        { once: true },
      );

      return;
    }

    const script = document.createElement("script");

    script.src =
      "https://cdn.jsdelivr.net/gh/ThyrithSor/momentkh@3.0.3/momentkh.js";

    script.async = true;

    script.dataset.momentkh = "3.0.3";

    script.onload = () => {
      typeof momentkh !== "undefined"
        ? resolve(momentkh)
        : reject(new Error("MomentKH global not found."));
    };

    script.onerror = () => reject(new Error("MomentKH failed to load."));

    document.head.appendChild(script);
  });

  return momentKHReady;
}

/* =========================================================
   LUNAR OUTPUT
   ========================================================= */

async function showLunar() {
  const x = parseDate();

  const out = document.getElementById("lunarOutput");

  if (!x) {
    out.textContent = "សូមជ្រើសរើសកាលបរិច្ឆេទត្រឹមត្រូវ";

    out.classList.remove("has-result");

    return;
  }

  // Loading text stays light
  out.textContent = "កំពុងគណនាចន្ទគតិ…";

  out.classList.remove("has-result");

  try {
    const mk = await loadMomentKH();

    const result = mk.fromGregorian(x.y, x.mo, x.d, 0, 0, 0);

    out.textContent = mk.format(result, "ថ្ងៃW DN ខែm ឆ្នាំa e ព.ស b");

    // Final result becomes dark
    out.classList.add("has-result");
  } catch (err) {
    console.error("Khmer lunar conversion error:", err);

    out.textContent = "មិនអាចគណនាចន្ទគតិបាន។";

    out.classList.remove("has-result");
  }
}

/* =========================================================
   COPY FUNCTIONS
   ========================================================= */

async function copyText(outputId, statusId, button) {
  const output = document.getElementById(outputId);

  const text = output ? output.textContent.trim() : "";

  if (
    !text ||
    text.includes("នឹងបង្ហាញ") ||
    text.startsWith("សូមជ្រើសរើស") ||
    text.startsWith("មិនអាចគណនា") ||
    text.startsWith("កំពុងគណនា")
  ) {
    return;
  }

  let copied = false;

  try {
    await navigator.clipboard.writeText(text);

    copied = true;
  } catch (e) {
    try {
      const ta = document.createElement("textarea");

      ta.value = text;

      ta.setAttribute("readonly", "");

      ta.style.position = "fixed";

      ta.style.opacity = "0";

      document.body.appendChild(ta);

      ta.select();

      copied = document.execCommand("copy");

      ta.remove();
    } catch (fallbackError) {
      copied = false;
    }
  }

  if (!copied) return;

  const s = document.getElementById(statusId);

  if (s) {
    s.textContent = "បាន Copy ✓";
  }

  if (button) {
    button.classList.add("copied");

    const icon = button.querySelector("i");

    if (icon) {
      icon.className = "fi fi-br-check";
    }

    clearTimeout(button._copyResetTimer);

    button._copyResetTimer = setTimeout(() => {
      button.classList.remove("copied");

      if (icon) {
        icon.className = "fi fi-dr-copy";
      }
    }, 1200);
  }

  clearTimeout(s?._copyStatusTimer);

  if (s) {
    s._copyStatusTimer = setTimeout(() => {
      s.textContent = "";
    }, 1500);
  }
}

/* =========================================================
   INITIAL CALENDAR
   ========================================================= */

renderCalendar();
