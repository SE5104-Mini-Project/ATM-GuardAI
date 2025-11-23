import express from "express";
import {
    createCamera,
    getCameras,
    getCameraStats
} from "../controllers/cameraController.js";

const router = express.Router();

router.post("/", createCamera);
router.get("/", getCameras);
router.get("/stats", getCameraStats);

export default router;