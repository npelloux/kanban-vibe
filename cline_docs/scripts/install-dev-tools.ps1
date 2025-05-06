# Windows Development Environment Setup Script
# This script installs essential development tools using Chocolatey

Write-Host "Installing essential development tools..." -ForegroundColor Green

# Install .NET SDK
Write-Host "Installing .NET SDK..." -ForegroundColor Cyan
choco install dotnetcore-sdk -y

# Install Maven
Write-Host "Installing Maven..." -ForegroundColor Cyan
choco install maven -y

# Install additional recommended tools
Write-Host "Installing additional recommended tools..." -ForegroundColor Cyan

# PostgreSQL (popular database)
choco install postgresql -y

# Postman (API testing tool)
choco install postman -y

# Windows Terminal (better terminal experience)
choco install microsoft-windows-terminal -y

# Configure Git
Write-Host "Configuring Git..." -ForegroundColor Cyan
# Uncomment and modify the following lines with your information
# git config --global user.name "Your Name"
# git config --global user.email "your.email@example.com"

# Install VS Code extensions
Write-Host "Installing VS Code extensions..." -ForegroundColor Cyan
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension eamodio.gitlens
code --install-extension ms-azuretools.vscode-docker
code --install-extension ms-vscode-remote.vscode-remote-extensionpack
code --install-extension ritwickdey.liveserver

# Verify installations
Write-Host "Verifying installations..." -ForegroundColor Cyan
Write-Host "Python version:" -ForegroundColor Yellow
python --version
Write-Host ".NET SDK version:" -ForegroundColor Yellow
dotnet --version
Write-Host "Maven version:" -ForegroundColor Yellow
mvn --version
Write-Host "Git version:" -ForegroundColor Yellow
git --version
Write-Host "Node.js version:" -ForegroundColor Yellow
node --version
Write-Host "npm version:" -ForegroundColor Yellow
npm --version

Write-Host "Development environment setup complete!" -ForegroundColor Green
