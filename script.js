// Ganti URL ini dengan link Web App GAS kamu (yang diakhiri /exec)
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxMgYIklAMmLvFaKGxqTETTp8_hwGw0EaW4CE18a4lsRWDUHFgtKrQNR2haAF72A2OP/exec";

// Simpan data master & kode mingguan dari server
let masterData = [];
let weeklyCodeServer = "";

// Ambil master data (nama + kode mingguan dari E2)
async function loadMaster() {
  try {
    const res = await fetch(WEB_APP_URL);
    const data = await res.json();

    if (data.error) {
      document.getElementById("status").textContent = "Error: " + data.error;
      return;
    }

    masterData = data.master || [];
    weeklyCodeServer = data.weeklyCode || "";

    console.log("Master data loaded:", masterData, "Kode:", weeklyCodeServer);
  } catch (err) {
    console.error("Error loading sheet:", err);
    document.getElementById("status").textContent = "Gagal load master data";
  }
}

// Tampilkan hasil pencarian nama
function setupSearch() {
  const searchInput = document.getElementById("search");
  const resultList = document.getElementById("result-list");

  searchInput.addEventListener("input", function () {
    const query = this.value.toLowerCase();
    resultList.innerHTML = "";

    if (!query) return;

    const filtered = masterData.filter((nama) =>
      nama.toLowerCase().includes(query)
    );

    filtered.forEach((nama) => {
      const li = document.createElement("li");
      li.textContent = nama;
      li.style.cursor = "pointer";
      li.onclick = () => {
        searchInput.value = nama;
        resultList.innerHTML = "";
      };
      resultList.appendChild(li);
    });
  });
}

// Kirim absensi ke server
async function submitAbsensi() {
  const nama = document.getElementById("search").value.trim();
  const kodeInput = document.getElementById("weekly-code").value.trim();
  const statusEl = document.getElementById("status");

  if (!nama) {
    statusEl.textContent = "Nama wajib diisi.";
    return;
  }
  if (!kodeInput) {
    statusEl.textContent = "Kode wajib diisi.";
    return;
  }

  // Validasi kode mingguan
  if (kodeInput !== weeklyCodeServer) {
    statusEl.textContent = "Kode mingguan salah!";
    return;
  }

  try {
    const res = await fetch(WEB_APP_URL, {
      method: "POST",
      body: JSON.stringify({ nama: nama, kode: kodeInput }),
      headers: { "Content-Type": "application/json" },
    });
    const result = await res.json();

    if (result.success) {
      statusEl.textContent = "✅ Absensi berhasil dicatat.";
    } else {
      statusEl.textContent = "❌ Gagal: " + result.message;
    }
  } catch (err) {
    console.error("Error submit:", err);
    statusEl.textContent = "Terjadi kesalahan saat absen.";
  }
}

// Saat halaman siap
window.onload = () => {
  loadMaster();
  setupSearch();
  document
    .getElementById("submit-btn")
    .addEventListener("click", submitAbsensi);
};
