// Simulación de actividades desde un backend o base de datos
document.addEventListener('DOMContentLoaded', () => {
    const actividadesList = document.getElementById('actividades-list');
    const actividades = [
        { nombre_asignatura: "Matemáticas", instrucciones: "Resuelve los problemas de la página 45", fecha_entrega: "2024-11-15" },
        { nombre_asignatura: "Historia", instrucciones: "Lee el capítulo 3 y responde las preguntas", fecha_entrega: "2024-11-20" }
    ];

    actividadesList.innerHTML = actividades.map(actividad => `
        <li>
            <h4>${actividad.nombre_asignatura}</h4>
            <p>${actividad.instrucciones}</p>
            <p><strong>Fecha de entrega:</strong> ${actividad.fecha_entrega}</p>
        </li>
    `).join('');
});
