// Script pour interactions (rubants, modal, menu)
document.addEventListener('DOMContentLoaded', function() {
  const showMenuBtn = document.getElementById('showMenu');
  const menuSection = document.getElementById('menuSection');
  const downloadBtn = document.getElementById('downloadMenu');
  const pdfFrame = document.getElementById('pdfFrame');

  // --- Menu interactions ---
  showMenuBtn && showMenuBtn.addEventListener('click', function() {
    menuSection && menuSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  downloadBtn && downloadBtn.addEventListener('click', function() {
    try {
      const key = 'menu_downloads';
      const count = parseInt(localStorage.getItem(key) || '0', 10) + 1;
      localStorage.setItem(key, String(count));
      const oldText = downloadBtn.textContent;
      downloadBtn.textContent = `Téléchargé (${count})`;
      setTimeout(()=> downloadBtn.textContent = oldText, 2000);
    } catch(e){ }
  });

  // --- Delivery ribbon & modal (appear each visit; closing kept only for session) ---
  const ribbon = document.getElementById('deliveryRibbon');
  const closeRibbon = document.getElementById('closeRibbon');
  const modal = document.getElementById('deliveryModal');
  const closeModal = document.getElementById('closeModal');
  const closeModalThisVisit = document.getElementById('closeModalThisVisit');

  const ribbonSessionKey = 'delivery_ribbon_closed_session';
  const modalSessionKey = 'delivery_modal_closed_session';

  // helper to set body padding based on ribbon height
  function updateBodyPaddingForRibbon() {
    if (ribbon && getComputedStyle(ribbon).display !== 'none') {
      document.body.style.paddingTop = ribbon.offsetHeight + 'px';
    } else {
      document.body.style.paddingTop = '';
    }
  }
  // update on load and on resize
  updateBodyPaddingForRibbon();
  window.addEventListener('resize', updateBodyPaddingForRibbon);

  // Show modal on each new session (if not closed during this session)
  if (!sessionStorage.getItem(modalSessionKey)) {
    setTimeout(()=> {
      if (modal) openModal();
    }, 700);
  }

  // If ribbon closed this session, hide it
  if (sessionStorage.getItem(ribbonSessionKey) === 'true') {
    ribbon && (ribbon.style.display = 'none');
    updateBodyPaddingForRibbon();
  }

  closeRibbon && closeRibbon.addEventListener('click', function() {
    if (ribbon) ribbon.style.display = 'none';
    sessionStorage.setItem(ribbonSessionKey, 'true'); // only for this session
    updateBodyPaddingForRibbon();
  });

  // Modal focus handling and trap
  let lastFocusedElement = null;
  function trapFocus(e) {
    if (!modal || modal.getAttribute('aria-hidden') === 'true') return;
    const focusable = modal.querySelectorAll('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])');
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length -1];
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    } else if (e.key === 'Escape') {
      closeModalHandler();
    }
  }

  function openModal() {
    if (!modal) return;
    lastFocusedElement = document.activeElement;
    modal.setAttribute('aria-hidden','false');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    // focus first focusable inside modal (prefer close button)
    const preferred = modal.querySelector('#closeModal');
    (preferred || modal.querySelector('[tabindex]') || modal).focus();

    document.addEventListener('keydown', trapFocus);
  }

  function closeModalHandler() {
    if (!modal) return;
    modal.setAttribute('aria-hidden','true');
    modal.style.display = 'none';
    document.body.style.overflow = '';
    document.removeEventListener('keydown', trapFocus);
    try { if (lastFocusedElement) lastFocusedElement.focus(); } catch(e){}
  }

  closeModal && closeModal.addEventListener('click', closeModalHandler);
  closeModalThisVisit && closeModalThisVisit.addEventListener('click', function() {
    try { sessionStorage.setItem(modalSessionKey, 'true'); } catch(e){}
    closeModalHandler();
  });

  // small pdf fallback helper text
  setTimeout(()=> {
    if (pdfFrame) {
      try {
        const doc = pdfFrame.contentDocument || pdfFrame.contentWindow.document;
        if (!doc || doc.body.childNodes.length === 0) {
          const container = document.getElementById('pdfContainer');
          const hint = document.createElement('p');
          hint.style.marginTop = '8px';
          hint.style.color = '#6b5a4a';
          hint.textContent = 'Si l’aperçu ne s’affiche pas, utilisez le bouton "Télécharger le menu".';
          container.appendChild(hint);
        }
      } catch(e){
        // cross-origin can block checking; ignore
      }
    }
  }, 1000);

});

/* === SLIDER MAISON DE L’INDE === */
.slider {
    position: relative;
    width: 100%;
    height: 420px;
    overflow: hidden;
    border-radius: 18px;
    margin: 25px auto;
    box-shadow: 0 25px 50px rgba(0,0,0,0.25);
    z-index: 1;
}

.slide {
    position: absolute;
    inset: 0;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    opacity: 0;
    transition: opacity 1.2s ease-in-out;
    filter: brightness(50%); /* 50% d’opacité visuelle */
}

.slide.active {
    opacity: 1;
}

/* Pour que le texte passe au-dessus du slider */
header, nav, .menu {
    position: relative;
    z-index: 2;
}

/* Responsive */
@media(max-width: 720px){
    .slider {
        height: 280px;
    }
}
