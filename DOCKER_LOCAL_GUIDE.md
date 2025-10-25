## Docker & Supabase Local Development Guide

### 📋 Quick Reference

**First Time Starting Docker:**
```bash
make quick-start
```

**Restarting After Shutdown:**
```bash
make quick-start      # Try this first (fast)
make clean-build      # If quick-start fails (slower, full rebuild)
```

**Stopping Docker:**
```bash
make quick-stop
```

**Checking Status:**
```bash
make docker-status
```

---

## 🚀 Workflow Recommendations

### **For Offline Development (Flying, No Internet)**

1. **Before you travel**, ensure everything is built and cached:
   ```bash
   docker-compose down
   docker-compose up -d --build    # Cache everything
   docker-compose down              # Stop but keep images
   ```

2. **Offline startup** (no downloads needed):
   ```bash
   make quick-start    # Should work instantly
   ```

3. **If it fails** (shouldn't happen offline):
   - Images/containers might be corrupted
   - You'll need internet for a rebuild
   - Solution: Use local development instead (see below)

### **For Local Development WITHOUT Docker**

If Docker reliability is an issue, use local Node.js instead:

```bash
# Terminal 1: Next.js dev server
yarn dev

# Terminal 2: Drizzle Studio (optional)
yarn db:studio

# You'll need Supabase running locally or use cloud
```

This avoids Docker layers entirely and is faster.

---

## 🔧 Advanced Troubleshooting

### **Problem: "Docker needs to download something new"**

**Causes:**
1. Base image changed (`node:22-bullseye`)
2. `package.json` dependencies changed
3. Docker cache was invalidated
4. Supabase CLI version mismatch

**Solutions:**

**Option A: Use Build Cache** (Fastest)
```bash
# Scripts already include caching - just use:
make quick-start
```

**Option B: Save Images for Offline** (Before travel)
```bash
# Export images
docker save nextapp:latest -o /tmp/nextapp.tar
docker save node:22-bullseye -o /tmp/node-base.tar

# When offline, import them
docker load -i /tmp/nextapp.tar
docker load -i /tmp/node-base.tar

# Then quick-start
make quick-start
```

**Option C: Disable Internet-Dependent Builds**
```bash
# Modify compose.yml to never pull updates:
# In services.nextapp.build section, add:
# pull: false
```

### **Problem: Supabase Version Out of Date**

This is **separate** from Docker. You need to update Supabase CLI locally:

```bash
# Update Supabase CLI
brew upgrade supabase-cli

# Verify
supabase --version
```

Docker doesn't manage Supabase CLI versions - that's on your machine.

### **Problem: Container won't start**

```bash
# Check logs
docker-compose logs nextapp

# If corrupted, full clean rebuild
make clean-build

# If still fails, nuclear option
docker system prune -a --volumes
docker-compose up -d --build
```

---

## 📊 Docker Management

### **Check Disk Usage**
```bash
docker system df
```

### **Free Up Space**
```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# The "nuclear option"
docker system prune -a --volumes
```

### **Speed Comparison**

| Command | Time | Use Case |
|---------|------|----------|
| `make quick-start` | ~5s | Normal restart |
| `make clean-build` | ~1-2m | After package changes |
| `docker-compose up --build` | ~1-2m | Full rebuild |
| Local `yarn dev` | ~3-5s | Fast iteration |

---

## 🎯 Recommended Setup for Frequent Travel

```bash
# Before traveling:
1. make clean-build              # Full rebuild to cache everything
2. docker-compose down           # Stop containers (keep images)
3. docker image prune -a -f      # Clean up unused images
4. Verify: make quick-start      # Should work instantly

# While traveling:
- Just use: make quick-start     # Should not need internet
- All images cached locally

# Return from travel:
- make quick-start               # Still works instantly
```

---

## 📝 Summary

| Scenario | Command |
|----------|---------|
| Starting after stop | `make quick-start` |
| After package.json change | `make clean-build` |
| Stopping for travel | `make quick-stop` |
| Checking health | `make docker-status` |
| Complete cleanup | `docker system prune -a --volumes` |
| No internet dev | `yarn dev` (local Node.js) |

