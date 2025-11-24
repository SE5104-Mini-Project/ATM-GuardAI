import express from "express";
import {
    createAlert,
    getAlerts,
    getAlertById,
    updateAlert,
    deleteAlert,
} from "../controllers/alertController.js";
import validateAlert from "../middleware/alertMiddleware.js";

const router = express.Router();

router.post("/", validateAlert, createAlert);
router.get("/", getAlerts);
router.get("/:id", getAlertById);
router.put("/:id", updateAlert);
router.delete("/:id", deleteAlert);

export default router;