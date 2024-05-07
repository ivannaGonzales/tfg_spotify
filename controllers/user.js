
const validate = require("../helpers/validate")
const User = require("../models/user");
const bcrypt = require("bcrypt");
const pruebaUser = (req, res) => {
    return res.status(200).send({
        message: "Mensaje enviado desde controllers/user.js",
        usuario: req.user,
    });
};
const jwt = require("../services/jwt");
const fs = require("fs");
const path = require("path");
const register = async (req, res) => {

    let params = req.body;
    if (!params.name || !params.email || !params.password || !params.nick) {
        console.log("Validacion Incorrecta");
        return res.status(404).json({
            status: "error",
            message: "Faltan datos por enviar",
        });
    }
    try {
        try {
            validate.validate(params);
        } catch (error) {
            return res.status(404).json({
                status: "error",
                message: "Validacion no superada " + error.message,
            });
        }
        const userFind = await User.findOne({
            $or: [{ email: params.email }, { nick: params.nick }],
        });

        if (userFind) {
            // Si el usuario ya existe, enviar respuesta y detener la ejecución
            return res.status(400).json({
                status: "success",
                message: "El usuario ya existe",
                user: userFind,
            });
        }

        // Si el usuario no existe, proceder a crear y guardar el nuevo usuario
        let pwd = await bcrypt.hash(params.password, 10);
        params.password = pwd;

        let user_to_save = new User(params);
        const usuarioGuardado = await user_to_save.save();
        //limpiar el objeto
        let userCreated = usuarioGuardado.toObject();
        delete userCreated.password;
        delete userCreated.role;
        delete userCreated.email;
        delete userCreated.__v;
        // Enviar respuesta de éxito después de guardar el nuevo usuario
        return res.status(200).json({
            status: "usuario guardado",
            User: userCreated,
            mensaje: "usuarioGuardado creado con exito",
        });
    } catch (error) {
        // Manejar cualquier error que ocurra durante la operación
        return res.status(500).json({
            status: "error",
            mensaje: "Error en la consulta de usuarios" + error.message,
        });
    }
}

const login = (req, res) => {
    //me va a devolver los datos de mi usuario o un token jwt

    //recoger parametros body
    const params = req.body;

    console.log(params)
    if (!params.email || !params.password) {
        return res.status(400).send({
            status: "error",
            message: "Faltan datos por llegar",
        });
    }

    //buscar en la bbdd si existe
    User.findOne({ email: params.email }).select("+password +role")
        //.select({ password: 0 }) // para que no me llegue el password
        .then((user) => {
            if (!user) {

                return res.status(404).send({
                    status: "error",
                    message: "No existe el usuario",
                });
            }

            let pwd = bcrypt.compareSync(params.password, user.password);
            if (!pwd) {
                return res.status(400).send({
                    status: "error",
                    message: "No te has identificado correctamente",
                });
            }

            // Conseguir el token

            let identityUser = user.toObject();
            delete identityUser.password;
            delete identityUser.role;
            const token = jwt.createToken(user);

            //Devolver datos del usuario

            return res.status(200).send({
                status: "sucess",
                message: "Te has identificado correctamente",
                user: identityUser,
                token: token
            });
        })
        .catch((error) => {
            return res.status(404).send({
                status: "error",
                message: "No existe el usuario " + error.message,
            });
        });
};

const profile = async (req, res) => {
    // Recibir el parametro del id de usuario por la url
    const id = req.params.id;

    try {
        // Consulta para sacar los datos del usuario
        const userProfile = await User.findById(id).select({ password: 0, role: 0 });

        if (!userProfile) {
            return res.status(404).json({
                status: "success",
                message: "No existe el usuario",
            });
        }

        // Info de seguimiento
        // Aquí asumimos que tienes un servicio de seguimiento implementado
        // que recibe el id del usuario actualmente autenticado y el id del usuario del perfil
        // y devuelve información sobre si el usuario actual sigue al usuario del perfil.

        // Devolver el resultado
        return res.status(200).json({
            status: "success",
            userProfile,
        });
    } catch (err) {
        res.status(404).json({
            status: "error",
            message: "El usuario no existe: " + err.message,
        });
    }
};

