document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("search");
  const resultList = document.getElementById("result-list");
  const submitBtn = document.getElementById("submit-btn");
  const status = document.getElementById("status");
  const weeklyCodeInput = document.getElementById("weekly-code");

  let selectedName = "";

  // 🔍 Cari Nama dari Master Data
  searchInput.addEventListener("input", async () => {
    const query = searchInput.value.trim();
    resultList.innerHTML = "";

    if (query.length === 0) return;

    const res = await fetch(`/search?name=${encodeURIComponent(query)}`);
    const names = await res.json();

    names.forEach(name => {
      const li = document.createElement("li");
      li.textContent = name;
      li.addEventListener("click", () => {
        searchInput.value = name;
        selectedName = name;
        resultList.innerHTML = "";
      });
      resultList.appendChild(li);
    });
  });

  // 📝 Submit Absensi
  submitBtn.addEventListener("click", async () => {
    if (!selectedName) {
      status.textContent = "Pilih nama Anda dulu.";
      return;
    }

    // 🚀 Aktifkan Loading State
    submitBtn.disabled = true;
    searchInput.disabled = true;
    submitBtn.innerHTML = "⏳ Loading..."; // bisa juga pakai spinner CSS
    status.textContent = "Sedang memproses...";

    const code = weeklyCodeInput.value.trim();

    try {
      const res = await fetch("/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: selectedName, code })
      });
      const result = await res.json();

      if (result.success) {
        status.textContent = "✅ Absensi berhasil!";
      } else {
        status.textContent = "❌ " + (result.message || "Gagal absen.");
      }
    } catch (err) {
      status.textContent = "⚠️ Error: " + err.message;
    } finally {
      // 🔄 Kembalikan normal
      submitBtn.disabled = false;
      searchInput.disabled = false;
      submitBtn.innerHTML = "Absen";
    }
  });
});
