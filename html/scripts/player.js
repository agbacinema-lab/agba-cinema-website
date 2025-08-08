// Replace file paths with YouTube video IDs
const videoList = [
    "hBbywzcz254", // Camera
    "y4SiSYgxAA8", // Earpod
    "c3qToUhcaZc", // Ereader
    "pgaekk8NOe8", // Importa
    "G_fGfa-1tZY", // Local transaction
    "IimlCWz9bdY", // Main corrected
    "RGFfjmP9zpQ"  // Headphone
];

let currentVideo = 0;
const player = document.getElementById("videoPlayer");
const dotContainer = document.getElementById("videoDots");

function loadVideo(index) {
    currentVideo = index;
    player.src = `https://www.youtube.com/embed/${videoList[index]}?rel=0&autoplay=1`;
    updateDots();
}

function createDots() {
    videoList.forEach((_, index) => {
        const dot = document.createElement("span");
        dot.classList.add("dot");
        dot.addEventListener("click", () => loadVideo(index));
        dotContainer.appendChild(dot);
    });
    updateDots();
}

function updateDots() {
    const dots = document.querySelectorAll(".dot");
    dots.forEach((dot, index) => {
        dot.classList.toggle("active", index === currentVideo);
    });
}

// Simulate "video ended" by auto-switching after a fixed time (YouTube API needed for true detection)
setInterval(() => {
    currentVideo = (currentVideo + 1) % videoList.length;
    loadVideo(currentVideo);
}, 20000); // 20 seconds per video

createDots();
loadVideo(currentVideo);
