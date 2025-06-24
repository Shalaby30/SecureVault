import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB6fTXHc4Lbt_35sURWW-bxSWUKgUa8fWk",
  authDomain: "password-manager-94cf1.firebaseapp.com",
  projectId: "password-manager-94cf1",
  storageBucket: "password-manager-94cf1.firebasestorage.app",
  messagingSenderId: "605456092412",
  appId: "1:605456092412:web:40354c913ded9d6d4b5b79"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

export { auth, db, storage, googleProvider };
