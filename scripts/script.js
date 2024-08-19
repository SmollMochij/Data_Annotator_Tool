var allClasses = [];
var markedDone = false;

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
        "annotatorID":"1234567",
        "textContent": textContent,
        "annotations": 
        {}
    };
    // document.getElementById("jsonPreview").setAttribute("style", "color:black; padding-top:5px;padding-left:5px;padding-right:5px;");
    let stringifiedJson = JSON.stringify(jsonFile);
    updateJSONPreview(stringifiedJson);
}

function updateJSONPreview(stringifiedJson) {
    let jsonString = JSON.stringify(jsonFile, null, 2);
    jsonString = jsonString.replace('textContent\":', 'textContent":<br>');
    document.getElementById('jsonPreviewText').innerHTML = jsonString;
    document.getElementById('jsonPreviewText').innerHTML = document.getElementById('jsonPreviewText').innerHTML.replace('"annotatorID"', '<span style="color:rgb(185, 255, 0)">"annotatorID"</span>');
    document.getElementById('jsonPreviewText').innerHTML = document.getElementById('jsonPreviewText').innerHTML.replace('"textContent"', '<span style="color:rgb(185, 255, 0)">"textContent"</span>');
    document.getElementById('jsonPreviewText').innerHTML = document.getElementById('jsonPreviewText').innerHTML.replace('"annotations"', '<span style="color:rgb(185, 255, 0)">"annotations"</span>');

    // console.log(JSON.stringify(jsonFile, null, 2));
    // console.log(document.getElementById('jsonPreviewText').innerHTML);
    // console.log(document.getElementById('jsonPreviewText').innerHTML);
    // alert(JSON.stringify(jsonFile, null, 2));

    //Show annotatorID
    console.log(stringifiedJson.substring(1,stringifiedJson.indexOf("textContent")));
    document.getElementById("annotatorIDCollapse").textContent = stringifiedJson.substring(1,stringifiedJson.indexOf("textContent")-2);
    //show Text Content
    // console.log(stringifiedJson.substring(stringifiedJson.indexOf("textContent")+13,stringifiedJson.indexOf(`,\"annotations\"`)));
    document.getElementById("textCollapse").textContent = stringifiedJson.substring(stringifiedJson.indexOf("textContent")+13,stringifiedJson.indexOf(`,\"annotations\"`));
    //show annotations
    console.log(stringifiedJson.substring(stringifiedJson.indexOf(`,\"annotations\"`)+15,stringifiedJson.length-1));
    document.getElementById("classificationsCollapse").textContent = stringifiedJson.substring(stringifiedJson.indexOf(`,\"annotations\"`)+15,stringifiedJson.length-1);
    console.log(jsonFile);
    
}

function submitClassification(className) {
    console.log(`Classification: ${className}`);
    let dropdown = document.getElementById("dropdown");
    dropdown.style.display = "none";
    // dropdown.setAttribute("style", `display:none;`);
    dropdownClassify(className);
}

