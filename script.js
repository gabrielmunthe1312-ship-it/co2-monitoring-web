// === Konfigurasi Mode ===
let useDummyData = true; // Akan berubah otomatis ke false jika Supabase terhubung

// === Data Dummy Default ===
const dummyData = [
  { waktu: "09/02/2026 00:30:00", co2: 750 },
  { waktu: "09/02/2026 00:31:00", co2: 820 },
  { waktu: "09/02/2026 00:32:00", co2: 950 },
  { waktu: "09/02/2026 00:33:00", co2: 1100 },
  { waktu: "09/02/2026 00:34:00", co2: 1250 },
  { waktu: "09/02/2026 00:35:00", co2: 980 },
  { waktu: "09/02/2026 00:36:00", co2: 870 },
  { waktu: "10/02/2026 00:30:00", co2: 2050 },
];

let data = [...dummyData];
let filteredTableData = [...data];

// === Helper Parse Tanggal DD/MM/YYYY HH:mm:ss ===
function parseDateStr(dateStr) {
  if (!dateStr) return new Date();
  if (typeof dateStr !== "string") return new Date(dateStr);
  
  if (dateStr.includes("/")) {
    const parts = dateStr.split(" ");
    const dateParts = parts[0].split("/");
    const day = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1;
    const year = parseInt(dateParts[2], 10);
    
    let hours = 0, minutes = 0, seconds = 0;
    if (parts[1]) {
      const timeParts = parts[1].split(":");
      hours = parseInt(timeParts[0], 10) || 0;
      minutes = parseInt(timeParts[1], 10) || 0;
      seconds = parseInt(timeParts[2], 10) || 0;
    }
    return new Date(year, month, day, hours, minutes, seconds);
  }
  return new Date(dateStr);
}

// === Color Helper ===
function colorPoint(value) {
  if (value >= 2000) return "#f87171"; // Merah (Tinggi)
  if (value >= 1000) return "#facc15"; // Kuning (Sedang)
  return "#4ade80"; // Hijau (Aman)
}

function getStatusBadge(value) {
  if (value >= 2000) return { text: "Berbahaya", class: "status tinggi" };
  if (value >= 1000) return { text: "Sedang", class: "status sedang" };
  return { text: "Aman", class: "status aman" };
}

