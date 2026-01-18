let datosGlobales = { eventos: [], participantes: [] };

async function cargarSistema() {
    try {
        const respuesta = await fetch('datos.json'); /*Mandas a buscar el archivo json que es un texto*/
        datosGlobales = await respuesta.json(); /*Convierte a objeto de JavaScript y lo guarda en variable*/ 
        
        //Elementos referenciados por ID
        const contenedor = document.getElementById('contenedor-eventos');
        const buscador = document.getElementById('buscador');
        const filtroCategoria = document.getElementById('filtro-categoria');
        const ordenador = document.getElementById('ordenar-por');
        const filtroFecha = document.getElementById('filtro-fecha');

        const guardados = localStorage.getItem('participantesGuardados');
        if (guardados) {
            const participantesNuevos = JSON.parse(guardados); /*transformamos el texto a array*/
            // Combinamos: los del JSON + los del LocalStorage
            datosGlobales.participantes = [...datosGlobales.participantes, ...participantesNuevos]; /*Spread Operator */
        }
        if (contenedor) {  /*Si existe la constante contenedor estamos en la pagina de eventos*/
            mostrarEventos(datosGlobales.eventos); 

            const aplicarFiltros = () => {  /*La definimos como constante para que esta funcion no cambie*/
                let eventosFiltrados = [...datosGlobales.eventos]; /*Generamos una copia*/

                // Filtrar por texto
                /* Convetirmos el texto y el nombre del evento a minusculas*/
                const texto = buscador.value.toLowerCase(); /*buscador en tiempo real*/
                eventosFiltrados = eventosFiltrados.filter(ev => 
                    ev.nombre.toLowerCase().includes(texto)
                );

                // Filtrar por Categoría
                const catSeleccionada = filtroCategoria.value;
                if (catSeleccionada !== "Todas las categorías") {
                    eventosFiltrados = eventosFiltrados.filter(ev => 
                        ev.categoria === catSeleccionada);
                }

                // Filtrar por fecha
                const fechaValor = filtroFecha.value; 
                if (fechaValor) {
                    eventosFiltrados = eventosFiltrados.filter(ev => {
                        return ev.fecha === fechaValor;});
                }

                // Ordenar
                const modoOrden = ordenador.value; /*definimos la constante como el valor que tenga mi menu despeglable con ID ordenar-por*/ 
                if (modoOrden === "nombre") {
                    eventosFiltrados.sort((a, b) => a.nombre.localeCompare(b.nombre)); /*compara letras*/ 
                } else if (modoOrden === "participantes") {
                    eventosFiltrados.sort((a, b) => {
                    const totalA = datosGlobales.participantes.filter(p => p.eventoId == a.id).length;
                    const totalB = datosGlobales.participantes.filter(p => p.eventoId == b.id).length;
                    return totalB - totalA; // De mayor a menor
                    });
                } else if (modoOrden === "recientes") {
                    eventosFiltrados.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
                }

                mostrarEventos(eventosFiltrados);
            };

            // Observadores (observa hasta que haya un cambio)
            buscador.addEventListener('input', aplicarFiltros);
            filtroCategoria.addEventListener('change', aplicarFiltros);
            ordenador.addEventListener('change', aplicarFiltros);
            filtroFecha.addEventListener('change', aplicarFiltros);
        }
        
        // Resto de inicializaciones de otras páginas
        if (document.getElementById('registro-evento-select')) inicializarPaginaRegistro(datosGlobales.eventos);
        if (document.getElementById('tabla-asistentes')) inicializarPaginaParticipantes();

    } catch (error) {
        console.error("Error cargando el sistema:", error);
    }
}

