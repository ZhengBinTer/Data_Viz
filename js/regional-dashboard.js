// Regional Dashboard Controller
document.addEventListener("DOMContentLoaded", async () => {
  console.log("Regional Dashboard loaded")

  // Initialize data loader
  if (window.dataLoader) {
    try {
      await window.dataLoader.loadData()
      initializeRegionalCharts()
      setupRegionalFilters()
    } catch (error) {
      console.error("Error loading data:", error)
    }
  }

  function initializeRegionalCharts() {
    // Initialize all regional charts
    console.log("Initializing regional charts...")

    // Students will implement these chart classes:
    // window.monthlyTrendChart = new MonthlyTrendChart("monthly-sales-chart")
    // window.countyMapChart = new CountyMapChart("county-map-chart")
    // window.citySalesChart = new CitySalesChart("city-sales-chart")
    // window.topStoresChart = new TopStoresChart("top-stores-chart")
  }

  function setupRegionalFilters() {
    // County filter
    document.getElementById("county-filter")?.addEventListener("change", (e) => {
      console.log("County filter changed:", e.target.value)
      updateRegionalCharts()
    })

    // Year filter
    document.getElementById("year-filter")?.addEventListener("change", (e) => {
      console.log("Year filter changed:", e.target.value)
      updateRegionalCharts()
    })

    // Reset filters
    document.getElementById("reset-filters")?.addEventListener("click", () => {
      document.getElementById("county-filter").value = "all"
      document.getElementById("year-filter").value = "all"
      updateRegionalCharts()
    })
  }

  function updateRegionalCharts() {
    // Update all charts with filtered data
    console.log("Updating regional charts with filters...")

    // Students will implement chart updates:
    // if (window.monthlyTrendChart) window.monthlyTrendChart.update(filteredData)
    // if (window.countyMapChart) window.countyMapChart.update(filteredData)
    // if (window.citySalesChart) window.citySalesChart.update(filteredData)
    // if (window.topStoresChart) window.topStoresChart.update(filteredData)
  }
})
