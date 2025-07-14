const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const chooseInput = document.getElementById("chooseImage");
const photoInput = document.getElementById("takePhoto");
const result = document.getElementById("result");

let img = new Image();
let imgLoaded = false;

const points = [
  { x: 50, y: 50 },
  { x: 250, y: 50 },
  { x: 250, y: 250 },
  { x: 50, y: 250 }
];

function drawCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "blue";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < 4; i++) ctx.lineTo(points[i].x, points[i].y);
  ctx.closePath();
  ctx.stroke();
}

function updatePointElements() {
  const rect = canvas.getBoundingClientRect();
  points.forEach((pt, i) => {
    const el = document.getElementById("p" + i);
    el.style.left = (canvas.offsetLeft + pt.x) + "px";
    el.style.top = (canvas.offsetTop + pt.y) + "px";
  });
}

function resizeCanvasToImage() {
  const maxWidth = 350;
  const scale = Math.min(1, maxWidth / img.width);
  canvas.width = img.width * scale;
  canvas.height = img.height * scale;

  points[0] = { x: 50, y: 50 };
  points[1] = { x: canvas.width - 50, y: 50 };
  points[2] = { x: canvas.width - 50, y: canvas.height - 50 };
  points[3] = { x: 50, y: canvas.height - 50 };

  drawCanvas();
  updatePointElements();
}

function handleFile(file) {
  const url = URL.createObjectURL(file);
  img.onload = () => {
    imgLoaded = true;
    resizeCanvasToImage();
    URL.revokeObjectURL(url);
  };
  img.src = url;
}

chooseInput.addEventListener("change", e => {
  if (e.target.files.length) handleFile(e.target.files[0]);
});

photoInput.addEventListener("change", e => {
  if (e.target.files.length) handleFile(e.target.files[0]);
});

// Points déplaçables
points.forEach((pt, i) => {
  const el = document.getElementById("p" + i);
  let isDragging = false;

  el.addEventListener("pointerdown", e => {
    e.preventDefault();
    isDragging = true;

    const move = ev => {
      if (!isDragging) return;
      const rect = canvas.getBoundingClientRect();
      pt.x = ev.clientX - rect.left;
      pt.y = ev.clientY - rect.top;
      drawCanvas();
      updatePointElements();
    };

    const up = () => {
      isDragging = false;
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", up);
    };

    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", up);
  });
});

document.getElementById("scanBtn").addEventListener("click", () => {
  if (!imgLoaded) return;
  const minX = Math.min(...points.map(p => p.x));
  const minY = Math.min(...points.map(p => p.y));
  const maxX = Math.max(...points.map(p => p.x));
  const maxY = Math.max(...points.map(p => p.y));
  const w = maxX - minX;
  const h = maxY - minY;

  const imgData = ctx.getImageData(minX, minY, w, h);
  const code = jsQR(imgData.data, w, h);
  if (code) {
    result.textContent = "Résultat : " + code.data;
  } else {
    result.textContent = "QR non détecté.";
  }
});
