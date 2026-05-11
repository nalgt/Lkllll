let storage;
let files = JSON.parse(localStorage.getItem("sharedFiles")) || [];

// Login na MEGA nalog
async function megaLogin() {
  storage = await mega({
    email: "YOUR_MEGA_EMAIL",      // ubaci email naloga
    password: "YOUR_MEGA_PASSWORD" // ubaci lozinku naloga
  }).login();
  console.log("Ulogovan na MEGA!");
}

// Render fajlova na sajtu
function renderFiles() {
  const fileList = document.getElementById("fileList");
  fileList.innerHTML = "";

  files.forEach(file => {
    const div = document.createElement("div");
    div.className = "file-item";
    div.innerHTML = `
      <span>${file.name}</span>
      <a class="download-btn" href="${file.link}" target="_blank">Download</a>
    `;
    fileList.appendChild(div);
  });
}

// Upload fajla na MEGA
async function uploadFile() {
  const input = document.getElementById("fileInput");
  const status = document.getElementById("status");

  if (!input.files.length) {
    status.innerText = "Izaberi fajl prvo!";
    return;
  }

  const file = input.files[0];

  try {
    const uploaded = await storage.upload(file.name, file).complete;
    status.innerText = "Fajl uploadovan na MEGA!";

    const link = await uploaded.link();
    const expireTime = Date.now() + 24 * 60 * 60 * 1000; // 24h

    files.push({ name: file.name, id: uploaded.nodeId, link, expire: expireTime });
    localStorage.setItem("sharedFiles", JSON.stringify(files));

    renderFiles();
  } catch (err) {
    console.error("Greška u uploadu:", err);
    status.innerText = "Greška pri uploadu!";
  }
}

// Brisanje fajlova starijih od 24h
async function cleanupFiles() {
  const now = Date.now();
  files = files.filter(file => {
    if (file.expire < now) {
      storage.delete(file.id); // briše sa MEGA
      console.log(`Obrisan fajl: ${file.name}`);
      return false;
    }
    return true;
  });

  localStorage.setItem("sharedFiles", JSON.stringify(files));
  renderFiles();
}

// Pokreni login i čišćenje kada se sajt učita
window.onload = async () => {
  await megaLogin();
  cleanupFiles();
  renderFiles();
};
