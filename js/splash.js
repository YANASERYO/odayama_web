document.addEventListener("DOMContentLoaded", () => {
    const splash = document.getElementById("splash");
    const skip = document.getElementById("skipBtn");

    if (!splash) return;

    if (localStorage.getItem("splashShown") === "true") {
        splash.style.display = "none";
        return;
    }

    const hideSplash = () => {
        splash.style.opacity = "0";
        setTimeout(() => splash.style.display = "none", 1200);
        localStorage.setItem("splashShown", "true");
    };

    skip?.addEventListener("click", hideSplash);

    setTimeout(hideSplash, 11500);

    const video = document.getElementById("splashmovie");
    if (video) video.play().catch(() => {});
});