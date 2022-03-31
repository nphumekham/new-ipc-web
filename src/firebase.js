
import { initializeApp } from 'firebase/app';
import { getDatabase } from "firebase/database";

// TODO: Replace with your app's Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyBprVQ8J91lqmrgArwV9yZiNcPV-Cv4EQ8",
    authDomain: "ipcsystem.firebaseapp.com",
    databaseURL: "https://ipcsystem-default-rtdb.asia-southeast1.firebasedatabase.app/",
    projectId: "ipcsystem",
    storageBucket: "ipcsystem.appspot.com",
    messagingSenderId: "376330449856",
    appId: "1:376330449856:web:610b8564d227edebcd4e25"
};

const app = initializeApp(firebaseConfig);

// Get a reference to the database service
const database = getDatabase(app);

export default database