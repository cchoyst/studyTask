// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { /*getAnalytics*/
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup, 
    signOut  } from "firebase/auth" /*"firebase/analytics"*/ ;
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: "study-task-f7d13.firebasestorage.app",
  messagingSenderId: "960245627788",
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: "G-9102BYCRG4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);


const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// ログイン関数
export const login = () => signInWithPopup(auth, provider);

// ログアウト関数
export const logout = () => signOut(auth);

// App.jsx で使うため export
export { auth };

//追加
import { getFirestore, collection, addDoc, getDocs, query, where } from "firebase/firestore";

const db = getFirestore(app);

export { db, collection, addDoc, getDocs, query, where };