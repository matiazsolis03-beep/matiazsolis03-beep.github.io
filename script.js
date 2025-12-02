// script.js
// Mejoras: menú móvil, scroll suave, tema, sonido, alertas dismissible, CTA móvil, accesibilidad

document.addEventListener('DOMContentLoaded', () => {
  /* ---------- Navegación / menú hamburguesa ---------- */
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');

  navToggle?.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    mainNav?.classList.toggle('open');
  });

  // Cerrar menú al hacer click fuera (móvil)
  document.addEventListener('click', (e) => {
    if (!mainNav || !navToggle) return;
    if (!mainNav.contains(e.target) && !navToggle.contains(e.target)) {
      mainNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });

  // Scroll suave para enlaces internos
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (mainNav?.classList.contains('open')) mainNav.classList.remove('open');
      }
    });
  });

  /* ---------- Tema (red / blue) ---------- */
  const themeBtn = document.getElementById('themeBtn');
  themeBtn?.addEventListener('click', () => {
    document.body.classList.toggle('blue-theme');
    document.body.classList.toggle('red-theme');
    const pressed = themeBtn.getAttribute('aria-pressed') === 'true';
    themeBtn.setAttribute('aria-pressed', String(!pressed));
  });

  /* ---------- Sonido (mute) - placeholder ---------- */
  const muteBtn = document.getElementById('muteBtn');
  let muted = false;
  muteBtn?.addEventListener('click', () => {
    muted = !muted;
    muteBtn.setAttribute('aria-pressed', String(muted));
    muteBtn.textContent = muted ? '🔇 Silencio' : '🔈 Sonido';
  });

  /* ---------- Datos de ejemplo: bomberos ---------- */
  const bomberos = [
    { id: 1, name: 'Juan Pérez', role: 'Conductor', status: 'available' },
    { id: 2, name: 'María López', role: 'Jefa de Turno', status: 'busy' },
    { id: 3, name: 'Carlos Díaz', role: 'Bombero', status: 'available' }
  ];

  const listaBomberosEl = document.getElementById('listaBomberos');
  const disponibilidadEl = document.getElementById('disponibilidad');

  function renderBomberos(filterText = '', filterStatus = 'all') {
    if (!listaBomberosEl) return;
    listaBomberosEl.innerHTML = '';
    const filtered = bomberos.filter(b => {
      const matchesText = b.name.toLowerCase().includes(filterText.toLowerCase());
      const matchesStatus = filterStatus === 'all' ? true : b.status === filterStatus;
      return matchesText && matchesStatus;
    });

    disponibilidadEl.textContent = filtered.some(b => b.status === 'available') ? 'Unidades disponibles' : 'Todas ocupadas';

    filtered.forEach(b => {
      const li = document.createElement('li');
      li.className = 'bombero-card';
      li.innerHTML = `
        <div class="bombero-left">
          <div class="bombero-avatar" aria-hidden="true">${b.name.split(' ').map(n=>n[0]).slice(0,2).join('')}</div>
          <div class="bombero-meta">
            <div class="bombero-name">${b.name}</div>
            <div class="bombero-role">${b.role}</div>
          </div>
        </div>
        <div class="bombero-status ${b.status}">${b.status === 'available' ? 'Disponible' : 'Ocupado'}</div>
      `;
      listaBomberosEl.appendChild(li);
    });
  }

  renderBomberos();

  // filtros
  const filterBombero = document.getElementById('filterBombero');
  const filterEstado = document.getElementById('filterEstado');
  filterBombero?.addEventListener('input', () => renderBomberos(filterBombero.value, filterEstado.value));
  filterEstado?.addEventListener('change', () => renderBomberos(filterBombero.value, filterEstado.value));

  /* ---------- Formulario de alertas y historial ---------- */
  const alertForm = document.getElementById('alertForm');
  const listaHistorial = document.getElementById('listaHistorial');
  const alertaBox = document.getElementById('alertaBox');
  const alertText = document.getElementById('alertText');
  const dismissAlert = document.getElementById('dismissAlert');
  const clearHistoryBtn = document.getElementById('clearHistory');
  const exportHistoryBtn = document.getElementById('exportHistory');

  // historial en memoria (session)
  let historial = JSON.parse(sessionStorage.getItem('historial') || '[]');

  function renderHistorial() {
    if (!listaHistorial) return;
    listaHistorial.innerHTML = '';
    historial.slice().reverse().forEach((h) => {
      const li = document.createElement('li');
      li.textContent = `${new Date(h.timestamp).toLocaleString()} · ${h.tipo} · ${h.ubicacion}`;
      listaHistorial.appendChild(li);
    });
  }

  function pushHistorial(entry) {
    historial.push(entry);
    sessionStorage.setItem('historial', JSON.stringify(historial));
    renderHistorial();
  }

  // mostrar alerta temporal y dismissible
  let alertaTimeout = null;
  function showAlerta(text, timeout = 6000) {
    if (!alertaBox || !alertText) return;
    alertText.textContent = text;
    alertaBox.classList.remove('oculto');
    if (alertaTimeout) clearTimeout(alertaTimeout);
    alertaTimeout = setTimeout(() => {
      alertaBox.classList.add('oculto');
    }, timeout);
  }

  dismissAlert?.addEventListener('click', () => {
    if (!alertaBox) return;
    alertaBox.classList.add('oculto');
    if (alertaTimeout) clearTimeout(alertaTimeout);
  });

  alertForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const tipo = document.getElementById('tipoIncendio')?.value || 'No especificado';
    const ubicacion = document.getElementById('ubicacion')?.value || 'No especificada';
    const entry = { tipo, ubicacion, timestamp: Date.now() };
    pushHistorial(entry);
    showAlerta(`Alerta enviada: ${tipo} · ${ubicacion}`);
    alertForm.reset();
  });

  clearHistoryBtn?.addEventListener('click', () => {
    historial = [];
    sessionStorage.removeItem('historial');
    renderHistorial();
  });

  exportHistoryBtn?.addEventListener('click', () => {
    const dataStr = JSON.stringify(historial, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'historial_alertas.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });

  renderHistorial();

  /* ---------- Quick assign (asignar manual) - demo ---------- */
  const quickAssignBtn = document.getElementById('quickAssign');
  quickAssignBtn?.addEventListener('click', () => {
    const disponible = bomberos.find(b => b.status === 'available');
    if (disponible) {
      disponible.status = 'busy';
      renderBomberos(filterBombero?.value || '', filterEstado?.value || 'all');
      showAlerta(`Unidad asignada: ${disponible.name}`);
    } else {
      showAlerta('No hay unidades disponibles', 4000);
    }
  });

  /* ---------- CTA móvil: foco y accesibilidad ---------- */
  const mobileCta = document.getElementById('mobileCta');
  mobileCta?.addEventListener('click', () => {
    const target = document.getElementById('alerts');
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  /* ---------- Inicializaciones adicionales ---------- */
  // Si querés precargar el embed oficial, reemplaza el src del iframe en index.html por la URL de "Insertar mapa" de Google Maps.
});