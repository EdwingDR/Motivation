const API_URL = 'https://type.fit/api/quotes';

// DOM
const views = document.querySelectorAll('.view');
const navButtons = document.querySelectorAll('nav button');
const quoteText = document.getElementById('quoteText');
const quoteAuthor = document.getElementById('quoteAuthor');
const shareBtn = document.getElementById('shareBtn');
const saveFavBtn = document.getElementById('saveFavBtn');
const newQuoteBtn = document.getElementById('newQuoteBtn');
const quotesList = document.getElementById('quotesList');
const searchInput = document.getElementById('searchInput');
const addBtn = document.getElementById('addBtn');
const quoteForm = document.getElementById('quoteForm');
const textInput = document.getElementById('text');
const authorInput = document.getElementById('author');
const cancelBtn = document.getElementById('cancelBtn');
const voiceBtn = document.getElementById('voiceBtn');
const installBtn = document.getElementById('installBtn');

const shareModal = document.getElementById('shareModal');
const closeShareModalBtn = document.getElementById('closeShareModal');

let quotesCache = [];
let currentQuote = null;
let editingId = null;

const STORAGE_KEY = 'motivaday_quotes';

function loadLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error(e);
    return [];
  }
}

function saveLocal(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function addLocal(quote) {
  const list = loadLocal();
  quote.id = Date.now().toString();
  list.unshift(quote);
  saveLocal(list);
  return quote;
}

function updateLocal(id, data) {
  const list = loadLocal();
  const idx = list.findIndex(q => q.id === id);
  if (idx > -1) {
    list[idx] = { ...list[idx], ...data };
    saveLocal(list);
    return true;
  }
  return false;
}

function deleteLocal(id) {
  const list = loadLocal().filter(q => q.id !== id);
  saveLocal(list);
}

function showView(id) {
  views.forEach(v => v.id === id ? v.classList.remove('hidden') : v.classList.add('hidden'));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

navButtons.forEach(b => b.addEventListener('click', () => showView(b.dataset.view)));
addBtn?.addEventListener('click', () => showView('addView'));

async function fetchQuotes() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    quotesCache = data.filter(q => q.text).map(q => ({ text: q.text, author: q.author || 'Desconocido' }));
  } catch (e) {
    console.warn('API no disponible — usando locales', e);
    quotesCache = [];
  }
}

function pickRandomQuote() {
  const localQuotes = loadLocal();
  const allQuotes = [...localQuotes, ...quotesCache];
  if (allQuotes.length > 0) {
    return allQuotes[Math.floor(Math.random() * allQuotes.length)];
  }
  return { text: 'Cree en ti mismo y todo será posible.', author: 'MotivaDay' };
}

async function showRandomQuote() {
  if (quotesCache.length === 0) await fetchQuotes();
  const q = pickRandomQuote();
  currentQuote = q;
  quoteText.textContent = q.text;
  quoteAuthor.textContent = q.author ? `— ${q.author}` : '';
  document.querySelector('#homeView').classList.remove('opacity-0');
}

saveFavBtn?.addEventListener('click', () => {
  if (!currentQuote) return;
  addLocal({ text: currentQuote.text, author: currentQuote.author || 'Desconocido', favorite: true });
  alert('Guardada en tus frases');
});

newQuoteBtn?.addEventListener('click', showRandomQuote);

