@echo off
cd /d "%~dp0"

REM Start the Node.js server from the Server folder
npm start

REM Keep the window open if the server exits unexpectedly
pause
