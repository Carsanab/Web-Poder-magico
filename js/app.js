/* =========================================
   APLICACIÓN PRINCIPAL - PODER MÁGICO
   (Lectura directa de tu Google Sheet CSV)
   ========================================= */

// ✅ TU URL DE GOOGLE SHEETS PUBLICADO (¡Ya está configurada!)
const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQvQ1YqjnyFO4COecgf8QognF88kcBBSgW3mVup4dPqydBo_XW4FR8Kih_xOmkIiwfZJzs3wtPH7RuE/pub?gid=0&single=true&output=csv';

const CONFIG = {
  contacto: {
    whatsapp: "5491123436369"
  },
  // Información fija de tus juegos (NO necesitas tocar esto nunca)
  juegosBase: [
    {
      id: "inflable",
      nombre: "INFLABLE",
      descripcion: "Saltá, reí y disfrutá con nuestros inflables de alta calidad y total seguridad.",
      precioDefault: 25000, // Precio de respaldo por si falla internet
      imagen: "imagenes/inflable.png",
      icono: "castle"
    },
    {
      id: "metegol",
      nombre: "METEGOL",
      descripcion: "El clásico de siempre, ideal para todas las edades y grupos.",
      precioDefault: 15000,
      imagen: "imagenes/metegol.png",
      icono: "sports_soccer"
    },
    {
      id: "cama-elastica",
      nombre: "CAMA ELÁSTICA",
      descripcion: "Salto, movimiento y mucha diversión en un solo juego.",
      precioDefault: 20000,
      imagen: "imagenes/cama elastica.png",
      icono: "airline_seat_legroom_extra"
    },
    {
      id: "mesa-pool",
      nombre: "MESA DE POOL",
      descripcion: "Demostrá tu puntería y disfrutá de este clásico siempre vigente.",
      precioDefault: 18000,
      imagen: "imagenes/mesa-pool.png",
      icono: "sports_bar"
    }
  ],
  cotizador: {
    titulo: "PRESUPUESTO INMEDIATO",
    subtitulo: "Seleccioná los juegos que necesitás y obtené tu presupuesto al instante",
    mensajeWhatsApp: "Hola! Quiero reservar los siguientes juegos:"
  }
};

let juegosData = [];
let carrito = [];

document.addEventListener('DOMContentLoaded', () => {
  console.log('✨ Poder Mágico: Cargando...');
  initHeader();
  initMobileMenu();
  cargarPreciosYRenderizar();
});

// =========================================
// 1. LEER PRECIOS DIRECTAMENTE DE TU GOOGLE SHEET
// =========================================
async function cargarPreciosYRenderizar() {
  // Empezamos con una copia de los datos base (por si falla la conexión)
  juegosData = JSON.parse(JSON.stringify(CONFIG.juegosBase));

  try {
    const response = await fetch(SHEET_CSV_URL);
    if (response.ok) {
      const csvText = await response.text();
      
      // Dividimos el texto en líneas
      const lines = csvText.trim().split(/\r?\n/);
      
      // Recorremos las líneas (empezamos en 1 para saltar el encabezado "id,precio")
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',');
        if (parts.length >= 2) {
          const id = parts[0].trim();
          const precio = Number(parts[1].trim());
          
          // Buscamos el juego que coincide con el ID y actualizamos su precio
          const juego = juegosData.find(j => j.id === id);
          if (juego && !isNaN(precio)) {
            juego.precio = precio;
          }
        }
      }
      console.log('✅ Precios actualizados exitosamente desde Google Sheets');
    }
  } catch (error) {
    console.warn('⚠️ No se pudo conectar con la hoja. Usando precios por defecto.', error);
    // Si falla, nos aseguramos de que tengan el precio por defecto
    juegosData.forEach(j => j.precio = j.precioDefault);
  }

  renderJuegos();
  initCotizador();
  updateWhatsAppLinks();
}

