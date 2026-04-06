import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDmdfqdS4GLPuXByA7cFUAKqHJ2tdQap_o",
    authDomain: "content-gen-745c2.firebaseapp.com",
    projectId: "content-gen-745c2",
    storageBucket: "content-gen-745c2.firebasestorage.app",
    messagingSenderId: "944315313821",
    appId: "1:944315313821:web:24c0dc3ffc2e22f298ae74",
    measurementId: "G-2SHNMVKSWV"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);