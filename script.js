// Ganti URL ini dengan Web App URL kamu
const API_URL = "https://script.google.com/macros/s/AKfycby-BiWhVHyBHf0K_Jo-cK094Dsw-fqbt_uTj0ECL7AQzOC0YkO-HGr8PjyFtUIEDgSN/exec";

// Simulasi data nama (ini harusnya diambil dari Google Sheet juga)
// untuk demo kita hardcode dulu
const names = [
  "Andi Pratama",
  "Budi Santoso",
  "Citra Dewi",
  "Dewi Lestari",
  "Eko Nugroho"
];

function filterNames() {
  const input = document.getElementById("nameInput").value.toLowerCase();
  const suggestions = document.getElementById("suggestions");
  suggestions.innerHTML = "";

  if (!input) return;

  const filtered = names.filter(n => n.toLowerCase().includes(input));
  filtered.forEach(name => {
    const li = document.createElement("li");
    li.textContent = name;
    li.onclick = () => {
      document.getElementById("nameInput").value = name;
      suggestions.innerHTML = "";
    };
    suggestions.appendChild(li);
  });
}

function submitAttendance() {
  const name = document.getElementById("nameInput").value.trim();
  const code = document.getElementById("codeInput").value.trim();
  const statusText = document.getElementById("status");

  if (!name || !code) {
    statusText.textContent = "⚠️ Harap isi nama dan kode!";
    statusText.style.color = "red";
    return;
  }

  fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, code })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        statusText.textContent = "✅ " + data.message;
        statusText.style.color = "green";
      } else {
        statusText.textContent = "❌ " + data.message;
        statusText.style.color = "red";
      }
    })
    .catch(err => {
      console.error(err);
      statusText.textContent = "⚠️ Gagal koneksi ke server!";
      statusText.style.color = "red";
    });
}
