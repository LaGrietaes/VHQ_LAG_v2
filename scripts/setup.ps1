# VHQ_LAG_v2 Development Setup Script
# This script sets up the development environment for the VHQ_LAG_v2 project

Write-Host "🚀 Setting up VHQ_LAG_v2 development environment..." -ForegroundColor Green

# Check if Rust is installed
Write-Host "Checking Rust installation..." -ForegroundColor Yellow
try {
    rustc --version | Out-Null
    Write-Host "✅ Rust is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Rust is not installed. Please install Rust from https://rustup.rs/" -ForegroundColor Red
    exit 1
}

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    node --version | Out-Null
    Write-Host "✅ Node.js is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check if pnpm is installed
Write-Host "Checking pnpm installation..." -ForegroundColor Yellow
try {
    pnpm --version | Out-Null
    Write-Host "✅ pnpm is installed" -ForegroundColor Green
} catch {
    Write-Host "Installing pnpm..." -ForegroundColor Yellow
    try {
        npm install -g pnpm
        Write-Host "✅ pnpm installed successfully" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to install pnpm. Please install manually: npm install -g pnpm" -ForegroundColor Red
        exit 1
    }
}

# Install Tauri CLI
Write-Host "Installing Tauri CLI..." -ForegroundColor Yellow
try {
    cargo install tauri-cli
    Write-Host "✅ Tauri CLI installed" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Tauri CLI installation failed or already installed" -ForegroundColor Yellow
}

# Install frontend dependencies
Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
try {
    pnpm install
    Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install frontend dependencies" -ForegroundColor Red
    exit 1
}

# Build Rust dependencies
Write-Host "Building Rust dependencies..." -ForegroundColor Yellow
try {
    cargo build
    Write-Host "✅ Rust dependencies built" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to build Rust dependencies" -ForegroundColor Red
    exit 1
}

Write-Host "🎉 Setup completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Run 'pnpm run tauri dev' to start development" -ForegroundColor White
Write-Host "2. Run 'pnpm run tauri build' to build for production" -ForegroundColor White
Write-Host "3. Check the docs/ folder for more information" -ForegroundColor White 