function renderList(filter = '') {
  const list = loadLocal();
  const filtered = list.filter(item => (item.text + (item.author || '')).toLowerCase().includes(filter.toLowerCase()));
  quotesList.innerHTML = '';
  if (filtered.length === 0) {
    quotesList.innerHTML = '<li class="p-3 text-slate-500">No hay frases guardadas.</li>';
    return;
  }
  filtered.forEach(item => {
    const li = document.createElement('li');
    li.className = 'bg-white dark:bg-slate-800 p-3 rounded-xl flex justify-between items-start shadow';
    li.innerHTML = `
      <div>
        <div class="font-medium">${escapeHtml(item.text)}</div>
        <div class="text-xs text-slate-500 dark:text-slate-300 mt-2">${escapeHtml(item.author || '')}</div>
      </div>
      <div class="flex flex-col gap-2">
        <button class="edit text-sm text-indigo-600" data-id="${item.id}">Editar</button>
        <button class="del text-sm text-red-500" data-id="${item.id}">Eliminar</button>
      </div>
    `;
    quotesList.appendChild(li);
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"]+/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] || c));
}

quotesList.addEventListener('click', (e) => {
  const edit = e.target.closest('button.edit');
  const del = e.target.closest('button.del');
  if (edit) {
    const id = edit.dataset.id;
    startEdit(id);
  } else if (del) {
    const id = del.dataset.id;
    if (confirm('Eliminar frase?')) {
      deleteLocal(id);
      renderList(searchInput.value);
    }
  }
});

searchInput?.addEventListener('input', () => renderList(searchInput.value));

function startEdit(id) {
  const list = loadLocal();
  const item = list.find(i => i.id === id);
  if (!item) return;
  editingId = id;
  textInput.value = item.text;
  authorInput.value = item.author || '';
  showView('addView');
}

quoteForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = textInput.value.trim();
  const author = authorInput.value.trim() || 'Anónimo';
  if (!text) {
    alert('La frase no puede estar vacía');
    return;
  }
  if (editingId) {
    updateLocal(editingId, { text, author });
    editingId = null;
  } else {
    addLocal({ text, author });
  }
  quoteForm.reset();
  renderList();
  showView('listView');
});

cancelBtn.addEventListener('click', () => {
  quoteForm.reset();
  editingId = null;
  showView('listView');
});

voiceBtn?.addEventListener('click', () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert('Reconocimiento de voz no soportado en este navegador');
    return;
  }
  const recog = new SpeechRecognition();
  recog.lang = 'es-ES';
  recog.interimResults = false;
  recog.maxAlternatives = 1;
  recog.onresult = (ev) => {
    const text = ev.results[0][0].transcript;
    textInput.value = text;
  };
  recog.onerror = (ev) => alert('Error de reconocimiento: ' + ev.error);
  recog.start();
});

// PWA install prompt
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.style.display = 'inline-block';
});
installBtn.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const choice = await deferredPrompt.userChoice;
  deferredPrompt = null;
  installBtn.style.display = 'none';
});

// Service worker registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(() => console.log('SW registrado'))
      .catch(e => console.warn('SW falla', e));
  });
}

// --- NUEVO: Opciones ampliadas de compartir ---

// Abrir modal compartir
shareBtn.addEventListener('click', () => {
  shareModal.classList.remove('hidden');
});

// Cerrar modal
closeShareModalBtn.addEventListener('click', () => {
  shareModal.classList.add('hidden');
});

// Función para abrir url en nueva ventana
function openShareWindow(url) {
  window.open(url, '_blank', 'width=600,height=400');
}

// Manejar clicks en opciones de compartir
shareModal.querySelectorAll('.share-option').forEach(btn => {
  btn.addEventListener('click', () => {
    const platform = btn.dataset.platform;
    const text = encodeURIComponent(`${currentQuote.text} ${currentQuote.author ? '— ' + currentQuote.author : ''}`);
    const url = encodeURIComponent(window.location.href);

    switch(platform) {
      case 'whatsapp':
        openShareWindow(`https://api.whatsapp.com/send?text=${text}`);
        break;
      case 'facebook':
        openShareWindow(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`);
        break;
      case 'twitter':
        openShareWindow(`https://twitter.com/intent/tweet?text=${text}&url=${url}`);
        break;
      case 'telegram':
        openShareWindow(`https://t.me/share/url?url=${url}&text=${text}`);
        break;
      case 'linkedin':
        openShareWindow(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`);
        break;
      case 'email':
        window.location.href = `mailto:?subject=Frase motivacional&body=${text} - ${url}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(`${currentQuote.text} ${currentQuote.author ? '— ' + currentQuote.author : ''}`)
          .then(() => alert('Frase copiada al portapapeles'))
          .catch(() => alert('Error al copiar'));
        break;
    }

    // Cerrar modal después de acción, excepto copiar que podría quedarse abierto
    if(platform !== 'copy') {
      shareModal.classList.add('hidden');
    }
  });
});

// Inicialización
(async function init() {
  await fetchQuotes();
  showRandomQuote();
  renderList();
})();
