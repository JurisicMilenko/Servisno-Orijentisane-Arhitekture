@echo off
setlocal enabledelayedexpansion

echo ============================================================
echo   Docker Deployment - Turisticka Aplikacija
echo ============================================================
echo.

:menu
echo Select an option:
echo   1) Start services (clean build)
echo   2) Start services (quick start)
echo   3) Stop services
echo   4) Restart services
echo   5) Show logs
echo   6) Show status
echo   7) Clean up (remove all data)
echo   8) Exit
echo.

set /p option="Enter option [1-8]: "

if "%option%"=="1" goto clean_build
if "%option%"=="2" goto quick_start
if "%option%"=="3" goto stop
if "%option%"=="4" goto restart
if "%option%"=="5" goto logs
if "%option%"=="6" goto status
if "%option%"=="7" goto cleanup
if "%option%"=="8" goto exit
echo Invalid option
goto menu

:clean_build
echo Cleaning up old containers and volumes...
docker-compose down -v
echo Building services...
docker-compose build
echo Starting services...
docker-compose up -d
goto show_info

:quick_start
echo Starting services...
docker-compose up -d
goto show_info

:stop
echo Stopping services...
docker-compose down
echo Services stopped
pause
goto menu

:restart
echo Restarting services...
docker-compose restart
echo Services restarted
goto show_info

:logs
echo Following logs (Ctrl+C to stop)...
docker-compose logs -f
goto menu

:status
docker-compose ps
echo.
pause
goto menu

:cleanup
echo Cleaning up all containers, volumes and data...
docker-compose down -v
echo Cleanup complete
pause
goto menu

:show_info
echo.
echo ============================================================
echo   Application URLs:
echo ============================================================
echo   Frontend:     http://localhost:8080
echo   API Gateway:  http://localhost:4000
echo   Backend:      http://localhost:3000
echo   Tours:        http://localhost:3002
echo   PostgreSQL:   localhost:5432
echo   MongoDB:      localhost:27017
echo ============================================================
echo.
docker-compose ps
echo.
pause
goto menu

:exit
echo Goodbye!
exit /b 0