// === Inisialisasi Chart ===
const ctx = document.getElementById("co2Chart").getContext("2d");
const co2Chart = new Chart(ctx, {
  type: "line",
  data: {
    labels: data.map(item => item.waktu),
    datasets: [{
      label: "Kadar CO₂ (ppm)",
      data: data.map(item => item.co2),
      borderColor: "#38bdf8",
      backgroundColor: "rgba(56, 189, 248, 0.15)",
      fill: true,
      tension: 0.3,
      pointRadius: 5,
      pointHoverRadius: 7,
      pointBackgroundColor: data.map(item => colorPoint(item.co2)),
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: { display: false },
      legend: { display: false },
      zoom: {
        zoom: {
          wheel: { enabled: true },
          pinch: { enabled: true },
          mode: 'x',
        },
        pan: {
          enabled: true,
          mode: 'x',
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "rgba(255, 255, 255, 0.05)" },
        ticks: { color: "#94a3b8" },
        title: { display: true, text: "ppm", color: "#94a3b8" }
      },
      x: {
        grid: { color: "rgba(255, 255, 255, 0.05)" },
        ticks: { color: "#94a3b8" },
        title: { display: true, text: "Waktu", color: "#94a3b8" }
      }
    }
  }
});

// === Render Table ===
function renderTable(dataset) {
  const tableBody = document.getElementById("dataTable");
  const rowCount = document.getElementById("tableRowCount");
  
  if (rowCount) rowCount.textContent = dataset.length;
  
  if (dataset.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: var(--text-muted);">Tidak ada data ditemukan</td></tr>`;
    return;
  }
  
  tableBody.innerHTML = dataset.map(item => {
    const badge = getStatusBadge(item.co2);
    return `
      <tr>
        <td>${item.waktu}</td>
        <td><strong>${item.co2} ppm</strong></td>
        <td><span class="${badge.class}">${badge.text}</span></td>
      </tr>
    `;
  }).join("");
}

// === Status Metric Header ===
function updateStatus() {
  if (!data || data.length === 0) return;
  const latestItem = data[data.length - 1];
  const latestValueEl = document.getElementById("latestValue");
  const statusLabelEl = document.getElementById("statusLabel");
  const connectionInfoEl = document.getElementById("connectionInfo");

  if (latestValueEl) latestValueEl.textContent = `${latestItem.co2} ppm`;
  
  if (statusLabelEl) {
    const badge = getStatusBadge(latestItem.co2);
    statusLabelEl.textContent = badge.text;
    statusLabelEl.className = badge.class;
  }
  
  if (connectionInfoEl) {
    const modeText = useDummyData ? "Dummy Mode" : "Supabase Realtime Database";
    connectionInfoEl.textContent = `${latestItem.waktu} | Koneksi: ${modeText}`;
  }
}

// === Update Chart ===
function updateChart(dataset) {
  co2Chart.data.labels = dataset.map(item => item.waktu);
  co2Chart.data.datasets[0].data = dataset.map(item => item.co2);
  co2Chart.data.datasets[0].pointBackgroundColor = dataset.map(item => colorPoint(item.co2));
  co2Chart.update();
}

// === Filter Grafik Dashboard ===
function applyTimeFilter() {
  const startInput = document.getElementById("startTime").value;
  const endInput = document.getElementById("endTime").value;
  
  if (!startInput || !endInput) {
    alert("Silakan isi kedua input waktu (Dari & Sampai).");
    return;
  }

  const start = new Date(startInput);
  const end = new Date(endInput);
  
  const filtered = data.filter(item => {
    const waktuObj = parseDateStr(item.waktu);
    return waktuObj >= start && waktuObj <= end;
  });
  
  updateChart(filtered);
}

function resetGraph() {
  updateChart(data);
  document.getElementById("startTime").value = "";
  document.getElementById("endTime").value = "";
}

// === Filter Form Tabel Historis ===
const filterForm = document.getElementById("filterForm");
if (filterForm) {
  filterForm.addEventListener("submit", function(e) {
    e.preventDefault();
    const startDateVal = document.getElementById("startDate").value;
    const endDateVal = document.getElementById("endDate").value;
    
    if (!startDateVal || !endDateVal) return;
    
    const startDate = new Date(startDateVal);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(endDateVal);
    endDate.setHours(23, 59, 59, 999);
    
    filteredTableData = data.filter(item => {
      const itemDate = parseDateStr(item.waktu);
      return itemDate >= startDate && itemDate <= endDate;
    });
    
    renderTable(filteredTableData);
  });
}

function resetTableFilter() {
  document.getElementById("startDate").value = "";
  document.getElementById("endDate").value = "";
  filteredTableData = [...data];
  renderTable(filteredTableData);
}

// === Download CSV ===
const downloadBtn = document.getElementById("downloadBtn");
if (downloadBtn) {
  downloadBtn.addEventListener("click", function() {
    if (!filteredTableData || filteredTableData.length === 0) {
      alert("Tidak ada data untuk diunduh.");
      return;
    }
    
    let csvContent = "data:text/csv;charset=utf-8,Waktu,CO2_ppm,Status\n";
    filteredTableData.forEach(row => {
      const status = getStatusBadge(row.co2).text;
      csvContent += `"${row.waktu}",${row.co2},"${status}"\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `co2_monitoring_data_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
}

// === Navigasi Sidebar ===
function showSection(sectionId) {
  document.querySelectorAll(".content-section").forEach(sec => sec.classList.remove("active"));
  document.querySelectorAll(".sidebar nav button").forEach(btn => btn.classList.remove("active"));

  const targetSection = document.getElementById(sectionId);
  if (targetSection) targetSection.classList.add("active");
  
  const navBtn = sectionId === "dashboard" ? document.getElementById("btnNavDashboard") : document.getElementById("btnNavHistoris");
  if (navBtn) navBtn.classList.add("active");
}

// === Inisialisasi Supabase Fetch & Realtime ===
async function initSupabaseData() {
  if (!supabaseClient) {
    console.log("Supabase Client belum dikonfigurasi. Menggunakan Dummy Data.");
    useDummyData = true;
    updateAllViews();
    return;
  }

  try {
    const { data: fetchedData, error } = await supabaseClient
      .from("co2_data")
      .select("*")
      .order("waktu", { ascending: true });

    if (error) throw error;

    if (fetchedData && fetchedData.length > 0) {
      useDummyData = false;
      data = fetchedData;
      filteredTableData = [...data];
      updateAllViews();
      console.log("Data berhasil dimuat dari Supabase.");

      // Setup Realtime Subscription
      supabaseClient
        .channel("co2_realtime")
        .on("postgres_changes", { event: "*", schema: "public", table: "co2_data" }, (payload) => {
          console.log("Perubahan data Supabase diterima:", payload);
          if (payload.eventType === "INSERT") {
            data.push(payload.new);
            filteredTableData = [...data];
            updateAllViews();
          }
        })
        .subscribe();
    } else {
      console.warn("Tabel co2_data di Supabase kosong. Beralih ke Dummy Mode.");
      useDummyData = true;
      updateAllViews();
    }
  } catch (err) {
    console.warn("Koneksi Supabase belum aktif atau URL belum dikonfigurasi. Menggunakan Dummy Data:", err.message);
    useDummyData = true;
    updateAllViews();
  }
}

function updateAllViews() {
  updateChart(data);
  renderTable(filteredTableData);
  updateStatus();
}

// Initial Load
initSupabaseData();
