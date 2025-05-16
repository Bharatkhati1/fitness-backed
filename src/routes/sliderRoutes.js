import express from "express";
import { createSlider, deleteSliderById, editSlider, getSliders } from "../controllers/sliderController.js";
const router = express.Router();

router.post("/get-sliders", getSliders)
router.post("/create-slider", createSlider);
router.post(`/edit-slider/:id`,editSlider)
router.delete("/:id", deleteSliderById)

export default router;