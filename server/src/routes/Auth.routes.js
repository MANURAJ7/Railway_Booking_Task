import { Router } from "express";

import { RegisterUser as UserRegisterController } from "../controllers/Auth/UserRegister.controllers.js";
import { LoginUser as UserLoginController } from "../controllers/Auth/UserLogin.controllers.js";
import { LoginAdmin as AdminLoginController } from "../controllers/Auth/AdminLogin.controllers.js";

const router = Router();

router.route("/User/Register").post(UserRegisterController);
router.route("/User/Login").post(UserLoginController);
router.route("/Admin/Login").get(AdminLoginController);

export default router;
