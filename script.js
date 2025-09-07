// Ganti ini dengan URL Worker kamu
const workerUrl = "https://lingering-bush-bef7.richieleonardo20.workers.dev/";

// URL Google Apps Script (ABSENSI)
const scriptUrl = "https://script.google.com/macros/s/AKfycby-BiWhVHyBHf0K_Jo-cK094Dsw-fqbt_uTj0ECL7AQzOC0YkO-HGr8PjyFtUIEDgSN/exec";

const nameListElement = document.getElementById("nameList");
const messageElement = document.getElementById("message");
const codeElement = document.getElementById("code");

let names = [];

// Ambil data dari Google Sheet via Worker
fetch(workerUrl + encodeURIComponent(scriptUrl))
  .then(res => res.json())
  .then(data => {
    console.log("Data dari Sheet:", data);

    // tampilkan kode mingguan
    codeElement.textContent = data.weeklyCode || "Belum ada";

    // ambil daftar nama
    names = data.names || [];
    renderNameList(names);
  })
  .catch(err => {
    console.error("Error:", err);
    codeElement.textContent = "Gagal memuat";
  });

// Render daftar nama
function renderNameList(list) {
  nameListElement.innerHTML = "";
  list.forEach(nama => {
    const li = document.createElement("li");
    li.textContent = nama;
    li.onclick = () => markAttendance(nama);
    nameListElement.appendChild(li);
  });
}

// Search filter
function filterNames() {
  const input = document.getElementById("searchInput").value.toLowerCase();
  const filtered = names.filter(n => n.toLowerCase().includes(input));
  renderNameList(filtered);
}

// Kirim absensi
function markAttendance(nama) {
  fetch(workerUrl + encodeURIComponent(scriptUrl), {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ name: nama })
  })
    .then(res => res.json())
    .then(result => {
      messageElement.textContent = `Absensi untuk ${nama} berhasil dicatat!`;
      messageElement.style.color = "green";
    })
    .catch(err => {
      console.error(err);
      messageElement.textContent = "Gagal mencatat absensi.";
      messageElement.style.color = "red";
    });
}
