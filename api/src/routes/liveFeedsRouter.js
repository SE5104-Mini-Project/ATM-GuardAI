import express from 'express';
import {
    getCameras,
    getCameraStatus,
    getVideoFeed
} from '../controllers/liveFeedsController.js';

const router = express.Router();

router.get('/cameras', getCameras);
router.get('/cameras/:id/status', getCameraStatus);
router.get('/video_feed/:cameraId', getVideoFeed);

export default router;