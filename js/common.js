document.addEventListener("DOMContentLoaded", () => {

fetch("fragments/header.html")
.then(res => res.text())
.then(data => {
document.getElementById("header-area").innerHTML = data;
});

fetch("fragments/footer.html")
.then(res => res.text())
.then(data => {
document.getElementById("footer").innerHTML = data;
});

});