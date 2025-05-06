# Development Tools Installation Script Guide

This guide explains how to use the `install-dev-tools.ps1` PowerShell script to complete your Windows development environment setup.

## Overview

The `install-dev-tools.ps1` script automates the installation of essential development tools using Chocolatey. It installs:

- .NET SDK
- Maven
- PostgreSQL
- Postman
- Windows Terminal
- VS Code extensions

It also helps configure Git and verifies all installations.

## Prerequisites

Before running the script, ensure:

1. PowerShell is running as Administrator
2. Internet connection is available

Note: The script will automatically install Chocolatey if it's not already installed, and Python has already been installed.

## How to Run the Script

1. Open PowerShell as Administrator
2. Navigate to the script location:
   ```powershell
   cd d:/workspace/cline/kanban/memory-bank
   ```
3. Execute the script:
   ```powershell
   .\install-dev-tools.ps1
   ```

## Customizing the Script

### Git Configuration

Before running the script, you should customize the Git configuration section:

1. Open the script in a text editor
2. Locate the Git configuration section
3. Uncomment and modify these lines with your information:
   ```powershell
   # git config --global user.name "Your Name"
   # git config --global user.email "your.email@example.com"
   ```

### Tool Selection

You can customize which tools to install by commenting out or removing the lines for tools you don't need:

```powershell
# Comment out any tools you don't want to install
# choco install postgresql -y
```

## Troubleshooting

### Installation Failures

If any tool fails to install:

1. Check the error message
2. Try installing the tool manually:
   ```powershell
   choco install [tool-name] -y
   ```
3. Check if the tool requires a system restart

### Path Issues

If tools are installed but not recognized in the command line:

1. Close and reopen PowerShell
2. If still not working, check your PATH environment variable:
   ```powershell
   $env:Path
   ```
3. Add the tool's bin directory to your PATH if needed

## After Running the Script

After successful execution:

1. Verify all tools are working correctly
2. Configure any tool-specific settings
3. Restart your computer to ensure all environment variables are properly set

## Maintenance

To update all installed tools in the future:

```powershell
choco upgrade all -y
```
