@echo off
chcp 65001 > nul
title منظومة مدرسة الشهيد امحمد الباعور للتعليم الأساسي - التشغيل الفوري
echo ==============================================================================
echo        منظومة مدرسة الشهيد امحمد الباعور للتعليم الأساسي (Windows Edition)
echo               الإصدار المؤسسي المعتمد للعام الدراسي 2025/2026
echo ==============================================================================
echo.
echo [1/2] جاري فحص ملفات التشغيل المكتبي...

cd /d "%~dp0"

:: 1. Check if Portable Executable exists in dist-electron
if exist "dist-electron\منظومة مدرسة الباعور الرقمية-Portable-2.0.0.exe" (
    echo [2/2] تشغيل النسخة المحمولة المستقلة مباشرة...
    start "" "dist-electron\منظومة مدرسة الباعور الرقمية-Portable-2.0.0.exe"
    goto :done
)

:: 2. Check if Setup exists
if exist "dist-electron\win-unpacked\منظومة مدرسة الباعور الرقمية.exe" (
    echo [2/2] تشغيل المنظومة من المجلد المجهز...
    start "" "dist-electron\win-unpacked\منظومة مدرسة الباعور الرقمية.exe"
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
