// Importar dependencias
const { conexion } = require("./database/conexion");

const express = require("express");
const cors = require("cors");
// Mensaje de bienvenida
console.log("API NODE para RED SOCIAL app_musica  arrancada");
//  Conexion a bbdd
conexion();

//  Crear servidor node
const app = express();
const puerto = 3910;
//  Configurar cors
//utilizar middleware
app.use(cors()); //se ejecuta dentro de un middleware
//  Convertir los datos del body a objects js
app.use(express.json()); //middleware de json a objeto json
app.use(express.urlencoded({ extended: true }));
//  Cargar conf rutas
const UserRoutes = require("./routes/user");
const ArtistRoutes = require("./routes/artist");
const AlbumRoutes = require("./routes/album");
const SongRoutes = require("./routes/song");
//creo que es la ruta general
app.use("/api/user", UserRoutes);
app.use("/api/artist", ArtistRoutes);
app.use("/api/album", AlbumRoutes);
app.use("/api/song", SongRoutes);
//  Poner el servidor a escuchar peticiones http
app.listen(puerto, () => {
    console.log("Servidor de node corriendo en el puerto: ", puerto);
});
