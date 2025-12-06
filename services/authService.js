import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config';

// Sign up with email and password
export const signUpWithEmail = async (email, password, firstName, lastName) => {
  try {
    // Create user with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update user profile with display name
    await updateProfile(user, {
      displayName: `${firstName} ${lastName}`
    });

    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      firstName: firstName,
      lastName: lastName,
      displayName: `${firstName} ${lastName}`,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    });

    return { success: true, user };
  } catch (error) {
    console.error('Sign up error:', error);
    return { 
      success: false, 
      error: getErrorMessage(error.code) 
    };
  }
};

// Sign in with email and password
export async function signInUser(email, password) {
  try {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
    const user = cred.user;

    // Update last login time if document exists
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      await setDoc(userDocRef, {
        lastLogin: serverTimestamp()
      }, { merge: true });
    }

    return { success: true, user };
  } catch (error) {
    console.error("signInUser error:", error);
    return { 
      success: false, 
      errorCode: error.code, 
      errorMessage: error.message 
    };
  }
}

// Sign out
export async function signOutUser() {
  try {
    console.log("[authService] calling Firebase signOut");
    await signOut(auth);
    console.log("[authService] signOut success");
    return { success: true };
  } catch (error) {
    console.error("[authService] signOut error:", error);
    return { success: false, error: error.message };
  }
}

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Listen to auth state changes
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Reset password
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    console.error('Password reset error:', error);
    return { 
      success: false, 
      error: getErrorMessage(error.code) 
    };
  }
};

// Get user data from Firestore
export const getUserData = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return { success: true, data: userDoc.data() };
    } else {
      return { success: false, error: 'User not found' };
    }
  } catch (error) {
    console.error('Get user data error:', error);
    return { 
      success: false, 
      error: 'Failed to get user data' 
    };
  }
};

// Sign up user
export async function signUpUser(firstName, lastName, email, password) {
  try {
    // Create user with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    const user = userCredential.user;

    // Set display name
    await updateProfile(user, {
      displayName: `${firstName} ${lastName}`
    });

    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: `${firstName} ${lastName}`,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp()
    });

    return { success: true, user };
  } catch (error) {
    console.error("signUpUser error:", error);
    return { 
      success: false, 
      errorCode: error.code, 
      errorMessage: error.message 
    };
  }
}

// Helper function to convert Firebase error codes to user-friendly messages
const getErrorMessage = (errorCode) => {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists';
    case 'auth/invalid-email':
      return 'Please enter a valid email address';
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please try again.';
    case 'auth/operation-not-allowed':
      return 'Email/password accounts are not enabled. Please contact support.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/user-not-found':
      return 'No account found with this email address';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    default:
      return 'An error occurred. Please try again.';
  }
};
