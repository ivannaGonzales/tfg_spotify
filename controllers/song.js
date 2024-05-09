
const Song = require("../models/song")
const fs = require("fs");
const path = require("path");
const save = (req, res) => {

    let params = req.body;
    //recoger los datos que me llegan
    let song = new Song(params)

    song.file = null;
    //Crear un ojeto con mi modelo
    // Guardado
    song.save().then(songStored => {

        if (!songStored) {
            return res.status(404).json({
                status: "error",
                message: "No se ha podido guardar"
            });

        }
        return res.status(200).json({
            status: "success",
            songStored: songStored
        });

    }).catch(error => {
        return res.status(500).json({
            status: "Error",
            message: error.message
        });
    })


}
//tengo que sacar el album tambien
const one = (req, res) => {
    let songId = req.params.id;
    Song.findById(songId).populate("album").then((song) => {
        if (!song) {
            return res.status(500).json({
                status: "Error",
                message: "No existe la cancion"
            });
        }
        return res.status(200).json({
            status: "success",
            song: song
        });

    }).catch(error => {
        return res.status(500).json({
            status: "Error",
            message: error.message
        });

    })
}
//listar todas las canciones de un album
const list = (req, res) => {
    let albumId = req.params.albumId
    //recoger id del album 
    //hacer consulta
    Song.find({ album: albumId }).sort("track").
        populate({
            path: "album",
            populate: {
                path: "artist",//propiedad
                model: "Artist"//modelo
            }
        }).then(songs => {
            if (!songs) {
                return res.status(404).json({
                    status: "Error",
                    message: "No hay canciones"
                });
            }
            return res.status(200).json({
                status: "success",
                songs: songs
            });


        }).catch(error => {

        })
    //devolver un resultado

}

const update = (req, res) => {
    //parametro url id de cancion
    let songId = req.params.id;
    //datos para guardar 
    let data = req.body;
    //busqueda y actualizacion
    console.log("songId " + songId)

    Song.findByIdAndUpdate(songId, data, { new: true }).then(songUpdated => {

        if (!songUpdated) {
            return res.status(404).json({
                status: "error",
                message: "No se pudo actualizar"
            });

        }
        return res.status(200).json({
            status: "sucess",
            song: songUpdated
        });

    }).catch(error => {
        return res.status(500).json({
            status: "error",
            message: "Error general"
        });

    })
}

//borrar una cancion
const remove = (req, res) => {
    //recoger parametro
    const songId = req.params.id;
    Song.findByIdAndRemove(songId).then(songRemoved => {
        if (!songRemoved) {
            return res.status(500).json({
                status: "error",
                message: "No se ha podido eliminar la cancion "
            });
        }
        return res.status(204).json({
            status: "error",
            songRemoved: songRemoved
        });

    }).catch(error => {

        return res.status(500).json({
            status: "error",
            message: "Error general"
        });
    })

}
const upload = (req, res) => {
    // recoger el fichero de imagen y comprobar que existe
    //Recoger artist id
    let songId = req.params.id;
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
    if (extension.toLowerCase() != "mp4" && extension != "ogg") {
        //eliminar archivo que se sube automaticamente a la carpeta

        //ruta fisica
        const filePath = req.file.path;
        const fileDelete = fs.unlinkSync(filePath);//borrar el archivo
        return res.status(400).send({
            status: "error",
            mensaje: "Extension del fichero invalida"
        });
    }
    // si si es correcto, guardar imagen en bbdd
    Song.findOneAndUpdate({ _id: songId }, { file: req.file.filename }, { new: true })
        .then(songUpdate => {
            return res.status(200).json({
                status: "sucess",
                song: songUpdate,
                file: req.file,
            });

        })
        .catch(error => {
            return res.status(500).send({
                status: "error",
                mensaje: "Error en la subida de la imagen " + error.message
            });
        })
}
const audio = (req, res) => {
    // mostrar el avatar
    const file = req.params.file;
    console.log("hola")

    // sacar el parametro de la ulr

    const filePath = "./uploads/songs/" + file; //el nombre del fichero
    console.log("filePath " + filePath)
    ///Users/ivannagonzales/tfg_spotify/uploads/songs
    // montar el path real de la imagen 
    fs.stat(filePath, (error, exists) => {
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


//subir archivos
module.exports = {
    save,
    one,
    list,
    update,
    remove,
    upload,
    audio
}