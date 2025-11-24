import axios from 'axios';

const FLASK_API = 'http://localhost:5000';


async function checkFlaskHealth() {
    try {
        const response = await axios.get(`${FLASK_API}/`, { timeout: 5000 });
        return response.status === 200;
    } catch (error) {
        console.log('Flask API is not available');
        return false;
    }
}


export const getCameraStatus = async (req, res) => {
    try {
        const flaskHealthy = await checkFlaskHealth();
        if (flaskHealthy) {
            const response = await axios.get(`${FLASK_API}/api/cameras/${req.params.id}/status`);
            res.json(response.data);
        } else {
            res.json({
                status: 'online',
                last_frame: new Date().toISOString(),
                alerts: []
            });
        }
    } catch (error) {
        console.error('Error fetching camera status:', error.message);
        res.json({
            status: 'online',
            last_frame: new Date().toISOString(),
            alerts: []
        });
    }
};

export const getVideoFeed = async (req, res) => {
    try {
        const flaskHealthy = await checkFlaskHealth();
        if (flaskHealthy) {
            const response = await axios({
                method: 'get',
                url: `${FLASK_API}/video_feed/${req.params.cameraId}`,
                responseType: 'stream'
            });

            res.set(response.headers);
            response.data.pipe(res);
        } else {
            res.status(503).json({ error: 'Video feed not available in mock mode' });
        }
    } catch (error) {
        console.error('Error proxying video feed:', error.message);
        res.status(500).json({ error: 'Failed to get video feed' });
    }
};