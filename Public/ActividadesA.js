document.addEventListener("DOMContentLoaded", () => {
    const allowedFileTypes = ["image/jpeg", "image/png", "application/pdf"];

    // Función para validar tipo de archivo
    function validateFile(file, tareaCell, fileInput) {
        if (!allowedFileTypes.includes(file.type)) {
            alert("Solo se permiten imágenes (JPEG, PNG) o documentos PDF.");
            fileInput.value = ""; // Limpiar el archivo seleccionado
            tareaCell.textContent = "Ningún archivo adjunto";
            return false;
        }
        return true;
    }

    // Obtener actividades desde el servidor y generar tabla
    fetch('/actividades')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.querySelector('table tbody');
            
            if (data.length > 0) {
                data.forEach(activity => {
                    const row = document.createElement('tr');
                    
                    row.innerHTML = `
                        <td>${activity.id}</td>
                        <td>${activity.Nombre_Asignatura}</td>
                        <td>${activity.Instrucciones}</td>
                        <td>${activity.Fecha}</td>
                        <td>${activity.Estado || 'N/A'}</td>
                        <td class="tarea-cell">Ningún archivo adjunto</td>
                        <td>
                            <button class="attach">Adjuntar</button>
                            <input type="file" class="file-input" style="display: none;">
                            <button class="send">Enviar</button>
                            <button class="delete">Eliminar</button>
                        </td>
                    `;

                    tableBody.appendChild(row);

                    // Asociar eventos a los botones dentro de esta fila
                    const attachButton = row.querySelector(".attach");
                    const sendButton = row.querySelector(".send");
                    const deleteButton = row.querySelector(".delete");
                    const fileInput = row.querySelector(".file-input");
                    const tareaCell = row.querySelector(".tarea-cell");

                    // Adjuntar archivo
                    attachButton.addEventListener("click", () => {
                        fileInput.click(); // Simular clic en el input[type="file"]
                    });

                    fileInput.addEventListener("change", () => {
                        const file = fileInput.files[0];
                        if (file && validateFile(file, tareaCell, fileInput)) {
                            tareaCell.textContent = file.name; // Actualizar el nombre del archivo
                        }
                    });

                    // Enviar archivo
                    sendButton.addEventListener("click", () => {
                        const file = fileInput.files[0];

                        if (!file) {
                            alert("No se ha adjuntado ningún archivo.");
                            return;
                        }

                        const formData = new FormData();
                        formData.append("file", file);

                        // Indicador de envío
                        sendButton.disabled = true;
                        sendButton.textContent = "Enviando...";

                        fetch("/upload", {
                            method: "POST",
                            body: formData,
                        })
                            .then((response) => response.json())
                            .then((data) => {
                                if (data.success) {
                                    alert(`Archivo "${file.name}" enviado correctamente.`);
                                } else {
                                    alert("Hubo un error al enviar el archivo.");
                                }
                            })
                            .catch((error) => {
                                console.error("Error al enviar el archivo:", error);
                                alert("Hubo un error al enviar el archivo.");
                            })
                            .finally(() => {
                                sendButton.disabled = false;
                                sendButton.textContent = "Enviar";
                            });
                    });

                    // Eliminar archivo
                    deleteButton.addEventListener("click", () => {
                        tareaCell.textContent = "Ningún archivo adjunto"; // Limpiar nombre de archivo
                        fileInput.value = ""; // Limpiar el valor del input
                    });
                });
            } else {
                const row = document.createElement('tr');
                row.innerHTML = `<td colspan="7">No hay actividades disponibles</td>`;
                tableBody.appendChild(row);
            }
        })
        .catch(err => {
            console.error('Error al obtener las actividades:', err);
        });
});
