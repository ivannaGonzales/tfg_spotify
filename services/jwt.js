// Importar dependencias
const jwt = require("jwt-simple");

const moment = require("moment");

// Clave secreta

const secret = "CLAVE_SECRETA_del_proyecto_DE_LA_RED_soCIAL_987987";

//Crear funcion para generar token
const createToken = (user) => {
    //lo que se va a cargar dentro de nuestro token
    //En formato de sesion
    //una vez que decodifique ese token tendre toda esa informacion del usuario
    //que necesitare en mis metodos
    const payload = {
        id: user._id,
        name: user.name,
        surname: user.surname,
        nick: user.nick,
        email: user.email,
        role: user.role,
        imagen: user.imagen,
        iat: moment().unix(), // en el momento que se crea el payload (fecha de creacion del token)
        exp: moment().add(30, "days").unix(), //la fecha de expiriacion del tokem
    };

    //Devolver jwt token codificado
    return jwt.encode(payload, secret);
};

module.exports = {
    secret,
    createToken,
};
