@echo off
cd /d "%~dp0"
npm.cmd run dev -- --host 127.0.0.1 --port 5173 --strictPort > vite.out.log 2> vite.err.log
