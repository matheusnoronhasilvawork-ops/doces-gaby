
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBz3iHhqpUZEqzzYfRDNdoI8LuVKrgnpkY",
  authDomain: "doces-gaby.firebaseapp.com",
  projectId: "doces-gaby",
  storageBucket: "doces-gaby.firebasestorage.app",
  messagingSenderId: "719010341967",
  appId: "1:719010341967:web:2c66dacaad99b90053b63a",
  measurementId: "G-7V7E3QWKT9",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);

if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      getAnalytics(app);
    }
  });
}
