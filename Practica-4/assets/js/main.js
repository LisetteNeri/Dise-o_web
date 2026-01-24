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

/* ----------------------------*/

        const selectMotivo = document.getElementById('opciones-motivo');
        const divEspecificar = document.getElementById('especificar-otro');
        const inputOtro = document.getElementById('otro-detalle');

        selectMotivo.addEventListener('change', function() {
            if (this.value === 'otro') {
                divEspecificar.style.display = 'block';
                inputOtro.setAttribute('required', ''); // Se vuelve obligatorio 
            } else {
                divEspecificar.style.display = 'none';
                inputOtro.removeAttribute('required');
            }
        });

/*--------------------------- */