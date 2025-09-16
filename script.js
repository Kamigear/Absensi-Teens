const API_URL = "https://lingering-bush-bef7.richieleonardo20.workers.dev/";

const targetLat = -6.142195319651587;
const targetLng = 106.67969693645462;
const MAX_DISTANCE_METERS = 200;

let masterData = [];
let weeklyCode = "";
let locationRestricted = false;
let enabled = true;

// Hitung jarak (Tidak ada perubahan)
function getDistanceFromLatLon(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Ambil data master (Logika overlay dihapus dari sini)
async function loadMasterData() {
  try {
    document.getElementById("loading-text").textContent = "📡 Mengambil data...";
    const res = await fetch(API_URL, { cache: "no-store" });
    const data = await res.json();

    masterData = data.master || [];
    weeklyCode = data.weeklyCode || "";
    locationRestricted = data.locationRestricted ?? false;
    enabled = data.enabled ?? true;

    document.getElementById("loading-screen").classList.add("hidden");
    document.querySelector(".container").style.display = "block";

    const overlay = document.getElementById("location-overlay");
    const overlayText = document.getElementById("overlay-text");
    const allowBtn = document.getElementById("allow-location");

    if (!enabled) {
      overlay.classList.remove("hidden");
      overlayText.textContent =
        "❌ Absensi sedang dinonaktifkan. Coba lagi nanti.";
      allowBtn.textContent = "🔄 Refresh Halaman";
      allowBtn.onclick = () => location.reload();
      return;
    }
    
    // LOGIKA PENGECEKAN LOKASI DIHAPUS DARI SINI
    
  } catch (err) {
    document.getElementById("loading-text").textContent =
      "❌ Gagal memuat data. Coba refresh.";
  }
}

// Request izin lokasi (Tidak ada perubahan)
function requestLocationPermission() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject("❌ Browser tidak mendukung geolokasi.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const distance = getDistanceFromLatLon(latitude, longitude, targetLat, targetLng);
        if (distance <= MAX_DISTANCE_METERS) {
          resolve();
        } else {
          reject("❌ Anda berada di luar lokasi absensi.");
        }
      },
      (error) => {
        let message = "❌ Izin lokasi ditolak. Absensi tidak bisa dilanjutkan.";
        if(error.code === 1) { // PERMISSION_DENIED
            message = "❌ Anda menolak izin lokasi. Aktifkan di pengaturan browser untuk melanjutkan.";
        } else if (error.code === 2) { // POSITION_UNAVAILABLE
            message = "❌ Lokasi tidak dapat ditentukan. Pastikan GPS aktif.";
        }
        reject(message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
}

// Search filter (Tidak ada perubahan)
function setupSearch() {
  const searchInput = document.getElementById("search");
  const resultList = document.getElementById("result-list");
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();
    resultList.innerHTML = "";
    if (!query) return;
    const filtered = masterData.filter((nama) => nama.toLowerCase().includes(query));
    filtered.forEach((nama) => {
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

// Submit absensi (LOGIKA UTAMA DIPINDAHKAN KE SINI)
async function submitAbsensi() {
  const nama = document.getElementById("search").value.trim();
  const kode = document.getElementById("weekly-code").value.trim();
  const btn = document.getElementById("submit-btn");

  // elemen overlay
  const overlay = document.getElementById("location-overlay");
  const overlayText = document.getElementById("overlay-text");
  const overlayBtn = document.getElementById("allow-location");

  if (!nama || !kode) {
    overlayText.textContent = "⚠️ Nama dan kode harus diisi.";
    overlayBtn.textContent = "Mengerti";
    overlay.classList.remove("hidden");
    return;
  }
  if (!masterData.includes(nama)) {
    overlayText.textContent = "❌ Nama tidak valid. Pilih dari daftar.";
    overlayBtn.textContent = "Mengerti";
    overlay.classList.remove("hidden");
    return;
  }

  btn.disabled = true;
  btn.innerHTML = "⏳ Memeriksa...";

  try {
    // LANGKAH 1: Cek lokasi jika diperlukan
    if (locationRestricted) {
      btn.innerHTML = "📍 Mengecek Lokasi...";
      try {
        await requestLocationPermission();
      } catch (err) {
        overlayText.textContent = err;
        overlayBtn.textContent = "Mengerti";
        overlay.classList.remove("hidden");
        return;
      }
    }

    // LANGKAH 2: Kirim absensi
    btn.innerHTML = "⏳ Mengirim...";
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nama, kode }),
    });
    const result = await res.json();

    // tampilkan pesan server di overlay
    overlayText.textContent = result.message || "✔️ Absensi berhasil.";
    overlayBtn.textContent = "Mengerti";
    overlay.classList.remove("hidden");

  } catch (err) {
    overlayText.textContent = "❌ Gagal mengirim absensi. Coba refresh halaman.";
    overlayBtn.textContent = "🔄 Refresh Halaman";
    overlayBtn.onclick = () => location.reload();
    overlay.classList.remove("hidden");
  } finally {
    btn.disabled = false;
    btn.innerHTML = "Absen";
  }
}


// Listener koneksi (Tidak ada perubahan)
window.addEventListener("offline", () => alert("⚠️ Koneksi internet hilang..."));
window.addEventListener("online", () => location.reload());

// Uppercase kode (Tidak ada perubahan)
document.addEventListener("input", (e) => {
  if (e.target.id === "weekly-code") {
    e.target.value = e.target.value.toUpperCase();
  }
});

// Init
window.addEventListener("DOMContentLoaded", async () => {
  await loadMasterData();
  setupSearch();
  document.getElementById("submit-btn").addEventListener("click", submitAbsensi);

  // Tambahkan listener untuk tombol di overlay agar berfungsi sebagai tombol 'tutup'
  document.getElementById("allow-location").addEventListener('click', () => {
    document.getElementById("location-overlay").classList.add('hidden');
  });
});