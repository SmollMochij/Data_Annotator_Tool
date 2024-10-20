// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getDatabase, ref, set, onValue, onChildAdded, update } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";

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
    
    //get url parameters
    const queryString = window.location.search;
    console.log(queryString)
    const urlParams = new URLSearchParams(queryString)
    // const filename = urlParams.get('filename')
    //grab project ID to find project in database
    const project = urlParams.get('projectID')
    const userID = urlParams.get('userID')
    const isAProjectManager = urlParams.get('PM')
    console.log(userID)
    console.log(isAProjectManager)

    //navbar: dashboard link (for PM and ANN accounts)
    document.getElementById("dashboard-link").addEventListener("click", function(e) {
        if(isAProjectManager == "true") {
            window.location = `/dashboard-pm.html?userId=${userID}`
        } else {
            window.location = `/dashboard-ann.html?userId=${userID}`
        }
    })


    //find the upload files button on webpage
    var uploadButton = document.getElementById("uploadButton")
    //assign an event listener to detect uploaded files
    uploadButton.addEventListener("change", function () {
        //for each file uploaded
        for (let i = 0; i < uploadButton.files.length; i++) {
            //use the FileReader to read its contents
            let fr = new FileReader()
            fr.onload = function () {
                console.log(`fr:${fr}`)
                console.log(`fr.readyState:${fr.readyState}`)
                console.log(`fr.result:${fr.result}`)
                console.log(`uploadButton.files[i].name ${uploadButton.files[i].name}`)

                addFileToDatabase(project, uploadButton.files[i].name, fr.result)

                let fileExtension = uploadButton.files[i].name.split('.').pop();
                console.log(fileExtension)

                if (fileExtension == 'txt') {
                    let newFileName = document.createElement("li")
                    newFileName.textContent = uploadButton.files[i].name
                    document.getElementById("listOfFileNames").appendChild(newFileName)

                    let newContent = document.createElement("li")
                    newContent.textContent = fr.result;
                    console.log(newContent.textContent)
                    console.log(`Success: ${uploadButton.files[i].name} is a text file`)
                } else {
                    alert(`Error: ${uploadButton.files[i].name} is not a valid text file! Please upload .txt files only`)
                }
            }
            fr.onerror = function (event) {
                alert(`Error reading file: ${uploadButton.files[i].name}`);
            }
            fr.readAsText(this.files[i]);
        }
    })


    const projectRef = ref(database, `Projects/${project}`)
    onValue(projectRef, (snapshot) => {
        document.getElementById("title").textContent = snapshot.val().Name
        document.getElementById("desc").textContent = snapshot.val().Description
        document.getElementById("id").textContent = `Project ID: ${snapshot.val().ProjectID}`
        document.getElementById("instructionsBox").textContent = `${snapshot.val().Instructions}`
    })

    
    //edit instructions button
    let instructionsButton = document.getElementById("editInstructionsButton")
    instructionsButton.addEventListener('click', function(e) {
        let newInstructionsPrompt = prompt("Please enter new instructions:", document.getElementById("instructionsBox").textContent)
        if(newInstructionsPrompt != null && newInstructionsPrompt.trim() != "") {
            alert("New instructions: " + newInstructionsPrompt)
            const currentProjectRef = ref(database, `Projects/${project}/Instructions`)
            update(ref(getDatabase(), `Projects/${project}`), {
                Instructions: newInstructionsPrompt.trim(),
            })
        } else {
            alert("No changes made")
        }
    })

    //if the annotator is viewing the page, hide the edit buttons
    if(isAProjectManager == "false") {
        instructionsButton.style.display='none'
        document.getElementById("assignAnnotatorsRow").style.display="none"
        document.getElementById("newProjectMainBtn").style.display="none"
    }
    

    // read data
    const projectFilesRef = ref(database, `Projects/${project}/Files`);
    onValue(projectFilesRef, (snapshot) => {
        document.getElementById("files").innerHTML = "";

        let newfileItem = document.createElement("div")
        newfileItem.setAttribute("class", "file-item");
        let newFileImg = document.createElement("img")
        newFileImg.src = "images/button-icons/upload.png"
        newFileImg.alt = "File"
        newFileImg.id = "newFileButton"
        let newFileName = document.createElement("p")
        newFileName.textContent = "New file"
        //new file button
        newfileItem.addEventListener("click", function (e) {
            document.getElementById("uploaderDiv").style.display = "block"
        })

        newfileItem.appendChild(newFileImg)
        newfileItem.appendChild(newFileName)
        document.getElementById("files").appendChild(newfileItem)
        //if the annotator is viewing the page, hide the "New File" button
        if(isAProjectManager == "false") {
            newfileItem.style.display="none"
        }

        snapshot.forEach((childSnapshot) => {
            const data = childSnapshot.val();
            console.log(childSnapshot.key);

            let fileItem = document.createElement("div")
            fileItem.setAttribute("class", "file-item");
            let img = document.createElement("img")
            switch (data.status){
                case "done":
                    img.src = "images/button-icons/done.png"; break
                default:
                    img.src = "images/button-icons/todo.png"; break
            }
            img.alt = "File " + data.status;
            let name = document.createElement("p")
            name.textContent = childSnapshot.key

            fileItem.appendChild(img)
            fileItem.appendChild(name)
            fileItem.addEventListener("click", function (e) {
                window.location.href = `annotation.html?projectID=${project}&filename=${childSnapshot.key}.txt&userID=${userID}&PM=${isAProjectManager}` //TODO: change to annotation.html
            })
            document.getElementById("files").appendChild(fileItem)
        })
    });

    document.getElementById("doneButton").addEventListener("click", function (e) {
        document.getElementById("uploaderDiv").style.display = "none"
    })
}

//add each uploaded file to the database
function addFileToDatabase(projectID, name, content) {
    //then use file name as key
    let project = projectID
    name = name.substring(0, name.indexOf(".")) //remove the extension (.txt) to get the filename
    set(ref(database, `Projects/${project}/Files/${name}`), {
        assignedAnnotator: "",
        fileContent: content,
        status: "unassigned",
    }).catch((error) => {
        alert(error)
    })
}