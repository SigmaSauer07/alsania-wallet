# 🚀 Alsania Wallet - Quick Start Guide

## 3-Minute Setup

### Step 1: Install Dependencies (30 seconds)
```bash
make setup
```

### Step 2: Build (2 minutes)
```bash
make build-chrome    # Just Chrome extension (fastest)
# OR
make build           # All platforms (slower)
```

### Step 3: Load Extension (30 seconds)
1. Open Chrome
2. Go to `chrome://extensions`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select `platforms/dist/chrome-extension` folder

### Step 4: Start Developing (immediate)
```bash
make dev
```

## Common Commands

```bash
make help            # Show all commands
make status          # Check what's built
make test            # Run tests
make clean-all       # Start fresh
```

## Troubleshooting

**Problem**: Yarn version error
```bash
corepack enable
make install-force
```

**Problem**: Build fails
```bash
make clean-all
make fresh
```

**Problem**: Want to start over
```bash
make clean-all && make setup && make build
```

## Next Steps

Read the full documentation:
- `MAKEFILE_GUIDE.md` - All 60+ commands
- `CROSS_PLATFORM_GUIDE.md` - Build other platforms
- `make help` - Interactive help

## Need Help?

```bash
make help            # See all options
make status          # Check what's wrong
make info            # System information
```

That's it! You're ready to go! 🎉
