# Firebase Storage Setup Guide for Netlify

This guide will help you set up Firebase Storage for your Netlify-deployed timetable application.

## Prerequisites

- Firebase project already created (you already have this)
- Netlify account with your site deployed

## Step 1: Enable Firebase Storage

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click on **Storage** in the left sidebar
4. Click **Get Started**
5. Choose your security rules (start with test mode for development):
   ```
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /{allPaths=**} {
         allow read, write: if request.auth != null; // Only authenticated users
         // OR for public read access:
         // allow read: if true;
         // allow write: if request.auth != null;
       }
     }
   }
   ```
6. Choose a storage location (select the closest to your users)
7. Click **Done**

## Step 2: Get Your Firebase Configuration

Your Firebase config is already set up in `src/firebase.js`, but make sure you have all the environment variables.

1. Go to Firebase Console > Project Settings > General
2. Scroll to "Your apps" section
3. Copy your configuration values

## Step 3: Set Up Local Environment Variables

1. Create a `.env` file in your project root (it's gitignored):
   ```bash
   cp .env.example .env
   ```

2. Fill in your Firebase credentials in `.env`:
   ```env
   VITE_FIREBASE_API_KEY=your_actual_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
   VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

## Step 4: Configure Netlify Environment Variables

**IMPORTANT**: Netlify needs the same environment variables to build your app correctly.

### Option A: Using Netlify UI (Recommended)

1. Go to your [Netlify Dashboard](https://app.netlify.com/)
2. Select your site
3. Go to **Site settings** > **Environment variables**
4. Click **Add a variable** and add each of these:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_FIREBASE_MEASUREMENT_ID`

5. For each variable, set the scope to **All scopes** or at least **Production**
6. Click **Save**
7. Trigger a new deploy: **Deploys** > **Trigger deploy** > **Deploy site**

### Option B: Using Netlify CLI

```bash
# Install Netlify CLI if you haven't
npm install -g netlify-cli

# Login to Netlify
netlify login

# Link your project (if not already linked)
netlify link

# Set environment variables
netlify env:set VITE_FIREBASE_API_KEY "your_api_key"
netlify env:set VITE_FIREBASE_AUTH_DOMAIN "your_project.firebaseapp.com"
netlify env:set VITE_FIREBASE_PROJECT_ID "your_project_id"
netlify env:set VITE_FIREBASE_STORAGE_BUCKET "your_project.appspot.com"
netlify env:set VITE_FIREBASE_MESSAGING_SENDER_ID "123456789"
netlify env:set VITE_FIREBASE_APP_ID "1:123456789:web:abcdef"
netlify env:set VITE_FIREBASE_MEASUREMENT_ID "G-XXXXXXXXXX"

# Trigger a new deploy
netlify deploy --prod
```

## Step 5: Using Firebase Storage in Your App

The storage utilities are available in `src/storageUtils.js`. Here are some examples:

### Example 1: Upload a PDF Timetable

```javascript
import { uploadTimetablePDF } from './storageUtils';

// After generating PDF with jsPDF
const handleSavePDF = async () => {
  const pdf = new jsPDF();
  // ... generate your PDF
  
  const pdfBlob = pdf.output('blob');
  const filename = `timetable-${Date.now()}.pdf`;
  
  try {
    const downloadURL = await uploadTimetablePDF(pdfBlob, filename);
    console.log('PDF uploaded successfully:', downloadURL);
    // You can save this URL to Firestore or display it to users
  } catch (error) {
    console.error('Failed to upload PDF:', error);
  }
};
```

### Example 2: Upload with Progress Bar

```javascript
import { uploadFileWithProgress } from './storageUtils';

const handleUploadWithProgress = async (file) => {
  const path = `uploads/${file.name}`;
  
  try {
    const downloadURL = await uploadFileWithProgress(
      file,
      path,
      (progress) => {
        console.log(`Upload progress: ${progress.toFixed(2)}%`);
        // Update your UI progress bar here
      }
    );
    console.log('File uploaded:', downloadURL);
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

### Example 3: Save Timetable Data as JSON

```javascript
import { uploadTimetableData } from './storageUtils';

const handleSaveTimetable = async (timetableData) => {
  const filename = `timetable-${Date.now()}.json`;
  
  try {
    const downloadURL = await uploadTimetableData(timetableData, filename);
    console.log('Timetable data saved:', downloadURL);
  } catch (error) {
    console.error('Failed to save timetable:', error);
  }
};
```

### Example 4: List All Timetables

```javascript
import { listFiles, getFileURL } from './storageUtils';

const loadAllTimetables = async () => {
  try {
    const files = await listFiles('timetables/');
    
    // Get URLs for all files
    const fileURLs = await Promise.all(
      files.map(async (fileRef) => ({
        name: fileRef.name,
        url: await getFileURL(fileRef.fullPath)
      }))
    );
    
    console.log('Available timetables:', fileURLs);
  } catch (error) {
    console.error('Failed to load timetables:', error);
  }
};
```

### Example 5: Delete a File

```javascript
import { deleteFile } from './storageUtils';

const handleDeleteTimetable = async (filepath) => {
  try {
    await deleteFile(filepath);
    console.log('File deleted successfully');
  } catch (error) {
    console.error('Failed to delete file:', error);
  }
};
```

## Step 6: Security Rules (Production)

For production, update your Firebase Storage security rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Timetables - authenticated users can read/write
    match /timetables/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Public timetables - anyone can read, only authenticated can write
    match /public/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // User-specific files
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Troubleshooting

### Issue: "Firebase Storage is not enabled"
**Solution**: Make sure you've enabled Storage in Firebase Console (Step 1)

### Issue: "Permission denied" errors
**Solution**: Check your Firebase Storage security rules. For testing, you can temporarily use:
```javascript
allow read, write: if true; // WARNING: Only for testing!
```

### Issue: Environment variables not working on Netlify
**Solution**: 
1. Verify variables are set in Netlify dashboard
2. Make sure they start with `VITE_` prefix (required for Vite)
3. Trigger a new deploy after setting variables
4. Check build logs for any errors

### Issue: CORS errors
**Solution**: Firebase Storage should handle CORS automatically, but if you have issues:
1. Go to Firebase Console > Storage > Rules
2. Make sure your domain is allowed
3. Check that you're using the correct storage bucket URL

## Testing Locally

1. Make sure your `.env` file has all the variables
2. Run your dev server:
   ```bash
   npm run dev
   ```
3. Test file upload/download functionality
4. Check browser console for any errors

## Deployment Checklist

- [ ] Firebase Storage enabled in Firebase Console
- [ ] Storage security rules configured
- [ ] Local `.env` file created and working
- [ ] All environment variables added to Netlify
- [ ] New deployment triggered on Netlify
- [ ] Storage functionality tested on deployed site

## Additional Resources

- [Firebase Storage Documentation](https://firebase.google.com/docs/storage)
- [Netlify Environment Variables](https://docs.netlify.com/environment-variables/overview/)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
