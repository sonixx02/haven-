// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAe2cOK8PTHoBC-adhx70VDFUCA9HHzDIo",
  authDomain: "apnisehat-a4154.firebaseapp.com",
  projectId: "apnisehat-a4154",
  storageBucket: "apnisehat-a4154.appspot.com",
  messagingSenderId: "825904484127",
  appId: "1:825904484127:web:1fda89053f95ee20f6ea2a",
  measurementId: "G-7JFJJQXKYJ"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth=getAuth();
export const db=getFirestore(app);
export default app;