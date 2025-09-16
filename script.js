const API_URL = "https://lingering-bush-bef7.richieleonardo20.workers.dev/";

const targetLat = -6.142195319651587;
const targetLng = 106.67969693645462;
const MAX_DISTANCE_METERS = 200;

let masterData = [];
let weeklyCode = "";
let locationRestricted = false;
let enabled = true;

// Hitung jarak
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

// Ambil data master
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

    if (locationRestricted) {
      overlay.classList.remove("hidden");
      overlayText.textContent =
        "❌ Mohon berikan izin lokasi untuk melanjutkan absensi.";
      allowBtn.textContent = "Izinkan Lokasi";
      allowBtn.onclick = async () => {
        try {
          await requestLocationPermission();
          overlay.classList.add("hidden");
        } catch (err) {
          overlayText.textContent = err;
        }
      };
    } else {
      overlay.classList.add("hidden");
    }
  } catch (err) {
    document.getElementById("loading-text").textContent =
      "❌ Gagal memuat data. Coba refresh.";
  }
}

// Request izin lokasi
function requestLocationPermission() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject("❌ Browser tidak mendukung geolokasi.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const distance = getDistanceFromLatLon(
          latitude,
          longitude,
          targetLat,
          targetLng
        );

        if (distance <= MAX_DISTANCE_METERS) {
          localStorage.setItem("locationAllowed", "true");
          resolve();
        } else {
          // ubah tombol jadi refresh
          const allowBtn = document.getElementById("allow-location");
          allowBtn.textContent = "🔄 Refresh Halaman";
          allowBtn.onclick = () => location.reload();

          reject("❌ Anda berada di luar lokasi absensi.");
        }
      },
      () => {
        const allowBtn = document.getElementById("allow-location");
        allowBtn.textContent = "🔄 Refresh Halaman";
        allowBtn.onclick = () => location.reload();

        reject(
          "❌ Mohon berikan izin lokasi. Jika tidak, absensi tidak bisa dilanjutkan."
        );
      }
    );
  });
}

// Search filter
function setupSearch() {
  const searchInput = document.getElementById("search");
  const resultList = document.getElementById("result-list");

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();
    resultList.innerHTML = "";

    if (!query) return;

    const filtered = masterData.filter((nama) =>
      nama.toLowerCase().includes(query)
    );

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

// Submit absensi
async function submitAbsensi() {
  const nama = document.getElementById("search").value.trim();
  const kode = document.getElementById("weekly-code").value.trim();
  const status = document.getElementById("status");

  if (!nama || !kode) {
    status.textContent = "Nama dan kode harus diisi.";
    return;
  }

  if (!masterData.includes(nama)) {
    status.textContent = "Nama tidak valid. Pilih dari daftar.";
    return;
  }

  const btn = document.getElementById("submit-btn");
  btn.disabled = true;
  btn.innerHTML = "⏳ Absen...";

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nama, kode }),
    });
    const result = await res.json();
    status.textContent = result.message;
  } catch (err) {
    status.textContent = "Gagal mengirim absensi. Coba refresh halaman.";
  } finally {
    btn.disabled = false;
    btn.innerHTML = "Absen";
  }
}

// Listener koneksi
window.addEventListener("offline", () => {
  alert("⚠️ Koneksi internet hilang. Halaman akan di-refresh ketika online kembali.");
});
window.addEventListener("online", () => {
  location.reload();
});

// Uppercase kode
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
});
