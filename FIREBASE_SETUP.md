# Firebase Setup Guide for Climbing App

This guide will help you set up Firebase Authentication and Firestore for your climbing app.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"** or **"Add project"**
3. Enter a project name (e.g., "climbing-app")
4. Choose whether to enable Google Analytics (optional)
5. Click **"Create project"**

## Step 2: Enable Authentication

1. In your Firebase project, click **"Authentication"** in the left sidebar
2. Click **"Get started"**
3. Go to the **"Sign-in method"** tab
4. Enable **"Email/Password"** authentication:
   - Click on **"Email/Password"**
   - Toggle **"Enable"** to ON
   - Click **"Save"**

## Step 3: Set Up Firestore Database

1. In your Firebase project, click **"Firestore Database"** in the left sidebar
2. Click **"Create database"**
3. Choose **"Start in test mode"** (for development)
4. Select a location for your database (choose the closest to your users)
5. Click **"Done"**

## Step 4: Get Your Firebase Configuration

1. In your Firebase project, click the **gear icon** (⚙️) next to "Project Overview"
2. Select **"Project settings"**
3. Scroll down to **"Your apps"** section
4. Click **"Add app"** and select **"Web"** (</>)
5. Give your app a nickname (e.g., "climbing-app-web")
6. Click **"Register app"**
7. Copy the configuration object that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};
```

## Step 5: Update Your Firebase Configuration

1. Open `config/firebase.js` in your project
2. Replace the placeholder values with your actual Firebase configuration:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "YOUR_ACTUAL_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_ACTUAL_PROJECT_ID",
  storageBucket: "YOUR_ACTUAL_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_ACTUAL_MESSAGING_SENDER_ID",
  appId: "YOUR_ACTUAL_APP_ID"
};
```

## Step 6: Set Up Firestore Security Rules

1. In your Firebase project, go to **"Firestore Database"**
2. Click on the **"Rules"** tab
3. Replace the default rules with these secure rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Add more rules for other collections as needed
    // For example, if you want to store gym data:
    // match /gyms/{gymId} {
    //   allow read: if true;  // Anyone can read gym data
    //   allow write: if request.auth != null;  // Only authenticated users can write
    // }
  }
}
```

4. Click **"Publish"**

## Step 7: Test Your Setup

1. Start your app: `npx expo start --web`
2. Try to create a new account using the sign-up form
3. Check your Firebase Console:
   - Go to **"Authentication"** → **"Users"** to see the new user
   - Go to **"Firestore Database"** → **"Data"** to see the user document

## Step 8: Environment Variables (Optional but Recommended)

For better security, you can use environment variables:

1. Create a `.env` file in your project root:

```env
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
FIREBASE_APP_ID=your-app-id
```

2. Install the dotenv package: `npm install react-native-dotenv`
3. Update `config/firebase.js`:

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// ... rest of the code
```

## Features Included

✅ **Email/Password Authentication**
- User registration with email and password
- User login with email and password
- Password reset functionality
- User profile creation in Firestore

✅ **User Data Storage**
- User profiles stored in Firestore
- First name, last name, email, creation date
- Last login tracking

✅ **Error Handling**
- User-friendly error messages
- Network error handling
- Form validation

✅ **Security**
- Secure authentication flow
- Firestore security rules
- Password strength requirements

## Next Steps

1. **Add Social Authentication**: Implement Google and Apple sign-in
2. **User Profile Management**: Add profile editing functionality
3. **Data Persistence**: Store gym data in Firestore
4. **Real-time Updates**: Use Firestore real-time listeners
5. **Push Notifications**: Add Firebase Cloud Messaging

## Troubleshooting

**Common Issues:**

1. **"Firebase App named '[DEFAULT]' already exists"**
   - Make sure you're only initializing Firebase once
   - Check that you're not importing firebase.js multiple times

2. **"Permission denied" errors**
   - Check your Firestore security rules
   - Make sure users are authenticated before accessing data

3. **"Network request failed"**
   - Check your internet connection
   - Verify your Firebase configuration is correct

4. **"Invalid email" errors**
   - Make sure email format validation is working
   - Check that the email field is properly trimmed

For more help, check the [Firebase Documentation](https://firebase.google.com/docs).
