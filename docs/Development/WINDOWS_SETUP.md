# Windows Setup Guide

## Issue: better-sqlite3 Native Compilation

The `better-sqlite3` package requires native compilation on Windows. You need Visual Studio Build Tools with C++ support.

## Solution 1: Install Visual Studio Build Tools (Recommended)

1. **Download Visual Studio Build Tools:**
   - Go to: https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022
   - Download "Build Tools for Visual Studio 2022"

2. **Install with C++ Workload:**
   - Run the installer
   - Select "Desktop development with C++" workload
   - Make sure "MSVC v143 - VS 2022 C++ x64/x86 build tools" is checked
   - Click "Install"

3. **Restart your terminal/PowerShell** after installation

4. **Try installing again:**
   ```powershell
   npm install
   ```

## Solution 2: Use Docker (Easier, No Build Tools Needed)

If you prefer not to install Visual Studio Build Tools, use Docker:

```powershell
# Build the Docker image (compiles inside Linux container)
docker build -t spooldb .

# Run with docker-compose
docker-compose up
```

Or run directly:
```powershell
docker run -p 8080:8080 -v ${PWD}/data:/data spooldb
```

## Solution 3: Use Alternative SQLite Library (Not Recommended)

If you absolutely cannot install build tools, we could switch to `sql.js` or another pure JavaScript SQLite implementation, but this would require code changes and may have performance implications.

## Quick Test After Installation

Once build tools are installed:

```powershell
# Install dependencies
npm install

# Initialize database
npm run migrate --workspace=backend

# Start server
npm run dev
```

## Troubleshooting

If you still get errors after installing build tools:

1. **Restart your computer** (sometimes required for PATH updates)
2. **Run PowerShell as Administrator** and try again
3. **Clear npm cache:**
   ```powershell
   npm cache clean --force
   rm -r node_modules
   npm install
   ```

4. **Check Node.js version compatibility:**
   - Node.js 25.0.0 should work, but if issues persist, try Node.js 20 LTS

