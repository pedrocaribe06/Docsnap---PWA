const camera = document.getElementById("camera");
const preview = document.getElementById("preview");
const startCameraBtn = document.getElementById("start-camera");
const takePhotoBtn = document.getElementById("take-photo");
const savePhotoBtn = document.getElementById("save-photo");
const gallery = document.getElementById("gallery");

let stream;
let capturedImage;
let useFrontCamera = true; // começa na câmera frontal

// Função para iniciar câmera
async function startCamera() {
  // Para stream anterior
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

// Abrir câmera
startCameraBtn.addEventListener("click", startCamera);

// Criar botão de alternar câmera
const switchBtn = document.createElement("button");
switchBtn.innerText = "Alternar Câmera";
switchBtn.classList.add("switch-btn");
switchBtn.addEventListener("click", switchCamera);
document.querySelector(".buttons").appendChild(switchBtn);

// Tirar foto
takePhotoBtn.addEventListener("click", () => {
  const ctx = preview.getContext("2d");
  preview.width = camera.videoWidth;
  preview.height = camera.videoHeight;
  ctx.drawImage(camera, 0, 0, preview.width, preview.height);
  capturedImage = preview.toDataURL("image/png");
});

// Salvar foto
savePhotoBtn.addEventListener("click", () => {
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

  // Baixar documento
  const a = document.createElement("a");
  a.href = capturedImage;
  a.download = "documento.png";
  a.click();
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
      deferredPrompt.userChoice.then((choiceResult) => {
        deferredPrompt = null;
        btnInstall.style.display = 'none';
      });
    });
  }
});
