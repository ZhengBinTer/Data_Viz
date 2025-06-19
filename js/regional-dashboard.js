// Regional Dashboard - Direct integration with existing chart implementations
document.addEventListener("DOMContentLoaded", async () => {
  console.log("🏠 Loading Regional Dashboard - Direct Chart Integration...")

  try {
    // Load data once for all charts
    const csvData = await d3.csv("data/small_dataset.csv")
    console.log(`✅ Loaded ${csvData.length} records for dashboard`)

    // Store data globally for all charts to access
    window.dashboardData = csvData

    // Setup dashboard-specific filters first
    setupDashboardFilters(csvData)

    // Initialize all charts directly
    await initializeDashboardCharts()

    console.log("✅ Regional Dashboard fully loaded!")
  } catch (error) {
    console.error("❌ Error loading dashboard:", error)
    showDashboardError()
  }
})

// Initialize all dashboard charts by directly calling existing implementations
async function initializeDashboardCharts() {
  console.log("🎨 Initializing dashboard charts directly...")

  // Remove all placeholders
  d3.selectAll(".chart-placeholder").remove()

  // Initialize each chart directly using their existing logic
  await initMonthlySalesDashboard()
  await initGeographicDashboard()
  await initCitySalesDashboard()
  await initTopStoresDashboard()
}

// Direct Monthly Sales Chart Integration
async function initMonthlySalesDashboard() {
  console.log("📈 Initializing Monthly Sales directly...")

  const container = d3.select("#monthly-sales-chart")
  container.selectAll("*").remove() // Clear container

  const data = window.dashboardData
  const d3 = window.d3

  // Parse and clean data (from monthly-sales.js logic)
  data.forEach((d) => {
    d.parsedDate = d3.timeParse("%Y-%m-%d")(d.Date)
    d.sales = +d["Sale (Dollars)"]
    d.category = d["Category Name"]
    d.county = d.County

    if (d.parsedDate) {
      d.month = new Date(d.parsedDate.getFullYear(), d.parsedDate.getMonth(), 1)
    }
  })

  // Filter valid data
  const validData = data.filter((d) => d.parsedDate && d.sales > 0 && d.category)

  // Get top 5 categories for dashboard
  const salesByCategory = d3.rollup(
    validData,
    (v) => d3.sum(v, (d) => d.sales),
    (d) => d.category,
  )

  const top5Categories = Array.from(salesByCategory.entries())
    .sort((a, b) => d3.descending(a[1], b[1]))
    .slice(0, 5)
    .map((d) => d[0])

  // Filter data to top 5 categories
  const top5Data = validData.filter((d) => top5Categories.includes(d.category))

  // Group by category and month
  const categoryMonthData = d3.rollup(
    top5Data,
    (v) => d3.sum(v, (d) => d.sales),
    (d) => d.category,
    (d) => d3.timeFormat("%Y-%m")(d.month),
  )

  // Convert to array format
  const categoryData = Array.from(categoryMonthData, ([category, monthMap]) => ({
    category,
    values: Array.from(monthMap, ([monthStr, sales]) => ({
      month: new Date(monthStr + "-01"),
      sales: sales,
    })).sort((a, b) => d3.ascending(a.month, b.month)),
  }))

  // Dashboard dimensions
  const margin = { top: 40, right: 20, bottom: 60, left: 80 }
  const width = 400 - margin.left - margin.right
  const height = 250 - margin.top - margin.bottom

  // Create SVG
  const svg = container
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)

  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`)

  // Scales
  const allMonths = Array.from(new Set(top5Data.map((d) => d.month))).sort()
  const x = d3.scaleTime().domain(d3.extent(allMonths)).range([0, width])

  const maxSales = d3.max(categoryData, (c) => d3.max(c.values, (v) => v.sales))
  const y = d3
    .scaleLinear()
    .domain([0, maxSales * 1.1])
    .nice()
    .range([height, 0])

  // Color scale
  const color = d3.scaleOrdinal().domain(top5Categories).range(["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd"])

  // Add axes
  g.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%b")).ticks(6))

  g.append("g").call(d3.axisLeft(y).tickFormat(d3.format("$.1s")).ticks(5))

  // Line generator
  const line = d3
    .line()
    .x((d) => x(d.month))
    .y((d) => y(d.sales))
    .curve(d3.curveMonotoneX)

  // Add lines
  categoryData.forEach((cat) => {
    g.append("path")
      .datum(cat.values)
      .attr("fill", "none")
      .attr("stroke", color(cat.category))
      .attr("stroke-width", 2)
      .attr("d", line)

    // Add dots
    g.selectAll(`.dot-${cat.category.replace(/[^a-zA-Z0-9]/g, "")}`)
      .data(cat.values)
      .enter()
      .append("circle")
      .attr("cx", (d) => x(d.month))
      .attr("cy", (d) => y(d.sales))
      .attr("r", 3)
      .attr("fill", color(cat.category))
  })

  // Add title
  g.append("text")
    .attr("x", width / 2)
    .attr("y", -20)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .text("Monthly Sales Trend (Top 5 Categories)")
}

// Direct Geographic Chart Integration
async function initGeographicDashboard() {
  console.log("🗺️ Initializing Geographic Chart directly...")

  const container = d3.select("#geographic-chart")
  container.selectAll("*").remove()

  // Simple placeholder for geographic chart in dashboard
  container
    .append("div")
    .style("padding", "20px")
    .style("text-align", "center")
    .style("color", "#666")
    .html(`
      <i class="fas fa-map" style="font-size: 3rem; margin-bottom: 10px; color: #007bff;"></i>
      <p><strong>Iowa Counties Map</strong></p>
      <p>Geographic visualization available in full view</p>
      <button onclick="window.location.href='geographic.html'" style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
        View Full Map
      </button>
    `)
}

// Direct City Sales Chart Integration
async function initCitySalesDashboard() {
  console.log("🏙️ Initializing City Sales directly...")

  const container = d3.select("#city-sales-chart")
  container.selectAll("*").remove()

  const data = window.dashboardData

  // Process data - aggregate sales by city
  const citySales = d3
    .rollups(
      data,
      (v) =>
        d3.sum(v, (d) => {
          const salesValue = Number.parseFloat(d["Sale (Dollars)"])
          return isNaN(salesValue) ? 0 : salesValue
        }),
      (d) => d["City"],
    )
    .map(([city, sales]) => ({ city, sales }))
    .filter((d) => d.city && d.sales > 0)
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 8) // Top 8 for dashboard

  if (citySales.length === 0) {
    container
      .append("div")
      .style("padding", "20px")
      .style("text-align", "center")
      .style("color", "#dc3545")
      .html(`<p>No city sales data available</p>`)
    return
  }

  // Dashboard dimensions
  const margin = { top: 40, right: 30, bottom: 60, left: 120 }
  const width = 400 - margin.left - margin.right
  const height = 250 - margin.top - margin.bottom

  // Create SVG
  const svg = container
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`)

  // Scales
  const xScale = d3
    .scaleLinear()
    .domain([0, d3.max(citySales, (d) => d.sales) * 1.1])
    .range([0, width])

  const yScale = d3
    .scaleBand()
    .domain(citySales.map((d) => d.city))
    .range([0, height])
    .paddingInner(0.1)

  // Add axes
  svg
    .append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScale).tickFormat(d3.format(".2s")))

  svg.append("g").call(d3.axisLeft(yScale))

  // Add bars
  svg
    .selectAll(".bar")
    .data(citySales)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("y", (d) => yScale(d.city))
    .attr("height", yScale.bandwidth())
    .attr("x", 0)
    .attr("width", (d) => xScale(d.sales))
    .attr("fill", "#E57373")
    .attr("rx", 3)

  // Add title
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", -20)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .text("Top Cities by Sales")
}

