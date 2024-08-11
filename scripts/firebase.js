// var database = firebase.database();
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";
 
import { getDatabase, ref, set, onValue, onChildAdded } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";


    // Your web app's Firebase configuration
    const firebaseConfig = {
        apiKey: "AIzaSyDsAD7cYKC7boqne9MLZ2y7b9AANgWk5OE", authDomain: "data-annotator-tool.firebaseapp.com",
        databaseURL: "https://data-annotator-tool-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "data-annotator-tool",
        storageBucket: "data-annotator-tool.appspot.com",
        messagingSenderId: "913657972954",
        appId: "1:913657972954:web:94e337e257d3452d7f3de3",
        measurementId: "G-RWJF94GG05"
        };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const database = getDatabase(app);

    // Authentication
    const auth = getAuth();

    export function createUser(email, password) {
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                alert('User created successfully: ' + user.email);
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                alert('Error: ' + errorMessage + ' (Code: ' + errorCode + ')');
            });
    }
