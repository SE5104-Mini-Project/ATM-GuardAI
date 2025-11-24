const validateAlert = (req, res, next) => {
    const { type, cameraId, confidence } = req.body;

    if (req.method === "POST") {
        if (!type || !cameraId) {
            return res.status(400).json({
                success: false,
                message: "Type and cameraId are required",
            });
        }

        if (confidence && (confidence < 0 || confidence > 100)) {
            return res.status(400).json({
                success: false,
                message: "Confidence must be between 0 and 100",
            });
        }
    }

    next();
};

export default validateAlert;