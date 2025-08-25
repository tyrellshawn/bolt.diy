# PowerShell script to fix node_modules permissions on Windows
Write-Host "🔧 Fixing node_modules permissions..." -ForegroundColor Yellow

# Get the current directory
$projectPath = Get-Location

# Check if node_modules exists
$nodeModulesPath = Join-Path $projectPath "node_modules"
if (Test-Path $nodeModulesPath) {
    Write-Host "📁 Found node_modules directory" -ForegroundColor Green

    # Take ownership of the node_modules directory
    Write-Host "🔐 Taking ownership of node_modules..." -ForegroundColor Blue
    takeown /f "$nodeModulesPath" /r /d y 2>$null

    # Grant full control to current user
    Write-Host "✅ Granting permissions..." -ForegroundColor Blue
    icacls "$nodeModulesPath" /grant "$env:USERNAME:(OI)(CI)F" /t 2>$null

    Write-Host "✅ Permissions fixed! Try restarting VS Code." -ForegroundColor Green
} else {
    Write-Host "❌ node_modules not found. Run 'pnpm install' first." -ForegroundColor Red
}

Write-Host "🔄 You may need to restart VS Code for changes to take effect." 
