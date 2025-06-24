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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
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
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { user: userCredential.user };
    } catch (error) {
      console.error("Error signing in:", error);
      throw error;
    }
  };
  
  const sendEmailVerification = async (user) => {
    try {
      await firebaseSendEmailVerification(user);
    } catch (error) {
      console.error("Error sending email verification:", error);
      throw error;
    }
  };

  const signUp = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error("Error signing up:", error);
      throw error;
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
