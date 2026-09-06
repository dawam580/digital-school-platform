# PowerShell Script: Create Windows Desktop Shortcut for School Platform
# Sets proper path, working directory, Arabic name, and school icon

$WshShell = New-Object -ComObject WScript.Shell
$DesktopPath = [System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::Desktop)
$ProjectDir = Resolve-Path (Join-Path $PSScriptRoot "..")
$BatchFile = Join-Path $ProjectDir "Run-School-Desktop.bat"
$IconFile = Join-Path $ProjectDir "public\favicon.ico"

# 1. Primary Arabic Shortcut
$ShortcutPath = Join-Path $DesktopPath "مدرسة الشهيد امحمد الباعور.lnk"
$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = $BatchFile
$Shortcut.WorkingDirectory = $ProjectDir
$Shortcut.Description = "منظومة مدرسة الشهيد امحمد الباعور للتعليم الأساسي - نظام إدارة التعليم والامتحانات الشامل"
if (Test-Path $IconFile) {
    $Shortcut.IconLocation = "$IconFile,0"
}
$Shortcut.Save()

Write-Host "[OK] Desktop shortcut created successfully at: $ShortcutPath" -ForegroundColor Green
