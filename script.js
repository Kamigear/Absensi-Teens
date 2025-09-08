const API_URL = "https://script.google.com/macros/s/AKfycbxMgYIklAMmLvFaKGxqTETTp8_hwGw0EaW4CE18a4lsRWDUHFgtKrQNR2haAF72A2OP/exec";

let masterData = [];
let weeklyCode = "";

// Ambil data master dari Google Sheets
async function loadMasterData() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    masterData = data.master || [];
    weeklyCode = data.weeklyCode || "";

    console.log("Master data loaded:", masterData, "Kode:", weeklyCode);
  } catch (err) {
    console.error("Error loading sheet:", err);
  }
}

// Fungsi search filter
function setupSearch() {
  const searchInput = document.getElementById("search");
  const resultList = document.getElementById("result-list");

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();
    resultList.innerHTML = "";

    if (!query) return;

    const filtered = masterData.filter(nama =>
      nama.toLowerCase().includes(query)
    );

    filtered.forEach(nama => {
      const li = document.createElement("li");
      li.textContent = nama;
      li.addEventListener("click", () => {
        searchInput.value = nama;
        resultList.innerHTML = "";
      });
      resultList.appendChild(li);
    });
  });
}

// Submit absensi
async function submitAbsensi() {
  const nama = document.getElementById("search").value.trim();
  const kode = document.getElementById("weekly-code").value.trim();
  const status = document.getElementById("status");

  if (!nama || !kode) {
    status.textContent = "Nama dan kode harus diisi.";
    return;
  }

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nama, kode })
    });
    const result = await res.json();

    console.log("Submit result:", result);
    status.textContent = result.message;
  } catch (err) {
    console.error("Error submit:", err);
    status.textContent = "Gagal mengirim absensi.";
  }
}

// Inisialisasi
window.addEventListener("DOMContentLoaded", () => {
  loadMasterData();
  setupSearch();
  document.getElementById("submit-btn").addEventListener("click", submitAbsensi);
});