function dropdownClassify(className) {
    console.log(toolSelected);
    console.log(toolSelected === tool.HIGHLIGHT);
    // alert(className);
    // let selectedText = window.getSelection().toString().trim();
    // alert(selectedText);
    console.log("STEXT: " + selectedText);
    //check if text file has been uploaded first
    if (document.getElementById("classifyButton").getAttribute("class") == "btn btn-success") {
        //check if selection actually contains text
        if(selectedText.length > 0) {
            console.log("SELECTED TEXT: " + selectedText);
            let textArea = document.getElementById("textArea");
            
            //create new list item
            let newItem = document.createElement("li");
            newItem.appendChild(document.createTextNode(`${selectedText} : ${className}`));
            //add list item to the end of the list
            let clist = document.getElementById("classifications-list");
            //if there have been no classifications made yet, first reset the list
            if(clist.innerHTML.trim().toLowerCase() === "<li>No classifications yet!</li>".toLowerCase()) {
                clist.innerHTML = "";
            }
            //then add new classification to the list
            classificationsList.push(`${selectedText} : ${className}`);
            console.log(classificationsList);
            // classificationsHTMLList.appendChild(newItem);
            
            //add new span to the text
            // let searchMask = selectedText;
            // let regex = new RegExp(searchMask, "ig"); //ig = case insensitive https://regex101.com/
            // let replaceMask = `$&`;
            // document.getElementById("textArea").innerHTML = textArea.innerHTML.replaceAll(regex,
            //     `<span data-toggle='tooltip' title='${className}' class='${className}'>${replaceMask}</span>`);
            // console.log(document.getElementById("textArea").innerHTML);   

            //NEW
            let pattern = `(?<=^|\\s|"|')${selectedText}(?=['"\\s,;:.])`
            let reg = new RegExp(pattern, "ig")
            let replaceMask = `<span data-toggle='tooltip' title=${className} class='${className}'>$&</span>` //replace with itself +
            document.getElementById("textArea").innerHTML = document.getElementById("textArea").innerHTML.replaceAll(reg, replaceMask)
            // document.getElementById("textArea").innerHTML = textArea.innerHTML.replaceAll(reg,
            //     `<span data-toggle='tooltip' title='${className}' class='${className}'>${replaceMask}</span>`);

            let name = className.toUpperCase();
            console.log("Name: " + name);
            // jsonFile.annotations[name].push(range.extractContents());
            jsonFile.annotations[name].push(selectedText);
            console.log("TEST2:" + JSON.stringify(jsonFile));
            // document.getElementById("jsonPreview").innerHTML = JSON.stringify(jsonFile);
            updateJSONPreview(JSON.stringify(jsonFile));
            
            updateClassificationsList();
            spanTest();

            displayNotification(`New classification: ${className} - ${selectedText}`);
            
            // console.log(document.getElementById("textArea").innerHTML);
            // console.log(document.getElementById("textArea").textContent);
        }
    }
}

function displayNotification(message) {
    //notification
    setTimeout(function() {
        // document.getElementById("notification").style.display = "none";
        document.getElementById("notification").style.display = "flex";
        document.getElementById("notification").style.animation = "fadein 500ms";
        setTimeout(function() {
            document.getElementById("notification").style.opacity = "100";
        }, 500)
    }, 0);

    document.getElementById("notification").style.display = "flex";
    document.getElementById("notification-text").textContent = message;

    setTimeout(function() {
        // document.getElementById("notification").style.display = "none";
        document.getElementById("notification").style.animation = "fadeout 500ms";
        setTimeout(function() {
            document.getElementById("notification").style.display = "none";
        }, 400)
    }, 2000);
}

