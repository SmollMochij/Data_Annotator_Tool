window.onload = function() {
    body = document.getElementById("testbody").textContent.toLowerCase();
    console.log(body);
    body = body.replace("emily", "<span style='color:blue'>emily</span>");
    console.log(body);
    document.getElementById("testbody").innerHTML = body;
    body = body.replace("<span style='color:blue'>emily</span>", "emily");
    document.getElementById("testbody").innerHTML = body;
    console.log(body);

    document.getElementById("unicodeTest").innerHTML = "<span>asd";
    alert(document.getElementById("unicodeTest").content)

    jsonObj = {
        "annotations": 
        {}
    };
    let name = "name";
    jsonObj.annotations[name] = []
    jsonObj.annotations[name].push("jason");
    jsonObj.annotations[name].push("diaz");
    jsonObj.annotations[name].pop("diaz");
    document.getElementById("jsonTest").innerHTML = JSON.stringify(jsonObj);

}
