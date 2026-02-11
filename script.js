console.log("JBMoveis Planejados carregado com sucesso");
function openImage(src) {
    document.getElementById("imageModal").style.display = "flex";
    document.getElementById("modalImg").src = src;
}

function closeImage() {
    document.getElementById("imageModal").style.display = "none";
}
