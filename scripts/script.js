import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";

import {
    getDatabase,
    ref,
    set,
    get,
    child,
    onValue,
    onChildAdded,
    update,
    off,
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

var allClasses = [];
var markedDone = false;

var annotatorID;

const tool = {
    NONE: 0,
    HIGHLIGHT: 1,
    ERASE: 2
}

let toolSelected = tool.NONE;
console.log(toolSelected); //0

//list of each classification (eg "Name":"John")
var classificationsList = [];

//has the user uploaded a file to be annotated?
var uploadedfile = false;
var jsonFile;

var selectedText = "";

function createJSON(textContent) {
    //CREATE JSON (filler annotatorID)
    jsonFile = {
        "textContent": textContent,
        "annotations":
            {}
    };
    // document.getElementById("jsonPreview").setAttribute("style", "color:black; padding-top:5px;padding-left:5px;padding-right:5px;");
    let stringifiedJson = JSON.stringify(jsonFile);
    updateJSONPreview(stringifiedJson);
}

function updateJSONPreview(stringifiedJson) {
    console.log(jsonFile)
    let jsonString = JSON.stringify(jsonFile, null, 2);
    jsonString = jsonString.replace('textContent\":', 'textContent":<br>');
    document.getElementById('jsonPreviewText').innerHTML = jsonString;
    document.getElementById('jsonPreviewText').innerHTML = document.getElementById('jsonPreviewText').innerHTML.replace('"annotatorID"', '<span style="color:rgb(185, 255, 0)">"annotatorID"</span>');
    document.getElementById('jsonPreviewText').innerHTML = document.getElementById('jsonPreviewText').innerHTML.replace('"textContent"', '<span style="color:rgb(185, 255, 0)">"textContent"</span>');
    document.getElementById('jsonPreviewText').innerHTML = document.getElementById('jsonPreviewText').innerHTML.replace('"annotations"', '<span style="color:rgb(185, 255, 0)">"annotations"</span>');

    //Show annotatorID
    console.log(stringifiedJson.substring(1, stringifiedJson.indexOf("textContent")));
    //show Text Content
    document.getElementById("textCollapse").textContent = stringifiedJson.substring(stringifiedJson.indexOf("textContent") + 13, stringifiedJson.indexOf(`,\"annotations\"`));
    //show annotations
    console.log(stringifiedJson.substring(stringifiedJson.indexOf(`,\"annotations\"`) + 15, stringifiedJson.length - 1));
    document.getElementById("classificationsCollapse").textContent = stringifiedJson.substring(stringifiedJson.indexOf(`,\"annotations\"`) + 15, stringifiedJson.length - 1);
    console.log(jsonFile);
}

function dropdownClassify(className) {
    console.log(toolSelected);
    console.log(toolSelected === tool.HIGHLIGHT);
    console.log("Selected Text: " + selectedText);
    //check if text file has been uploaded first
    if (uploadedfile) {
        //check if selection actually contains text
        if (selectedText.length > 0) {
            if (selectedText.includes(",")) {
                alert("Error: Please select text with no commas")
            } else {
                let textArea = document.getElementById("textArea");

                //create new list item
                let newItem = document.createElement("li");
                newItem.appendChild(document.createTextNode(`${selectedText} : ${className}`));
                //add list item to the end of the list
                let clist = document.getElementById("classifications-list");
                //if there have been no classifications made yet, first reset the list
                if (clist.innerHTML.trim().toLowerCase() === "<li>No classifications yet!</li>".toLowerCase()) {
                    clist.innerHTML = "";
                }
                //then add new classification to the list
                classificationsList.push(`${selectedText} : ${className}`);
                console.log(classificationsList);

                //regex pattern
                let pattern = `(?<=^|\\s|"|')${selectedText}(?=['"\\s,;:.])`
                let reg = new RegExp(pattern, "ig")
                let replaceMask = `<span data-toggle='tooltip' title=${className} class='${className}'>$&</span>` //replace with itself +
                document.getElementById("textArea").innerHTML = document.getElementById("textArea").innerHTML.replaceAll(reg, replaceMask)

                let name = className.toUpperCase();
                console.log("Name: " + name);
                jsonFile.annotations[name].push(selectedText);
                console.log("JSON:" + JSON.stringify(jsonFile));

                updateJSONPreview(JSON.stringify(jsonFile));

                updateClassificationsList();
                spanTest();

                displayNotification(`New classification: ${className} - ${selectedText}`);
            }
        }
    }
}

function displayNotification(message) {
    //notification
    setTimeout(function () {
        // document.getElementById("notification").style.display = "none";
        document.getElementById("notification").style.display = "flex";
        document.getElementById("notification").style.animation = "fadein 500ms";
        setTimeout(function () {
            document.getElementById("notification").style.opacity = "100";
        }, 500)
    }, 0);

    document.getElementById("notification").style.display = "flex";
    document.getElementById("notification-text").textContent = message;

    setTimeout(function () {
        // document.getElementById("notification").style.display = "none";
        document.getElementById("notification").style.animation = "fadeout 500ms";
        setTimeout(function () {
            document.getElementById("notification").style.display = "none";
        }, 400)
    }, 2000);
}

//also loads assigned annotator's details
function loadFile(projectID, textfilename) {
    const projectRef = ref(database, `Projects/${projectID}`)
    get(projectRef).then((snapshot) => {
        console.log(`Filename: ${textfilename}`)
        console.log(`Project ID: ${snapshot.val().ProjectID}`)
        console.log(`Project name: ${snapshot.val().Name}`)

        let name = snapshot.val().Name
        textfilename = textfilename.substring(0, textfilename.length - 4)
        console.log(textfilename)
        
        let fileRef = ref(database, `Projects/${projectID}/Files/${textfilename}`)
        get(fileRef).then((snapshot) => {
            console.log(snapshot.val().fileContent)
            //file has been uploaded
            uploadedfile = true;
            console.log("File loaded: " + textfilename);
            // grab annotator name as well for the JSON file
            annotatorID = snapshot.val().assignedAnnotator

            //import text content
            document.getElementById("textArea").innerHTML = snapshot.val().fileContent

            //update Project Name | Data File Name
            document.getElementById("dataFileNameSpan").textContent = textfilename
            document.getElementById("projectNameSpan").textContent = name

            //create JSON file
            createJSON(document.getElementById("textArea").innerHTML);

            //enable Add class button
            document.getElementById("addClassButton").setAttribute("class", "btn btn-primary");

            loadClasses(projectID)
        })
    })
}

function viewInstructions() {
    const queryString = window.location.search;
    console.log(queryString)
    const urlParams = new URLSearchParams(queryString)
    const projectID = urlParams.get('projectID')

    let instructionsP = document.getElementById("instructionsParagraph")
    let instructionsRef = ref(database, `Projects/${projectID}/Instructions`)
    onValue(instructionsRef, (snapshot) => {
        instructionsP.innerHTML = snapshot.val()
    })
}

function loadClasses(projectID) {
    let classesRef = ref(database, `Projects/${projectID}/Classes`)
    // read data
    get(classesRef)
    .then((snapshot) => {
        //get each class
        snapshot.forEach((childSnapshot) => {
            const data = childSnapshot.val();
            let newElement = document.createElement("p");

            newElement.innerHTML = `${childSnapshot.key}:<br> ${data.BackgroundHEX}<br> ${data.Classifications}<br>${data.TextColour}`;
            console.log("KEY: " + childSnapshot.key)
            console.log("HEX: " + data.BackgroundHEX)
            createClass(childSnapshot.key, data.BackgroundHEX)

            let listOfClassifications = data.Classifications.split(",")
            for (let i = 0; i < listOfClassifications.length; i++) {
                console.log(childSnapshot.key + " | CLASSIFICATION: " + listOfClassifications[i])
                updateClassificationsList();
                spanTest();
                updateJSONPreview(JSON.stringify(jsonFile));

                //classify
                selectedText = listOfClassifications[i]
                let className = childSnapshot.key
                dropdownClassify(className)
            }
            console.log(listOfClassifications)
            console.log(data);
            console.log(jsonFile)
        })
    });
}

//when the window finishes loading, find the textArea div and fill it with lorem ipsum
window.onload = function () {
    document.getElementById("instructionsButton").addEventListener("click", function (e) {
        viewInstructions()
    })

    document.getElementById("exportToJSONButton").addEventListener("click", function (e) {
        exportToJSON()
    })
    document.getElementById("increaseFont").addEventListener("click", function (e) {
        increaseFont()
    })
    document.getElementById("decreaseFont").addEventListener("click", function (e) {
        decreaseFont()
    })

    document.getElementById("addClassButton").addEventListener("click", function (e) {
        generateColourHEX();
    })
    document.getElementById("dropdownAddNewClassButton").addEventListener("click", function (e) {
        generateColourHEX();
    })

    document.getElementById("goBackButton").addEventListener("click", function (e) {
        goBack()
    })

    let newClassField = document.getElementById("newClass")
    let classColourField = document.getElementById("classColour")
    document.getElementById("createClassButton").addEventListener("click", function (e) {
        createClass(newClassField.value, classColourField.value)
    })

    
    //get URL parameters (eg projectID=P000001)
    const queryString = window.location.search;
    console.log(queryString)
    const urlParams = new URLSearchParams(queryString)
    const filename = urlParams.get('filename')
    const projectID = urlParams.get('projectID')
    const userID = urlParams.get('userID')
    const isAProjectManager = urlParams.get('PM')
    console.log(filename)

    if (projectID == null || filename == null) {
        alert("Error: Text file not selected. Please return to the project page and select a text file from there.")
    } else {
        console.log(`Project: ${projectID} | File selected: ${filename}`)
    }

    //eg Project Manager | Annotation
    if(isAProjectManager == "true") {
        document.getElementById("accountType").textContent = "Project Manager"
    } else {
        document.getElementById("accountType").textContent = "Annotator"
    }

    //navbar: dashboard link (for PM and ANN accounts)
    document.getElementById("dashboard-link").addEventListener("click", function(e) {
        if(isAProjectManager == "true") {
            window.location = `/dashboard-pm.html?userId=${userID}`
            document.getElementById("accountType").textContent = "Project Manager"
        } else {
            window.location = `/dashboard-ann.html?userId=${userID}`
            document.getElementById("accountType").textContent = "Annotator"
        }
    })

    //navbar: dashboard link (for PM and ANN accounts)
    document.getElementById("projects-link").addEventListener("click", function(e) {
        if(isAProjectManager == "true") {
            window.location.href = `view-project.html?projectID=${projectID}&userID=${userID}&PM=true` //change to annotation.html
        } else {
            window.location.href = `view-project.html?projectID=${projectID}&userID=${userID}&PM=false` //change to annotation.html
        }
    })

    loadFile(projectID, filename)

    let classifyToolButton = document.getElementById("classifyToolButton");
    //classify tool
    classifyToolButton.addEventListener("mouseover", function () {
        classifyToolButton.setAttribute("style", "border-radius:4px;background-color:rgba(80, 168, 226, 0.3);width:26px;cursor: url('svg/pointer_cursor.svg'), auto");
        document.getElementById("classifyTip").style.display = "inline-block";
    });
    classifyToolButton.addEventListener("mouseleave", function () {
        classifyToolButton.setAttribute("style", "width:26px;cursor:auto");
        document.getElementById("classifyTip").style.display = "none";
    });
    classifyToolButton.addEventListener("click", function () {
        if (toolSelected !== tool.HIGHLIGHT) {
            classifyToolButton.setAttribute("src", "svg/classify_button_selected.svg");
            document.body.setAttribute("style", `cursor: url("svg/classify_cursor.svg"), auto`);
            eraseButton.setAttribute("src", "svg/erase_button_unselected.svg");

            toolSelected = tool.HIGHLIGHT;
            console.log(toolSelected); //1
        } else {
            classifyToolButton.setAttribute("src", "svg/classify_button_unselected.svg");
            document.body.setAttribute("style", `url('svg/pointer_cursor.svg'), auto`);
            toolSelected = tool.NONE;
        }
    });

    //erase tool
    let eraseButton = document.getElementById("eraseToolButton");
    eraseButton.addEventListener("mouseover", function () {
        eraseButton.setAttribute("style", "border-radius:4px;background-color:rgba(80, 168, 226, 0.3);width:26px;cursor: url('svg/pointer_cursor.svg'), auto");
        document.getElementById("eraseTip").style.marginLeft = '-40px';
        document.getElementById("eraseTip").style.display = "inline-block";
    });
    eraseButton.addEventListener("mouseleave", function () {
        eraseButton.setAttribute("style", "width:26px;cursor:auto");
        document.getElementById("eraseTip").style.display = "none";
    });
    eraseButton.addEventListener("click", function () {
        if (toolSelected !== tool.ERASE) {
            eraseButton.setAttribute("src", "svg/erase_button_selected.svg");
            document.body.setAttribute("style", `cursor: url("svg/erase_cursor.svg"), auto`);
            classifyToolButton.setAttribute("src", "svg/classify_button_unselected.svg");

            toolSelected = tool.ERASE;
            console.log(toolSelected); //2
        } else {
            eraseButton.setAttribute("src", "svg/erase_button_unselected.svg");
            document.body.setAttribute("style", `cursor:auto`);
            toolSelected = tool.NONE;
        }
    });

    //export tool
    let exportButton = document.getElementById("exportJsonButton");
    exportButton.addEventListener("mouseover", function () {
        exportButton.setAttribute("style", "border-radius:4px;background-color:rgba(80, 168, 226, 0.3);width:26px;cursor: url('svg/pointer_cursor.svg'), auto");
        document.getElementById("jsonTip").style.marginLeft = '-44px';
        document.getElementById("jsonTip").style.display = "inline-block";
    });
    exportButton.addEventListener("mouseleave", function () {
        exportButton.setAttribute("style", "width:26px;cursor:auto");
        document.getElementById("jsonTip").style.display = "none";
    });


    //instructions tool
    let instructionsButton = document.getElementById("instructionsButton");
    instructionsButton.addEventListener("mouseover", function () {
        instructionsButton.setAttribute("style", "border-radius:4px;background-color:rgba(80, 168, 226, 0.3);width:26px;cursor: url('svg/pointer_cursor.svg'), auto");
        document.getElementById("instructionsTip").style.display = "inline-block";
        document.getElementById("instructionsTip").style.marginLeft = "-54px";

    });
    instructionsButton.addEventListener("mouseleave", function () {
        instructionsButton.setAttribute("style", "width:26px;cursor: auto");
        document.getElementById("instructionsTip").style.display = "none";
    });

    //save tool
    let saveChangesButton = document.getElementById("saveChangesButton")
    saveChangesButton.addEventListener("mouseover",
        function () {
            saveChangesButton.setAttribute("style", "border-radius:4px;background-color:rgba(80, 168, 226, 0.3);width:26px;cursor: url('svg/pointer_cursor.svg'), auto");
            document.getElementById("saveChangesTip").style.display = "inline-block";
            document.getElementById("saveChangesTip").style.marginLeft = "-54px";
        });

    saveChangesButton.addEventListener("mouseleave",
        function () {
            saveChangesButton.setAttribute("style", "width:26px;cursor: auto");
            document.getElementById("saveChangesTip").style.display = "none";
        }
    )

    saveChangesButton.addEventListener("click",
        function () {
            saveChanges();
        }
    )

    function saveChanges() {
        console.log(jsonFile.annotations)
        testList()
        alert("Saving changes...")
        alert("Changes saved!")
    }

    //increase/decrease font size buttons
    let increaseFontButton = document.getElementById("increaseFont");
    increaseFontButton.addEventListener("mouseover", function () {
        increaseFontButton.style.borderRadius = "4px";
        increaseFontButton.style.backgroundColor = "rgba(80,168,226,0.3)";
        document.getElementById("increaseFontTip").style.display = "inline-block";
    });
    increaseFontButton.addEventListener("mouseleave", function () {
        increaseFontButton.setAttribute("style", "");
        document.getElementById("increaseFontTip").style.display = "none";
    });
    let decreaseFontButton = document.getElementById("decreaseFont");
    decreaseFontButton.addEventListener("mouseover", function () {
        decreaseFontButton.style.borderRadius = "4px";
        decreaseFontButton.style.backgroundColor = "rgba(80,168,226,0.3)";
        document.getElementById("decreaseFontTip").style.display = "inline-block";
    });
    decreaseFontButton.addEventListener("mouseleave", function () {
        decreaseFontButton.setAttribute("style", "");
        document.getElementById("decreaseFontTip").style.display = "none";
    });

    //mark as done button
    let doneStatus;
    //get files 'done' status
    onValue(ref(database, `Projects/${projectID}/Files/${filename.substring(0,filename.indexOf(".txt"))}`), (snapshot) => {
        doneStatus = snapshot.val().status

        //if the file is marked done
        console.log(doneStatus == "done")
        if(doneStatus == "done") {
            markedDone = true
            markDoneButton.style.backgroundColor = "#47DE56";
            markDoneButton.firstChild.textContent = "Marked done!"
            doneCircle.src = "./svg/circle_done.svg";
            markedDone = true;
            console.log(doneCircle)
            markAsDone();
        } else {
            markedDone = false
            markDoneButton.style.backgroundColor = "#939393";
            markDoneButton.firstChild.textContent = "Mark as done"
            doneCircle.src = "./svg/circle.svg";
            markedDone = false;
            console.log(doneCircle)
        }
        console.log(markedDone)
    })
    

    let markDoneButton = document.getElementById("markDoneButton");
    let doneCircle = document.getElementById("doneCircle");

    markDoneButton.addEventListener("mouseover", function () {
        markDoneButton.style.cursor = "pointer";
    })

    markDoneButton.addEventListener("click", function () {
        if (!markedDone) {
            markDoneButton.style.backgroundColor = "#47DE56";
            markDoneButton.firstChild.textContent = "Marked done!"
            doneCircle.src = "./svg/circle_done.svg";
            markedDone = true;
            console.log(doneCircle)
            markAsDone();
        } else {
            markDoneButton.style.backgroundColor = "#939393";
            markDoneButton.firstChild.textContent = "Mark as done"
            doneCircle.src = "./svg/circle.svg";
            markedDone = false;
            console.log(doneCircle)
            //in the future, "unassigned" should be "in progress" or something similar
            update(ref(database, `Projects/${projectID}/Files/${filename.substring(0,filename.indexOf(".txt"))}`), {
                status: "unassigned",
            });
        }
    })

    function goBack() {
        //get url parameters
        const queryString = window.location.search;
        console.log(queryString)
        const urlParams = new URLSearchParams(queryString)

        //grab project ID to find project in database
        const project = urlParams.get('projectID')
        const userID = urlParams.get('userID')
        const isAProjectManager = urlParams.get('PM')
        console.log(userID)
        console.log(isAProjectManager)
        
        //redirect (go back) to view project page
        window.location.href = `view-project.html?projectID=${project}&userID=${userID}&PM=${isAProjectManager}`
    }

    function markAsDone() {
        // Get the value of a specific query parameter
        function getQueryParam(param) {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get(param);
        }

        // Get the filename from the URL
        let filename = getQueryParam('filename');

        // If the filename is not null and ends with .txt, remove the .txt extension
        if (filename && filename.endsWith('.txt')) {
            filename = filename.replace('.txt', '');
        }

        // Get the Project ID from the URL
        let projectID = getQueryParam('projectID');

        // Log or use the filename without the .txt
        console.log("Filename without extension:", filename);
        console.log("projectID:", projectID);

        update(ref(database, `Projects/${projectID}/Files/${filename}`), {
            status: "done",
        });
    }

    console.log(document.getElementById("textArea"));
    let dropdown = document.getElementById("dropdown");

    //detect clicking on the body of text
    document.getElementById("textArea").addEventListener("click", function (event) {
        //if the user selects text (not just whitespace)
        if (window.getSelection().toString().trim().length > 0 && toolSelected === tool.HIGHLIGHT) {
            console.log(window.getSelection().toString().trim())

            dropdown.style.display = 'block';
            dropdown.style.position = 'fixed';
            dropdown.style.left = (event.pageX - 16) + 'px';
            dropdown.style.top = (event.pageY + 16) + 'px';
        } else {
            dropdown.setAttribute("style", `display:none;`);
        }
    })

    //
    window.addEventListener("click", function () {
        selectedText = window.getSelection().toString().trim();
        if (window.getSelection().toString().trim().length == 0) {
            dropdown.setAttribute("style", `display:none;`);
        }
    })

    updateClassificationsList();

    document.getElementById("textArea").innerHTML = "<strong>This is filler text. Upload a file to replace it!</strong><br>Minim officia mollit" +
        " non officia minim cupidatat ullamco. Reprehenderit tempor sunt non aliqua aute mollit" +
        " consequat veniam. Id veniam ad laboris cupidatat dolore cupidatat Lorem do nisi tempor" +
        " elit incididunt. Cillum consectetur ullamco cillum sunt pariatur anim enim aliqua duis" +
        " voluptate non eiusmod Lorem. Labore nulla nostrud tempor nostrud non veniam duis tempor" +
        " amet fugiat aliquip reprehenderit veniam id.Qui in excepteur reprehenderit elit. Ex labore" +
        " ex duis reprehenderit nostrud. Aliqua est non est do dolor. Eu ex deserunt duis mollit" +
        " minim cupidatat in consectetur occaecat labore duis enim sint. Est nostrud amet minim sit" +
        " veniam excepteur eiusmod. Ex adipisicing sint pariatur quis ipsum anim incididunt ut ad" +
        " tempor ad fugiat sit do. Pariatur irure dolor tempor deserunt.  Pariatur consequat" +
        " exercitation est anim irure duis deserunt amet adipisicing. Eu veniam aute pariatur" +
        " incididunt exercitation incididunt. Culpa quis do do velit exercitation dolore est occaecat non." +
        " Elit anim reprehenderit incididunt excepteur exercitation ut elit ea culpa sunt sunt do.";
    document.getElementById("textArea").setAttribute("style", "font-size:20px; word-spacing:3px; font-family:'Source Sans 3', Helvetica, sans-serif; color:#363030");

    console.log(
        'The page has the following classes:\n  .' +
        listCSSClasses().join('\n  .')
    )

    //SPANS
    let spans = document.getElementsByTagName("span");
    for (let i = 0; i < spans.length; i++) {
        console.log(spans[i]);
        if (spans[i].className.length > 0) {
            console.log("CLASS " + spans[i].className)
        }
    }

    //CLASS HIGHLIGHT PREVIEW
    let selectedColour = document.getElementById("classColour");
    selectedColour.addEventListener("change", function (e) {
        console.log("COLOUR: " + selectedColour.value);
        let red = parseInt(selectedColour.value.substr(1, 2), 16);
        let green = parseInt(selectedColour.value.substr(3, 2), 16);
        let blue = parseInt(selectedColour.value.substr(5, 2), 16);
        //determine if text colour should be white or black
        let textColour = "white";
        if ((red * 0.299 + green * 0.587 + blue * 0.114) >= 186.00) {
            textColour = "black";
        }
        let highlightPreview = document.getElementById("classTest");
        highlightPreview.setAttribute("style", `font-weight:500;padding-bottom:2px;padding-left:4px;padding-right:4px;
            color:${textColour};background-color: rgb(${red},${green},${blue});border-radius:5px`);
    });
}

function deleteClass(name) {
    console.log(name.toUpperCase());
    console.log(allClasses);
    console.log(allClasses.includes(name.toUpperCase()));
    if (allClasses.includes(name.toUpperCase())) {
        console.log("Deleting class: " + name.toUpperCase());
        let index = allClasses.indexOf(name.toUpperCase());
        console.log(index);
        delete allClasses[index];
        console.log(allClasses);

        let classesList = document.getElementById("allClasses");
        classesList.removeChild(document.getElementById(name));
        //remove class from dropdown
        removeClassFromDropdown(name);
        //TODO: delete all classifications
        displayNotification(`Class deleted: ${name}`);
    } else {
        displayNotification("Class not found!");
    }
}

function testList() {
    let jsonObj = { "name": ["#b10234"] }
    console.log(jsonObj.name.push("black"))
    console.log(jsonObj.name.push("John"))
    console.log(jsonObj.name.push("Jimmy"))
    jsonObj["city"] = ["#d5615"]
    console.log(jsonObj.city.push("white"))
    console.log(jsonObj.city.push("Chicago"))
    console.log(jsonObj)
    console.log(jsonFile.annotations)

    // Get an array of the object's keys
    let keys = Object.keys(jsonFile.annotations);

    //URLParams
    let queryString = window.location.search;
    let urlParams = new URLSearchParams(queryString)
    let projectID = urlParams.get('projectID')
    // outer loop to iterate over the keys (CLASSES)
    for (let i = 0; i < keys.length; i++) {
        //eg name
        let key = keys[i];
        console.log(key + ":");
        //for each key, make a comma-separated list of its classifications
        let keyHex = ""
        let keyTextColour = ""
        let keyClassifications = ""

        // inner loop to iterate over the array of values (CLASSIFICATIONS)
        for (let j = 0; j < jsonFile.annotations[key].length; j++) {
            //print HEX if 0
            if (j === 0) { 
                console.log("  HEX: " + jsonFile.annotations[key][j])
                keyHex = jsonFile.annotations[key][j]
            }
            else if (j === 1) {
                console.log("  TextColour: " + jsonFile.annotations[key][j])
                keyTextColour = jsonFile.annotations[key][j]
            }
            //print value (classification) if j != 0
            else {
                if (j < jsonFile.annotations[key].length - 1) {
                    console.log("  " + jsonFile.annotations[key][j] + ",");
                    keyClassifications += jsonFile.annotations[key][j] + ","
                } else if (j == jsonFile.annotations[key].length - 1 ) {
                    console.log("  " + jsonFile.annotations[key][j]);
                    keyClassifications += jsonFile.annotations[key][j]
                }
            } 
        }
        console.log("CLASSIFICATIONS STRING (DB): " + keyClassifications)

        set(ref(database, `Projects/${projectID}/Classes/${key}`), {
            BackgroundHEX: keyHex,
            Classifications: keyClassifications,
            TextColour: keyTextColour
        })

    }
}

//create a new class, given a class name (supplied by user) and a colour chosen by the user (in HEX)
function createClass(name, colourHex) {
    //if the "Add class" button is active (basically checking if an actual text file is currently open)
    if (document.getElementById("addClassButton").getAttribute("class") == "btn btn-primary") {
        name = name.replaceAll(/ /g, "");//remove any spaces
        //if the class name is not already present in the list (preventing duplicates)
        if (!allClasses.includes(name.toUpperCase())) {
            //find HTML unordered list of classes
            let classesList = document.getElementById("allClasses");
            console.log(classesList);

            //convert HEX to rgb values for class colour
            let red = parseInt(colourHex.substr(1, 2), 16);
            let green = parseInt(colourHex.substr(3, 2), 16);
            let blue = parseInt(colourHex.substr(5, 2), 16);
            console.log(`${red}, ${green}, ${blue}`);

            //create new class list item to display on right sidebar
            let newClassListItem = document.createElement("li");
            newClassListItem.setAttribute("id", name);

            //add coloured icon for the class list item
            let icon = document.createElement("i");
            icon.setAttribute("class", "material-icons");
            icon.setAttribute("style", `margin-right:5px; font-size:12px;color:rgb(${red}, ${green}, ${blue})`);
            icon.innerHTML = "circle";
            newClassListItem.appendChild(icon);

            //add class text to the class list item
            newClassListItem.appendChild(document.createTextNode(`${name.toString()}`));
            classesList.append(newClassListItem);

            //add delete button for deleting the class
            let deleteButton = document.createElement("img");
            deleteButton.src = `svg/delete_button.svg`;
            // deleteButton.setAttribute("onclick", `deleteClass('${name}')`);
            deleteButton.addEventListener("click", function (e) {
                //confirm if the user actually wants to delete the class and its classifications
                if (window.confirm(`Delete class: ${name}?`)) {
                    deleteClass(`${name}`)
                }
            })
            //delete button styling
            deleteButton.setAttribute("style", `margin-left:5px;margin-top:-3px`);
            //on hover: change cursor to pointer
            deleteButton.addEventListener("mouseover", function () {
                deleteButton.setAttribute("style", "cursor: url('svg/pointer_cursor.svg'), auto;margin-left:5px;margin-top:-3px");;
            });
            //add a delete button next to each class list item
            newClassListItem.appendChild(deleteButton);

            //if highlight colour is too bright, text colour becomes black 
            let textColour = "white";
            if ((red * 0.299 + green * 0.587 + blue * 0.114) >= 186.00) {
                textColour = "black";
            }

            //create a style for new class
            var style = document.createElement('style');
            style.innerHTML = `
            .${name.toUpperCase()} {
                background-color: rgb(${red}, ${green}, ${blue});
                border-radius: 5px;
                padding-bottom:2px;
                padding-left:2px;
                padding-right:2px;
                color:${textColour};
                font-weight: 500;
            }
            `;
            //add the style to the page's stylesheet
            document.head.appendChild(style);

            //TOOLTIP (to show while hovering over a classification)
            var tooltipStyle = document.createElement('style');
            tooltipStyle.innerHTML = `
            .${name.toUpperCase()}:hover {
                border-style: double;
                border-color: rgb(${red}, ${green}, ${blue});
                border-width: 1px;
            }
            `;
            document.head.appendChild(tooltipStyle);

            //insert new class into classesList
            allClasses.push(name.toUpperCase());
            // allClasses.forEach(printClass);

            let newClassEntry = name.toUpperCase().toString();
            //add new class to the json file
            jsonFile.annotations[newClassEntry] = [];
            //add the backgroundcolour
            jsonFile.annotations[newClassEntry].push(colourHex)
            //add the textcolour
            jsonFile.annotations[newClassEntry].push(textColour)

            //add to dropdown menu
            addClassToDropdown(newClassEntry, red, green, blue);

            //reset the input values
            document.getElementById("classColour").value = "#ffffff";
            document.getElementById("newClass").value = "";
            document.getElementById("classTest").setAttribute("style", "");

            //add to firebase
            // Get the value of a specific query parameter
            function getQueryParam(param) {
                const urlParams = new URLSearchParams(window.location.search);
                return urlParams.get(param);
            }

            // Get the Project ID from the URL
            let projectID = getQueryParam('projectID');

            // Log or use the filename without the .txt
            console.log("projectID:", projectID);

            //close the modal
            $('#exampleModal').modal('hide');
        }
        else {
            //display error if the new class's name is not unique
            alert("Class with the same name already exists!");
        }
    } else {
        //display error if a text file hasn't been detected
        alert("Please upload a text file first!");
    }
}

//Update the classifications list with any new classifications
function updateClassificationsList() {
    let clist = document.getElementById("classifications-list");
    //log the list as it is
    console.log("vvv Classifications HTML list vvv");
    console.log(clist);
    //reset the list entirely
    clist.innerHTML = "";
    console.log(clist.innerHTML);
    //start creating the list from scratch
    if (classificationsList.length < 1) {
        //if there are no active classifications
        let newItem = document.createElement("li");
        newItem.appendChild(document.createTextNode("No classifications yet!"));
        clist.appendChild(newItem);
    } else {
        //recreate (update) the list
        for (let i = 0; i < classificationsList.length; i++) {
            let newItem = document.createElement("li");
            newItem.appendChild(document.createTextNode(classificationsList[i]));
            //add list item to the end of the list
            clist.appendChild(newItem);
        }
    }
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
    //need a 500ms delay to focus on the text input field - it works, but doesn't work without this.
    //I don't know why, so I have to keep it
    setTimeout(function () {
        document.getElementById("newClass").focus();
    }, 500);

    //generate random RGB values (0-255) for red, green, and blue
    let red = Math.floor(Math.random() * 256);
    let green = Math.floor(Math.random() * 256);
    let blue = Math.floor(Math.random() * 256);

    //convert the rgb to hex to use as the new class's colour
    let newColour = RGBtoHex(red, green, blue);
    console.log(`${newColour}`);
    document.getElementById("classColour").value = `${newColour}`;

    //determine if text colour should be white or black, based on the highlight colour
    //for readability
    let textColour = "white";
    if ((red * 0.299 + green * 0.587 + blue * 0.114) >= 186.00) {
        textColour = "black";
    }
    //show a preview of the new class, with its highlight colour and text colour
    //so the user can confirm if they want to keep it or change it
    let highlightPreview = document.getElementById("classTest");
    highlightPreview.setAttribute("style", `font-weight:500;padding-bottom:2px;padding-left:4px;padding-right:4px;color:${textColour};background-color: ${newColour};border-radius:5px`);
}

//button increase size of the text file's contents for better readability (+ button)
function increaseFont() {
    //grab the current font size
    let fontSize = document.getElementById("textArea").style.fontSize;
    let size = parseInt(fontSize.toString().substring(0, 2));
    //if the font size isn't at its maximum (size 40)
    if (size < 40) {
        //increase by 2px
        document.getElementById("textArea").style.fontSize = `${size + 2}px`;
    }
}

//button to decrease size of the text file's contents for better readability (- button)
function decreaseFont() {
    //grab the current font size
    let fontSize = document.getElementById("textArea").style.fontSize;
    let size = parseInt(fontSize.toString().substring(0, 2));
    //if the font size isn't at its minimum (size 12)
    if (size > 12) {
        //decrease by 2px
        document.getElementById("textArea").style.fontSize = `${size - 2}px`;
    }
}

//NEW REMOVE CLASSIFICATION
function newRemoveClassification(classToDelete, classification) {
    //TODO in the future: update function to remove classifications with CASE INSENSITIVITY included
    //debugging statements
    console.log(document.getElementById("textArea").innerHTML);
    console.log(classToDelete);
    console.log(classification);
    console.log(`<span data-toggle="tooltip" title="${classToDelete}" style="cursor: url('svg/pointer_cursor.svg'), auto">${classification}</span>`);
    console.log(document.getElementById("textArea").innerHTML.replaceAll(`<span data-toggle="tooltip" title="${classToDelete}" class="${classToDelete}" style="cursor: url('svg/pointer_cursor.svg'), auto">${classification}</span>`, `${classification}`));

    //if the user has selected the ERASE tool first from the toolbar
    if (toolSelected === tool.ERASE) {
        //update the textArea by replacing all occurrences of the classification
        document.getElementById("textArea").innerHTML = document.getElementById("textArea").innerHTML.replaceAll(`<span data-toggle="tooltip" title="${classToDelete}" class="${classToDelete}" style="cursor: url('svg/pointer_cursor.svg'), auto">${classification}</span>`, `${classification}`);
        document.getElementById("textArea").innerHTML = document.getElementById("textArea").innerHTML.replaceAll(`<span data-toggle="tooltip" title="${classToDelete}" class="${classToDelete}">${classification}</span>`, `${classification}`);

        //remove classification from JSON file
        console.log(`Before: ${JSON.stringify(jsonFile)}`);
        // jsonFile.annotations[classToDelete].pop(classification);
        console.log(jsonFile.annotations[classToDelete]);
        jsonFile.annotations[classToDelete] = jsonFile.annotations[classToDelete].filter(function (item) {
            return item !== classification;
        });
        console.log(`After: ${JSON.stringify(jsonFile)}`);

        //remove classification from list of classifications
        classificationsList = classificationsList.filter(function (item) {
            console.log(item);
            console.log(`${classification} : ${classToDelete}`);
            console.log(item !== `${classification} : ${classToDelete}`);
            return item !== `${classification} : ${classToDelete}`;
        });

        //update classifications list
        updateClassificationsList();

        //update JSON preview
        updateJSONPreview(JSON.stringify(jsonFile));
        spanTest();

        //display confirmation notification
        displayNotification(`Removed classification: ${classification}`);
    } else {
        //if the tool is not selected when the user clicks on a classification
        //then simply display the classification and what class it is under
        alert(`${classification} : ${classToDelete}`);
    }
}

function spanTest() {
    //GET ALL SPANS (highlighted/classified words) in the text area
    let spans = document.getElementById("textArea").getElementsByTagName("span")
    console.log(spans);

    //spans  to exclude

    //focusing on classification spans
    for (let i = 0; i < spans.length; i++) {
        console.log(spans[i].innerHTML);
        //reset event listeners for each span
        spans[i].removeEventListener("mouseover", this);
        spans[i].removeEventListener("click", this);
        //add hover function
        spans[i].addEventListener("mouseover", function (e) {
            spans[i].setAttribute("style", "cursor: url('svg/pointer_cursor.svg'), auto");
        });
        //add click to remove function
        spans[i].addEventListener("click", function (e) {
            newRemoveClassification(spans[i].getAttribute("class"), spans[i].innerHTML);
        });
    }
}

//DEBUG: List all classes in index.html eg. class="row"
function listCSSClasses() {
    let classes = new Set();
    let elementsWithClasses = document.querySelectorAll('[class]');
    for (let element of elementsWithClasses) {
        for (let className of element.classList) {
            classes.add(className);
        }
    }
    return [...classes].sort();
}

//Export the text and its annotations to a downloadable JSON file 
function exportToJSON() {
    let newJson = window.structuredClone(jsonFile)

    // Get an array of the object's keys
    let keys = Object.keys(newJson.annotations);
    // outer loop to iterate over the keys (CLASSES)
    for (let i = 0; i < keys.length; i++) {
        //eg name
        let key = keys[i];
        console.log(key + ":");
        //for each key, make a comma-separated list of its classifications
        let keyTextColour = ""
        let keyClassifications = ""

        //inner loop to iterate over the array of values (CLASSIFICATIONS)
        //start the new JSON file with a clean slate for each class
        delete newJson.annotations[key]
        newJson.annotations[key] = []
        //j = 2 because index 0 & 1 are the backgroundHEX and textColour respectively, which we don't want
        //to add to the json export
        for (let j = 2; j < jsonFile.annotations[key].length; j++) {
            //push each key (class eg NAME) to the new json file
            newJson.annotations[key].push(jsonFile.annotations[key][j])
            //DEBUG: add to the classifications string
            if (j < newJson.annotations[key].length - 1) {
                console.log("  " + newJson.annotations[key][j] + ",");
                keyClassifications += newJson.annotations[key][j] + ","
            } else if (j == newJson.annotations[key].length - 1 ) {
                console.log("  " + newJson.annotations[key][j]);
                keyClassifications += newJson.annotations[key][j]

            }
        }
        //DEBUG: print classifications string to the console
        console.log("CLASSIFICATIONS STRING (DB): " + keyClassifications)
        console.log("KEY TEXT COLOUR: " + keyTextColour)
        console.log(newJson)
    }
    //stringify the new JSON object
    let stringified = JSON.stringify(newJson, null, 2);
    var blob = new Blob([stringified], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    const jsonString = JSON.stringify(newJson, (key, value) => {
        return value === null ? "" : value;
    });
    console.log(jsonString);

    //make a downloadable blob out of the JSON
    var a = document.createElement("a");
    a.download = 'jsonFile.json';
    a.href = url;
    a.id = 'jsonFile';
    //add the "link" to the page and force click it, to automatically begin downloading the JSON file
    document.body.appendChild(a);
    a.click();
    //after that, remove this "link" from the page
    document.body.removeChild(a);
}

//Add a new class to the dropdown menu
function addClassToDropdown(newClassName, red, green, blue) {
    //add the new class as a link in the dropdown menu
    let newClass = document.createElement("a");
    //when that link is clicked on
    newClass.addEventListener('click', function (e) {
        //classify the selected body of text
        dropdownClassify(newClassName)
    })
    newClass.setAttribute('id', `${newClassName}_dropdown`);
    //add a circle that represents the colour of the class
    let icon = document.createElement("i");
    icon.setAttribute("style", `margin-right:5px;font-size:11px;color: rgb(${red}, ${green}, ${blue})`);
    icon.setAttribute("class", "material-icons");
    icon.innerHTML = "circle";
    newClass.appendChild(icon);
    //add the class's name
    newClass.appendChild(document.createTextNode(newClassName));
    //add everything to the class dropdown menu
    document.getElementById("dropdown-links").appendChild(newClass);
}

//remove an existing class from the dropdown menu
function removeClassFromDropdown(className) {
    //get the class by its name
    let toRemove = document.getElementById(`${className}_dropdown`);
    console.log(toRemove);
    //get the dropdown menu's links
    let dropdownLinks = document.getElementById("dropdown-links");
    console.log(dropdownLinks)
    //delete the class and remove it from the dropdown menu
    dropdownLinks.removeChild(toRemove);
    console.log(dropdownLinks)
}