/*PÁGINA DE INICIO*/
function mostrarEventos(eventos) {
    const contenedor = document.getElementById('contenedor-eventos');
    if (!contenedor) return; /*Si no hay contenedor no se muestra nada*/ 
    contenedor.innerHTML = ''; /*Limpia el contenedor */
    
    if (eventos.length === 0) { /*Si no hay eventos*/
        contenedor.innerHTML = `<p class="no-resultados">No se encontraron eventos con esos criterios.</p>`;
        return;
    } 
        eventos.forEach(evento => { /*Por cada*/
        const totalAsistentes = datosGlobales.participantes.filter(p => p.eventoId == evento.id && p.tipo === 'asistente').length;
        const totalPonentes = datosGlobales.participantes.filter(p => p.eventoId == evento.id && p.tipo === 'ponente').length;
        const [anio, mes, dia] = evento.fecha.split('-'); /*Separamos por - y asignamos a uns constante*/ 
        const fechaObj = new Date(anio, mes - 1, dia); /*Empieza en 0 Enero es 0 en js  y 1 json*/
        const fechaLegible = fechaObj.toLocaleDateString('es-ES', { /*Convierte la fecha en texto segun la region */ 
            day: '2-digit', 
            month: 'long', 
            year: 'numeric' 
        });

        contenedor.innerHTML += `
            <article class="card-evento">
                <span class="badge">${evento.categoria}</span>
                <h3>${evento.nombre}</h3>
                <p>📅 ${fechaLegible} | 🕒 ${evento.hora} | 📍 ${evento.lugar}</p>
                <p class="descripcion-breve">${evento.desc}</p>
                <div class="stats">
                    <span class="count-asis">👥 ${totalAsistentes} Asistentes</span>
                    <span class="count-pon">🎤 ${totalPonentes} Ponentes</span>
                </div>
                <div class="acciones">
                    <a href="registro.html?id=${evento.id}" class="btn-primary">Registrar</a>
                    <a href="participantes.html?id=${evento.id}" class="btn-secondary">Participantes</a>
                </div>
            </article>`;
    });
}

/*PÁGINA DE REGISTRO*/
function inicializarPaginaRegistro(eventos) {
    const selectEvento = document.getElementById('registro-evento-select');
    const radioAsistente = document.getElementById('asistente');
    const radioPonente = document.getElementById('ponente');
    const seccionAsistente = document.getElementById('seccion-asistente');
    const seccionPonente = document.getElementById('seccion-ponente');
    const formulario = document.getElementById('formulario-registro');

    // Llenar dropdown
    eventos.forEach(ev => {
        const opt = document.createElement('option'); /* creamos una etiqueta option vacia*/
        opt.value = ev.id; /*para llenar las opciones usamos el id de los evntos*/
        opt.textContent = ev.nombre; /* Es el valor que se mostrara como opcion*/
        selectEvento.appendChild(opt); /*Agregamos la opcion desde el json*/
    });
    /* Te da el nombre del evento desde el que ingresaste*/
    const idUrl = new URLSearchParams(window.location.search).get('id'); /*Capturamos fragmento url, separa parametros y devuelve id*/ 
    if (idUrl) selectEvento.value = idUrl; /*Si no venimos desde un evento  el menu se queda en la primera opcion*/ 

    function alternarCampos() {
        const esPonente = radioPonente.checked;
        seccionAsistente.style.display = esPonente ? 'none' : 'block';
        seccionPonente.style.display = esPonente ? 'block' : 'none';
        /*Visualizacion de campos requeridos*/ 
        document.getElementById('titulo-ponencia').required = esPonente;
        document.getElementById('duracion').required = esPonente;
        document.getElementById('biografia').required = esPonente;

        document.getElementById('nivel-experiencia').required = !esPonente;
    }
    /*Observadores*/ 
    radioAsistente.addEventListener('change', alternarCampos);
    radioPonente.addEventListener('change', alternarCampos);
    alternarCampos();

    // Simulación del envio
    formulario.addEventListener('submit', (e) => {
    e.preventDefault(); /* No recaragamos la pagina inmediatamente, se da el tiempo de guardar los datos */
    
    const btn = formulario.querySelector('.btn-primary');
    btn.disabled = true; /*Evitamos el click loco, cerrado temporalmente */
    btn.innerHTML = `Enviando... <span class="spinner"></span>`;

    // 1. Capturar los datos según el tipo
    const esPonente = radioPonente.checked;
    
    const nuevoParticipante = {
        id: Date.now(), // Genera un ID único basado en el tiempo usando los milisegundos desde 1 enero 1970
        eventoId: document.getElementById('registro-evento-select').value,
        nombre: document.getElementById('nombre').value,
        email: document.getElementById('email').value,
        telefono: document.getElementById('tel').value,
        empresa: document.getElementById('empresa').value,
        pais_ciudad: document.getElementById('ciudad').value,
        tipo: esPonente ? 'ponente' : 'asistente',
        fechaRegistro: new Date().toISOString().split('T')[0] // Fecha actual YYYY-MM-DD
    };

    // 2. Agregamos campos específicos
    if (esPonente) {
        nuevoParticipante.titulo_ponencia = document.getElementById('titulo-ponencia').value;
        nuevoParticipante.duracion = document.getElementById('duracion').value;
        nuevoParticipante.req_tecnicos = document.getElementById('req-tecnicos').value;
        nuevoParticipante.linkedin = document.getElementById('linkedin').value;
        nuevoParticipante.github = document.getElementById('github').value;
        nuevoParticipante.biografia_profesional = document.getElementById('biografia').value;
    } else {
        nuevoParticipante.nivel = document.getElementById('nivel-experiencia').value;
        nuevoParticipante.interes = document.getElementById('interes').value;
        nuevoParticipante.certificado = document.getElementById('certificado').checked;
    }

    // 3. Guardar en el array global y en LocalStorage
    const previos = JSON.parse(localStorage.getItem('participantesGuardados') || "[]"); /*Verifica si en el LocalStarage hay gaurdado algo */
    previos.push(nuevoParticipante); /*Si hay, los agrega */
    
    localStorage.setItem('participantesGuardados', JSON.stringify(previos));

    // Actualizamos la variable global para que la redirección los vea
    datosGlobales.participantes.push(nuevoParticipante);
    // ----------------------------------------
    setTimeout(() => {
        alert("✅ ¡Registro guardado con éxito!");
        window.location.href = `participantes.html?id=${nuevoParticipante.eventoId}`;
    }, 1500);
});
}