// Direct Top Stores Chart Integration
async function initTopStoresDashboard() {
  console.log("🏪 Initializing Top Stores directly...")

  const container = d3.select("#top-stores-chart")
  container.selectAll("*").remove()

  const data = window.dashboardData

  // Process data - aggregate sales by store
  const validData = data.filter((d) => d["Sale (Dollars)"] != null && !isNaN(+d["Sale (Dollars)"]))

  const salesByStore = d3
    .rollups(
      validData,
      (v) => d3.sum(v, (d) => +d["Sale (Dollars)"]),
      (d) => d["Store Name"],
    )
    .map(([storeName, totalSales]) => ({ storeName, totalSales }))
    .sort((a, b) => b.totalSales - a.totalSales)
    .slice(0, 8) // Top 8 for dashboard

  if (salesByStore.length === 0) {
    container
      .append("div")
      .style("padding", "20px")
      .style("text-align", "center")
      .style("color", "#dc3545")
      .html(`<p>No store sales data available</p>`)
    return
  }

  // Dashboard dimensions
  const margin = { top: 40, right: 30, bottom: 80, left: 60 }
  const width = 400 - margin.left - margin.right
  const height = 250 - margin.top - margin.bottom

  // Create SVG
  const svg = container
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`)

  // Scales
  const xScale = d3
    .scaleBand()
    .domain(salesByStore.map((d) => d.storeName))
    .range([0, width])
    .paddingInner(0.1)

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(salesByStore, (d) => d.totalSales) * 1.1])
    .range([height, 0])

  // Add axes
  svg
    .append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScale))
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-45)")
    .style("font-size", "10px")

  svg.append("g").call(d3.axisLeft(yScale).tickFormat(d3.format(".2s")))

  // Add bars
  svg
    .selectAll(".bar")
    .data(salesByStore)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", (d) => xScale(d.storeName))
    .attr("width", xScale.bandwidth())
    .attr("y", (d) => yScale(d.totalSales))
    .attr("height", (d) => height - yScale(d.totalSales))
    .attr("fill", "#ff6b35")
    .attr("rx", 3)

  // Add title
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", -20)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .text("Top Stores by Sales")
}

// Setup dashboard-specific filters
function setupDashboardFilters(data) {
  console.log("🔧 Setting up dashboard filters...")

  // Populate county filter
  const counties = [...new Set(data.map((d) => d.County))].filter((c) => c).sort()
  const countySelect = d3.select("#county-filter")

  countySelect.selectAll("option.dynamic").remove()
  countySelect
    .selectAll("option.dynamic")
    .data(counties)
    .enter()
    .append("option")
    .attr("class", "dynamic")
    .attr("value", (d) => d)
    .text((d) => d)

  // Populate month filter
  const months = [
    ...new Set(
      data.map((d) => {
        const date = new Date(d.Date)
        return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0")
      }),
    ),
  ]
    .filter((m) => m && m !== "NaN-NaN")
    .sort()

  const monthSelect = d3.select("#month-filter")
  monthSelect.selectAll("option.dynamic").remove()
  monthSelect
    .selectAll("option.dynamic")
    .data(months)
    .enter()
    .append("option")
    .attr("class", "dynamic")
    .attr("value", (d) => d)
    .text((d) => {
      const [year, month] = d.split("-")
      const date = new Date(year, Number.parseInt(month) - 1, 1)
      return date.toLocaleString("en-US", { month: "long", year: "numeric" })
    })

  // Filter event listeners
  document.getElementById("county-filter").addEventListener("change", handleFilterChange)
  document.getElementById("year-filter").addEventListener("change", handleFilterChange)
  document.getElementById("month-filter").addEventListener("change", handleFilterChange)
  document.getElementById("sort-order-filter").addEventListener("change", handleFilterChange)

  document.getElementById("reset-filters").addEventListener("click", () => {
    document.getElementById("county-filter").value = "all"
    document.getElementById("year-filter").value = "all"
    document.getElementById("month-filter").value = "all"
    document.getElementById("sort-order-filter").value = "desc"

    // Reset to original data
    window.dashboardData = data
    initializeDashboardCharts()
  })

  console.log("✅ Dashboard filters configured")
}

// Handle filter changes
function handleFilterChange() {
  const selectedCounty = document.getElementById("county-filter").value
  const selectedYear = document.getElementById("year-filter").value
  const selectedMonth = document.getElementById("month-filter").value

  let filteredData = [...window.dashboardData] // Create copy

  // Apply county filter
  if (selectedCounty !== "all") {
    filteredData = filteredData.filter((d) => d.County === selectedCounty)
  }

  // Apply year filter
  if (selectedYear !== "all") {
    filteredData = filteredData.filter((d) => new Date(d.Date).getFullYear() === Number.parseInt(selectedYear))
  }

  // Apply month filter
  if (selectedMonth !== "all") {
    filteredData = filteredData.filter((d) => {
      const date = new Date(d.Date)
      const monthStr = date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0")
      return monthStr === selectedMonth
    })
  }

  console.log(`🔍 Filtered data: ${filteredData.length} records`)

  // Update global data and reinitialize charts
  window.dashboardData = filteredData
  initializeDashboardCharts()
}

// Show error message if dashboard fails to load
function showDashboardError() {
  const containers = ["#monthly-sales-chart", "#geographic-chart", "#city-sales-chart", "#top-stores-chart"]

  containers.forEach((containerId) => {
    d3.select(containerId)
      .append("div")
      .style("padding", "20px")
      .style("text-align", "center")
      .style("color", "#dc3545")
      .html(`
        <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 10px;"></i>
        <p><strong>Error loading chart</strong></p>
        <p>Please check data availability</p>
      `)
  })
}

// Export dashboard functions for external use
window.dashboardAPI = {
  refresh: window.refreshDashboard,
  initCharts: initializeDashboardCharts,
  setupFilters: setupDashboardFilters,
}
