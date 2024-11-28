document.addEventListener("DOMContentLoaded", () => {
    fetch('/actividades')
        .then(response => response.json())
        .then(data => {
            const tbody = document.getElementById('actividades-tbody');
            tbody.innerHTML = ''; // Limpiar contenido previo

            if (data.length > 0) {
                data.forEach(activity => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${activity.id}</td>
                        <td>${activity.Nombre_Asignatura}</td>
                        <td>${activity.Instrucciones}</td>
                        <td>${activity.Fecha}</td>
                        <td>${activity.Estado}</td>
                    `;
                    tbody.appendChild(row);
                });
            } else {
                tbody.innerHTML = '<tr><td colspan="5">No hay actividades asignadas.</td></tr>';
            }
        })
        .catch(err => {
            console.error('Error al obtener actividades:', err);
            const tbody = document.getElementById('actividades-tbody');
            tbody.innerHTML = '<tr><td colspan="5">Error al cargar actividades.</td></tr>';
        });
});
