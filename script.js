const inputImage = document.getElementById('inputImage');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const points = ['p1', 'p2', 'p3', 'p4'].map(id => document.getElementById(id));
const resultDiv = document.getElementById('result');

let img = new Image();
let imgLoaded = false;

// Positions des points sur le canvas (initialisé plus tard)
let pointPositions = [
  { x: 50, y: 50 },
  { x: 250, y: 50 },
  { x: 250, y: 250 },
  { x: 50, y: 250 }
];

// Variables pour drag
let dragTarget = null;
let dragOffset = { x: 0, y: 0 };

function draw() {
  if (!imgLoaded) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  // Dessiner le quadrilatère connecté
  ctx.strokeStyle = 'red';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(pointPositions[0].x, pointPositions[0].y);
  for(let i=1; i<4; i++) ctx.lineTo(pointPositions[i].x, pointPositions[i].y);
  ctx.closePath();
  ctx.stroke();

  // Positionner les points (boules)
  points.forEach((p, i) => {
    p.style.left = pointPositions[i].x + 'px';
    p.style.top = pointPositions[i].y + 'px';
  });
}

// Charger image et adapter canvas
inputImage.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;

  const url = URL.createObjectURL(file);
  img.onload = () => {
    imgLoaded = true;
    // Adapter la taille du canvas à l'image (max 500px width)
    const maxW = 500;
    const ratio = img.width / img.height;
    if(img.width > maxW){
      canvas.width = maxW;
      canvas.height = maxW / ratio;
    } else {
      canvas.width = img.width;
      canvas.height = img.height;
    }

    // Initialiser points aux coins du canvas
    pointPositions = [
      { x: 20, y: 20 },
      { x: canvas.width - 20, y: 20 },
      { x: canvas.width - 20, y: canvas.height - 20 },
      { x: 20, y: canvas.height - 20 }
    ];
    draw();
    URL.revokeObjectURL(url);
  };
  img.src = url;
});

// Drag & drop points (support souris et tactile)
points.forEach((p, i) => {
  p.addEventListener('pointerdown', e => {
    dragTarget = i;
    dragOffset.x = e.clientX - pointPositions[i].x;
    dragOffset.y = e.clientY - pointPositions[i].y;
    p.setPointerCapture(e.pointerId);
  });
  p.addEventListener('pointermove', e => {
    if (dragTarget === i) {
      pointPositions[i].x = e.clientX - dragOffset.x;
      pointPositions[i].y = e.clientY - dragOffset.y;
      // Limiter dans le canvas
      pointPositions[i].x = Math.min(Math.max(pointPositions[i].x, 0), canvas.width);
      pointPositions[i].y = Math.min(Math.max(pointPositions[i].y, 0), canvas.height);
      draw();
    }
  });
  p.addEventListener('pointerup', e => {
    dragTarget = null;
    points[i].releasePointerCapture(e.pointerId);
  });
  p.addEventListener('pointercancel', e => {
    dragTarget = null;
    points[i].releasePointerCapture(e.pointerId);
  });
});

// Fonction pour extraire zone rectangulaire approximative (boîte englobante des points)
function getBoundingBox() {
  const xs = pointPositions.map(p => p.x);
  const ys = pointPositions.map(p => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

document.getElementById('scanBtn').addEventListener('click', () => {
  if(!imgLoaded) {
    alert("Chargez d'abord une image !");
    return;
  }
  const box = getBoundingBox();
  const imageData = ctx.getImageData(box.x, box.y, box.width, box.height);

  const code = jsQR(imageData.data, box.width, box.height);
  if(code){
    resultDiv.textContent = "Code QR détecté : " + code.data;
  } else {
    resultDiv.textContent = "Aucun QR code détecté dans la zone sélectionnée.";
  }
});
