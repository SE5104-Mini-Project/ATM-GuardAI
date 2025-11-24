import Camera from "../models/cameraModel.js";

import axios from 'axios';

const FAST_API = 'http://localhost:5000';

async function checkFastAPIHealth() {
    try {
        const response = await axios.get(`${FAST_API}/`, { timeout: 5000 });
        return response.status === 200;
    } catch (error) {
        console.log('FastAPI is not available');
        return false;
    }
}

export const createCamera = async (req, res) => {
    try {
        const cameraData = {
            name: req.body.name,
            bankName: req.body.bankName,
            district: req.body.district,
            province: req.body.province,
            branch: req.body.branch,
            location: {
                latitude: req.body.latitude,
                longitude: req.body.longitude
            },
            address: req.body.address,
            status: req.body.status || "online",
            lastAvailableTime: req.body.lastAvailableTime || Date.now()
        };

        const camera = new Camera(cameraData);
        await camera.save();

        res.status(201).json({
            success: true,
            message: "Camera created successfully",
            data: camera
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Camera with this ID already exists"
            });
        }
        
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


export const getCameras = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            status,
            branch,
            district,
            province,
            search
        } = req.query;

        const filter = {};

        if (status) filter.status = status;
        if (branch) filter.branch = new RegExp(branch, 'i');
        if (district) filter.district = new RegExp(district, 'i');
        if (province) filter.province = new RegExp(province, 'i');

        if (search) {
            filter.$or = [
                { name: new RegExp(search, 'i') },
                { bankName: new RegExp(search, 'i') },
                { branch: new RegExp(search, 'i') },
                { address: new RegExp(search, 'i') }
            ];
        }

        const allCameras = await Camera.find({});

        if (await checkFastAPIHealth()) {
            axios.post(`${FAST_API}/api/all-cameras`, allCameras)
                .then(() => console.log("Sent all cameras to FastAPI"))
                .catch(err => console.log("FastAPI error:", err.message));
        }

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { createdAt: -1 }
        };

        const cameras = await Camera.find(filter)
            .limit(options.limit)
            .skip((options.page - 1) * options.limit)
            .sort(options.sort);

        const total = await Camera.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: cameras,
            pagination: {
                currentPage: options.page,
                totalPages: Math.ceil(total / options.limit),
                totalCameras: total,
                hasNext: options.page < Math.ceil(total / options.limit),
                hasPrev: options.page > 1
            }
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


export const getCameraById = async (req, res) => {
    try {
        const camera = await Camera.findById(req.params.id);

        if (!camera) {
            return res.status(404).json({
                success: false,
                message: "Camera not found"
            });
        }

        res.status(200).json({
            success: true,
            data: camera
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


export const updateCamera = async (req, res) => {
    try {
        const updates = { ...req.body };

        if (req.body.latitude || req.body.longitude) {
            updates.location = {
                latitude: req.body.latitude || req.body.location?.latitude,
                longitude: req.body.longitude || req.body.location?.longitude
            };
        }

        const camera = await Camera.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

        if (!camera) {
            return res.status(404).json({
                success: false,
                message: "Camera not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Camera updated successfully",
            data: camera
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


export const updateCameraStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!status || !["online", "offline"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status must be either 'online' or 'offline'"
            });
        }

        const updateData = { 
            status,
            lastAvailableTime: status === "online" ? Date.now() : undefined
        };

        const camera = await Camera.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!camera) {
            return res.status(404).json({
                success: false,
                message: "Camera not found"
            });
        }

        res.status(200).json({
            success: true,
            message: `Camera status updated to ${status}`,
            data: camera
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


export const deleteCamera = async (req, res) => {
    try {
        const camera = await Camera.findByIdAndDelete(req.params.id);

        if (!camera) {
            return res.status(404).json({
                success: false,
                message: "Camera not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Camera deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


export const getCamerasByLocation = async (req, res) => {
    try {
        const { latitude, longitude, radius = 5000 } = req.query; 

        if (!latitude || !longitude) {
            return res.status(400).json({
                success: false,
                message: "Latitude and longitude are required"
            });
        }

        const cameras = await Camera.find({
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [parseFloat(longitude), parseFloat(latitude)]
                    },
                    $maxDistance: parseInt(radius)
                }
            }
        });

        res.status(200).json({
            success: true,
            data: cameras,
            count: cameras.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


export const getCameraStats = async (req, res) => {
    try {
        const totalCameras = await Camera.countDocuments();
        const onlineCameras = await Camera.countDocuments({ status: "online" });
        const offlineCameras = await Camera.countDocuments({ status: "offline" });

        const camerasByProvince = await Camera.aggregate([
            {
                $group: {
                    _id: "$province",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        const camerasByBank = await Camera.aggregate([
            {
                $group: {
                    _id: "$bankName",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                total: totalCameras,
                online: onlineCameras,
                offline: offlineCameras,
                byProvince: camerasByProvince,
                byBank: camerasByBank
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};