// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBN-L-e8hiTLTqLIpZic5a9Cq0METLa7JY",
  authDomain: "zein-digital.firebaseapp.com",
  projectId: "zein-digital",
  storageBucket: "zein-digital.firebasestorage.app",
  messagingSenderId: "445566614164",
  appId: "1:445566614164:web:1dd11cfb53010507765281",
  measurementId: "G-VTH7K5EKJ1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);