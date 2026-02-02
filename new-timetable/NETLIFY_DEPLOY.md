# Netlify Deployment Guide

## 🚀 Quick Deploy (3 Steps)

Your app is already connected to GitHub and Netlify. Here's how to deploy the Firebase Storage updates:

### Step 1: Commit and Push Your Changes

```bash
# Add all new files
git add .

# Commit with a descriptive message
git commit -m "Add Firebase Storage integration"

# Push to GitHub
git push origin main
```

> **Note**: Replace `main` with your branch name if different (could be `master`)

### Step 2: Configure Firebase Environment Variables on Netlify

**CRITICAL**: Netlify needs your Firebase credentials to build the app correctly.

#### Option A: Using Netlify Dashboard (Easiest)

1. Go to [https://app.netlify.com/](https://app.netlify.com/)
2. Select your **dtl-timetable** site
3. Click **Site settings** → **Environment variables**
4. Click **Add a variable** and add each of these:

```
VITE_FIREBASE_API_KEY = your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN = your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID = your_project_id
VITE_FIREBASE_STORAGE_BUCKET = your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID = your_sender_id
VITE_FIREBASE_APP_ID = your_app_id
VITE_FIREBASE_MEASUREMENT_ID = G-XXXXXXXXXX
```

5. Set scope to **All scopes** or **Production**
6. Click **Save**

#### Option B: Using Netlify CLI (Faster if you have CLI)

```bash
# Install Netlify CLI (if not installed)
npm install -g netlify-cli

# Login to Netlify
netlify login

# Link your project (if not already linked)
netlify link

# Set all environment variables
netlify env:set VITE_FIREBASE_API_KEY "your_api_key"
netlify env:set VITE_FIREBASE_AUTH_DOMAIN "your_project.firebaseapp.com"
netlify env:set VITE_FIREBASE_PROJECT_ID "your_project_id"
netlify env:set VITE_FIREBASE_STORAGE_BUCKET "your_project.appspot.com"
netlify env:set VITE_FIREBASE_MESSAGING_SENDER_ID "your_sender_id"
netlify env:set VITE_FIREBASE_APP_ID "your_app_id"
netlify env:set VITE_FIREBASE_MEASUREMENT_ID "G-XXXXXXXXXX"
```

### Step 3: Deploy

#### Automatic Deploy (Recommended)
Once you push to GitHub, Netlify will automatically deploy. Just wait 2-3 minutes.

#### Manual Deploy via Dashboard
1. Go to Netlify Dashboard → Your site
2. Click **Deploys** tab
3. Click **Trigger deploy** → **Deploy site**

#### Manual Deploy via CLI
```bash
netlify deploy --prod
```

---

## 📋 Complete Deployment Checklist

- [ ] Firebase Storage enabled in Firebase Console
- [ ] Local `.env` file created with Firebase credentials
- [ ] Code tested locally (`npm run dev`)
- [ ] Changes committed to git
- [ ] Changes pushed to GitHub
- [ ] Firebase environment variables added to Netlify
- [ ] Deployment triggered (automatic or manual)
- [ ] Deployment successful (check Netlify dashboard)
- [ ] Test Firebase Storage on live site

---

## 🔍 Where to Get Firebase Credentials

If you don't have your Firebase credentials handy:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the **gear icon** ⚙️ → **Project settings**
4. Scroll to **Your apps** section
5. Find your web app or create one
6. Copy the config values

---

## 🐛 Troubleshooting

### Build Fails on Netlify
- **Check build logs** in Netlify dashboard
- Verify all environment variables are set correctly
- Make sure they start with `VITE_` prefix

### App Deploys but Firebase Doesn't Work
- Check browser console for errors
- Verify Firebase Storage is enabled in Firebase Console
- Check that environment variables are set in Netlify (not just locally)

### "Permission Denied" Errors
- Update Firebase Storage security rules
- For testing, use: `allow read, write: if true;`
- For production, use proper authentication rules

---

## 🎯 After Deployment

1. **Test the deployment**:
   - Visit your Netlify URL
   - Check that the app loads correctly
   - Test any Firebase Storage features you've implemented

2. **Monitor the deployment**:
   - Check Netlify deploy logs for any warnings
   - Check browser console for errors

3. **Update Firebase Security Rules** (if needed):
   - Go to Firebase Console → Storage → Rules
   - Update rules for production use

---

## 🔗 Useful Links

- **Your GitHub Repo**: https://github.com/divitgupta/DTL
- **Netlify Dashboard**: https://app.netlify.com/
- **Firebase Console**: https://console.firebase.google.com/

---

## 💡 Quick Commands Reference

```bash
# Check what files will be committed
git status

# Commit and push
git add .
git commit -m "Add Firebase Storage integration"
git push origin main

# Check Netlify deploy status
netlify status

# View Netlify logs
netlify logs

# Deploy manually
netlify deploy --prod
```
