@echo off
setlocal enabledelayedexpansion

REM video-to-frames.bat
REM Extract N evenly-spaced frames from a video as a PNG sequence.
REM
REM Usage:
REM   - Drag a video file onto this .bat (then enter frame count when prompted)
REM   - video-to-frames.bat video.mp4              (prompts for count)
REM   - video-to-frames.bat video.mp4 20           (non-interactive)
REM
REM Requires ffmpeg + ffprobe in PATH.

if "%~1"=="" (
  echo.
  echo video-to-frames.bat
  echo.
  echo Usage:
  echo   Drag a video file onto this .bat, OR
  echo   video-to-frames.bat ^<video^> [count=20]
  echo.
  pause
  exit /b 1
)

set "INPUT=%~1"
set "COUNT=%~2"

if "%COUNT%"=="" (
  set /p "COUNT=How many frames? [default 20]: "
  if "!COUNT!"=="" set "COUNT=20"
)

where ffmpeg >nul 2>&1
if errorlevel 1 (
  echo error: ffmpeg not found in PATH
  echo install: winget install ffmpeg ^|  choco install ffmpeg ^|  scoop install ffmpeg
  pause
  exit /b 1
)

if not exist "%INPUT%" (
  echo error: file not found: %INPUT%
  pause
  exit /b 1
)

set "OUTDIR=%~dp1frames"
if not exist "%OUTDIR%" mkdir "%OUTDIR%"

REM Total frame count via ffprobe
set "TOTAL="
for /f "tokens=*" %%i in ('ffprobe -v error -select_streams v:0 -count_packets -show_entries "stream=nb_read_packets" -of "csv=p=0" "%INPUT%"') do set "TOTAL=%%i"

if "%TOTAL%"=="" (
  echo error: ffprobe could not read frame count from %INPUT%
  pause
  exit /b 1
)

set /a STRIDE=TOTAL / COUNT
if %STRIDE% lss 1 set STRIDE=1

echo.
echo Video:   %INPUT%
echo Total:   %TOTAL% frames in source
echo Request: %COUNT% frames (stride=%STRIDE%)
echo Output:  %OUTDIR%
echo.

ffmpeg -hide_banner -loglevel warning ^
  -i "%INPUT%" ^
  -vf "select='not(mod(n\,%STRIDE%))'" ^
  -vsync vfr ^
  "%OUTDIR%\%%03d.png"

echo.
echo Done.
pause
start "" "%OUTDIR%"
