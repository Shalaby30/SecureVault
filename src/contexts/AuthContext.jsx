import { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail as sendFirebasePasswordResetEmail,
  sendEmailVerification as firebaseSendEmailVerification,
  updateProfile as updateFirebaseProfile
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Force refresh the user to get the latest email verification status
        await user.reload();
        
        // Only set the current user if email is verified
        if (user.emailVerified) {
          setCurrentUser(user);
        } else {
          // If email is not verified, sign the user out
          await firebaseSignOut(auth);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user; // Return the user object directly
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  const signIn = async (email, password) => {
    try {
      // First, sign in normally
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Force refresh the user to get the latest email verification status
      await userCredential.user.reload();
      
      // Check if email is verified
      if (!userCredential.user.emailVerified) {
        // Send verification email if not verified
        await firebaseSendEmailVerification(userCredential.user, {
          url: `${window.location.origin}/login`,
          handleCodeInApp: false
        });
        
        // Sign out the user since email is not verified
        await firebaseSignOut(auth);
        const verificationError = new Error('Please verify your email before signing in. A new verification email has been sent.');
        verificationError.code = 'auth/email-not-verified';
        throw verificationError;
      }
      
      return { user: userCredential.user };
    } catch (error) {
      console.error("Authentication error:", error);
      
      // Handle specific error cases
      let errorMessage = 'An error occurred during sign in. Please try again.';
      
      switch (error.code) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
          errorMessage = 'Invalid email or password. Please try again.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Access to this account has been temporarily disabled due to many failed login attempts. Please try again later or reset your password.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled. Please contact support.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled. Please contact support.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        default:
          // If it's a custom error we threw (like email verification)
          if (error.message) {
            errorMessage = error.message;
          }
      }
      
      // Create a new error with our custom message
      const authError = new Error(errorMessage);
      authError.code = error.code;
      throw authError;
    }
  };
  
  const sendEmailVerification = async (user) => {
    try {
      if (!user) {
        throw new Error('No user is currently signed in');
      }
      
      // Force refresh the user to get the latest data
      await user.reload();
      
      // Send verification email with redirect URL
      await firebaseSendEmailVerification(user, {
        url: `${window.location.origin}/login`,
        handleCodeInApp: false
      });
      
      return true;
    } catch (error) {
      console.error("Error sending email verification:", error);
      throw new Error('Failed to send verification email. Please try again.');
    }
  };

  const signUp = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Send verification email immediately after sign up
      await firebaseSendEmailVerification(userCredential.user, {
        url: `${window.location.origin}/login`,
        handleCodeInApp: false
      });
      
      // Return the user object
      return { user: userCredential.user };
    } catch (error) {
      console.error("Error signing up:", error);
      let errorMessage = 'Failed to create an account. Please try again.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already in use. Please try logging in instead.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      }
      
      const signUpError = new Error(errorMessage);
      signUpError.code = error.code;
      throw signUpError;
    }
  };

  const updateUserProfile = async (updates) => {
    try {
      if (auth.currentUser) {
        await updateFirebaseProfile(auth.currentUser, updates);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  };

  const sendPasswordReset = async (email) => {
    try {
      await sendFirebasePasswordResetEmail(auth, email);
    } catch (error) {
      console.error("Error sending password reset email:", error);
      throw error;
    }
  };

  const value = {
    currentUser,
    loading,
    signInWithGoogle,
    signIn,
    signUp,
    signOut,
    updateUserProfile,
    sendPasswordReset,
    sendEmailVerification
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
