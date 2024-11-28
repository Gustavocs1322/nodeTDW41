class ActividadApp {
    constructor() {
        // Elementos DOM
        this.btnAdjuntar = document.getElementById('btn-adjuntar');
        this.dropdownActividad = document.getElementById('dropdown-actividad');
        this.asignaturasSection = document.getElementById('asignaturas-section');
        this.fechaEntrega = document.getElementById('fecha-entrega');
        this.btnSubirActividad = document.getElementById('subir-actividad');
        this.actividadLink = document.getElementById('actividad-link');
        this.actividadesRevisarLink = document.getElementById('actividades-revisar-link');
        this.dropdownActividadesRevisar = document.getElementById('dropdown-actividad'); // Corrección aquí
        this.userProfile = document.querySelector('.user-profile');
        this.userMenu = document.querySelector('.user-menu');
        
        // Variable para almacenar la asignatura seleccionada
        this.asignaturaSeleccionada = null;

        // Configurar los event listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Mostrar/Ocultar la sección de asignaturas al hacer clic en "Adjuntar actividad"
        this.btnAdjuntar.addEventListener('click', () => this.toggleAsignaturasSection());

        // Asignar eventos a cada botón de asignatura
        document.querySelectorAll('.asignatura-btn').forEach(button => {
            button.addEventListener('click', (e) => this.seleccionarAsignatura(e));
        });

        // Subir la actividad
        this.btnSubirActividad.addEventListener('click', () => this.subirActividad());

        // Alternar dropdown de actividad
        this.actividadLink.addEventListener('click', (e) => this.toggleDropdown(e));

        // Alternar dropdown de actividades por revisar
        this.actividadesRevisarLink.addEventListener('click', (e) => {
            e.preventDefault(); // Evitar que la página se recargue
            window.location.href = '/actividades-revisar'; // Redirigir a la página de actividades por revisar
        });

        // Menú de usuario (para mostrar/ocultar)
        this.userProfile.addEventListener('click', () => this.toggleUserMenu());

        // Agregar eventos para editar y eliminar actividad
        document.getElementById('editar-actividad').addEventListener('click', () => this.editarActividad());
        document.getElementById('eliminar-actividad').addEventListener('click', () => this.eliminarActividad());

        // Cerrar menú de usuario si se hace clic fuera del menú
        document.addEventListener('click', (event) => this.cerrarMenuUsuario(event));
    }

    // Función para alternar la visibilidad de la sección de asignaturas
    toggleAsignaturasSection() {
        this.asignaturasSection.style.display =
            this.asignaturasSection.style.display === 'block' ? 'none' : 'block';
    }

    // Alternar el dropdown de "Adjuntar actividad"
    toggleDropdown(event) {
        event.preventDefault();
        this.dropdownActividad.style.display = 
            this.dropdownActividad.style.display === 'none' || this.dropdownActividad.style.display === '' 
            ? 'block' : 'none';
    }

    // Alternar el dropdown de "Actividades por Revisar"
    toggleDropdownActividadesRevisar(event) {
        event.preventDefault();
        this.dropdownActividadesRevisar.style.display =
            this.dropdownActividadesRevisar.style.display === 'none' || this.dropdownActividadesRevisar.style.display === ''
            ? 'block' : 'none';
    }

    // Función para manejar la selección de una asignatura
    seleccionarAsignatura(event) {
        this.asignaturaSeleccionada = event.target.dataset.nombre;
        alert(`Asignatura seleccionada: ${this.asignaturaSeleccionada}`);
    }

    // Función para subir la actividad
    subirActividad() {
        const fechaEntrega = this.fechaEntrega.value;

        if (this.asignaturaSeleccionada && fechaEntrega) {
            const actividadData = {
                nombre_actividad: this.asignaturaSeleccionada,
                descripcion: `Hola alumno, la actividad consiste en ir al botemalla ${this.asignaturaSeleccionada}, llevarlo al punto de reciclaje y subir tu evidencia de que ya lo has vaciado.`,
                fecha_entrega: fechaEntrega
            };

            fetch('/Actividad', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(actividadData)
            })
            .then(response => response.json())
            .then(data => {
                this.mostrarNotificacion('Actividad guardada con éxito', 'success');
                this.toggleAsignaturasSection(); // Ocultar la sección de asignaturas
            })
            .catch(error => {
                this.mostrarNotificacion('Error al guardar la actividad: ' + error, 'error');
            });
        } else {
            this.mostrarNotificacion('Por favor, selecciona una asignatura y una fecha de entrega', 'error');
        }
    }

    // Función para mostrar notificación
    mostrarNotificacion(mensaje, tipo) {
        const notificacion = document.getElementById('notificacion');
        notificacion.innerText = mensaje;
        notificacion.style.display = 'block';
        notificacion.className = tipo === 'success' ? 'notificacion-exito' : 'notificacion-error';

        // Ocultar la notificación después de 3 segundos
        setTimeout(() => notificacion.style.display = 'none', 3000);
    }

    // Función para editar la actividad
    editarActividad() {
        if (this.asignaturaSeleccionada) {
            const nuevaDescripcion = prompt("Introduce la nueva descripción para la actividad:");
            if (nuevaDescripcion) {
                const actividadData = {
                    nombre_actividad: this.asignaturaSeleccionada,
                    descripcion: nuevaDescripcion
                };

                fetch('/Actividad/editar', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(actividadData)
                })
                .then(response => response.json())
                .then(data => {
                    this.mostrarNotificacion('Actividad editada con éxito', 'success');
                })
                .catch(error => {
                    console.error('Error al editar la actividad:', error);
                    this.mostrarNotificacion('Error al editar la actividad', 'error');
                });
            }
        } else {
            this.mostrarNotificacion('Selecciona una asignatura para editar la actividad', 'error');
        }
    }

    // Función para eliminar la actividad
    eliminarActividad() {
        if (this.asignaturaSeleccionada) {
            const confirmDelete = confirm(`¿Estás seguro de que quieres eliminar la actividad de ${this.asignaturaSeleccionada}?`);
            if (confirmDelete) {
                fetch('/Actividad/eliminar', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nombre_actividad: this.asignaturaSeleccionada })
                })
                .then(response => response.json())
                .then(data => {
                    this.mostrarNotificacion('Actividad eliminada con éxito', 'success');
                })
                .catch(error => {
                    console.error('Error al eliminar la actividad:', error);
                    this.mostrarNotificacion('Error al eliminar la actividad', 'error');
                });
            }
        } else {
            this.mostrarNotificacion('Selecciona una asignatura para eliminar la actividad', 'error');
        }
    }

    // Función para alternar el menú de usuario
    toggleUserMenu() {
        this.userMenu.classList.toggle('active');
    }

    // Función para cerrar el menú de usuario si se hace clic fuera de él
    cerrarMenuUsuario(event) {
        if (!this.userProfile.contains(event.target) && !this.userMenu.contains(event.target)) {
            this.userMenu.classList.remove('active');
        }
    }
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    new ActividadApp();
});
