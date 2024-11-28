const express = require('express');
const mysql = require('mysql');
const session = require('express-session');
const path = require('path');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const app = express();



const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true }); // Crear la carpeta si no existe
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);  // Directorio donde se guardarán los archivos
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        cb(null, timestamp + '-' + file.originalname);  // Renombrar el archivo con un timestamp
    }
});

const upload = multer({ storage });




class Server {
    constructor() {
        this.app = express();
        this.conectarBD();
        this.port = process.env.PORT || 5000;  // Establece el puerto, usa 5000 por defecto

        this.middlewares();
        this.routes();
        this.listen();
    }

    conectarBD() {
        this.con = mysql.createPool({
            host: "localhost",
            user: "root",
            password: "Guvo2233", 
            database: "usuarios"
        });
    }

    middlewares() {
        this.app.use(express.static('./Public'));
        this.app.use(express.json());
        
        // Configurar body-parser para manejar datos de formularios URL-encoded
        this.app.use(bodyParser.urlencoded({ extended: true }));  // Agrega esta línea
        this.app.use(bodyParser.json());  // Si deseas usar JSON también

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

    

    routes() {
        this.app.get('/Docente', (req, res) => {
            if (req.session.user === "Guadalupe1999") {
                res.render("Docente" + req.session.user);
            } else {
                res.send("No iniciaste sesión como docente");
            }
        });
    
        this.app.get('/Hola', (req, res) => {
            if (req.session.user) {
                res.send("Hola " + req.session.user);
            } else {
                res.send("No iniciaste sesión");
            }
        });
    
        this.app.post("/login", (req, res) => {
            let user = req.body.usuario;
            let pass = req.body.cont;
    
            console.log("Ruta login...");
            console.log(user);
            console.log(pass);
    
            this.con.query("SELECT * FROM usuarios where usuario='" + user + "'", (err, result) => {
                if (err) throw err;
                if (result.length > 0) {
                    if (result[0].contrasena == pass) {
                        console.log('Credenciales correctas');
                        req.session.user = user;
                        req.session.rol = result[0].rol;
                        if (result[0].rol == "admin") {
                            res.render("Docente", { usuario: user, rol: result[0].rol });
                        } else {
                            res.render("Alumno", { usuario: user, rol: result[0].rol });
                        }
                    } else {
                        console.log('Contraseña incorrecta');
                        res.render('error', { mensaje: 'Usuario o contraseña incorrecta' });
                    }
                } else {
                    console.log('Usuario no existente');
                    res.render('error', { mensaje: 'Usuario o contraseña incorrecta' });
                }
            });
        });
    
        this.app.post('/registrar', (req, res) => {
            let user = req.body.usuario;
            let cont = req.body.cont;
            let salt = bcrypt.genSaltSync(12);
            let hashedCont = bcrypt.hashSync(cont, salt);
    
            let datos = [user, hashedCont, 'general'];
            let sql = "INSERT INTO usuarios (usuario, contrasena, rol) VALUES (?, ?, ?)";
            this.con.query(sql, datos, (err, result) => {
                if (err) throw err;
                console.log("Usuario guardado...");
                res.redirect('/');
            });
        });
    
        this.app.get('/AsignaturaA', (req, res) => {
            res.render('AsignaturaA');  // Renderiza la plantilla AsignaturaA.ejs
        });
    
        this.app.get('/ActividadesA', (req, res) => {
            res.render('ActividadesA');  // Renderiza la plantilla ActividadesA.ejs
        });
    
        
        this.app.post('/Actividad', (req, res) => {
            // Utiliza los nombres correctos que envía el cliente
            let nombreActividad = req.body.nombre_asignatura;
            let instrucciones = req.body.instrucciones;
            let fecha_entrega = req.body.fecha_entrega;
        
            // Mensajes para verificar los datos
            console.log("Datos recibidos:", req.body);
        
            if (!nombreActividad || !instrucciones || !fecha_entrega) {
                console.error("Faltan campos obligatorios");
                return res.status(400).json({ message: 'Faltan campos obligatorios' });
            }
        
            let sql = "INSERT INTO act_d (Nombre_Asignatura, Instrucciones, Fecha) VALUES (?, ?, ?)";
            this.con.query(sql, [nombreActividad, instrucciones, fecha_entrega], (err, result) => {
                if (err) {
                    console.error('Error al guardar la actividad:', err);
                    console.log(err);
                    return res.status(500).json({ message: 'Hubo un error al guardar la actividad' });
                }
                console.log("Actividad guardada...");
                res.status(201).json({ message: 'Actividad guardada con éxito' });
            });
        });
        
        this.app.get('/cerrar-sesion', (req, res) => {
            req.session.destroy((err) => {
                if (err) {
                    console.error("Error al cerrar sesión:", err);
                    return res.status(500).send("Error al cerrar sesión");
                }
                res.redirect('/'); // Redirige al login después de cerrar la sesión
            });
        });

        this.app.post('/upload', upload.single('file'), (req, res) => {
            if (req.file) {
                const filePath = '/uploads/' + req.file.filename;  // Ruta relativa del archivo subido
        
                // Aquí obtenemos los datos de la base de datos y el archivo en específico
                let nombreActividad = req.body.nombre_asignatura;
                let instrucciones = req.body.instrucciones;
        
                // Verificar que los campos obligatorios estén presentes
                if (!nombreActividad || !instrucciones) {
                    console.error("Faltan campos obligatorios");
                    return res.status(400).json({ message: 'Faltan campos obligatorios' });
                }
        
                // Insertar la ruta del archivo y los datos en la tabla `archivos`
                let sql = 'INSERT INTO archivos (ruta, nombre_asignatura, instrucciones) VALUES (?, ?, ?)';
        
                // Usamos `db.query()` para ejecutar la consulta
                db.query(sql, [filePath, nombreActividad, instrucciones], (err, results) => {
                    if (err) {
                        console.error('Error al insertar en la base de datos:', err);
                        return res.status(500).json({ success: false, message: 'Error al guardar el archivo en la base de datos.' });
                    }
                    res.json({ success: true, message: 'Archivo subido y guardado en la base de datos correctamente.' });
                });
            } else {
                console.error('No se ha recibido el archivo');
                res.status(400).json({ success: false, message: 'No se ha recibido el archivo.' });
            }
        });
        
        
        
}

listen() {
    this.app.listen(this.port, () => {
        console.log("Servidor escuchando: http://127.0.0.1:" + this.port);
    });
}
}


module.exports = Server;










this.app.get('/actividades-asignadas', (req, res) => {
    let sql = `
        SELECT
            nombre_actividad,
            descripcion,
            fecha_asignacion,
            fecha_limite,
            estatus
        FROM act_dd
        where estatus = 'Pendiente'
    `;

    this.con.query(sql, (err, results) => {
        if (err) {
            console.error('Error al obtener las actividades:', err);
            return res.status(500).json({ error: 'Error al obtener las actividades' });
        }

        res.json(results);
    });
});

this.app.get('/actividades-asignadas', (req, res) => {
    let sql = "SELECT * FROM act_a WHERE Estado = 'pendiente'";

    this.con.query(sql, (err, results) => {
        if (err) {
            console.error('Error al ejecutar la consulta:', err);
            res.status(500).send('Error al obtener actividades');
        } else {
            // Revisa que los datos obtenidos coincidan con lo esperado
            console.log(results);
            console.log("Ruta actividades")
            res.render('ActividadesA', { actividades: results });
        }
    });
});




this.app.get('/ver-actividades', (req, res) => {
    // Verifica si la sesión y el rol están configurados
    let usuario = req.session.user;
    let rol = req.session.rol;

    if (usuario) {
        // Verifica si el rol del usuario es 'admin'
        if (rol === 'admin') {
            // Consulta las actividades desde la base de datos
            let sql = "SELECT * FROM usuarios.vermisactivitys;";
            
            this.con.query(sql, (err, results) => {
                if (err) {
                    console.error('Error al obtener las actividades:', err);
                    return res.status(500).json({ error: 'Error al obtener las actividades' });
                } else {
                    // Renderiza la vista con las actividades obtenidas
                    console.log("Ruta actividades del Docente");
                    res.render('VerActAsiD', { actividades: results, usuario: usuario, rol: rol });
                }
            });
        } else {
            // Si el rol no es 'admin', muestra un mensaje de error
            res.render('error', { mensaje: 'No tienes permiso para acceder a esta página' });
        }
    } else {
        // Si no hay sesión, muestra un mensaje de error
        res.render('error', { mensaje: 'No has iniciado sesión' });
    }
});



this.app.get('/ver-actividades',(req, res) => {
    let usuario = req.session.user;
    let rol = req.session.rol;
    if(req.session.user){
        if(req.session.rol == 'admin'){
            res.render('/ver-actividades',{usuario: usuario, rol: rol});
        }else{
            res.render('error',{mensaje: 'No iniciaste session'});
         }
    }  
});

this.app.get('/ver-actividades', (req, res) => {
    let sql = "SELECT * FROM usuarios.vermisactivitys;";

    this.con.query(sql, (err, results) => {
        if (err) {
            console.error('Error al obtener las actividades:', err);
            return res.status(500).json({ error: 'Error al obtener las actividades' });
        } else {
            // Revisa que los datos obtenidos coincidan con lo esperado
            console.log(results);
            console.log("Ruta actividades del Docente")
            res.render('VerActAsiD', { actividades: results });
        }
    });




    this.app.get('/ActividadesA', (req, res) => {
        let sql = "SELECT * FROM act_a WHERE Estado = 'pendiente'";
    
        this.con.query(sql, (err, results) => {
            if (err) {
                console.error('Error al ejecutar la consulta:', err);
                res.status(500).send('Error al obtener actividades');
            } else {
                // Revisa que los datos obtenidos coincidan con lo esperado
                console.log(results);
                console.log("Ruta actividades")
                res.render('ActividadesA', { actividades: results });
            }
        });
    });
    

    this.app.get('/actividades-bd', (req, res) => { //vista de alumno para ver actividades aprobadas
        let sql = "SELECT * FROM act_a WHERE Estado = 'Aprobada'";
    
        this.con.query(sql, (err, results) => {
            if (err) {
                console.error('Error al ejecutar la consulta:', err);
                res.status(500).send('Error al obtener actividades');
            } else {
                // Revisa que los datos obtenidos coincidan con lo esperado
                console.log(results);
                console.log("Ruta actividades")
                res.render('ActDocAlum', { actividades: results });
            }
        });
    });