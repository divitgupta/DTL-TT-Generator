# Firebase Storage - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### 1. Enable Firebase Storage
```
1. Go to https://console.firebase.google.com/
2. Select your project
3. Click "Storage" → "Get Started"
4. Choose security rules (test mode for now)
5. Select storage location → Done
```

### 2. Set Up Environment Variables

**For Local Development:**
```bash
# Create .env file (already gitignored)
cp .env.example .env

# Edit .env and add your Firebase credentials
# Get them from: Firebase Console → Project Settings → General → Your apps
```

**For Netlify (IMPORTANT!):**
```bash
# Option 1: Using Netlify Dashboard
1. Go to https://app.netlify.com/
2. Select your site → Site settings → Environment variables
3. Add all VITE_FIREBASE_* variables
4. Trigger new deploy

# Option 2: Using CLI
netlify env:set VITE_FIREBASE_API_KEY "your_key"
netlify env:set VITE_FIREBASE_AUTH_DOMAIN "your_domain"
netlify env:set VITE_FIREBASE_PROJECT_ID "your_project_id"
netlify env:set VITE_FIREBASE_STORAGE_BUCKET "your_bucket"
netlify env:set VITE_FIREBASE_MESSAGING_SENDER_ID "your_sender_id"
netlify env:set VITE_FIREBASE_APP_ID "your_app_id"
netlify env:set VITE_FIREBASE_MEASUREMENT_ID "your_measurement_id"
```

### 3. Test Locally
```bash
npm run dev
```

### 4. Deploy to Netlify
```bash
# After setting environment variables
git add .
git commit -m "Add Firebase Storage support"
git push

# Or manually trigger deploy in Netlify dashboard
```

## 📝 Common Use Cases

### Upload PDF Timetable
```javascript
import { uploadTimetablePDF } from './storageUtils';
import jsPDF from 'jspdf';

const handleExportPDF = async () => {
  const pdf = new jsPDF();
  // ... generate your timetable PDF
  
  const pdfBlob = pdf.output('blob');
  const url = await uploadTimetablePDF(pdfBlob, 'timetable-2024.pdf');
  console.log('PDF URL:', url);
};
```

### Upload with Progress
```javascript
import { uploadFileWithProgress } from './storageUtils';

const handleUpload = async (file) => {
  const url = await uploadFileWithProgress(
    file,
    `uploads/${file.name}`,
    (progress) => console.log(`${progress}%`)
  );
};
```

### Save Timetable Data
```javascript
import { uploadTimetableData } from './storageUtils';

const saveTimetable = async (data) => {
  const url = await uploadTimetableData(data, 'timetable-data.json');
  // Save URL to Firestore for later retrieval
};
```

## 🔒 Security Rules (Update After Testing)

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /timetables/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

## ✅ Deployment Checklist

- [ ] Firebase Storage enabled
- [ ] Local `.env` file created with credentials
- [ ] Netlify environment variables configured
- [ ] New deployment triggered
- [ ] Upload tested on live site

## 🆘 Troubleshooting

**"Permission denied"** → Check Firebase Storage security rules  
**"Storage not enabled"** → Enable Storage in Firebase Console  
**Env vars not working on Netlify** → Verify they start with `VITE_` and redeploy  

For detailed documentation, see [FIREBASE_STORAGE_SETUP.md](./FIREBASE_STORAGE_SETUP.md)
