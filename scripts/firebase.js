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
  update,
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
              writeUserData(user.uid, username, user.email, inputCode);

              // Mark input code as user
              markCodeAsTrue(inputCode);

              window.location.href = `/dashboard-ann.html?${user.uid}`
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


// Write user data in database
function writeUserData(userId, username, email, inputCode) {
  let userType = '';

  // Set to project-manager for codes starting with PM
  if (inputCode.startsWith('PM')) {
    userType = 'project-manager'; 
  }
  // Set to annotator for codes starting with AN 
  else if (inputCode.startsWith('AN')) {
    userType = 'annotator'; 
  } else {
    userType = 'general';
  }

  set(ref(getDatabase(), `Users/${userType}/${userId}`), {
    username: username,
    email: email,
  }).then(() => {
    console.log(`User data written to ${userType} path.`);
  }).catch((error) => {
    console.error("Error writing user data:", error);
  });
}

function markCodeAsTrue(inputCode) {
  update(ref(database, `AccountCodes/` + inputCode), {
    Used: true,
  });
}

export function signInUser(email, password) {
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in
      const user = userCredential.user;
      const userId = user.uid;;

      // Retrieve the user data from the database
      get(ref(database, `Users`)).then((snapshot) => {
        if (snapshot.exists()) {
          let userType = '';

          const data = snapshot.val();

          // Check user data to determine user type using bracket notation for project-manager
          if (data["project-manager"] && data["project-manager"][userId]) {
            userType = 'project-manager';
          } else if (data.annotator && data.annotator[userId]) {
            userType = 'annotator';
          }

          // Redirect to project manager dashboard
          if (userType === 'project-manager') {
            window.location.href = `../dashboard-pm.html?userId=${userId}`; 
          }
          // Redirect to annotator dashboard 
          else if (userType === 'annotator') {
            // To-Do: change to annotator dashboard when it's available
            window.location.href = `../dashboard-ann.html?userId=${userId}`; 
          } 
          else {
            alert("User type not recognized."); // Handle unknown user type
          }
        } else {
          alert("User data not found in the database.");
        }
      }).catch((error) => {
        console.error("Error retrieving user data:", error);
      });
      
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

export function createNewProject(projectName, projectDescription, annotators, projectInstruction, listOfClasses) {

  function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }
  let userId = getQueryParam('userId');

  writeProjectData(projectName, projectDescription, annotators, projectInstruction, listOfClasses, userId);
}

function writeProjectData(projectName, projectDescription, annotators, projectInstruction, listOfClasses, userId) {
    const projectID = generateProjectID();

    set(ref(getDatabase(), `Projects/${projectID}`), {
      Name: projectName,
      Description: projectDescription,
      Annotators: annotators,
      Instruction: projectInstruction,
      Classes: listOfClasses,
    }).then(() => {
        console.log(`Project data written for project: ${projectName}`);
    }).catch((error) => {
        console.error("Error writing project data:", error);
    });

    set(ref(getDatabase(), `Users/project-manager/${userId}/Projects/${projectID}`), {
      ProjectId: projectID,
    })
}

function generateProjectID() {
  const randomNumber = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
  return `P${randomNumber}`;
}