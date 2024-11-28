// Asignación de eventos de clic a los botones de iniciar sesión y registrarse
document.getElementById("btn__iniciar-sesion").addEventListener("click", iniciarSesion);
document.getElementById("btn__registrarse").addEventListener("click", register);
window.addEventListener("resize", anchoPagina);

// Declaración de variables
var contenedor_login_register = document.querySelector(".contenedor__login-register");
var formulario_login = document.querySelector(".formulario__login");
var formulario_register = document.querySelector(".formulario__register");
var caja_trasera_login = document.querySelector(".caja__trasera-login");
var caja_trasera_register = document.querySelector(".caja__trasera-register");

// Función para ajustar la visualización según el ancho de la página
function anchoPagina() {
    if (window.innerWidth > 850) {
        caja_trasera_login.style.display = "block";
        caja_trasera_register.style.display = "block";
        caja_trasera_register.style.opacity = "1";
        caja_trasera_login.style.opacity = "1";
    } else {
        caja_trasera_register.style.display = "block";
        caja_trasera_register.style.opacity = "1";
        caja_trasera_login.style.display = "none";
        formulario_login.style.display = "block";
        formulario_register.style.display = "none";
        contenedor_login_register.style.left = "0";
    }
}

// Llamado inicial para ajustar la visualización al cargar la página
anchoPagina();

// Función para mostrar el formulario de inicio de sesión
function iniciarSesion() {
    if (window.innerWidth > 850) {
        formulario_register.style.display = "none";
        formulario_login.style.display = "block";
        contenedor_login_register.style.left = "10px";
        caja_trasera_register.style.opacity = "1";
        caja_trasera_login.style.opacity = "0";
    } else {
        formulario_register.style.display = "none";
        formulario_login.style.display = "block";
        contenedor_login_register.style.left = "0";
        caja_trasera_register.style.display = "block";
        caja_trasera_login.style.display = "none";
    }
}

// Función para mostrar el formulario de registro
function register() {
    if (window.innerWidth > 850) {
        formulario_register.style.display = "block";
        formulario_login.style.display = "none";
        contenedor_login_register.style.left = "700px";
        caja_trasera_register.style.opacity = "0";
        caja_trasera_login.style.opacity = "1";
    } else {
        formulario_register.style.display = "block";
        formulario_login.style.display = "none";
        contenedor_login_register.style.left = "450px";
        caja_trasera_register.style.display = "none";
        caja_trasera_login.style.display = "block";
        caja_trasera_login.style.opacity = "1";
    }
}
