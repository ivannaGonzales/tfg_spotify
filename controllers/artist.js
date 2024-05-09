const Artist = require("../models/artist")
const Album = require("../models/album")
const Song = require("../models/song")
const fs = require("fs");
const path = require("path");
//guardar un artista en la base de datos
const save = (req, res) => {
    //Recoger datos del body
    params = req.body;

    if (!params.name) {
        return res.status(409).json({
            status: "error",
            message: "Faltan datos por enviar",
        });
    }
    //Crear el objeto a guardar
    let artistSave = new Artist(params)

    artistSave.save().then(artistSaved => {
        return res.status(201).json({
            status: "success",
            message: "Guardar artista",
            artistSaved
        });
    }).catch(error => {
        return res.status(404).json({
            status: "error",
            message: "No se ha podido guardar el artista " + error.message,
        });
    });
}

//sacar un solo artista

const one = async (req, res) => {
    try {
        const id = req.params.id

        artista = await Artist.findById({ _id: id }).select({ __v: 0 })

        return res.status(200).json({
            status: "sucess",
            artista: artista
        });

    } catch (error) {

        return res.status(404).json({
            status: "error",
            error: "No se ha encontrado ninguno artista"
        });
    }


}

const list = async (req, res) => {
    try {
        let page = 1
        if (req.params.page) {
            page = req.params.page
        }
        let itemsPerPage = 2

        const artist = await Artist.paginate({}, {
            page: page,
            limit: itemsPerPage,
            select: '-__v',
            sort: { name: 1 } // Ordena por el campo 'name' en orden ascendente
        });

        return res.status(200).json({
            status: "sucess",
            message: "Listar artistas",
            artist: artist
        });

    } catch (error) {
        return res.status(404).json({
            status: "sucess",
            error: "No se ha podido listar artistas " + error.message,
        });
    }

}
const update = (req, res) => {
    const id = req.params.id;
    const data = req.body;

    Artist.findByIdAndUpdate(id, data, { new: true })
        .then(artistaUpdate => {
            //para que me devuelva actualizado los datos
            return res.status(200).json({
                status: "success",
                message: "Metodo de actualizar usuario",
                artista: artistaUpdate
            });

        }).catch(err => {
            return res.status(500).json({
                status: "error",
                mensaje: "Error al actualizar artista " + err.message,
            });
        })


}

//eliminar un artista
// todo lo relacionado
const eliminar = async (req, res) => {
    const id = req.params.id;
    try {
        const artistRemoved = await Artist.findByIdAndDelete(artistId)

        const albumRemoved = await Album.find({ artist: artistId }).remove();

        // y si hay muchos albumes? porque solo cojo uno
        albumRemoved.array.forEach(async (album) => {
            const songsRemoved = await Song.find({ album: album._id }).remove();

            album.remove();

        });
        return res.status(200).send({
            status: "success",
            message: "Metodo borrado de artista",
            artistRemoved,
        })
    }
    catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error al eliminar el artista o alguno de sus elementos",
            error
        })
    }
}

const upload = (req, res) => {
    // recoger el fichero de imagen y comprobar que existe
    //Recoger artist id
    let artistId = req.params.id;
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
    Artist.findOneAndUpdate({ _id: rartistId }, { image: req.file.filename }, { new: true })
        .then(artistUpdate => {
            return res.status(200).json({
                status: "sucess",
                artist: artistUpdate,
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

    const filePath = "./uploads/artist/" + file; //el nombre del fichero
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
    save,
    one,
    list,
    update,
    eliminar,
    upload,
    image
}