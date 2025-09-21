// ======= SUPPORT OVERLAY =======
const supportBtn = document.getElementById('supportBtn');
const supportCard = document.getElementById('supportCard');
const supportClose = document.getElementById('supportClose');

supportBtn?.addEventListener('click', () => {
    supportCard.classList.remove('hidden');
});

supportClose?.addEventListener('click', () => {
    supportCard.classList.add('hidden');
});

// Each support option already has data-tab-jump="home"
supportCard.querySelectorAll('[data-tab-jump]').forEach(btn => {
    btn.addEventListener('click', () => {
        showTab('home');            // reuse your existing tab function
        supportCard.classList.add('hidden');
    });
});