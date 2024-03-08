const router = require("express").Router();
const Controller = require("../controllers/pomo_controller");
const authMiddleware = require("../middlewares/auth_middleware");

router.get("/", authMiddleware.oturumAcilmismi, Controller.getanasayfa);

module.exports = router;