// =========================================
// 2. RENDERIZAR JUEGOS EN LA WEB (CON ALINEACIÓN PERFECTA)
// =========================================
function renderJuegos() {
  const juegosContainer = document.getElementById('juegos-grid');
  if (!juegosContainer) return;

  juegosContainer.innerHTML = juegosData.map(juego => `
    <div class="bg-[#121124]/95 rounded-2xl overflow-hidden neon-border-green flex flex-col justify-between group transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_0_30px_rgba(74,225,118,0.35)] h-full" data-juego="${juego.id}">
      <div class="flex flex-col flex-grow">
        <!-- Wrapper con clase para efecto hover y clic -->
        <div class="relative w-full h-52 bg-black/40 overflow-hidden juego-imagen-wrapper">
          <img alt="${juego.nombre}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 juego-imagen" 
               src="${juego.imagen}"
               data-nombre="${juego.nombre}"
               data-precio="${juego.precio}"
               onclick="abrirLightbox(this)"/>
          <div class="absolute inset-0 bg-gradient-to-t from-[#121124] via-transparent to-transparent pointer-events-none"></div>
        </div>
        <div class="p-5 pt-12 text-center flex flex-col items-center relative z-10 flex-grow">
          <div class="w-12 h-12 -mt-10 mb-2 rounded-full bg-[#1e1c36] border border-secondary/50 flex items-center justify-center text-secondary shadow-md relative z-20">
            <span class="material-symbols-outlined text-2xl">${juego.icono}</span>
          </div>
          <h3 class="font-headline font-extrabold text-xl text-primary tracking-wide mb-2 uppercase">${juego.nombre}</h3>
          <p class="font-body text-sm text-on-surface-variant leading-relaxed mb-3 min-h-[60px]">${juego.descripcion}</p>
          <div class="inline-flex items-center gap-2 bg-secondary/10 px-4 py-2 rounded-full border border-secondary/30 mt-auto">
            <span class="material-symbols-outlined text-secondary text-sm">attach_money</span>
            <span class="font-headline font-bold text-lg text-secondary">${formatearPrecio(juego.precio)}</span>
            <span class="text-xs text-on-surface-variant">/evento</span>
          </div>
        </div>
      </div>
      <div class="p-5 pt-0 space-y-2">
        <button onclick="agregarAlCotizador('${juego.id}')" class="w-full flex items-center justify-center gap-2 bg-secondary/20 hover:bg-secondary/30 text-secondary border border-secondary/50 py-2.5 rounded-full font-headline font-bold text-sm transition-all">
          <span class="material-symbols-outlined text-base">add_shopping_cart</span>
          <span>Agregar al presupuesto</span>
        </button>
        <a class="w-full flex items-center justify-center gap-2 bg-secondary hover:bg-secondary-container text-black py-2.5 rounded-full font-headline font-bold text-sm transition-all shadow-[0_0_12px_rgba(74,225,118,0.3)]" href="https://wa.me/${CONFIG.contacto.whatsapp}?text=${encodeURIComponent(`Hola! Quiero consultar disponibilidad del ${juego.nombre.toUpperCase()}`)}" rel="noopener" target="_blank">
          <span class="material-symbols-outlined text-base">chat</span>
          <span>Consultar disponibilidad</span>
        </a>
      </div>
    </div>
  `).join('');
}

