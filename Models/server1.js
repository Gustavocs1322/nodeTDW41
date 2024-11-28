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
        this.app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
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
                    // Verificar si la contraseña es correcta
                    if (bcrypt.compareSync(pass, result[0].contrasena)) {
                        // Guardar el ID del usuario en la sesión
                        req.session.id_Nuser = result[0].id_Nuser;  // Agregar el ID de usuario a la sesión
                        req.session.user = user;
                        req.session.rol = result[0].rol;

                        // Redirigir según el rol del usuario
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

        // Ruta para obtener las actividades por revisar
        this.app.get('/actividades-revisar', (req, res) => {
            const sql = 'SELECT * FROM usuarios.act_realizadas WHERE estatus = "Pendiente"';
            this.con.query(sql, (err, results) => {
                if (err) {
                    console.error('Error al obtener las actividades:', err);
                    res.status(500).json({ message: 'Error al obtener las actividades' });
                    return;
                }
                res.render('actividades-revisar', { actividades: results });
            });
        });

        // Ruta para subir imagen
        const upload = this.configurarMulter();
        this.app.post('/subir-imagen', upload.single('imagen'), (req, res) => {
            if (!req.file) {
                console.log('No se ha subido ninguna imagen.');
                return res.status(400).send('No se ha subido ninguna imagen.');
            }

            let imagenRuta = '/uploads/' + req.file.filename;
            let id_actividad = req.body.id_actividad; // ID de la actividad
            let id_usuario = req.session.id_Nuser;  // Asumimos que el id del usuario está guardado en la sesión

            // Insertar en la base de datos
            let sql = `INSERT INTO act_realizadas (id_actividad, ruta_evidencia, id_usuario) VALUES (?, ?, ?)`;
            this.con.query(sql, [id_actividad, imagenRuta, id_usuario], (err, result) => {
                if (err) {
                    console.error('Error al guardar en act_realizadas:', err);
                    return res.status(500).send('Error al registrar la actividad.');
                }
                res.send(`Actividad registrada correctamente con la imagen: ${imagenRuta}`);
            });
        });

        // Servir el archivo HTML
        this.app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, 'index.html'));
        });
    }

    // Iniciar el servidor
    listen() {
        this.app.listen(this.port, () => {
            console.log(`Servidor escuchando en http://127.0.0.1:${this.port}`);
        });
    }
}

module.exports = Server;
