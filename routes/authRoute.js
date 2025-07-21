import express from "express";
import { register, login, verifyEmail, signUpGoogle, forgotPasswordRequestController} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/verify-email", verifyEmail);
router.post("/googleAuth", signUpGoogle);
router.post("/forgot-password", forgotPasswordRequestController);


export default router;
