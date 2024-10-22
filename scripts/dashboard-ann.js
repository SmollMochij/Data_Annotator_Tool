// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getDatabase, ref, set, onValue, onChildAdded } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDsAD7cYKC7boqne9MLZ2y7b9AANgWk5OE",
    authDomain: "data-annotator-tool.firebaseapp.com",
    databaseURL: "https://data-annotator-tool-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "data-annotator-tool",
    storageBucket: "data-annotator-tool.appspot.com",
    messagingSenderId: "913657972954",
    appId: "1:913657972954:web:94e337e257d3452d7f3de3",
    measurementId: "G-RWJF94GG05"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
const database = getDatabase();
const annotatorRef = ref(database, 'annotators/');

// Fetch and display the list of annotators in the dropdown
onChildAdded(annotatorRef, (snapshot) => {
    const annotator = snapshot.val();
    const annotatorOption = document.createElement('option');
    annotatorOption.value = annotator.id; // Assuming annotator has an 'id' field
    annotatorOption.textContent = annotator.name; // Assuming annotator has a 'name' field
    document.getElementById('annotatorDropdown').appendChild(annotatorOption);
});

window.onload = function () {
    const queryString = window.location.search;
    console.log(queryString)
    const urlParams = new URLSearchParams(queryString)
    const userID = urlParams.get('userId')

    //navbar: dashboard link
    document.getElementById("dashboard-link").addEventListener("click", function(e) {
        window.location = `/dashboard-ann.html?userId=${userID}`
    })
    
    //get annotators's assigned projects
    const userRef = ref(database, `Users/annotator/${userID}`)
    //retrieve user's attributes from db
    onValue(userRef, (snapshot) => {
        //get their profile name
        document.getElementById("profileName").textContent = snapshot.val().username
        document.getElementById("usernameSpan").textContent = snapshot.val().username
        //get their profile description/bio
        document.getElementById("desc").textContent = snapshot.val().bio
        //get their user ID
        document.getElementById("id").textContent = `User ID: ${snapshot.key}`
        //get all their assigned projects
        let assignedProjectsString = snapshot.val().AssignedProjects
        console.log(assignedProjectsString)
        //if there are any projects assigned to them
        if (assignedProjectsString.length > 0) {
            //split the projects string into an array
            let assignedProjectsList = assignedProjectsString.split(",")
            //log contents of array
            console.log(assignedProjectsString)
            console.log(assignedProjectsList)

            const projectFilesRef = ref(database, 'Projects/');
            onValue(projectFilesRef, (snapshot) => {
                //log each project
                console.log(snapshot.val())
                document.getElementById("files").innerHTML = "";

                
                snapshot.forEach((childSnapshot) => {
                    const data = childSnapshot.val();
                    console.log(childSnapshot.key);
                    console.log(assignedProjectsList.includes(childSnapshot.key))
                    console.log(data.Name);
        
                    if(assignedProjectsList.includes(childSnapshot.key)) {

                        let projectItem = document.createElement("div")
                        projectItem.setAttribute("class", "file-item");
                        let img = document.createElement("img")
            
                        img.src = "images/project_symbol.png"; 
                        
                        img.alt = "File " + data.status;
                        let id = document.createElement("p")
                        id.textContent = childSnapshot.key
                        id.style.fontSize = '16px';
                        id.style.fontWeight = 'bold';
                        let name = document.createElement("p")
                        name.textContent = data.Name
                        name.style.fontSize = '20px';
                        
            
                        projectItem.appendChild(img)
                        projectItem.appendChild(id)
                        projectItem.appendChild(name)
                        let projectID = `${childSnapshot.key}` 
                        projectItem.addEventListener("click", function (e) {
                            window.location.href = `view-project.html?projectID=${projectID}&userID=${userID}&PM=false` //change to annotation.html
                        })
                        document.getElementById("files").appendChild(projectItem)
                    }
                })
            });
        }
    })


    document.getElementById("doneButton").addEventListener("click", function (e) {
        document.getElementById("uploaderDiv").style.display = "none"
    })
}