// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDWEnV-bZ1_0EV-NX3PyrkPKCIEa668g_g",
  authDomain: "study-task-f7d13.firebaseapp.com",
  projectId: "study-task-f7d13",
  storageBucket: "study-task-f7d13.firebasestorage.app",
  messagingSenderId: "960245627788",
  appId: "1:960245627788:web:69a5bc632cd96df03bb4a9",
  measurementId: "G-9102BYCRG4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);