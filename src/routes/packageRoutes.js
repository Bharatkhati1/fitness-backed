import express from "express"
import { createPackage, deletePackageById, getAllPackages, updatePackage } from "../controllers/packageController.js";

const router = express.Router();

router.post("/create", createPackage)
router.post("/edit/:id", updatePackage);
router.get("/", getAllPackages);
router.delete("/:id", deletePackageById)

export default router;