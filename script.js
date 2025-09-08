const API_URL = "https://script.google.com/macros/s/AKfycbxMgYIklAMmLvFaKGxqTETTp8_hwGw0EaW4CE18a4lsRWDUHFgtKrQNR2haAF72A2OP/exec";

// 🔹 Ambil data Master
function loadMasterData() {
  fetch(API_URL, { method: "GET", mode: "cors" })
    .then(res => res.json())
    .then(data => {
      console.log("Master data loaded:", data.master, "Kode:", data.weeklyCode);
    })
    .catch(err => {
      console.error("Error load master:", err);
    });
}

// 🔹 Submit Absensi
function submitAbsensi() {
  const nama = document.getElementById("nama").value;
  const kode = document.getElementById("kode").value;

  fetch(API_URL, {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ nama, kode })
  })
  .then(res => res.json())
  .then(data => {
    console.log("Response absensi:", data);
    alert(data.message);
  })
  .catch(err => {
    console.error("Error submit:", err);
    alert("Gagal absen, coba lagi.");
  });
}

// Jalankan saat halaman load
window.onload = loadMasterData;
