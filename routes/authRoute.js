import express from "express";
import { register, login, verifyEmail, signUpGoogle, forgotPasswordRequestController, allUsers} from "../controllers/authController.js";
import { verifyToken } from "../middleware/jwt/verifyToken.js";
import { isAdmin } from "../middleware/roles/adminRoles.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/verify-email", verifyEmail);
router.post("/googleAuth", signUpGoogle);
router.post("/forgot-password", forgotPasswordRequestController);
router.get("/allUsers", verifyToken, isAdmin, allUsers);


export default router;
