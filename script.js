// URL Worker kamu
const workerUrl = "https://absensi-proxy.namaakun.workers.dev/?url=";

// URL Google Apps Script kamu
const scriptUrl = "https://script.google.com/macros/s/AKfycby-BiWhVHyBHf0K_Jo-cK094Dsw-fqbt_uTj0ECL7AQzOC0YkO-HGr8PjyFtUIEDgSN/exec";

// Fetch lewat Worker proxy
fetch(workerUrl + encodeURIComponent(scriptUrl), {
  method: "GET"
})
  .then(res => res.json())
  .then(data => {
    console.log("Data dari Google Sheets:", data);
    // tampilkan ke halaman di sini
  })
  .catch(err => console.error("Error:", err));
