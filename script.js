document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("search");
  const resultList = document.getElementById("result-list");
  const submitBtn = document.getElementById("submit-btn");
  const status = document.getElementById("status");
  const weeklyCodeInput = document.getElementById("weekly-code");

  let masterData = [];
  let weeklyCode = "";

  // URL Web App GAS
  const SHEET_URL = "YOUR_WEBAPP_URL_HERE"; 

  // Ambil data dari Google Sheets
  fetch(SHEET_URL)
    .then((res) => res.json())
    .then((data) => {
      // Misalnya struktur: { master: ["Nama1","Nama2"], weeklyCode: "ABC123" }
      masterData = data.master || [];
      weeklyCode = data.weeklyCode || "";
      console.log("Master data loaded:", masterData);
      console.log("Weekly code loaded:", weeklyCode);
    })
    .catch((err) => console.error("Error loading sheet:", err));

  // Search bar
  searchInput.addEventListener("input", () => {
    const keyword = searchInput.value.toLowerCase();
    resultList.innerHTML = "";
    if (keyword.length > 0) {
      const filtered = masterData.filter((nama) =>
        nama.toLowerCase().includes(keyword)
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
    }
  });

  // Tombol submit
  submitBtn.addEventListener("click", () => {
    const nama = searchInput.value.trim();
    const inputCode = weeklyCodeInput.value.trim();

    if (!nama) {
      status.textContent = "Harap pilih nama.";
      status.style.color = "red";
      return;
    }

    if (inputCode !== weeklyCode) {
      status.textContent = "Kode mingguan salah!";
      status.style.color = "red";
      return;
    }

    status.textContent = `Absensi berhasil untuk ${nama}!`;
    status.style.color = "green";

    // Kirim ke Google Sheets (opsional kalau mau catat absen)
    fetch(SHEET_URL, {
      method: "POST",
      body: JSON.stringify({ nama: nama, kode: inputCode }),
    });
  });
});
