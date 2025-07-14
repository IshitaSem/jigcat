const container = document.getElementById("puzzle-container");
const shuffleBtn = document.getElementById("shuffle");
const solvedSound = document.getElementById("solvedSound");
const memeVideo = document.getElementById("memeVideo");

const rows = 4;
const cols = 4;
const size = 100;
let currentImage = "";
const imageList = ["cat1.jpeg", "cat2.jpeg", "jigsaw1.jpeg"];

let pieces = [];
let positions = [];

function getRandomImage() {
  const random = imageList[Math.floor(Math.random() * imageList.length)];
  currentImage = random;
  return `images/${random}`;
}

function createPuzzle() {
  container.innerHTML = "";
  memeVideo.style.display = "none";
  memeVideo.pause();
  memeVideo.currentTime = 0;

  pieces = [];
  positions = [];

  const bgImage = getRandomImage();

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const index = r * cols + c;
      const piece = document.createElement("div");
      piece.classList.add("piece");
      piece.style.backgroundImage = `url('${bgImage}')`;
      piece.style.backgroundPosition = `-${c * size}px -${r * size}px`;
      piece.style.left = `${c * size}px`;
      piece.style.top = `${r * size}px`;
      piece.dataset.index = index;

      enableDrag(piece);
      container.appendChild(piece);
      pieces.push(piece);
      positions.push({ top: r * size, left: c * size });
    }
  }
}

function enableDrag(piece) {
  let offsetX, offsetY;
  let dragging = false;

  // Desktop
  piece.addEventListener("mousedown", (e) => {
    dragging = true;
    offsetX = e.offsetX;
    offsetY = e.offsetY;
    piece.style.zIndex = 1000;

    function onMouseMove(e) {
      piece.style.left = e.pageX - offsetX - container.offsetLeft + "px";
      piece.style.top = e.pageY - offsetY - container.offsetTop + "px";
    }

    function onMouseUp() {
      dragging = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      snapPiece(piece);
      checkSolved();
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  });

  // Touch
  piece.addEventListener("touchstart", (e) => {
    dragging = true;
    const touch = e.touches[0];
    const rect = piece.getBoundingClientRect();
    offsetX = touch.clientX - rect.left;
    offsetY = touch.clientY - rect.top;
    piece.style.zIndex = 1000;

    function onTouchMove(e) {
      const touch = e.touches[0];
      piece.style.left = touch.clientX - offsetX - container.offsetLeft + "px";
      piece.style.top = touch.clientY - offsetY - container.offsetTop + "px";
    }

    function onTouchEnd() {
      dragging = false;
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
      snapPiece(piece);
      checkSolved();
    }

    document.addEventListener("touchmove", onTouchMove);
    document.addEventListener("touchend", onTouchEnd);
  });
}

function snapPiece(piece) {
  const index = +piece.dataset.index;
  const correct = positions[index];
  const x = parseInt(piece.style.left);
  const y = parseInt(piece.style.top);

  const dx = x - correct.left;
  const dy = y - correct.top;

  if (Math.abs(dx) < size / 2 && Math.abs(dy) < size / 2) {
    piece.style.left = correct.left + "px";
    piece.style.top = correct.top + "px";
  }
}

function shufflePuzzle() {
  memeVideo.style.display = "none";
  memeVideo.pause();
  pieces.forEach(piece => {
    const randX = Math.random() * (container.clientWidth - size);
    const randY = Math.random() * (container.clientHeight - size);
    piece.style.left = `${randX}px`;
    piece.style.top = `${randY}px`;
  });
}

function checkSolved() {
  let solved = true;
  pieces.forEach(piece => {
    const index = +piece.dataset.index;
    const correct = positions[index];
    const x = parseInt(piece.style.left);
    const y = parseInt(piece.style.top);
    if (Math.abs(x - correct.left) > 2 || Math.abs(y - correct.top) > 2) {
      solved = false;
    }
  });

  if (solved) {
    solvedSound.play();
    showMemeVideo();
  }
}

function showMemeVideo() {
  const videoName = currentImage.replace(".jpeg", ".mp4");
  memeVideo.src = `videos/${videoName}`;
  memeVideo.style.display = "block";
  memeVideo.play();
}

shuffleBtn.addEventListener("click", shufflePuzzle);
createPuzzle();
