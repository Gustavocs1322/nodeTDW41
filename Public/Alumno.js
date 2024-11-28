document.addEventListener("DOMContentLoaded", function () {
    // Referencias a elementos
    const profilePic = document.getElementById("profile-pic");
    const userMenu = document.getElementById("user-menu");
    const navLinks = document.querySelectorAll(".nav-link");
    const form = document.getElementById('formSubidaImagen'); // Formulario de subida de imagen
    const mensajeDiv = document.getElementById('mensaje'); // Div para mostrar mensajes

    // Inicialmente oculta el menú de usuario
    userMenu.style.display = "none";

    // Muestra u oculta el menú de usuario al hacer clic en la imagen de perfil
    profilePic.addEventListener("click", function (event) {
        event.stopPropagation();
        userMenu.style.display = userMenu.style.display === "none" ? "block" : "none";
    });

    // Cierra el menú de usuario si se hace clic fuera de él
    document.addEventListener("click", function (event) {
        if (!userMenu.contains(event.target) && event.target !== profilePic) {
            userMenu.style.display = "none";
        }
    });

    // Script para cambiar la clase 'active' en el menú
    navLinks.forEach(link => {
        link.addEventListener("click", function () {
            // Elimina la clase 'active' de todos los enlaces
            navLinks.forEach(link => link.classList.remove("active"));
            // Agrega la clase 'active' al enlace actual
            this.classList.add("active");
        });
    });

    // Lógica para la subida de imágenes (usando AJAX)
    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevenir el envío tradicional del formulario

        // Crear un objeto FormData con los datos del formulario
        const formData = new FormData(form);

        try {
            // Enviar la imagen al backend usando fetch y el método POST
            const response = await fetch('/subir-imagen', {
                method: 'POST',
                body: formData,
            });

            // Verificar si la respuesta fue exitosa
            if (response.ok) {
                const result = await response.text();
                mensajeDiv.textContent = `Imagen subida correctamente: ${result}`;
                mensajeDiv.style.color = 'green'; // Mensaje de éxito
            } else {
                mensajeDiv.textContent = `Error al subir la imagen: ${response.statusText}`;
                mensajeDiv.style.color = 'red'; // Mensaje de error
            }
        } catch (error) {
            console.error('Error al enviar la imagen:', error);
            mensajeDiv.textContent = 'Error al conectar con el servidor';
            mensajeDiv.style.color = 'red';
        }
    });
});
