const mongoose = require("mongoose");
mongoose.set("strictQuery", true);
const conexion = async () => {
    try {
        await mongoose.connect("mongodb://localhost:27017/app_musica");
        console.log("Conectado correctamente a la base de datos app_musica !!");
    } catch (error) {
        console.log(error);
        throw new Error("No se ha podido conectar a la base de datos !!");
    }
};

module.exports = {
    conexion,
};
