const camera = document.getElementById("camera");
const preview = document.getElementById("preview");
const startCameraBtn = document.getElementById("start-camera");
const takePhotoBtn = document.getElementById("take-photo");
const savePhotoBtn = document.getElementById("save-photo");
const gallery = document.getElementById("gallery");
const ocrResult = document.getElementById("ocr-result");

let stream;
let capturedImage;
let useFrontCamera = true; // começa na câmera frontal

// Função para iniciar câmera
async function startCamera() {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: useFrontCamera ? "user" : "environment" }
    });
    camera.srcObject = stream;
  } catch (err) {
    alert("Erro ao acessar a câmera: " + err);
  }
}

// Alternar câmera
function switchCamera() {
  useFrontCamera = !useFrontCamera;
  startCamera();
}

// Criar botão de alternar câmera
const switchBtn = document.createElement("button");
switchBtn.innerText = "🔄 Alternar Câmera";
switchBtn.classList.add("switch-btn");
switchBtn.addEventListener("click", switchCamera);
document.querySelector(".buttons").appendChild(switchBtn);

// Botões
startCameraBtn.addEventListener("click", startCamera);

takePhotoBtn.addEventListener("click", () => {
  if (!stream) {
    alert("Abra a câmera primeiro!");
    return;
  }
  const ctx = preview.getContext("2d");
  preview.width = camera.videoWidth;
  preview.height = camera.videoHeight;
  ctx.drawImage(camera, 0, 0, preview.width, preview.height);
  capturedImage = preview.toDataURL("image/png");
});

savePhotoBtn.addEventListener("click", async () => {
  if (!capturedImage) {
    alert("Primeiro tire uma foto!");
    return;
  }

  // Criar container da imagem
  const container = document.createElement("div");
  container.classList.add("photo-item");

  // Criar imagem
  const img = document.createElement("img");
  img.src = capturedImage;

  // Criar botão de excluir
  const deleteBtn = document.createElement("button");
  deleteBtn.innerText = "Excluir ❌";
  deleteBtn.classList.add("delete-btn");
  deleteBtn.addEventListener("click", () => {
    gallery.removeChild(container);
  });

  // Montar container
  container.appendChild(img);
  container.appendChild(deleteBtn);
  gallery.appendChild(container);

  // Baixar imagem
  const a = document.createElement("a");
  a.href = capturedImage;
  a.download = `documento-${Date.now()}.png`; // nome único
  document.body.appendChild(a); // precisa estar no DOM
  a.click();
  document.body.removeChild(a); // remove após o clique

  // API OCR Space para extrair texto
  try {
    let blob = await fetch(capturedImage).then(res => res.blob());
    let formData = new FormData();
    formData.append("file", blob, "document.png");
    formData.append("language", "por");

    let response = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      headers: {
        apikey: "K87492144488957"
      },
      body: formData
    });

    let result = await response.json();
    if (result.ParsedResults && result.ParsedResults.length > 0) {
      ocrResult.innerText = "📄 Texto extraído:\n" + result.ParsedResults[0].ParsedText;
    } else {
      ocrResult.innerText = "⚠️ Não foi possível extrair texto.";
    }
  } catch (error) {
    ocrResult.innerText = "Erro ao chamar API OCR: " + error;
  }
});

// PWA - Instalação
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;

  const btnInstall = document.getElementById('btn-install');
  if (btnInstall) {
    btnInstall.style.display = 'block';

    btnInstall.addEventListener('click', () => {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => {
        deferredPrompt = null;
        btnInstall.style.display = 'none';
      });
    });
  }
});
