import express from "express";
import {
  loginController,
  logoutController,
  generateNewAccessToken,
} from "../controllers/authController.js";
import { verifyRefreshToken } from "../middlewares/verifyToken.js";
const router = express.Router();

//AUTH POST METHODS
router.post("/login", loginController);
router.post("/signup", loginController);

//AUTH GET METHODS
router.get("/logout", logoutController);
router.get("/refresh", verifyRefreshToken, generateNewAccessToken); 

export default router;
