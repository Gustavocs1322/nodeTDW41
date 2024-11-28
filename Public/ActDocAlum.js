// Ejecutar cuando el DOM esté cargado
document.addEventListener("DOMContentLoaded", () => {
    // Contenedor donde se mostrarán las actividades
    const actividadesContainer = document.querySelector("body");

    // Realizar una petición al backend para obtener las actividades
    fetch('/actividades-pendientes')
        .then(response => {
            if (!response.ok) {
                throw new Error("Error al obtener actividades");
            }
            return response.json();
        })
        .then(data => {
            // Comprobar si hay actividades
            if (data.length > 0) {
                // Crear una lista dinámica
                const ul = document.createElement("ul");

                data.forEach(actividad => {
                    const li = document.createElement("li");
                    li.innerHTML = `
                        <strong>${actividad.nombre_actividad}</strong><br>
                        <p>${actividad.descripcion}</p>
                        <small>Fecha de entrega: ${actividad.fecha_entrega}</small>
                    `;
                    ul.appendChild(li);
                });

                actividadesContainer.appendChild(ul);
            } else {
                // Mostrar mensaje si no hay actividades
                const noActividades = document.createElement("p");
                noActividades.textContent = "No tienes actividades pendientes.";
                actividadesContainer.appendChild(noActividades);
            }
        })
        .catch(error => {
            console.error("Error:", error);

            // Mostrar mensaje de error
            const errorMsg = document.createElement("p");
            errorMsg.textContent = "Error al cargar las actividades.";
            actividadesContainer.appendChild(errorMsg);
        });
});
