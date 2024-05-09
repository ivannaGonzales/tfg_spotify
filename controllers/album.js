const Album = require("../models/album")
const Song = require("../models/song")

const Artist = require("../models/artist")
const fs = require("fs");
const path = require("path");
const save = (req, res) => {
    // Sacar datos enviados en el body

    let params = req.body;
    let album = new Album(params)
    album.save().then(albumGuardado => {
        return res.status(201).json({
            status: "success",
            message: "Album guardado correctamente",
            albumGuardado: albumGuardado
        });
    }).catch(error => {
        return res.status(500).json({
            status: "error",
            message: "Error al guardar album " + error.message,
        });
    })

}

//sacar un album y sacar la informacion del artista
const one = async (req, res) => {

    try {
        id = req.params.id

        const album = await Album.findById({ _id: id }).populate("artist")
        //sacar informacion del artista
        return res.status(201).json({
            status: "success",
            album: album,
        });

    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "No existe ningun album",
        });
    }
}
const list = async (req, res) => {

    try {
        // Sacar el id del artista por la url
        const id = req.params.id_artista

        //sacar todos los albums de la bbdd de un artista en concreto
        if (!id) {
            return res.status(404).json({
                status: "error",
                message: "No se ha encontrado el artista " + error.message,
            });
        }

        const albums = await Album.find({ artist: id }).populate("artist artist")

        console.log("lenght de albums " + albums.length)
        //popular info del artista
        //devolver ell resultado
        return res.status(200).json({
            status: "sucess",
            message: "Albumes de un artista",
            albums: albums
        });

    } catch (error) {
        return res.status(404).json({
            status: "error",
            message: "No se han encontrado albumnes para ese artista " + error.message,
        });

    }

}
const update = (req, res) => {
    const album_id = req.params.album_id;
    const data = req.body;

    Album.findByIdAndUpdate(album_id, data, { new: true })
        .then(albumUpdate => {
            //para que me devuelva actualizado los datos
            return res.status(200).json({
                status: "success",
                message: "Metodo de actualizar usuario",
                album: albumUpdate
            });

        }).catch(err => {
            return res.status(500).json({
                status: "error",
                mensaje: "Error al actualizar album " + err.message,
            });
        })
}

const upload = (req, res) => {
    // recoger el fichero de imagen y comprobar que existe
    //Recoger artist id
    let albumId = req.params.id;
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
    console.log("albumId " + albumId)
    Album.findOneAndUpdate({ _id: albumId }, { image: req.file.filename }, { new: true })
        .then(albumUpdate => {
            return res.status(200).json({
                status: "sucess",
                album: albumUpdate,
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
const image = (req, res) => {
    // mostrar el avatar
    const file = req.params.file;

    // sacar el parametro de la ulr

    const filePath = "./uploads/albums/" + file; //el nombre del fichero
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

const eliminar = async (req, res) => {
    const albumId = req.params.id;
    try {

        const albumRemoved = await Album.findById(albumId).remove();

        const songsRemoved = await Song.find({ album: albumId }).remove();

        return res.status(200).send({
            status: "success",
            message: "Metodo borrado de artista",
            albumRemoved,
            songsRemoved
        })
    }
    catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error al eliminar el artista o alguno de sus elementos",
            error: error.message
        })
    }
}

module.exports = {
    save,
    one,
    list,
    update,
    upload,
    image,
    eliminar
}