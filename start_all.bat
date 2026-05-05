@echo off
echo [1/3] Starting AI Worker...
start "DunFang AI Worker" cmd /k "cd dunfang-ai-worker && start.bat"

echo [2/3] Starting Frontend...
start "DunFang Frontend" cmd /k "cd dunfang-frontend && npm run dev"

echo [3/3] Backend should be running already in your main terminal.
echo All services are starting in separate windows.
pause
