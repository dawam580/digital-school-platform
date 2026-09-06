@echo off
chcp 65001 > nul
title منظومة مدرسة الشهيد امحمد الباعور الرقمية - Windows Edition
echo ==============================================================================
echo        منظومة مدرسة الشهيد امحمد الباعور الرقمية (Windows Desktop Edition)
echo ==============================================================================
echo.
echo [1/2] جاري التحقق من ملفات النظام وقاعدة البيانات...

cd /d "%~dp0"

:: If dist does not exist, build it
if not exist "dist\index.html" (
    echo [تنبيه] جاري بناء وتجهيز حزمة المنظومة لأول مرة...
    call npm.cmd run build
)

echo [2/2] جاري تشغيل المنظومة بنافذة سطح المكتب المستقلة...
echo.

:: Check if Electron is installed in project or system
if exist "node_modules\electron\dist\electron.exe" (
    start "" "node_modules\electron\dist\electron.exe" electron\main.cjs
    goto :done
)

:: Alternative: run via npx
where npx.cmd >nul 2>nul
if %errorlevel% equ 0 (
    start "" npx.cmd electron electron/main.cjs
    goto :done
)

:: Fallback: Launch native Windows Edge App Window (Offline file)
start msedge --app="file:///%~dp0dist/index.html" --window-size=1440,920 --window-position=40,40

:done
echo [تم] تم تشغيل المنظومة بنجاح!
echo ==============================================================================
timeout /t 2 > nul
exit
