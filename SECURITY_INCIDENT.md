# Security Incident - OpenAI API Key Exposed

## ⚠️ CRITICAL: Action Required

Your OpenAI API key was exposed in commit `8aede480` and needs to be rotated immediately.

## Steps to Resolve:

### 1. Rotate Your OpenAI API Key (URGENT!)

1. Go to: https://platform.openai.com/api-keys
2. **Delete** the exposed key: `sk-proj-q07hLSD...`
3. **Create** a new API key
4. Update your local `backend/src/PdfPortal.Api/appsettings.json` with the new key

### 2. Update Local Configuration

Edit `backend/src/PdfPortal.Api/appsettings.json`:
```json
{
  "OpenAI": {
    "ApiKey": "YOUR_NEW_API_KEY_HERE",
    "Model": "gpt-4-turbo-preview"
  }
}
```

### 3. Verify Protection

Check that your new `appsettings.json` is NOT tracked:
```bash
git status
```

You should see: 
```
On branch main
nothing to commit, working tree clean
```

**NOT** see `appsettings.json` in changes!

### 4. Push to GitHub

```bash
git push
```

## What Was Fixed:

✅ Removed `appsettings.json` from Git tracking  
✅ Removed all `bin/` and `obj/` build artifacts  
✅ Added comprehensive `.gitignore` files  
✅ Created `appsettings.json.template` for sharing  
✅ Added setup documentation  

## What You Need to Do:

🔴 **ROTATE YOUR OPENAI API KEY** (Step 1 above)  
🟡 Update local configuration (Step 2)  
🟢 Push changes to GitHub (Step 4)  

## Why This Happened:

The `bin/Debug/net8.0/appsettings.json` file was accidentally committed during a build. This contained your production API key. GitHub's secret scanning detected it and blocked the push.

## Prevention:

- ✅ `.gitignore` now prevents this
- ✅ Build artifacts are excluded
- ✅ Configuration files are protected
- ✅ Template file available for team sharing

---

**Created:** $(Get-Date)  
**Status:** Awaiting API key rotation

