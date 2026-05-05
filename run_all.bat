@echo off
echo ==================================================
echo DunFang BizHub - Unified Startup Script
echo ==================================================

echo [0/4] Starting Infrastructure (MySQL, Redis, MinIO, PGVector)...
docker-compose up -d

echo [1/4] Starting Python AI Worker (Port 8001)...
start "DunFang AI Worker" cmd /c "cd dunfang-ai-worker && start.bat"

echo [2/4] Starting Java Backend (Port 8080)...
start "DunFang Backend" cmd /c "cd dunfang-backend && mvn spring-boot:run"

echo [3/3] Starting Frontend (Port 8000)...
start "DunFang Frontend" cmd /c "cd dunfang-frontend && npm run dev"

echo.
echo All services are starting in separate windows.
echo - AI Worker: http://localhost:8001/docs
echo - Backend: http://localhost:8080
echo - Frontend: http://localhost:8000
echo ==================================================
pause
