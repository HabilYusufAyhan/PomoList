const router = require("express").Router();
const authController = require("../controllers/auth_controller");
const validatorMiddleware = require("../middlewares/validation_middleware");
const authMiddleware = require("../middlewares/auth_middleware");

router.get(
  "/auth",
  authMiddleware.oturumAcilmamismi,
  authController.loginFormunuGoster
);
router.post(
  "/login",
  authMiddleware.oturumAcilmamismi,
  validatorMiddleware.validateLogin(),
  authController.login
);
router.post(
  "/register",
  authMiddleware.oturumAcilmamismi,
  validatorMiddleware.validateNewUser(),
  authController.register
);
router.get(
  "/forget-password",
  authMiddleware.oturumAcilmamismi,
  authController.forgetPasswordFormunuGoster
);
router.post(
  "/forget-password",
  authMiddleware.oturumAcilmamismi,
  validatorMiddleware.validateEmail(),
  authController.forgetPassword
);
router.get("/verify", authController.verifyMail);
router.get("/reset-password/:id/:token", authController.yeniSifreFormuGoster);
router.get("/reset-password", authController.yeniSifreFormuGoster);
router.post(
  "/reset-password",
  validatorMiddleware.validateNewPassword(),
  authController.yeniSifreyiKaydet
);
router.get("/logout", authMiddleware.oturumAcilmismi, authController.logout);
router.get(
  "/changepassword",
  authMiddleware.oturumAcilmismi,
  authController.openchangepassword
);
router.post(
  "/changepassword",
  authMiddleware.oturumAcilmismi,
  validatorMiddleware.validateNewPassword(),
  authController.postchangepassword
);

module.exports = router;
