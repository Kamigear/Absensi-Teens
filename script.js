const API_URL = "https://lingering-bush-bef7.richieleonardo20.workers.dev/";

let masterData = [];
let weeklyCode = "";

// Toggle loading UI di awal
function setInitialLoading(isLoading) {
  const searchInput = document.getElementById("search");
  const codeInput = document.getElementById("weekly-code");
  const submitBtn = document.getElementById("submit-btn");
  const status = document.getElementById("status");

  if (isLoading) {
    searchInput.disabled = true;
    codeInput.disabled = true;
    submitBtn.disabled = true;
    submitBtn.innerHTML = "⏳ Loading data...";
    status.textContent = "Sedang mengambil data...";
  } else {
    searchInput.disabled = false;
    codeInput.disabled = false;
    submitBtn.disabled = false;
    submitBtn.innerHTML = "Absen";
    status.textContent = "";
  }
}

// Ambil data master dari Google Sheets
async function loadMasterData() {
  setInitialLoading(true);

  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    masterData = data.master || [];
    weeklyCode = data.weeklyCode || "";

    console.log("Master data loaded:", masterData, "Kode:", weeklyCode);
  } catch (err) {
    console.error("Error loading sheet:", err);
    document.getElementById("status").textContent = "Gagal memuat data master.";
  } finally {
    setInitialLoading(false);
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

// Submit absensi (sama seperti sebelumnya)
async function submitAbsensi() {
  const nama = document.getElementById("search").value.trim();
  const kode = document.getElementById("weekly-code").value.trim();
  const status = document.getElementById("status");

  if (!nama || !kode) {
    status.textContent = "Nama dan kode harus diisi.";
    return;
  }

  // tombol loading
  document.getElementById("submit-btn").disabled = true;
  document.getElementById("submit-btn").innerHTML = "⏳ Absen...";

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
  } finally {
    document.getElementById("submit-btn").disabled = false;
    document.getElementById("submit-btn").innerHTML = "Absen";
  }
}

// Inisialisasi
window.addEventListener("DOMContentLoaded", () => {
  loadMasterData();
  setupSearch();
  document.getElementById("submit-btn").addEventListener("click", submitAbsensi);
});
