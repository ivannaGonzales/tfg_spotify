const express = require("express")
const router = express.Router();
const SongController = require("../controllers/song")
const check = require("../middleware/auth");
const multer = require("multer")//--> middleware


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/songs/")
    },
    filename: (req, file, cb) => {
        cb(null, "songs-" + Date.now() + "-" + file.originalname)

    }
})

const uploads = multer({ storage })

router.post("/save", check.auth, SongController.save);

router.get("/one/:id", check.auth, SongController.one);
router.get("/list/:albumId", check.auth, SongController.list);
router.put("/update/:id", check.auth, SongController.update);
router.delete("/remove/:id", check.auth, SongController.remove)
router.post("/upload/:id", [check.auth, uploads.single("file0")], SongController.upload)
router.get("/audio/:file", SongController.audio);
module.exports = router;