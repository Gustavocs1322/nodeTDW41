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
        this.dropdownActividadesRevisar = document.getElementById('dropdown-actividades-revisar');
        this.alumnosEntregaronLink = document.getElementById('alumnos-entregaron-link'); // Enlace de "Alumnos que entregaron actividades"
        this.dropdownAlumnosEntregaron = document.getElementById('dropdown-alumnos-entregaron'); // Dropdown de alumnos entregados
        this.verAlumnosButton = document.getElementById('ver-alumnos'); // Botón para ver los alumnos
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

        // Alternar dropdown de alumnos que entregaron actividades
        this.alumnosEntregaronLink.addEventListener('click', (e) => this.toggleDropdownAlumnos(e));

        // Hacer la solicitud para obtener los alumnos que entregaron la actividad
        this.verAlumnosButton.addEventListener('click', () => this.verAlumnos());

        // Mostrar/Ocultar el menú de usuario
        this.userProfile.addEventListener('click', () => this.toggleUserMenu());

        // Cerrar el menú de usuario al hacer clic fuera de él
        document.addEventListener('click', (e) => this.closeUserMenu(e));
    }

    toggleAsignaturasSection() {
        this.asignaturasSection.style.display = 
            this.asignaturasSection.style.display === 'none' || !this.asignaturasSection.style.display
                ? 'block'
                : 'none';
    }

    seleccionarAsignatura(event) {
        const button = event.target;
        this.asignaturaSeleccionada = button.getAttribute('data-nombre');
        alert(`Asignatura seleccionada: ${this.asignaturaSeleccionada}`);
    }

    subirActividad() {
        const fecha = this.fechaEntrega.value;
        if (!this.asignaturaSeleccionada || !fecha) {
            alert('Por favor selecciona una asignatura y una fecha de entrega.');
            return;
        }
        alert(`Actividad para ${this.asignaturaSeleccionada} subida con fecha: ${fecha}`);
        this.asignaturaSeleccionada = null; // Resetear selección
        this.asignaturasSection.style.display = 'none'; // Ocultar sección
    }

    toggleDropdown(event) {
        event.preventDefault();
        const targetDropdown = event.target.nextElementSibling;
        targetDropdown.style.display =
            targetDropdown.style.display === 'none' || !targetDropdown.style.display
                ? 'block'
                : 'none';
    }

    toggleDropdownAlumnos(event) {
        event.preventDefault();
        const targetDropdown = this.dropdownAlumnosEntregaron;
        targetDropdown.style.display =
            targetDropdown.style.display === 'none' || !targetDropdown.style.display
                ? 'block'
                : 'none';
    }

    toggleUserMenu() {
        const isVisible = this.userMenu.style.display === 'block';
        this.userMenu.style.display = isVisible ? 'none' : 'block';
    }

    closeUserMenu(event) {
        if (
            this.userProfile.contains(event.target) || // Si el clic fue en el perfil
            this.userMenu.contains(event.target)      // Si el clic fue en el menú desplegable
        ) {
            return; // No cerrar el menú
        }
        this.userMenu.style.display = 'none'; // Cerrar el menú
    }

    SubirActividad(){
        fetch('/Actividad', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nombre_actividad: 'nombre de la actividad',
                descripcion: 'descripcion de la actividad',
                fecha_entrega: 'fecha de entrega'
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                alert(data.message); // Mensaje de éxito o error
            }
        })
        .catch(err => {
            console.error('Error al enviar la solicitud:', err);
        });
        
    }
    // Función para ver los alumnos que entregaron la actividad
    verAlumnos() {
        const idActividad = 1; // Este ID debe ser el que corresponda, puede estar definido en algún lugar de tu aplicación

        // Realizar la solicitud POST al servidor para obtener los alumnos que entregaron la actividad
        fetch('/ver-alumnos-actividad', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id_actividad: idActividad })
        })
        .then(response => response.json())
        .then(data => {
            if (data.alumnos) {
                // Aquí puedes hacer algo con los datos obtenidos, por ejemplo, mostrar los alumnos
                console.log('Alumnos que entregaron la actividad:', data.alumnos);
                alert(`Se encontraron ${data.alumnos.length} alumnos.`);
            } else {
                alert('No se encontraron alumnos para esta actividad.');
            }
        })
        .catch(err => {
            console.error('Error al obtener los alumnos:', err);
            alert('Hubo un problema al obtener los alumnos.');
        });
    }
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    new ActividadApp();
});
