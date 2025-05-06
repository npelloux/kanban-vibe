# Windows Development Environment Setup Script
# This script installs essential development tools using Chocolatey

Write-Host "Setting up Windows development environment..." -ForegroundColor Green

# Check if Chocolatey is installed
Write-Host "Checking if Chocolatey is installed..." -ForegroundColor Cyan
$chocoInstalled = $false
try {
    $chocoVersion = choco --version
    Write-Host "Chocolatey is already installed (version $chocoVersion)" -ForegroundColor Green
    $chocoInstalled = $true
} catch {
    Write-Host "Chocolatey is not installed or not in PATH" -ForegroundColor Yellow
}

# Install Chocolatey if not installed
if (-not $chocoInstalled) {
    Write-Host "Installing Chocolatey..." -ForegroundColor Cyan
    try {
        Set-ExecutionPolicy Bypass -Scope Process -Force
        [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
        Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))
        Write-Host "Chocolatey installed successfully" -ForegroundColor Green
        
        # Refresh environment variables to include Chocolatey
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        Write-Host "Environment variables refreshed" -ForegroundColor Green
    } catch {
        Write-Host "Failed to install Chocolatey: $_" -ForegroundColor Red
        Write-Host "Please install Chocolatey manually from https://chocolatey.org/install" -ForegroundColor Red
        exit 1
    }
}

Write-Host "Installing essential development tools..." -ForegroundColor Green

# Install .NET SDK
Write-Host "Installing .NET SDK..." -ForegroundColor Cyan
try {
    choco install dotnetcore-sdk -y
} catch {
    Write-Host "Failed to install .NET SDK: $_" -ForegroundColor Red
}

# Install Maven
Write-Host "Installing Maven..." -ForegroundColor Cyan
try {
    choco install maven -y
} catch {
    Write-Host "Failed to install Maven: $_" -ForegroundColor Red
}

# Install additional recommended tools
Write-Host "Installing additional recommended tools..." -ForegroundColor Cyan

# PostgreSQL (popular database)
try {
    choco install postgresql -y
} catch {
    Write-Host "Failed to install PostgreSQL: $_" -ForegroundColor Red
}

# Postman (API testing tool)
try {
    choco install postman -y
} catch {
    Write-Host "Failed to install Postman: $_" -ForegroundColor Red
}

# Windows Terminal (better terminal experience)
try {
    choco install microsoft-windows-terminal -y
} catch {
    Write-Host "Failed to install Windows Terminal: $_" -ForegroundColor Red
}

# Configure Git
Write-Host "Configuring Git..." -ForegroundColor Cyan
# Uncomment and modify the following lines with your information
# git config --global user.name "Your Name"
# git config --global user.email "your.email@example.com"

# Install VS Code extensions
Write-Host "Installing VS Code extensions..." -ForegroundColor Cyan
try {
    code --install-extension dbaeumer.vscode-eslint
    code --install-extension esbenp.prettier-vscode
    code --install-extension eamodio.gitlens
    code --install-extension ms-azuretools.vscode-docker
    code --install-extension ms-vscode-remote.vscode-remote-extensionpack
    code --install-extension ritwickdey.liveserver
    Write-Host "VS Code extensions installed successfully" -ForegroundColor Green
} catch {
    Write-Host "Failed to install some VS Code extensions: $_" -ForegroundColor Red
    Write-Host "You may need to install them manually from VS Code" -ForegroundColor Yellow
}

# Verify installations
Write-Host "Verifying installations..." -ForegroundColor Cyan

# Function to check command existence
function Test-CommandExists {
    param ($command)
    $exists = $false
    try {
        if (Get-Command $command -ErrorAction Stop) {
            $exists = $true
        }
    } catch {}
    return $exists
}

# Check Python
Write-Host "Python version:" -ForegroundColor Yellow
if (Test-CommandExists python) {
    python --version
} else {
    Write-Host "Python is not installed or not in PATH" -ForegroundColor Red
}

# Check .NET SDK
Write-Host ".NET SDK version:" -ForegroundColor Yellow
if (Test-CommandExists dotnet) {
    dotnet --version
} else {
    Write-Host ".NET SDK is not installed or not in PATH" -ForegroundColor Red
}

# Check Maven
Write-Host "Maven version:" -ForegroundColor Yellow
if (Test-CommandExists mvn) {
    mvn --version
} else {
    Write-Host "Maven is not installed or not in PATH" -ForegroundColor Red
}

# Check Git
Write-Host "Git version:" -ForegroundColor Yellow
if (Test-CommandExists git) {
    git --version
} else {
    Write-Host "Git is not installed or not in PATH" -ForegroundColor Red
}

# Check Node.js
Write-Host "Node.js version:" -ForegroundColor Yellow
if (Test-CommandExists node) {
    node --version
} else {
    Write-Host "Node.js is not installed or not in PATH" -ForegroundColor Red
}

# Check npm
Write-Host "npm version:" -ForegroundColor Yellow
if (Test-CommandExists npm) {
    npm --version
} else {
    Write-Host "npm is not installed or not in PATH" -ForegroundColor Red
}

Write-Host "`nDevelopment environment setup complete!" -ForegroundColor Green
Write-Host "Note: You may need to restart your computer or open a new PowerShell session for all changes to take effect." -ForegroundColor Cyan
