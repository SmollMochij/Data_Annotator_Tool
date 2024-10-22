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
        const assignedProjects = codeData.AssignedProjects;
        if (codeData.Used === false) {
          console.log("Code is valid");
          createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
              const user = userCredential.user;
              alert("User created successfully: " + user.email);

              // Write user's data in the database
              writeUserData(user.uid, username, user.email, inputCode, assignedProjects);

              // Mark input code as user
              markCodeAsTrue(inputCode);

              window.location.href = `/sign-in.html?`
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
function writeUserData(userId, username, email, inputCode, assignedProjects) {
  let userType = '';
  // let assignedProjects = '';

  // Set to project-manager for codes starting with PM
  if (inputCode.startsWith('PM')) {
    userType = 'project-manager'; 
    set(ref(getDatabase(), `Users/${userType}/${userId}`), {
      username: username,
      email: email,
    }).then(() => {
      console.log(`User data written to ${userType} path.`);
    }).catch((error) => {
      console.error("Error writing user data:", error);
    }); 
  }
  // Set to annotator for codes starting with AN 
  else if (inputCode.startsWith('AN')) {
    userType = 'annotator';
      //add assigned projects
      set(ref(getDatabase(), `Users/${userType}/${userId}`), {
        username: username,
        email: email,
        AssignedProjects: assignedProjects,
      }).then(() => {
        console.log(`User data written to ${userType} path.`);
      }).catch((error) => {
        console.error("Error writing user data:", error);
      }); 
  } else {
    userType = 'general';
    set(ref(getDatabase(), `Users/${userType}/${userId}`), {
      username: username,
      email: email,
    }).then(() => {
      console.log(`User data written to ${userType} path.`);
    }).catch((error) => {
      console.error("Error writing user data:", error);
    }); 
  }


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

export function createNewProject(projectName, projectDescription, annotators, projectInstruction, listOfClasses, projectID) {

  function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }
  let userId = getQueryParam('userId');

  writeProjectData(projectName, projectDescription, annotators, projectInstruction, listOfClasses, userId, projectID);
}

//Converts given RGB values (r, g, b) to HEX
function RGBtoHex(r, g, b) {
  const rgb2hex = (r, g, b) => {
      return '#' +
          (
              (1 << 24) +
              (r << 16) +
              (g << 8) +
              b
          )
              .toString(16).slice(1);
  };
  return rgb2hex(r, g, b);
}

//generates a HEX colour
function generateColourHEX() {
  //need a 500ms delay to focus on the text input field - dont ask me why i dont know 
  setTimeout(function () {
      // document.getElementById("newClass").value = " ";
      document.getElementById("newClass").focus();
  }, 500);

  let red = Math.floor(Math.random() * 256);
  let green = Math.floor(Math.random() * 256);
  let blue = Math.floor(Math.random() * 256);

  let newColour = RGBtoHex(red, green, blue);
  console.log(`${newColour}`);

  //determine if text colour should be white or black
  let textColour = "white";
  if ((red * 0.299 + green * 0.587 + blue * 0.114) >= 186.00) {
      textColour = "black";
  }

  let returnColour = [newColour, textColour]
  return returnColour
}

function writeProjectData(projectName, projectDescription, annotators, projectInstruction, listOfClasses, userId, projectID) {
    // const projectID = generateProjectID();

    //preparing listOfClasses by generating colours
    for(let className of listOfClasses) {
      className = className.toUpperCase()
      let colourHEX = generateColourHEX()
      console.log(`${className} - ${colourHEX[0]} : ${colourHEX[1]}`)
      set(ref(getDatabase(), `Projects/${projectID}/Classes/${className}`), {
        BackgroundHEX: colourHEX[0],
        Classifications: '',
        TextColour: colourHEX[1],
      })
    }

    update(ref(getDatabase(), `Projects/${projectID}`), {
      Name: projectName,
      Description: projectDescription,
      Annotators: annotators,
      Instructions: projectInstruction,
      ProjectID: projectID,
    }).then(() => {
        console.log(`Project data written for project: ${projectName}`);
    }).catch((error) => {
        console.error("Error writing project data:", error);
    });

    set(ref(getDatabase(), `Users/project-manager/${userId}/Projects/${projectID}`), {
      ProjectId: projectID,
    })
}

export function generateProjectID() {
  const randomNumber = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
  return `P${randomNumber}`;
}