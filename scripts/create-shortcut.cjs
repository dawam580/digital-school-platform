const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const desktopPath = path.join(process.env.USERPROFILE || 'C:\\Users\\HP', 'Desktop');
const projectDir = path.resolve(__dirname, '..');
const batchFile = path.join(projectDir, 'Run-School-Desktop.bat');
const iconFile = path.join(projectDir, 'public', 'favicon.ico');

const shortcutNames = [
  'مدرسة الشهيد امحمد الباعور.lnk',
  'School-Platform.lnk'
];

for (const name of shortcutNames) {
  const shortcutPath = path.join(desktopPath, name);
  const psScript = `
    $WshShell = New-Object -ComObject WScript.Shell;
    $Shortcut = $WshShell.CreateShortcut([System.IO.Path]::Combine('${desktopPath.replace(/'/g, "''")}', [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String('${Buffer.from(name, 'utf8').toString('base64')}'))));
    $Shortcut.TargetPath = '${batchFile.replace(/'/g, "''")}';
    $Shortcut.WorkingDirectory = '${projectDir.replace(/'/g, "''")}';
    $Shortcut.Description = 'School Management Platform';
    if (Test-Path '${iconFile.replace(/'/g, "''")}') {
      $Shortcut.IconLocation = '${iconFile.replace(/'/g, "''")},0';
    }
    $Shortcut.Save();
  `;

  try {
    execSync(`powershell -NoProfile -Command "${psScript.replace(/\r?\n/g, ' ')}"`, { stdio: 'inherit' });
    console.log(`[OK] Created shortcut: ${shortcutPath}`);
  } catch (err) {
    console.error(`Failed to create shortcut ${name}:`, err.message);
  }
}
