const express = require("express");

const router = express.Router();

const UserController = require("../controllers/user");

const check = require("../middleware/auth");
const multer = require("multer")//--> middleware

//Configuracion de subida, configurar el middleware
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/avatars/")
    },
    filename: (req, file, cb) => {
        cb(null, "avatar-" + Date.now() + "-" + file.originalname)

    }
})
//crear middleware
const uploads = multer({ storage })
//Definir rutas
router.post("/register", UserController.register)
router.post("/login", UserController.login);
router.get("/profile/:id", check.auth, UserController.profile)
router.put("/update", check.auth, UserController.update)
router.post("/upload", [check.auth, uploads.single("file0")], UserController.upload)
router.get("/avatar/:file", UserController.avatar);
module.exports = router;