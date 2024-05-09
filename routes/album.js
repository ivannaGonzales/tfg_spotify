const express = require("express")
const router = express.Router();
const AlbumController = require("../controllers/album")
const check = require("../middleware/auth");
const multer = require("multer")//--> middleware

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/albums/")
    },
    filename: (req, file, cb) => {
        cb(null, "albums-" + Date.now() + "-" + file.originalname)

    }
})

const uploads = multer({ storage })

router.post("/save", check.auth, AlbumController.save)
router.get("/one/:id", check.auth, AlbumController.one)
router.get("/list/:id_artista", check.auth, AlbumController.list)
router.put("/update/:album_id", check.auth, AlbumController.update)
router.post("/upload/:id", [check.auth, uploads.single("file0")], AlbumController.upload)
router.get("/image/:file", AlbumController.image);
router.delete("/remove/:id", check.auth, AlbumController.eliminar)
module.exports = router;