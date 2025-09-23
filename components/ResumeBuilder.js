const modal = document.getElementById("resumeModal");
const buildBtn = document.getElementById("buildResumeBtn");
const refineBtn = document.getElementById("refineResumeBtn");
const closeBtn = document.getElementById("closeModal");
const buildMode = document.getElementById("buildMode");
const refineMode = document.getElementById("refineMode");

buildBtn.addEventListener("click", () => {
    modal.classList.remove("hidden");
    buildMode.classList.remove("hidden");
    refineMode.classList.add("hidden");
});

refineBtn.addEventListener("click", () => {
    modal.classList.remove("hidden");
    refineMode.classList.remove("hidden");
    buildMode.classList.add("hidden");
});

closeBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
});

// Placeholder handlers for generate/analyze/save
document.getElementById("generateResume").addEventListener("click", () => {
    alert("Resume generated and ready for PDF export.");
});

document.getElementById("analyzeResume").addEventListener("click", () => {
    document.getElementById("refineResults").classList.remove("hidden");
});

document.getElementById("saveRefined").addEventListener("click", () => {
    alert("Refined resume saved as PDF.");
});