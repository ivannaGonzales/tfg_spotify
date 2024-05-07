//Va antes de las rutas

// Una clave secreta sirve para cifrar o descigrar mensaje en
// cifrado simetrico y asimetrico

//Importar moduloes
const jwt = require("jwt-simple");
const moment = require("moment");

//Importar clave secreta
const libjwt = require("../services/jwt");
const secret = libjwt.secret;

// Funcion de autenticacion
exports.auth = (req, res, next) => {
    // Comprobar si me llega la cabecera de auth

    if (!req.headers.authorization) {
        return res.status(403).send({
            status: "error",
            message: "La peticion no tiene la cabecera de autenticacion",
        });
    }

    // Limpiar el token
    //let token = req.header.authorization.replace(/['"]+/g, '');
    let token = req.headers.authorization ? req.headers.authorization.replace(/['"]+/g, '') : null;
    //Decodificar token

    try {
        //datos cargados
        let payload = jwt.decode(token, secret);
        //Comprobar expiracion del token
        if (payload.exp <= moment().unix()) {
            return res.status(401).send({
                status: "error",
                message: "Token expirado",
                error,
            });
        }
        // Agregar datos del usuario a request
        req.user = payload; // --> en cada peticion veremos los datos del usuario
    } catch (error) {
        return res.status(404).send({
            status: "error",
            message: "Token invalido",
            error,
        });
    }
    //req.user = payload; // --> en cada peticion veremos los datos del usuario
    // Pasar a ejecucion de accion
    next(); //ejecutar la accion del controlador
};
