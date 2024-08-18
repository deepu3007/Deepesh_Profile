// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDcl-XBKw18oEHgHLQgdGKg_A32PvXh0Z0",
  authDomain: "redvelvet-aution-system.firebaseapp.com",
  projectId: "redvelvet-aution-system",
  storageBucket: "redvelvet-aution-system.appspot.com",
  messagingSenderId: "562013921873",
  appId: "1:562013921873:web:c29ec93ddb51deb12b0e70",
  measurementId: "G-V84VJSF6C7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the Firestore database instance
export { db };
