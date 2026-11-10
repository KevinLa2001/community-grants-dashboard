const stages = ["Researching", "Eligible", "Drafting", "Ready for review", "Submitted", "Awarded", "Declined"];
const sourceFilter = document.querySelector("#source-filter");
const grantFilter = document.querySelector("#grant-filter");
const submissionFilter = document.querySelector("#submission-filter");
const search = document.querySelector("#search");
let grants = [];

function formatDue(value) {
  if (!value) return "Not published";
  if (value === "rolling") return "Rolling";
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.valueOf()) ? "Not published" : date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function render() {
  const needle = search.value.trim().toLowerCase();
  const visible = grants.filter(grant =>
    (!sourceFilter.value || grant.source === sourceFilter.value) &&
    (!grantFilter.value || grant.grantStatus === grantFilter.value) &&
    (!submissionFilter.value || grant.submissionStatus === submissionFilter.value) &&
    (!needle || `${grant.title} ${grant.description}`.toLowerCase().includes(needle))
  );
  const target = document.querySelector("#grant-list");
  target.replaceChildren();
  for (const grant of visible) {
    const row = document.querySelector("#row-template").content.cloneNode(true);
    const link = row.querySelector(".grant-link");
    link.href = grant.url; link.textContent = grant.title;
    row.querySelector(".description").textContent = grant.description || "See the official source for eligibility and application details.";
    row.querySelector(".source").textContent = grant.source;
    const grantState = row.querySelector(".grant-state");
    grantState.textContent = grant.grantStatus; grantState.classList.add(`state-${grant.grantStatus.toLowerCase().replaceAll(" ", "-")}`);
    row.querySelector(".due").textContent = formatDue(grant.dueDate);
    const submission = row.querySelector(".submission-state");
    submission.textContent = grant.submissionStatus; submission.classList.add(`state-${grant.submissionStatus.toLowerCase().replaceAll(" ", "-")}`);
    row.querySelector(".apply-link").href = grant.url;
    target.append(row);
  }
  document.querySelector("#empty").hidden = visible.length > 0;
}

function populate(data) {
  grants = data.grants;
  const sources = [...new Set(grants.map(grant => grant.source))].sort();
  sourceFilter.append(...sources.map(source => new Option(source, source)));
  submissionFilter.append(...stages.map(stage => new Option(stage, stage)));
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const nextMonth = new Date(today); nextMonth.setDate(today.getDate() + 30);
  document.querySelector("#open-count").textContent = grants.filter(grant => grant.grantStatus === "Open" || grant.grantStatus === "Rolling").length;
  document.querySelector("#due-count").textContent = grants.filter(grant => grant.dueDate && grant.dueDate !== "rolling" && new Date(`${grant.dueDate}T00:00:00`) >= today && new Date(`${grant.dueDate}T00:00:00`) <= nextMonth).length;
  document.querySelector("#submitted-count").textContent = grants.filter(grant => grant.submissionStatus === "Submitted").length;
  document.querySelector("#action-count").textContent = grants.filter(grant => ["Eligible", "Drafting", "Ready for review"].includes(grant.submissionStatus)).length;
  document.querySelector("#updated").textContent = `Last official-source check: ${new Date(data.generatedAt).toLocaleString()} (${data.grants.length} tracked opportunities)`;
  const sourceList = document.querySelector("#source-list");
  for (const source of data.sources) {
    const item = document.createElement("li");
    item.innerHTML = `<a href="${source.url}" target="_blank" rel="noreferrer">${source.name}</a><small>Last checked: ${new Date(source.lastChecked).toLocaleString()} · ${source.health}</small>`;
    sourceList.append(item);
  }
  render();
}

[sourceFilter, grantFilter, submissionFilter, search].forEach(input => input.addEventListener("input", render));
fetch("data/grants.json", { cache: "no-store" }).then(response => response.json()).then(populate).catch(() => {
  document.querySelector("#updated").textContent = "Grant data could not be loaded. Please try again.";
});
