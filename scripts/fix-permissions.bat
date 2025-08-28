@echo off
echo 🔧 Fixing node_modules permissions...

if exist "node_modules" (
    echo 📁 Found node_modules directory
    echo 🔐 Taking ownership of node_modules...
    takeown /f "node_modules" /r /d y >nul 2>&1
    
    echo ✅ Granting permissions...
    icacls "node_modules" /grant "%USERNAME%:(OI)(CI)F" /t >nul 2>&1
    
    echo ✅ Permissions fixed! Try restarting VS Code.
) else (
    echo ❌ node_modules not found. Run 'pnpm install' first.
)

echo 🔄 You may need to restart VS Code for changes to take effect.
pause