// =========================================
// 3. COTIZADOR / PRESUPUESTO
// =========================================
function initCotizador() {
  const existingCotizador = document.getElementById('cotizador-section');
  if (existingCotizador) return;

  const cotizadorHTML = `
    <section id="cotizador-section" class="max-w-7xl mx-auto px-6 lg:px-12 py-14">
      <div class="flex items-center justify-center gap-4 mb-12">
        <div class="h-[2px] w-12 sm:w-28 bg-gradient-to-r from-transparent via-primary/70 to-primary"></div>
        <div class="flex items-center gap-2">
          <span class="text-secondary text-xl">★</span>
          <h2 class="font-headline font-black text-2xl sm:text-3xl tracking-widest text-primary drop-shadow-[0_0_12px_rgba(255,193,116,0.7)]">
            ${CONFIG.cotizador.titulo}
          </h2>
          <span class="text-secondary text-xl">★</span>
        </div>
        <div class="h-[2px] w-12 sm:w-28 bg-gradient-to-l from-transparent via-primary/70 to-primary"></div>
      </div>
      
      <p class="text-center text-on-surface-variant mb-8">${CONFIG.cotizador.subtitulo}</p>
      
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 space-y-4">
          ${juegosData.map(juego => `
            <div class="flex items-center justify-between bg-[#121124]/80 p-4 rounded-xl border border-white/10 hover:border-secondary/50 transition-colors">
              <div class="flex items-center gap-4">
                <label class="relative flex items-center cursor-pointer">
                  <input type="checkbox" class="peer sr-only cotizador-checkbox" value="${juego.id}" data-precio="${juego.precio}" data-nombre="${juego.nombre}">
                  <div class="w-6 h-6 border-2 border-secondary/50 rounded peer-checked:bg-secondary peer-checked:border-secondary transition-all"></div>
                  <span class="material-symbols-outlined absolute left-1 top-0.5 text-black text-[14px] opacity-0 peer-checked:opacity-100 transition-opacity">check</span>
                </label>
                <div>
                  <h4 class="font-headline font-bold text-white">${juego.nombre}</h4>
                  <p class="text-sm text-on-surface-variant">${formatearPrecio(juego.precio)}</p>
                </div>
              </div>
              <button onclick="agregarAlCotizador('${juego.id}')" class="text-secondary hover:text-primary transition-colors">
                <span class="material-symbols-outlined">add_circle</span>
              </button>
            </div>
          `).join('')}
        </div>
        
        <div class="bg-gradient-to-br from-[#121124] to-[#1a1738] p-6 rounded-2xl border border-secondary/30 shadow-[0_0_30px_rgba(74,225,118,0.15)] h-fit sticky top-24">
          <h3 class="font-headline font-bold text-xl text-white mb-4 flex items-center gap-2">
            <span class="material-symbols-outlined text-secondary">shopping_cart</span>
            Tu Presupuesto
          </h3>
          
          <div id="carrito-vacio" class="text-center py-8 text-on-surface-variant">
            <span class="material-symbols-outlined text-4xl mb-2 opacity-50">shopping_cart</span>
            <p>Seleccioná juegos para ver el total</p>
          </div>
          
          <div id="carrito-items" class="hidden space-y-3 mb-4"></div>
          
          <div id="carrito-total" class="hidden border-t border-white/10 pt-4 mt-4">
            <div class="flex justify-between items-center mb-4">
              <span class="text-on-surface-variant">Total:</span>
              <span class="font-headline font-black text-2xl text-secondary" id="total-precio">$0</span>
            </div>
            <button onclick="enviarPresupuestoWhatsApp()" class="w-full flex items-center justify-center gap-2 bg-[#25d366] hover:bg-[#20ba5a] text-black py-3 rounded-full font-headline font-bold transition-all shadow-[0_0_20px_rgba(37,211,102,0.4)]">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Enviar por WhatsApp
            </button>
          </div>
        </div>
      </div>
    </section>
  `;
  
  const bannerFinal = document.getElementById('contacto');
  bannerFinal.insertAdjacentHTML('beforebegin', cotizadorHTML);
  
  document.querySelectorAll('.cotizador-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', actualizarCarrito);
  });
}

