import { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithRedirect,
  getRedirectResult,
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
    // Listen to auth state
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await user.reload();
        if (user.emailVerified) {
          setCurrentUser(user);
        } else {
          await firebaseSignOut(auth);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    // Get redirect result from Google
    getRedirectResult(auth)
      .then(async (result) => {
        if (result && result.user) {
          const user = result.user;
          await user.reload();

          if (user.emailVerified) {
            setCurrentUser(user);
          } else {
            await firebaseSendEmailVerification(user, {
              url: `${window.location.origin}/login`,
              handleCodeInApp: false
            });
            await firebaseSignOut(auth);
            alert("Please verify your Google account email before logging in.");
          }
        }
      })
      .catch((error) => {
        console.error("Redirect sign-in error:", error);
      });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (error) {
      console.error("Error during Google redirect sign-in:", error);
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
      await userCredential.user.reload();

      if (!userCredential.user.emailVerified) {
        await firebaseSendEmailVerification(userCredential.user, {
          url: `${window.location.origin}/login`,
          handleCodeInApp: false
        });
        await firebaseSignOut(auth);

        const verificationError = new Error('Please verify your email before signing in. A new verification email has been sent.');
        verificationError.code = 'auth/email-not-verified';
        throw verificationError;
      }

      return { user: userCredential.user };
    } catch (error) {
      console.error("Authentication error:", error);
      let errorMessage = 'An error occurred during sign in. Please try again.';

      switch (error.code) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
          errorMessage = 'Invalid email or password. Please try again.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        default:
          if (error.message) {
            errorMessage = error.message;
          }
      }

      const authError = new Error(errorMessage);
      authError.code = error.code;
      throw authError;
    }
  };

  const sendEmailVerification = async (user) => {
    try {
      if (!user) throw new Error('No user is currently signed in');

      await user.reload();
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
      await firebaseSendEmailVerification(userCredential.user, {
        url: `${window.location.origin}/login`,
        handleCodeInApp: false
      });

      return { user: userCredential.user };
    } catch (error) {
      console.error("Error signing up:", error);
      let errorMessage = 'Failed to create an account. Please try again.';

      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already in use.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters.';
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
