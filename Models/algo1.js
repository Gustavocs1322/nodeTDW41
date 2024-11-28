const express = require('express');
const mysql = require('mysql');
const session = require('express-session');
const path = require('path');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');

class Server {
    constructor() {
        this.app = express();
        this.conectarBD();
        this.port = process.env.PORT || 5000;

        this.middlewares();
        this.routes();
        this.listen();
    }

    // Conexión a la base de datos
    conectarBD() {
        this.con = mysql.createPool({
            host: "localhost",
            user: "root",
            password: "Guvo2233", // Cambia esto por la contraseña de tu BD
            database: "usuarios"
        });
    }

    // Middlewares para el servidor
    middlewares() {
        this.app.use(express.static('./Public'));
        this.app.use(express.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(bodyParser.json());
        this.app.set("view engine", "ejs");
        this.app.set('trust proxy');
        this.app.use(session({
            secret: 'Clave',
            resave: false,
            saveUninitialized: true,
            cookie: { secure: false }
        }));
        this.app.use(cors());
    }

    // Verificar si la carpeta 'uploads' existe, si no, crearla
    crearCarpetaUploads() {
        const uploadsDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir);
        }
    }

    // Configuración de multer para manejar la subida de archivos
    configurarMulter() {
        // Verifica y crea la carpeta 'uploads' si no existe
        this.crearCarpetaUploads();

        const storage = multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, 'uploads/');
            },
            filename: (req, file, cb) => {
                cb(null, Date.now() + path.extname(file.originalname));
            }
        });

        return multer({ storage: storage });
    }

    // Rutas para las solicitudes HTTP
    routes() {
        // Ruta de ejemplo para Docente
        this.app.get('/Docente', (req, res) => {
            if (req.session.user === "Guadalupe1999") {
                res.render("Docente", { usuario: req.session.user });
            } else {
                res.send("No iniciaste sesión como docente");
            }
        });

        // Ruta de login
        this.app.post("/login", (req, res) => {
            let user = req.body.usuario;
            let pass = req.body.cont;

            this.con.query("SELECT * FROM n_user WHERE usuario = ?", [user], (err, result) => {
                if (err) throw err;
                if (result.length > 0) {
                    if (bcrypt.compareSync(pass, result[0].contrasena)) {
                        req.session.user = user;
                        req.session.rol = result[0].rol;
                        if (result[0].rol === "admin") {
                            res.render("Docente", { usuario: user });
                        } else {
                            res.render("Alumno", { usuario: user });
                        }
                    } else {
                        res.render('error', { mensaje: 'Usuario o contraseña incorrecta' });
                    }
                } else {
                    res.render('error', { mensaje: 'Usuario o contraseña incorrecta' });
                }
            });
        });

        // Ruta de registro
        this.app.post('/registrar', (req, res) => {
            let user = req.body.usuario;
            let cont = req.body.cont;
            let salt = bcrypt.genSaltSync(12);
            let hashedCont = bcrypt.hashSync(cont, salt);

            let datos = [user, hashedCont, 'general'];
            let sql = "INSERT INTO n_user (usuario, contrasena, rol) VALUES (?, ?, ?)";
            this.con.query(sql, datos, (err, result) => {
                if (err) throw err;
                res.redirect('/');
            });
        });

        // Ruta para guardar actividades
        this.app.post('/Actividad', (req, res) => {
            let nombreActividad = req.body.nombre_actividad;
            let descripcion = req.body.descripcion;
            let fechaLimite = req.body.fecha_entrega;
            let estatus = req.body.estatus || 'Pendiente';

            if (!nombreActividad || !descripcion || !fechaLimite) {
                return res.status(400).json({ message: 'Faltan campos obligatorios' });
            }

            let sql = "INSERT INTO act_tt (nombre_actividad, descripcion, fecha_limite, estatus) VALUES (?, ?, ?, ?)";
            this.con.query(sql, [nombreActividad, descripcion, fechaLimite, estatus], (err, result) => {
                if (err) {
                    return res.status(500).json({ message: 'Hubo un error al guardar la actividad' });
                }
                res.status(201).json({ message: 'Actividad guardada con éxito', actividadId: result.insertId });
            });
        });

        // Configuración de multer para manejar la subida de imagen
        const upload = this.configurarMulter();

        // Ruta para subir imagen
        this.app.post('/subir-imagen', upload.single('imagen'), (req, res) => {
            if (!req.file) {
                return res.status(400).send('No se ha subido ninguna imagen.');
            }

            let imagenRuta = '/uploads/' + req.file.filename;

            let sql = "INSERT INTO imagenes (ruta) VALUES (?)";
            this.con.query(sql, [imagenRuta], (err, result) => {
                if (err) {
                    return res.status(500).send('Error al guardar en la base de datos.');
                }
                res.send(`Imagen subida y guardada correctamente: ${imagenRuta}`);
            });
        });

        // Ruta para cerrar sesión
        this.app.get('/cerrar-sesion', (req, res) => {
            req.session.destroy((err) => {
                if (err) {
                    return res.status(500).send("Error al cerrar sesión");
                }
                res.redirect('/');
            });
        });





        
    }

    // Iniciar el servidor
    listen() {
        this.app.listen(this.port, () => {
            console.log(`Servidor escuchando en http://127.0.0.1:${this.port}`);
        });
    }
}

// Exportar la clase Server
module.exports = Server;
