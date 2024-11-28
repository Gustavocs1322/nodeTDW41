document.addEventListener("DOMContentLoaded", function() {
    // ---- Código para "Ver Evidencia" ----
    const enlacesEvidencia = document.querySelectorAll('.ver-evidencia');  // Selecciona todos los enlaces con la clase 'ver-evidencia'
    const modal = document.getElementById("modal-imagen");  // El modal donde se muestra la imagen
    const imagenModal = document.getElementById("imagen-modal");  // La imagen dentro del modal
    const closeModal = document.getElementById("close-modal");  // El botón de cerrar modal

    // Mostrar imagen al hacer clic en "Ver Evidencia"
    enlacesEvidencia.forEach(enlace => {
        enlace.addEventListener("click", function() {
            let imagenSrc = this.getAttribute("data-imagen");  // Obtener la ruta de la imagen desde el atributo 'data-imagen'
            
            // Verifica si la ruta ya contiene "/uploads/"
            if (!imagenSrc.startsWith('/uploads/')) {
                imagenSrc = '/uploads/' + imagenSrc;  // Si no, agrega la ruta base '/uploads/'
            }

            // Verifica la ruta de la imagen en la consola para depuración
            console.log("Ruta de la imagen:", imagenSrc); 

            // Asignar la ruta de la imagen al modal
            imagenModal.src = imagenSrc;
            
            // Mostrar el modal
            modal.style.display = "block"; 
        });
    });

    // Cerrar el modal al hacer clic en la X
    closeModal.addEventListener("click", function() {
        modal.style.display = "none";  // Ocultar el modal
    });

    // Cerrar el modal si se hace clic fuera de la imagen
    window.addEventListener("click", function(event) {
        if (event.target === modal) {
            modal.style.display = "none";  // Ocultar el modal si se hace clic fuera
        }
    });

    // ---- Código para "Marcar como Revisada" ----
    const botonesRevisar = document.querySelectorAll('.btn-revisar'); // Selecciona todos los botones con la clase 'btn-revisar'

    botonesRevisar.forEach(boton => {
        boton.addEventListener("click", function() {
            const idActividad = this.getAttribute('data-id'); // Obtiene el ID de la actividad

            if (confirm("¿Estás seguro de que quieres marcar esta actividad como revisada?")) {
                fetch('/revisar-actividad', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ id_actividad: idActividad })
                })
                .then(response => response.json())
                .then(data => {
                    alert(data.message); // Muestra el mensaje de respuesta
                    location.reload(); // Actualiza la página para reflejar los cambios
                })
                .catch(error => console.error('Error:', error));
            }
        });
    });
});
