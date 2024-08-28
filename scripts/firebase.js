// var database = firebase.database();
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";

import {
  getDatabase,
  ref,
  set,
  get,
  child,
  onValue,
  onChildAdded,
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDsAD7cYKC7boqne9MLZ2y7b9AANgWk5OE",
  authDomain: "data-annotator-tool.firebaseapp.com",
  databaseURL:
    "https://data-annotator-tool-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "data-annotator-tool",
  storageBucket: "data-annotator-tool.appspot.com",
  messagingSenderId: "913657972954",
  appId: "1:913657972954:web:94e337e257d3452d7f3de3",
  measurementId: "G-RWJF94GG05",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Authentication
const auth = getAuth();

export function createUser(username, email, password, inputCode) {
  const dbRef = ref(getDatabase());

  get(child(dbRef, `AccountCodes/${inputCode}`))
    .then((snapshot) => {
      // Checks if the code used is in the database and false
      if (snapshot.exists()) {
        const codeData = snapshot.val();
        if (codeData.Used === false) {
          console.log("Code is valid");
          createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
              const user = userCredential.user;
              alert("User created successfully: " + user.email);

              // Write user's data in the database
              writeUserData(user.uid, username, user.email);

              // Mark input code as user
              markCodeAsTrue(inputCode);

              window.location.href = "/dashboard-temp.html"
            })
            .catch((error) => {
              const errorCode = error.code;
              const errorMessage = error.message;
              alert("Error: " + errorMessage + " (Code: " + errorCode + ")");
            });
        } else {
            alert ("Code has already been used");
        }
      } else {
        alert("The code entered is invalid");
      }
    })
    .catch((error) => {
      alert("Error: " + error.message);
    });
}

function writeUserData(userId, username, email) {
  set(ref(database, "users/" + userId), {
    username: username,
    email: email,
  });
}

function markCodeAsTrue(inputCode) {
  set(ref(database, `AccountCodes/` + inputCode), {
    Used: true,
  });
}

export function signInUser(email, password) {
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in
      const user = userCredential.user;
      const userId = userCredential.uid;
      const dbRef = ref(getDatabase());

      window.location.href = "../dashboard-temp.html";
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;

      // Specific error messages
      switch (errorCode) {
        case "auth/internal-error":
          alert("No account found with this email.");
          break;
        case "auth/wrong-password":
          alert("Incorrect password.");
          break;
        case "auth/invalid-email":
          alert("Invalid email format.");
          break;
        case "auth/invalid-login-credentials":
          alert("Wrong email / password");
          break;
        default:
          alert(`${errorCode} : ${errorMessage}`);
          break;
      }
    });
}
