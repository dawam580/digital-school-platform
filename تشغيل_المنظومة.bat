@echo off
chcp 65001 > nul
title منظومة المدرسة الرقمية - التشغيل الفوري
echo ==============================================================================
echo                  منظومة المدرسة الرقمية (Windows Edition)
echo ==============================================================================
echo.
echo [1/2] جاري فحص ملفات التشغيل المكتبي...

cd /d "%~dp0"

:: 1. النسخة المحمولة (أي اسم/إصدار)
for %%F in ("dist-electron\*Portable*.exe") do (
    echo [2/2] تشغيل النسخة المحمولة المستقلة مباشرة...
    start "" "%%~fF"
    goto :done
)

:: 2. المجلد المجهز من electron-builder
for %%F in ("dist-electron\win-unpacked\*.exe") do (
    echo [2/2] تشغيل المنظومة من المجلد المجهز...
    start "" "%%~fF"
    goto :done
)

:: 3. Check if dist exists, otherwise build it
if not exist "dist\index.html" (
    echo [تنبيه] جاري تجهيز حزمة المنظومة لأول مرة...
    call npm.cmd run build
)

:: 4. Run native Desktop Edge app window (offline)
echo [2/2] جاري فتح المنظومة في نافذة سطح المكتب المستقلة (بدون إنترنت)...
start msedge --app="file:///%~dp0dist/index.html" --window-size=1440,920 --window-position=40,40

:done
echo.
echo [تم] فتحت المنظومة بنجاح! نتمنى لكم عملاً موفقاً.
echo ==============================================================================
timeout /t 2 > nul
exit
