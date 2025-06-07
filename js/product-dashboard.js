// Product Dashboard Controller
document.addEventListener("DOMContentLoaded", async () => {
  console.log("Product Dashboard loaded")

  // Initialize data loader
  if (window.dataLoader) {
    try {
      await window.dataLoader.loadData()
      initializeProductCharts()
      setupProductFilters()
    } catch (error) {
      console.error("Error loading data:", error)
    }
  }

  function initializeProductCharts() {
    // Initialize all product charts
    console.log("Initializing product charts...")

    // Students will implement these chart classes:
    // window.topCategoriesChart = new TopCategoriesChart("top-categories-chart")
    // window.topBrandsChart = new TopBrandsChart("top-brands-chart")
    // window.bottleSizeChart = new BottleSizeChart("bottle-size-chart")
    // window.priceVolumeChart = new PriceVolumeChart("price-volume-chart")
  }

  function setupProductFilters() {
    // Month filter
    document.getElementById("month-filter")?.addEventListener("change", (e) => {
      console.log("Month filter changed:", e.target.value)
      updateProductCharts()
    })

    // Category filter
    document.getElementById("category-filter")?.addEventListener("change", (e) => {
      console.log("Category filter changed:", e.target.value)
      updateProductCharts()
    })

    // Reset filters
    document.getElementById("reset-filters")?.addEventListener("click", () => {
      document.getElementById("month-filter").value = "all"
      document.getElementById("category-filter").value = "all"
      updateProductCharts()
    })
  }

  function updateProductCharts() {
    // Update all charts with filtered data
    console.log("Updating product charts with filters...")

    // Students will implement chart updates:
    // if (window.topCategoriesChart) window.topCategoriesChart.update(filteredData)
    // if (window.topBrandsChart) window.topBrandsChart.update(filteredData)
    // if (window.bottleSizeChart) window.bottleSizeChart.update(filteredData)
    // if (window.priceVolumeChart) window.priceVolumeChart.update(filteredData)
  }
})
