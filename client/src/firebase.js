import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSy...yourkey...",
  authDomain: "project-509265929487.firebaseapp.com",
  projectId: "project-509265929487",
  appId: "509265929487-ehenntoe2nt4uou5qdta9qbb20utj7a7.apps.googleusercontent.com"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();