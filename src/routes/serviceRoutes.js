import express from "express";
import { createService, deleteServiceById, editService, getAllService, getService } from "../controllers/serviceController.js";
const router = express.Router();

router.post("/get-all-services", getAllService)
router.post("/get-services", getService)
router.post("/create-service", createService);
router.post(`/edit-service/:id`,editService)
router.delete("/:id", deleteServiceById)

export default router;