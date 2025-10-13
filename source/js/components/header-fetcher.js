const includeHeader = () => {
    fetch("../../html/components/header.html").then(response =>{if(!response.ok){throw new Error("Network response failed");} return response.text();})
        .then(data => {document.getElementById("header_id").innerHTML = data;})
        .catch(error => {console.error("Error fetching the header:", error);
            document.getElementById("header_id").innerText = "Failed to load header.";
        });
    }

document.addEventListener("DOMContentLoaded", includeHeader);