/*PÁGINA DE PARTICIPANTES (informacion dentro de tablas, cards, graficas) */
function inicializarPaginaParticipantes() {
    const idEvento = new URLSearchParams(window.location.search).get('id');
    if (!idEvento) return;  /*Si no hay un id de evento valido nada de esta funcion pasa */

    const evento = datosGlobales.eventos.find(e => e.id == idEvento); /*Buscamos con find el id del evento*/
    const lista = datosGlobales.participantes.filter(p => p.eventoId == idEvento); /* filtra los participantes con ese id de evento*/

    if (evento) {
        document.getElementById('nombre-evento-titulo').textContent = evento.nombre; /*Cambia el nombre grande de la pagina */
        document.getElementById('detalle-evento-sub').textContent = `📅 ${evento.fecha} | 🕒 ${evento.hora} | 📍 ${evento.lugar}`;
    }

    renderizarParticipantes(lista);
}

function renderizarParticipantes(lista) {
    const tabla = document.querySelector('#tabla-asistentes tbody'); /*Cuerpo de la tabla vacia*/
    const listaPon = document.getElementById('lista-ponentes');
    if(tabla) tabla.innerHTML = ''; /*Borramos rastro de tablas anteriores */
    if(listaPon) listaPon.innerHTML = ''; 

    lista.forEach(p => {
        if (p.tipo === 'asistente') {
            tabla.innerHTML += `<tr><td>${p.nombre}</td><td>${p.email}</td><td>${p.empresa}</td>
                <td><span class="badge-asistente">${p.nivel}</span></td><td>${p.fechaRegistro}</td>`;
        } else {
            listaPon.innerHTML += `<div class="card-ponente">
                <h4>${p.nombre}</h4><p class="empresa-ponente">🏢 ${p.empresa}</p>
                <p><strong>🎤 Ponencia:</strong> ${p.titulo_ponencia}</p>
                <p>${p.biografia_profesional ? p.biografia_profesional.substring(0,80) : ''}...</p></div>`;
        }
    });
    actualizarContadores(lista);
}

function actualizarContadores(lista) {
    const asis = lista.filter(p => p.tipo === 'asistente').length;
    const pon = lista.filter(p => p.tipo === 'ponente').length;
    if(document.getElementById('contador-asistentes')) {
        document.getElementById('contador-asistentes').textContent = `Asistentes: ${asis}`;
        document.getElementById('contador-ponentes').textContent = `Ponentes: ${pon}`;
        document.getElementById('contador-total').textContent = `Total: ${asis + pon}`;
    }
}