function agregarAlCotizador(juegoId) {
  const checkbox = document.querySelector(`.cotizador-checkbox[value="${juegoId}"]`);
  if (checkbox) {
    checkbox.checked = !checkbox.checked;
    actualizarCarrito();
    document.getElementById('cotizador-section').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function actualizarCarrito() {
  const checkboxes = document.querySelectorAll('.cotizador-checkbox:checked');
  const carritoItems = document.getElementById('carrito-items');
  const carritoVacio = document.getElementById('carrito-vacio');
  const carritoTotal = document.getElementById('carrito-total');
  const totalPrecio = document.getElementById('total-precio');
  
  carrito = [];
  let subtotal = 0;
  
  checkboxes.forEach(checkbox => {
    carrito.push({
      nombre: checkbox.dataset.nombre,
      precio: parseInt(checkbox.dataset.precio)
    });
    subtotal += parseInt(checkbox.dataset.precio);
  });
  
  // Calcular descuento del 5% si hay más de 1 juego
  const hayDescuento = carrito.length > 1;
  const descuento = hayDescuento ? Math.round(subtotal * 0.05) : 0;
  const total = subtotal - descuento;
  
  if (carrito.length === 0) {
    carritoItems.classList.add('hidden');
    carritoTotal.classList.add('hidden');
    carritoVacio.classList.remove('hidden');
  } else {
    carritoVacio.classList.add('hidden');
    carritoItems.classList.remove('hidden');
    carritoTotal.classList.remove('hidden');
    
    // Renderizar items + descuento
    let html = carrito.map(item => `
      <div class="flex justify-between items-center bg-[#0b0a16]/50 p-3 rounded-lg">
        <span class="text-sm text-on-surface">${item.nombre}</span>
        <span class="font-bold text-secondary">${formatearPrecio(item.precio)}</span>
      </div>
    `).join('');
    
    // Agregar fila de descuento si aplica
    if (hayDescuento) {
      html += `
        <div class="flex justify-between items-center bg-green-900/30 p-3 rounded-lg border border-green-500/30">
          <span class="text-sm text-green-300 flex items-center gap-2">
            <span class="material-symbols-outlined text-base">percent</span>
            Descuento por ${carrito.length} juegos (5%)
          </span>
          <span class="font-bold text-green-400">-${formatearPrecio(descuento)}</span>
        </div>
      `;
    }
    
    carritoItems.innerHTML = html;
    
    // Mostrar total (y subtotal si hay descuento)
    if (hayDescuento) {
      totalPrecio.innerHTML = `
        <div class="flex flex-col items-end">
          <span class="text-xs text-on-surface-variant line-through">${formatearPrecio(subtotal)}</span>
          <span class="font-headline font-black text-2xl text-secondary">${formatearPrecio(total)}</span>
        </div>
      `;
    } else {
      totalPrecio.textContent = formatearPrecio(total);
    }
  }
}

function enviarPresupuestoWhatsApp() {
  if (carrito.length === 0) return;
  
  const subtotal = carrito.reduce((sum, item) => sum + item.precio, 0);
  const hayDescuento = carrito.length > 1;
  const descuento = hayDescuento ? Math.round(subtotal * 0.05) : 0;
  const total = subtotal - descuento;
  
  let mensaje = `${CONFIG.cotizador.mensajeWhatsApp}\n\n`;
  
  carrito.forEach(item => {
    mensaje += `• ${item.nombre}: ${formatearPrecio(item.precio)}\n`;
  });
  
  // Agregar descuento al mensaje si aplica
  if (hayDescuento) {
    mensaje += `\n🎉 *Descuento 5% por ${carrito.length} juegos:* -${formatearPrecio(descuento)}\n`;
  }
  
  mensaje += `\n*TOTAL: ${formatearPrecio(total)}*`;
  mensaje += `\n\nQuisiera consultar disponibilidad.`;
  
  window.open(`https://wa.me/${CONFIG.contacto.whatsapp}?text=${encodeURIComponent(mensaje)}`, '_blank');
}

// =========================================
// UTILIDADES
// =========================================
function formatearPrecio(precio) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(precio);
}

function initHeader() {
  const header = document.getElementById('main-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('shadow-lg', 'bg-[#0b0a16]/95');
      header.classList.remove('bg-[#0b0a16]/90');
    } else {
      header.classList.remove('shadow-lg', 'bg-[#0b0a16]/95');
      header.classList.add('bg-[#0b0a16]/90');
    }
  });
}

function initMobileMenu() {
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-link');
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
      mobileMenuBtn.querySelector('.material-symbols-outlined').textContent = mobileMenu.classList.contains('hidden') ? 'menu' : 'close';
    });
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        mobileMenuBtn.querySelector('.material-symbols-outlined').textContent = 'menu';
      });
    });
  }
}

function updateWhatsAppLinks() {
  document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
    const href = link.getAttribute('href');
    if (href && !href.includes(CONFIG.contacto.whatsapp)) {
      link.setAttribute('href', href.replace(/wa\.me\/\d+/, `wa.me/${CONFIG.contacto.whatsapp}`));
    }
  });
}

// =========================================
// LIGHTBOX / MODAL DE IMAGEN
// =========================================
function abrirLightbox(imgElement) {
  const modal = document.getElementById('lightbox-modal');
  const modalImg = document.getElementById('lightbox-img');
  const modalTitle = document.getElementById('lightbox-title');
  const modalPrice = document.getElementById('lightbox-price');
  
  // Cargar datos
  modalImg.src = imgElement.src;
  modalImg.alt = imgElement.alt;
  modalTitle.textContent = imgElement.dataset.nombre;
  modalPrice.textContent = formatearPrecio(parseInt(imgElement.dataset.precio)) + ' /evento';
  
  // Mostrar modal
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  document.body.classList.add('modal-open');
}

function cerrarLightbox() {
  const modal = document.getElementById('lightbox-modal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  document.body.classList.remove('modal-open');
}

// Event listeners del lightbox (se ejecutan una sola vez)
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('lightbox-modal');
  const overlay = document.getElementById('lightbox-overlay');
  const closeBtn = document.getElementById('lightbox-close');
  
  // Cerrar al hacer clic en el fondo
  if (overlay) {
    overlay.addEventListener('click', cerrarLightbox);
  }
  
  // Cerrar con el botón X
  if (closeBtn) {
    closeBtn.addEventListener('click', cerrarLightbox);
  }
  
  // Cerrar con la tecla Esc
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      cerrarLightbox();
    }
  });
});