//when the window finishes loading, find the textArea div and fill it with lorem ipsum
window.onload = function() {
    let classifyToolButton = document.getElementById("classifyToolButton");
    //classify tool testing
    classifyToolButton.addEventListener("mouseover", function() {
        classifyToolButton.setAttribute("style", "border-radius:4px;background-color:rgba(80, 168, 226, 0.3);width:26px;cursor: url('svg/pointer_cursor.svg'), auto");
        // document.getElementById("classifyTip").setAttribute("display", "inline-block");
        document.getElementById("classifyTip").style.display = "inline-block";
    });
    classifyToolButton.addEventListener("mouseleave", function() {
        classifyToolButton.setAttribute("style", "width:26px;cursor:auto");
        document.getElementById("classifyTip").style.display = "none";
    });
    classifyToolButton.addEventListener("click", function() {
        if(toolSelected !== tool.HIGHLIGHT) {
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
    eraseButton.addEventListener("mouseover", function() {
        eraseButton.setAttribute("style", "border-radius:4px;background-color:rgba(80, 168, 226, 0.3);width:26px;cursor: url('svg/pointer_cursor.svg'), auto");
        document.getElementById("eraseTip").style.marginLeft = '-40px';
        document.getElementById("eraseTip").style.display = "inline-block";
    });
    eraseButton.addEventListener("mouseleave", function() {
        eraseButton.setAttribute("style", "width:26px;cursor:auto");
        document.getElementById("eraseTip").style.display = "none";
    });
    eraseButton.addEventListener("click", function() {
        if(toolSelected !== tool.ERASE) {
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
    exportButton.addEventListener("mouseover", function() {
        exportButton.setAttribute("style", "border-radius:4px;background-color:rgba(80, 168, 226, 0.3);width:26px;cursor: url('svg/pointer_cursor.svg'), auto");
        document.getElementById("jsonTip").style.marginLeft = '-44px';
        document.getElementById("jsonTip").style.display = "inline-block";
    });
    exportButton.addEventListener("mouseleave", function() {
        exportButton.setAttribute("style", "width:26px;cursor:auto");
        document.getElementById("jsonTip").style.display = "none";
    });


    //instructions tool
    let instructionsButton = document.getElementById("instructionsButton");
    instructionsButton.addEventListener("mouseover", function() {
        instructionsButton.setAttribute("style", "border-radius:4px;background-color:rgba(80, 168, 226, 0.3);width:26px;cursor: url('svg/pointer_cursor.svg'), auto");
        document.getElementById("instructionsTip").style.display = "inline-block";
        document.getElementById("instructionsTip").style.marginLeft = "-54px";

    });
    instructionsButton.addEventListener("mouseleave", function() {
        instructionsButton.setAttribute("style", "width:26px;cursor: auto");
        document.getElementById("instructionsTip").style.display = "none";
    });

    //font size buttons
    let increaseFontButton = document.getElementById("increaseFont");
    increaseFontButton.addEventListener("mouseover", function() { 
        increaseFontButton.style.borderRadius = "4px";
        increaseFontButton.style.backgroundColor = "rgba(80,168,226,0.3)";
        document.getElementById("increaseFontTip").style.display = "inline-block";
    });
    increaseFontButton.addEventListener("mouseleave", function() { 
        increaseFontButton.setAttribute("style", "");
        document.getElementById("increaseFontTip").style.display = "none";
    });
    let decreaseFontButton = document.getElementById("decreaseFont");
    decreaseFontButton.addEventListener("mouseover", function() { 
        decreaseFontButton.style.borderRadius = "4px";
        decreaseFontButton.style.backgroundColor = "rgba(80,168,226,0.3)";
        document.getElementById("decreaseFontTip").style.display = "inline-block";
        // document.getElementById("decreaseFontTip").style.zIndex = "10";
    });
    decreaseFontButton.addEventListener("mouseleave", function() { 
        decreaseFontButton.setAttribute("style", "");
        document.getElementById("decreaseFontTip").style.display = "none";
    });

    //mark as done button
    let markDoneButton = document.getElementById("markDoneButton");
    let doneCircle = document.getElementById("doneCircle");
    markDoneButton.addEventListener("mouseover", function() {
        markDoneButton.style.cursor = "pointer";
    })
    markDoneButton.addEventListener("click", function() {
        if(!markedDone) {
            markDoneButton.style.backgroundColor = "#47DE56";
            markDoneButton.firstChild.textContent = "Marked done!"
            doneCircle.src = "./svg/circle_done.svg";
            markedDone = true;
            console.log(doneCircle)
        } else {
            markDoneButton.style.backgroundColor = "#939393";
            markDoneButton.firstChild.textContent = "Mark as done"
            doneCircle.src = "./svg/circle.svg";
            markedDone = false;
            console.log(doneCircle)
        }
    })


    // let testIcon = document.createElement("i");
    // testIcon.setAttribute("style", "font-size:10px;color: rgb(255, 45, 177)");
    // testIcon.setAttribute("class", "material-icons");
    // testIcon.innerHTML = "circle";
    // document.body.appendChild(testIcon);

    console.log(document.getElementById("textArea"));
    let dropdown = document.getElementById("dropdown");

    //detect clicking on the body of text
    document.getElementById("textArea").addEventListener("click", function(event) {
        //if the user selects text (not just whitespace)
        if(window.getSelection().toString().trim().length > 0 && toolSelected === tool.HIGHLIGHT) {
            console.log(window.getSelection().toString().trim())
            // alert(window.getSelection());
            //create dropdown
            // let dropdown = document.createElement("div");
            // document.getElementById("textDiv").appendChild(dropdown);

            // dropdown.setAttribute("style", `border-style:solid;border-width:1px;border-color:rgb(71,66,66);padding:10px;z-index:100;display:block;margin:auto;position:absolute;top:${event.pageY}px;left:${event.pageX}px;background: white;`);
            dropdown.style.display = 'block';
            dropdown.style.position = 'fixed';
            dropdown.style.left = (event.pageX - 16) + 'px';
            dropdown.style.top = (event.pageY + 16) + 'px';
        } else {
            dropdown.setAttribute("style", `display:none;`);
        }
    })

    //
    window.addEventListener("click", function() {
        selectedText = window.getSelection().toString().trim();
        if(window.getSelection().toString().trim().length == 0) {
            dropdown.setAttribute("style", `display:none;`);
        }
    })

    updateClassificationsList();
    // createJSON("");
    
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
    // document.getElementById("textArea").setAttribute("class", "test");
    document.getElementById("textArea").setAttribute("style", "font-size:20px; word-spacing:3px; font-family:'Source Sans 3', Helvetica, sans-serif; color:#363030");

    //UPLOAD TEXT FILE
    let uploadFileButton = document.getElementById("fileinput");
    uploadFileButton.addEventListener('change', () => {
        let files = uploadFileButton.files;
        if(files.length == 0) {
            return;
        }
        const file = files[0];
        let reader = new FileReader();
        reader.onload = (e) => {
            const file = e.target.result;
            const lines = file.split(/\r\n |\n/);
            document.getElementById("textArea").innerHTML = lines.join('\n');
            //user has uploaded a text file
            uploadedfile = true;
            console.log("File uploaded: " + uploadedfile);
            createJSON(document.getElementById("textArea").innerHTML);
            document.getElementById("classifyButton").setAttribute("class", "btn btn-success");
            document.getElementById("addClassButton").setAttribute("class", "btn btn-primary");
            //notification
            displayNotification("File uploaded succesfully!");

        };
        reader.onerror = (e) => alert("Problem reading text file!");
        reader.readAsText(file);
    })

    console.log(
        'The page has the following classes:\n  .' +
        listCSSClasses().join('\n  .')
    )

    //TEST SPAN
    let testSpan = document.getElementById("testSpan");
    // testSpan.addEventListener("mouseover", function(e){
    //     console.log("hover!");
    //     testSpan.setAttribute("style", "cursor: url('svg/erase_cursor.svg'), auto;text-decoration:underline");
    // });
    // testSpan.addEventListener("mouseout", function(e){
    //     console.log("leave!");
    //     testSpan.setAttribute("style", "text-decoration:none");
    // });
    // testSpan.addEventListener("click", function(e){
    //     alert("click!");
    //     //more span testing
    //     console.log("span - " + document.getElementsByTagName("span")[0]);
    // });

    //SPANS
    let spans = document.getElementsByTagName("span");
    for(i = 0; i < spans.length; i++) {
        console.log(spans[i]);
        if(spans[i].className.length > 0) {
            console.log("CLASS " + spans[i].className)
        }
    }

    //CLASS HIGHLIGHT PREVIEW
    // console.log(document.getElementById("classTest"));
    let selectedColour = document.getElementById("classColour");
    selectedColour.addEventListener("change", function(e){
        console.log("COLOUR: " + selectedColour.value);
        let red = parseInt(selectedColour.value.substr(1,2),16);
        let green = parseInt(selectedColour.value.substr(3,2), 16);
        let blue = parseInt(selectedColour.value.substr(5,2), 16);
        //determine if text colour should be white or black
        let textColour = "white";
        if ((red*0.299 + green*0.587 + blue*0.114) >= 186.00) {
            textColour = "black";
        }
        let highlightPreview = document.getElementById("classTest");
        highlightPreview.setAttribute("style", `font-weight:500;padding-bottom:2px;padding-left:4px;padding-right:4px;color:${textColour};background-color: rgb(${red},${green},${blue});border-radius:5px`);
    });
    
    //collapsible
    // let collapsible = document.getElementById("collapsible");
    // collapsible.addEventListener("mouseover", function(e) {
    //     collapsible.setAttribute("style", "cursor: url('svg/pointer_cursor.svg'), auto");
    // });
    // collapsible.addEventListener("click", function(e) {
    //     alert("a");
    // });


    // console.log("Highlight: " + highlightPreview);
    

    // const toast = new bootstrap.Toast('.toast');
}

function deleteClass(name) {
    console.log(name.toUpperCase());
    console.log(allClasses);
    console.log(allClasses.includes(name.toUpperCase()));
    if(allClasses.includes(name.toUpperCase())) {
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
        // alert("Class deleted!");
    } else {
        displayNotification("Class not found!");
        // alert("Class not found!");
    }
}

function createClass(name, colourHex) {
    if(document.getElementById("addClassButton").getAttribute("class") == "btn btn-primary") {
        name = name.replaceAll(/ /g,"");//remove any spaces
        if(!allClasses.includes(name.toUpperCase())) {
            //find HTML unordered list of classes
            let classesList = document.getElementById("allClasses");
            console.log(classesList);
            
            //convert HEX to rgb values for class colour
            let red = parseInt(colourHex.substr(1,2),16);
            let green = parseInt(colourHex.substr(3,2), 16);
            let blue = parseInt(colourHex.substr(5,2), 16);
            console.log(`${red}, ${green}, ${blue}`);
            
            //create new class list item
            let newClassListItem = document.createElement("li");
            newClassListItem.setAttribute("id", name);
            

            //add icon
            let icon = document.createElement("i");
            icon.setAttribute("class", "material-icons");
            icon.setAttribute("style", `margin-right:5px; font-size:12px;color:rgb(${red}, ${green}, ${blue})`);
            icon.innerHTML = "circle";
            newClassListItem.appendChild(icon);

            //add class text
            newClassListItem.appendChild(document.createTextNode(`${name.toString()}`));
            classesList.append(newClassListItem);

            //add delete button
            let deleteButton = document.createElement("img");
            deleteButton.src = `svg/delete_button.svg`;
            deleteButton.setAttribute("onclick", `deleteClass('${name}')`);
            deleteButton.setAttribute("style", `margin-left:5px;margin-top:-3px`);
            deleteButton.addEventListener("mouseover", function() {
                deleteButton.setAttribute("style","cursor: url('svg/pointer_cursor.svg'), auto;margin-left:5px;margin-top:-3px");;
            });
            newClassListItem.appendChild(deleteButton);

            console.log(document.getElementById(name));
            // classesList.appendChild(document.createElement("br"));

            
            //create radio button for new class
            // let newClassRadioButton = document.createElement("input");
            // newClassRadioButton.setAttribute("type", "radio");
            // newClassRadioButton.setAttribute("style", "margin-top:-5px");
            // newClassRadioButton.setAttribute("name", "class");
            // newClassRadioButton.setAttribute("value", name.toString());
            // newClassRadioButton.setAttribute("id", name.toString().toLowerCase());



    
            //create label for radio button
            // let label = document.createElement("label");
            // label.setAttribute("for", newClassRadioButton.id);
            // label.setAttribute("style", "margin-left:5px");
            // label.innerHTML = name.toString().toUpperCase();
            // classesList.appendChild(newClassRadioButton);
            // classesList.appendChild(label);

        
            //equation to determine text colour
            //if highlight colour is too bright, text colour becomes black 
            let textColour = "white";
            if ((red*0.299 + green*0.587 + blue*0.114) >= 186.00) {
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
            document.head.appendChild(style);
    
            //TODO: TOOLTIP
            var tooltipStyle = document.createElement('style');
            tooltipStyle.innerHTML = `
            .${name.toUpperCase()}:hover {
                border-style: double;
                border-color: rgb(${red}, ${green}, ${blue});
                border-width: 1px;
            }
            `;
            document.head.appendChild(tooltipStyle);
            //DEBUG: List all classes in index.html eg. class="row"
            // alert(
                // 'The page has the following classes:\n  .' +
                // listCSSClasses().join('\n  .')
            // )
    
    
            //insert new class into classesList
            allClasses.push(name.toUpperCase());
            // allClasses.forEach(printClass);
    
            let newClassEntry = name.toUpperCase().toString();
            jsonFile.annotations[newClassEntry] = [];
            // jsonFile.annotations[newClassEntry].push("test");
            // console.log("TEST:" + JSON.stringify(jsonFile));
    
            //add to dropdown menu
            addClassToDropdown(newClassEntry, red, green, blue);

            //insert new class into JSON
            // jsonFile.annotations[name.toUpperCase()] = "";
    
                //new class name
        // let testClass = "NEWCLASS";
        //create class in json
        //put the value into that class in json
    
            //reset the input values
            document.getElementById("classColour").value = "#ffffff";
            document.getElementById("newClass").value = "";
            document.getElementById("classTest").setAttribute("style", "");
    
            //close the modal
            $('#exampleModal').modal('hide');
        }
        else {
            alert("Class with the same name already exists!");
        }
    } else {
        alert("Please upload a text file first!");
    }
}

function viewAllActiveClasses() {
    alert(
        'The page has the following classes:\n  .' +
        listCSSClasses().join('\n  .')
    )
}

//NEW classify function (hopefully)
function newClassify() {
    //get the selected text
    let selectedText = window.getSelection().toString().trim();
    //check if the selection actually contains words
    if (document.getElementById("classifyButton").getAttribute("class") == "btn btn-success") {
        if(selectedText.length > 0) {
            //log the selected text
            console.log("TEXT: " + selectedText);
            //get the main text body
            let textArea = document.getElementById("textArea");
            //find the classifications list
            var classificationsHTMLList = document.getElementById("classifications-list");        
    
            //log the (proposed) method of placing each occurrence of the selected text within a span element
            //PROBLEM with this method is that it replaces lowercase occurrences with uppercase (or vice versa)
            let searchMask = selectedText;
            let regex = new RegExp(searchMask, "ig");
            let replaceMask = `$&`;
            console.log(textArea.innerHTML.replaceAll(regex, replaceMask));
            //add new classification to the classifications list
            var radioGroup = document.getElementsByName("class");
            let radioSelection = false;
            //check if a class has been selected first
            for(i = 0; i < radioGroup.length; i++) {
                //find the selected class
                if(radioGroup[i].checked) {
                    //create new list item
                    let newItem = document.createElement("li");
                    newItem.appendChild(document.createTextNode(`${selectedText} : ${radioGroup[i].value}`));
                    //add list item to the end of the list
                    let clist = document.getElementById("classifications-list");
                    //if there have been no classifications made yet, first reset the list
                    if(clist.innerHTML.trim().toLowerCase() === "<li>No classifications yet!</li>".toLowerCase()) {
                        clist.innerHTML = "";
                    }
                    //then add new classification to the list
                    classificationsList.push(`${selectedText} : ${radioGroup[i].value}`);
                    console.log(classificationsList);
                    // classificationsHTMLList.appendChild(newItem);
                    //user has selected a class
                    radioSelection = true;
                    
                    //add new span to the text
                    document.getElementById("textArea").innerHTML = textArea.innerHTML.replaceAll(regex,
                        `<span data-toggle='tooltip' title='${radioGroup[i].value.toUpperCase()}' class='${radioGroup[i].value.toUpperCase()}'>${replaceMask}</span>`);
                    console.log(document.getElementById("textArea").innerHTML);   

                    let name = radioGroup[i].value.toUpperCase();
                    console.log("Name: " + name);
                    // jsonFile.annotations[name].push(range.extractContents());
                    jsonFile.annotations[name].push(selectedText);
                    console.log("TEST2:" + JSON.stringify(jsonFile));
                    // document.getElementById("jsonPreview").innerHTML = JSON.stringify(jsonFile);
                    updateJSONPreview(JSON.stringify(jsonFile));
                    
                    updateClassificationsList();
                    spanTest();
                    
                    console.log(document.getElementById("textArea").innerHTML);
                    console.log(document.getElementById("textArea").textContent);
                    
                    //break out of loop
                    break;
                }
            }
            //if the user has not selected a class before attempting to classify
            if(!radioSelection) {
                alert("Please select a class first!");
            }
        } else {
            alert("Select text first!");
        }
    }
    else {
        alert("Please upload a text file first!");
    }
}

function updateClassificationsList() {
    let clist = document.getElementById("classifications-list");
    //log the list as it is
    console.log("vvv Classifications HTML list vvv");
    console.log(clist);
    //reset list
    clist.innerHTML = "";
    console.log(clist.innerHTML);
    if(classificationsList.length < 1) {
        let newItem = document.createElement("li");
        newItem.appendChild(document.createTextNode("No classifications yet!"));
        clist.appendChild(newItem);
    } else {
        //recreate (update) the list
        for(i = 0; i < classificationsList.length; i++) {
            let newItem = document.createElement("li");
            newItem.appendChild(document.createTextNode(classificationsList[i]));
            //add list item to the end of the list
            clist.appendChild(newItem);
        }
    }
}

function RGBtoHex(r,g,b) {
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
    return rgb2hex(r,g,b);
}

function generateColourHEX() {
    //need a 500ms delay to focus on the text input field - dont ask me why i dont fucking know 
    setTimeout(function() {
        // document.getElementById("newClass").value = " ";
        document.getElementById("newClass").focus();
    }, 500);

    

    // let colour = Math.floor(Math.random()*16777215).toString(16);
    let red = Math.floor(Math.random() * 256);
    let green = Math.floor(Math.random() * 256);
    let blue = Math.floor(Math.random() * 256);
    // console.log(colour);
    
    let newColour = RGBtoHex(red,green,blue);
    console.log(`${newColour}`);
    document.getElementById("classColour").value = `${newColour}`;

    // let red = parseInt(colour.substring(1,2),16);
    // let green = parseInt(colour.substring(3,2), 16);
    // let blue = parseInt(colour.substring(5,2), 16);
    //determine if text colour should be white or black
    let textColour = "white";
    if ((red*0.299 + green*0.587 + blue*0.114) >= 186.00) {
        textColour = "black";
    }
    let highlightPreview = document.getElementById("classTest");
    highlightPreview.setAttribute("style", `font-weight:500;padding-bottom:2px;padding-left:4px;padding-right:4px;color:${textColour};background-color: ${newColour};border-radius:5px`);
}

function increaseFont() {
    let fontSize = document.getElementById("textArea").style.fontSize;
    let size = parseInt(fontSize.toString().substring(0,2));
    if(size < 40) {
        document.getElementById("textArea").style.fontSize = `${size+2}px`;
    }
}

function decreaseFont() {
    let fontSize = document.getElementById("textArea").style.fontSize;
    let size = parseInt(fontSize.toString().substring(0,2));
    if(size > 12) {
        document.getElementById("textArea").style.fontSize = `${size-2}px`;
    }
}

//NEW REMOVE CLASSIFICATION
function newRemoveClassification(classToDelete, classification) {
    //TODO: update function to remove classifications with CASE INSENSITIVITY included
    //debugging
    console.log(document.getElementById("textArea").innerHTML);
    console.log(classToDelete);
    console.log(classification);
    console.log(`<span data-toggle="tooltip" title="${classToDelete}" style="cursor: url('svg/pointer_cursor.svg'), auto">${classification}</span>`);
    console.log(document.getElementById("textArea").innerHTML.replaceAll(`<span data-toggle="tooltip" title="${classToDelete}" class="${classToDelete}" style="cursor: url('svg/pointer_cursor.svg'), auto">${classification}</span>`, `${classification}`));
    
    if(toolSelected === tool.ERASE) {
        //update the textArea by replacing all occurrences of the classification
        document.getElementById("textArea").innerHTML = document.getElementById("textArea").innerHTML.replaceAll(`<span data-toggle="tooltip" title="${classToDelete}" class="${classToDelete}" style="cursor: url('svg/pointer_cursor.svg'), auto">${classification}</span>`, `${classification}`);
        document.getElementById("textArea").innerHTML = document.getElementById("textArea").innerHTML.replaceAll(`<span data-toggle="tooltip" title="${classToDelete}" class="${classToDelete}">${classification}</span>`, `${classification}`);
        
        //remove classification from JSON file
        console.log(`Before: ${JSON.stringify(jsonFile)}`);
        // jsonFile.annotations[classToDelete].pop(classification);
        console.log(jsonFile.annotations[classToDelete]);
        jsonFile.annotations[classToDelete] = jsonFile.annotations[classToDelete].filter(function(item) {
            return item !== classification;
        });
        console.log(`After: ${JSON.stringify(jsonFile)}`);
    
        //remove classification from list of classifications
        classificationsList = classificationsList.filter(function(item) {
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

        //notification
        displayNotification(`Removed classification: ${classification}`);
    } else {
        alert(`${classification} : ${classToDelete}`);
    }
}

function classify() {
    let selectedText = window.getSelection().toString();
    if(selectedText.length > 0) {
        console.log(`Text: ${selectedText.innerHTML}`);
        //check the existence of the classifications list
        // alert(document.getElementById("classifications-list"));
        //find the classifications list
        // var classificationsList = document.getElementById("classifications-list");        

        //create a new list item
        var newItem = document.createElement("li");
        //make the selected text the content of the new list item
        newItem.appendChild(document.createTextNode(selectedText));
        
        // alert(document.getElementById("person"));
        var radioGroup = document.getElementsByName("class");
        let radioSelection = false;
        for(i = 0; i < radioGroup.length; i++) {
            if(radioGroup[i].checked) {
                newItem.appendChild(document.createTextNode(": " + radioGroup[i].value));
                //add list item to the end of the list
                let clist = document.getElementById("classifications-list");
                if(clist.innerHTML.trim().toLowerCase() === "<li>No classifications yet!</li>".toLowerCase()) {
                    clist.innerHTML = "";
                }
                // classificationsList.appendChild(newItem);
                radioSelection = true;
                //alter text appearance
                let selection = window.getSelection();
                let range = selection.getRangeAt(0);
                //use the HTML span tag to highlight the text
                let span = document.createElement('span');
                //assign the class to the mark
                span.className = radioGroup[i].value.toUpperCase();
                let newClassificaion = range.extractContents();
                span.appendChild(newClassificaion);
                // data-toggle="tooltip" title="test"
                span.setAttribute("data-toggle", "tooltip");
                span.setAttribute("title", radioGroup[i].value.toUpperCase());
                //insert the node which highlights the selected text
                range.insertNode(span);
                //TODO:add to JSON
                let name = radioGroup[i].value.toUpperCase();
                console.log(name);
                // jsonFile.annotations[name].push(range.extractContents());
                jsonFile.annotations[name].push(selectedText);
                console.log("TEST2:" + JSON.stringify(jsonFile));
                document.getElementById("jsonPreview").innerHTML = JSON.stringify(jsonFile);

                spanTest();
            }
        }
        if(!radioSelection) {
            alert("Please select a class first!");
        }
    }
    else {
        alert("Please select text first!");
    }
}

function spanTest() {
    //GET ALL SPANS (highlighted/classified words) in the text area
    let spans = document.getElementById("textArea").getElementsByTagName("span")
    console.log(spans);

    //spans  to exclude

    //focusing on classification spans
    for(let i=0; i < spans.length; i++) {
        console.log(spans[i].innerHTML);
        //reset event listeners for each span
        spans[i].removeEventListener("mouseover", this);
        spans[i].removeEventListener("click", this);
        //add hover function
        spans[i].addEventListener("mouseover", function(e) {
            spans[i].setAttribute("style","cursor: url('svg/pointer_cursor.svg'), auto");
        });
        //add click to remove function
        spans[i].addEventListener("click", function(e) {
            // alert("Removing classification");
            // var replacement = document.createTextNode('');
            // replacement.textContent = spans[i].innerHTML;
            // spans[i].parentNode.replaceChild(replacement, spans[i]);
            newRemoveClassification(spans[i].getAttribute("class"), spans[i].innerHTML);
        });
    }
}

function printClass(item, index) {
    console.log(`${index}. ${item}\n`);
}

//DEBUG: List all classes in index.html eg. class="row"
function listCSSClasses () {
    let classes = new Set();
    let elementsWithClasses = document.querySelectorAll('[class]');
    for (let element of elementsWithClasses) {
        for (let className of element.classList) {
            classes.add(className);
        }
    }
    return [...classes].sort();
}

function exportToJSON() {
    //TODO: convert all classifications to lowercase?
    alert(JSON.stringify(jsonFile));
    let stringified = JSON.stringify(jsonFile,null,2);
    var blob = new Blob([stringified], {type: "application/json"});
    var url = URL.createObjectURL(blob);
    
    var a = document.createElement("a"); //'a' is a fuckin hyperlink which refreshes the page afterward lol try to fix
    a.download = 'jsonFile.json';
    a.href = url;
    a.id = 'jsonFile';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function addClassToDropdown(newClassName, red, green, blue) {
    //TESTING: adding classes to dropdown menu
    // let newClass = document.createElement("option");
    // newClass.innerHTML = `<option value='${newClassName}'>${newClassName}</option>`;

    // let selectMenu = document.getElementById("choice");
    // selectMenu.appendChild(newClass);
    let newClass = document.createElement("a");
    newClass.setAttribute('onclick', `dropdownClassify('${newClassName}')`);
    newClass.setAttribute('id', `${newClassName}_dropdown`);
    // newClass.onclick = dropdownClassify("Test");
    // newClass.addEventListener("click", dropdownClassify(`${newClassName}`));
    let icon = document.createElement("i");
    icon.setAttribute("style", `margin-right:5px;font-size:11px;color: rgb(${red}, ${green}, ${blue})`);
    icon.setAttribute("class", "material-icons");
    icon.innerHTML = "circle";
    newClass.appendChild(icon);
    
    newClass.appendChild(document.createTextNode(newClassName));
    document.getElementById("dropdown-links").appendChild(newClass);
}

function removeClassFromDropdown(className) {
    let toRemove = document.getElementById(`${className}_dropdown`);
    console.log(toRemove);
    let dropdownLinks = document.getElementById("dropdown-links");
    console.log(dropdownLinks)
    dropdownLinks.removeChild(toRemove);
    console.log(dropdownLinks)
}