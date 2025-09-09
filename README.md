# ATM-GuardAI (Monorepo)

- `web/` – React + Vite dashboard  
- `api/` – Express API + Socket.IO + MongoDB  
- `ai_service/` – FastAPI + TensorFlow/OpenCV  
- `infra/` – Docker Compose for local dev

## Dev quickstart
```bash
cd infra
docker compose up --build
