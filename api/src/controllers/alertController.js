import Alert from "../models/alertModel.js";


export const createAlert = async (req, res) => {
    try {
        const alert = new Alert(req.body);
        const savedAlert = await alert.save();

        res.status(201).json({
            success: true,
            message: "Alert created successfully",
            data: savedAlert
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Failed to create alert",
            error: error.message
        });
    }
};

export const getAlerts = async (req, res) => {
    try {
        const alerts = await Alert.find()
            .populate("cameraId", "name location")
            .populate("resolvedBy", "name email")
            .exec();

        const total = await Alert.countDocuments();

        res.status(200).json({
            success: true,
            message: "Alerts retrieved successfully",
            data: {
                alerts,
                pagination: {
                    totalPages: 1,
                    totalAlerts: total,
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve alerts",
            error: error.message
        });
    }
};

export const getAlertById = async (req, res) => {
    try {
        const alert = await Alert.findById(req.params.id)
            .populate("cameraId", "name location")
            .populate("resolvedBy", "name email");

        if (!alert) {
            return res.status(404).json({
                success: false,
                message: "Alert not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Alert retrieved successfully",
            data: alert
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve alert",
            error: error.message
        });
    }
};

export const updateAlert = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        if (updateData.status === "resolved" && !updateData.resolvedBy) {
            updateData.resolvedBy = req.user?._id || null;
        }

        const alert = await Alert.findByIdAndUpdate(
            id,
            updateData,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!alert) {
            return res.status(404).json({
                success: false,
                message: `Alert with ID '${id}' not found`,
            });
        }

        res.status(200).json({
            success: true,
            message: "Alert updated successfully",
            data: alert,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Failed to update alert",
            error: error.message,
        });
    }
};

export const deleteAlert = async (req, res) => {
    try {
        const alert = await Alert.findByIdAndDelete(req.params.id);

        if (!alert) {
            return res.status(404).json({
                success: false,
                message: "Alert not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Alert deleted successfully",
            data: alert
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete alert",
            error: error.message
        });
    }
};