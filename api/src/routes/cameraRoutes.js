import express from "express";
import {
    createCamera,
    getCameras,
    getCameraById,
    updateCamera,
    deleteCamera,
    updateCameraStatus,
    getCameraStats
} from "../controllers/cameraController.js";

const router = express.Router();

router.post("/", createCamera);
router.get("/", getCameras);
router.get("/stats", getCameraStats);
router.get("/:id", getCameraById);
router.put("/:id", updateCamera);
router.patch("/:id/status", updateCameraStatus);
router.delete("/:id", deleteCamera);

export default router;