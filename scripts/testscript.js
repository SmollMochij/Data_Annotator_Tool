window.onload = function() {
    let allText = document.getElementById("textBox");
    // console.log(allText.textContent);
    // console.log(allText.innerHTML);
    // console.log(allText.textContent.search("This"));
    // console.log(allText.textContent.search("this"));

    // json = '{"result":[true, false], "count":42}';
    // let obj = JSON.parse(json);
    // console.log("JSON string " + json);
    // console.log(obj);
    // console.log(obj.result); //show all 'result' values
    // console.log(obj.result[0]); //indexing
    // console.log("--------");

    //VARIABLES
    let content = "Jimmy and Russel are Math teachers at Newark High";

    //CREATE JSON
    let jsonFile = {
        "annotatorID":"1234567",
        "textContent": content,
        "annotations": 
        {
            "NAME":["Jimmy", "Russel"],
            "SUBJECT":["Math"],
            "SCHOOL":["Newark High"]
        }
        
    };
    console.log(jsonFile);

    
    //GET TEXT CONTENT
    content = "Jimmy and Russel are Math teachers at Newark High";
    //CREATE NEW JSON FILE
    let json = {
        "annotatorID":"1234567",
        "textContent":content,
        "annotations":{}
    };
    //ADD CLASSIFICATION
    let className = "Country";
    json.annotations[className] = "New Zealand";
    //SHOW ON PAGE
    let jsonDisplay = document.createElement("p");
    jsonDisplay.innerHTML = "<strong>Test</strong><br>" + JSON.stringify(json);
    document.body.appendChild(jsonDisplay);


    //ADD NEW CLASSIFICATION
    jsonFile.annotations.NAME.push("Fran");
    //get new class name and store into variable
    let newKey = "YEET";
    //then add it to json
    jsonFile.annotations[newKey] = [];
    jsonFile.annotations[newKey].push("new");

    //SHOW CLASSES
    let allClasses = document.createElement("p");
    allClasses.innerHTML = jsonFile.annotations.NAME;
    document.body.appendChild(allClasses);

    //SHOW JSON FILE ON PAGE
    let jsonFileDisplay = document.createElement("p");
    jsonFileDisplay.innerHTML = JSON.stringify(jsonFile);
    document.body.appendChild(jsonFileDisplay);
    console.log(JSON.stringify(jsonFile));


    //SHOW FORMATTED JSON ON PAGE
    let formattedJsonDisplay = document.createElement("p");
    formattedJsonDisplay.innerHTML = 
    `<strong>JSON PREVIEW:</strong><br/>
    {<div style='margin-left:1em'>
        "annotatorID": ${jsonFile.annotatorID},
        <br>
        "content":"${content}",<br>
        "annotations:":
        <br>
        {
        <br>
        <div style='margin-left:1em'>
            "NAME":["Jimmy", "Russel"],<br>
            "SUBJECT":["Math"],<br>
            "SCHOOL":["Newark High"]<br>
        </div>
        }
    </div>
    }`;
    document.body.appendChild(formattedJsonDisplay);

    console.log(
`{
    "annotatorID": ${jsonFile.annotatorID},
    "content":"${content}",
    "annotations:":
    {
        "NAME":["Jimmy", "Russel"],
        "SUBJECT":["Math"],
        "SCHOOL":["Newark High"]
    }
}`);
}

function createClass(className, classColour) {
    //DEBUG: log the chosen class name and colour
    console.log(`${className} : ${classColour}`);
    if(className == "City") {
        alert("City already exists!");
    }
    //close the modal
    $('#exampleModal').modal('hide');
}

