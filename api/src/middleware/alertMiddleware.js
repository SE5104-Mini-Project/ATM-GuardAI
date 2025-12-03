// api/src/middleware/alertMiddleware.js

const validateAlert = (req, res, next) => {
    const { type, cameraId, confidence } = req.body;

    // Validate only for POST requests (creating alerts)
    if (req.method === "POST") {

        // Required fields
        if (!type || !cameraId) {
            return res.status(400).json({
                success: false,
                message: "Type and cameraId are required",
            });
        }

        // Confidence must be between 0 and 100 (percentage)
        if (confidence !== undefined && (confidence < 0 || confidence > 100)) {
            return res.status(400).json({
                success: false,
                message: "Confidence must be between 0 and 100",
            });
        }
    }

    next();
};

export default validateAlert;