const update = async (req, res) => {
    //recoger info del usuario a actualizar
    let userIdentity = req.user;// -> actualizar este usuario
    let userToUpdate = req.body;
    try {
        validate.validate(userToUpdate);
    } catch (error) {
        return res.status(404).json({
            status: "error",
            message: "Validacion no superada " + error.message,
        });
    }
    // Eliminar campos sobrantes
    delete userIdentity.role;
    delete userIdentity.image;
    //comprobar si el usuario ya existe

    try {

        const users = await User.find({
            $or: [{ email: userToUpdate.email }, { nick: userToUpdate.nick }],
        });

        let userIsset = false;
        users.forEach(user => {
            //user._id --> si que existe
            // es distinto al userIdentity al del token
            if (user && user._id != userIdentity.id) {
                userIsset = true;
            }

        });

        if (userIsset) {
            // Si el usuario ya existe, enviar respuesta y detener la ejecución
            return res.status(400).json({
                status: "success",
                message: "El usuario ya existe",
                user: userFind,
            });
        }

        //Cifrar la contraseña
        //Si me llega la contraseña
        if (userToUpdate.password) {
            let pwd = await bcrypt.hash(userToUpdate.password, 10);
            userToUpdate.password = pwd;

        }
        else {
            //eliminar el campo de password
            delete userToUpdate.password
        }
        //Buscar y actualizar
        User.findByIdAndUpdate(userIdentity.id, userToUpdate, { new: true })
            .then(userUpdate => {
                //para que me devuelva actualizado los datos
                return res.status(200).json({
                    status: "success",
                    message: "Metodo de actualizar usuario",
                    user: userUpdate
                });

            }).catch(err => {
                return res.status(500).json({
                    status: "error",
                    mensaje: "Error al actualizar usuarios " + err.message,
                });
            })

    } catch (error) {
        // Manejar cualquier error que ocurra durante la operación
        return res.status(500).json({
            status: "error",
            mensaje: "Error en la consulta de usuarios " + error.message,
        });
    }

}
const upload = (req, res) => {
    // recoger el fichero de imagen y comprobar que existe
    console.log("file what " + req.file.path)
    if (!req.file) {
        return res.status(404).json({
            status: "error",
            mensaje: "La peticion no incluye la imagen"
        });
    }
    // conseguir el nombre del archivo
    let image = req.file.originalname;
    // sacar la extension del archivo
    const imageSplit = image.split("\.");
    const extension = imageSplit[1];
    // comprobar extension
    if (extension.toLowerCase() != "png" && extension != "jpg" && extension != "gif") {
        //eliminar archivo que se sube automaticamente a la carpeta

        //ruta fisica
        const filePath = req.file.path;
        console.log("file miau" + filePath)
        const fileDelete = fs.unlinkSync(filePath);//borrar el archivo
        return res.status(400).send({
            status: "error",
            mensaje: "Extension del fichero invalida"
        });
    }
    // si si es correcto, guardar imagen en bbdd
    User.findOneAndUpdate({ _id: req.user.id }, { image: req.file.filename }, { new: true })
        .then(userUpdate => {
            return res.status(200).json({
                status: "sucess",
                user: userUpdate,
                file: req.file,
            });

        })
        .catch(error => {
            return res.status(500).send({
                status: "error",
                mensaje: "Error en la subida del avatar " + error.message
            });
        })
}
const avatar = (req, res) => {
    // mostrar el avatar
    const file = req.params.file;

    // sacar el parametro de la ulr

    const filePath = "./uploads/avatars/" + file; //el nombre del fichero
    // montar el path real de la imagen 
    fs.stat(filePath, (error, exists) => {
        console.log(path.resolve(filePath))
        if (!exists) {
            return res.status(404).send({
                status: "error",
                mensaje: "No existe la imagen " + error.message
            });
        }

        //Devolver el archivo, hay que devolver una ruta absoluta
        return res.sendFile(path.resolve(filePath));
    })//--> comprobar si un archivo existe
}

module.exports = {
    pruebaUser,
    register,
    login,
    profile,
    update,
    upload,
    avatar
}