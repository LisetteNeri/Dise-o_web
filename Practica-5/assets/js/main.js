/**
 * Carga un componente HTML en un contenedor específico
 * @param {string} id - El ID del elemento donde se insertará el contenido
 * @param {string} path - La ruta al archivo .html del componente
 */
function loadComponent(id, path) {
    fetch(path)
        .then(response => {
            if (!response.ok) {
                throw new Error(`No se pudo cargar el archivo: ${path}`);
            }
            return response.text();
        })
        .then(data => {
            document.getElementById(id).innerHTML = data;
        })
        .catch(error => {
            console.error('Error al cargar el componente:', error);
        });
}

/**
----------------------
 */
document.addEventListener('click', (e) => {
  
    const menuBtn = e.target.closest('#mobile-menu');
    if (menuBtn) {
        const navList = document.getElementById('nav-list');
        if (navList) {
            navList.classList.toggle('active'); 
            menuBtn.classList.toggle('is-active'); 
        }
    }

    if (e.target.classList.contains('link-pagina')) {
        const navList = document.getElementById('nav-list');
        if (navList) {
            navList.classList.remove('active');
        }
    }
});

/**
 --------------------------------formulario
 */
document.addEventListener('change', (e) => {
    if (e.target.id === 'opciones-motivo') {
        const divEspecificar = document.getElementById('especificar-otro');
        const inputOtro = document.getElementById('otro-detalle');

        if (divEspecificar && inputOtro) {
            if (e.target.value === 'otro') {
                divEspecificar.style.display = 'block';
                inputOtro.setAttribute('required', ''); // Se vuelve obligatorio [cite: 45]
            } else {
                divEspecificar.style.display = 'none';
                inputOtro.removeAttribute('required');
            }
        }
    }
});