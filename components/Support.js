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

// Auto-close overlay when a support link is clicked
supportCard.querySelectorAll('[data-support-link]').forEach(link => {
    link.addEventListener('click', () => {
        showTab('home');            // switch back to Welcome tab
        supportCard.classList.add('hidden'); // hide overlay
    });
});
