/* =========================================
   JAVASCRIPT PRINCIPAL - PODER MÁGICO
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    console.log('✨ Poder Mágico: Sitio cargado correctamente.');
    
    // 1. Efecto de sombra en el header al hacer scroll
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

    // 2. Lógica del Menú Móvil
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    if (mobileMenuBtn && mobileMenu) {
        // Abrir / Cerrar menú al tocar el botón
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            const icon = mobileMenuBtn.querySelector('.material-symbols-outlined');
            
            // Cambiar ícono de menú a cerrar (y viceversa)
            if (mobileMenu.classList.contains('hidden')) {
                icon.textContent = 'menu';
            } else {
                icon.textContent = 'close';
            }
        });

        // Cerrar el menú automáticamente cuando el usuario toca un enlace
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
                mobileMenuBtn.querySelector('.material-symbols-outlined').textContent = 'menu';
            });
        });
    }
});