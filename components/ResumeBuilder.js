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


    const API_BASE = 'http://localhost:5055';

    // Utility: download a Blob as file
    async function downloadBlobAsFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), {href: url, download: filename });
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // Build ? gather fields ? optional GPT fill ? PDF
  document.getElementById("generateResume").addEventListener("click", async () => {
    const form = document.getElementById("resumeForm");
    const candidate = {
        name: form.querySelector('input[placeholder="Full Name"]').value.trim(),
    title: '', // optional field: add another input if you like
    contact: {
        email: form.querySelector('input[placeholder="Email"]').value.trim(),
    phone: form.querySelector('input[placeholder="Phone"]').value.trim(),
    location: '', links: []
      },
    summary: form.querySelector('textarea[placeholder="Professional Summary"]').value.trim(),
    // For MVP, treat textareas as raw text; GPT will structure them w/ bullets.
    experience: [{company: '', role: '', start: '', end: '', bullets: [ form.querySelector('textarea[placeholder="Work Experience"]').value.trim() ] }],
    education: [{school: '', degree: '', start: '', end: '', details: form.querySelector('textarea[placeholder="Education"]').value.trim() }],
      skills: form.querySelector('textarea[placeholder="Skills"]').value.split(',').map(s=>s.trim()).filter(Boolean),
    certs: [], projects: []
    };

    const body = JSON.stringify({candidate, style: 'minimal', useGPT: true });
    const resp = await fetch(`${API_BASE}/api/resume/build`, {
        method: 'POST', headers: {'Content-Type': 'application/json' }, body
    });
    if (!resp.ok) return alert('Failed to generate PDF.');
    const blob = await resp.blob();
    await downloadBlobAsFile(blob, `${candidate.name.replace(/\s+/g, '_')}_Resume.pdf`);
  });

  // Refine ? upload existing PDF ? GPT ? show suggestions ? allow PDF export
  document.getElementById("analyzeResume").addEventListener("click", async () => {
    const fileInput = document.querySelector('#uploadForm input[type="file"]');
    if (!fileInput.files[0]) return alert('Please choose a PDF first.');
    const fd = new FormData(); fd.append('file', fileInput.files[0]);

    const resp = await fetch(`${API_BASE}/api/resume/refine`, {method: 'POST', body: fd });
    if (!resp.ok) return alert('Failed to analyze.');
    const data = await resp.json(); // {improved:{...}, suggestions:[...] }

    // Render results into refineResults area
    const box = document.getElementById('refineResults');
    box.classList.remove('hidden');
    box.innerHTML = `
    <h4 class="text-md font-semibold mb-2">Refinements</h4>
    <ul class="list-disc pl-6 text-neutral-200 text-sm">
        ${(data.suggestions || []).map(s => `<li>${s}</li>`).join('')}
    </ul>
    <textarea id="structuredJson" class="w-full h-48 mt-4 px-3 py-2 rounded bg-neutral-800 border border-neutral-700"
        placeholder="Edited structured JSON">${JSON.stringify(data.improved, null, 2)}</textarea>
    <div class="mt-3 flex gap-2">
        <select id="tpl" class="px-3 py-2 rounded bg-neutral-800 border border-neutral-700">
            <option value="minimal">Minimal</option>
            <option value="two-column">Two Column</option>
        </select>
        <button id="saveRefined" class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white">
            Save Refined Resume (PDF)
        </button>
    </div>
    `;

    // Attach click after injecting DOM
    document.getElementById("saveRefined").addEventListener("click", async () => {
        let structured;
    try {structured = JSON.parse(document.getElementById('structuredJson').value); }
    catch { return alert('Edited JSON is invalid.'); }
    const style = document.getElementById('tpl').value;
    const resp2 = await fetch(`${API_BASE}/api/resume/build-from-structured`, {
        method: 'POST',
    headers: {'Content-Type': 'application/json' },
    body: JSON.stringify({structured, style})
      });
    if (!resp2.ok) return alert('PDF generation failed.');
    const blob = await resp2.blob();
    await downloadBlobAsFile(blob, `${(structured.name || 'Refined_Resume').replace(/\s+/g, '_')}.pdf`);
    });
  });

