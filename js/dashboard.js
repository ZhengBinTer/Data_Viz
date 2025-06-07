import * as d3 from "d3"

class Dashboard {
  constructor() {
    this.regionalCharts = {}
    this.productCharts = {}
    this.currentDashboard = "regional"
    this.init()
  }

  async init() {
    try {
      // Load data
      await window.dataLoader.loadData()

      // Initialize charts (you'll implement these)
      this.initializeRegionalCharts()
      this.initializeProductCharts()

      // Set up event listeners
      this.setupEventListeners()

      // Initial render
      this.switchDashboard("regional")
    } catch (error) {
      console.error("Error initializing dashboard:", error)
    }
  }

  initializeRegionalCharts() {
    // Initialize regional dashboard charts
    // You'll implement these chart classes
    /*
    this.regionalCharts.monthlyTrend = new MonthlyTrendChart("monthly-trend-chart")
    this.regionalCharts.countyMap = new CountyMapChart("county-map-chart")
    this.regionalCharts.citySales = new CitySalesChart("city-sales-chart")
    this.regionalCharts.topStores = new TopStoresChart("top-stores-chart")
    */

    console.log("Regional charts initialized")
  }

  initializeProductCharts() {
    // Initialize product dashboard charts
    // You'll implement these chart classes
    /*
    this.productCharts.topCategories = new TopCategoriesChart("top-categories-chart")
    this.productCharts.topBrands = new TopBrandsChart("top-brands-chart")
    this.productCharts.bottleSize = new BottleSizeChart("bottle-size-chart")
    this.productCharts.priceVolume = new PriceVolumeChart("price-volume-chart")
    */

    console.log("Product charts initialized")
  }

  setupEventListeners() {
    // Navigation buttons
    document.getElementById("nav-regional").addEventListener("click", () => {
      this.switchDashboard("regional")
    })

    document.getElementById("nav-product").addEventListener("click", () => {
      this.switchDashboard("product")
    })

    // Regional filters
    document.getElementById("county-filter").addEventListener("change", (e) => {
      window.dataLoader.setRegionalFilter("county", e.target.value)
      // Update dashboard 1 charts based on county filter
      this.updateRegionalCharts()
    })

    document.getElementById("year-filter").addEventListener("change", (e) => {
      window.dataLoader.setRegionalFilter("year", e.target.value)
    })

    document.getElementById("reset-regional-filters").addEventListener("click", () => {
      window.dataLoader.resetRegionalFilters()
    })

    // Product filters
    document.getElementById("category-filter").addEventListener("change", (e) => {
      window.dataLoader.setProductFilter("category", e.target.value)
      // Update dashboard 2 charts based on category filter
      this.updateProductCharts()
    })

    document.getElementById("price-range-filter").addEventListener("change", (e) => {
      window.dataLoader.setProductFilter("priceRange", e.target.value)
    })

    document.getElementById("reset-product-filters").addEventListener("click", () => {
      window.dataLoader.resetProductFilters()
    })

    // Month filter for Dashboard 2
    document.getElementById("month-filter").addEventListener("change", (e) => {
      console.log("Month filter changed:", e.target.value)
      // Update dashboard 2 charts based on month filter
      this.updateProductCharts()
    })
  }

  switchDashboard(dashboard) {
    this.currentDashboard = dashboard

    // Update navigation
    document.querySelectorAll(".nav-btn").forEach((btn) => btn.classList.remove("active"))
    document.getElementById(`nav-${dashboard}`).classList.add("active")

    // Update dashboard content
    document.querySelectorAll(".dashboard-content").forEach((content) => content.classList.remove("active"))
    document.getElementById(`${dashboard}-dashboard`).classList.add("active")

    // Update data loader
    window.dataLoader.switchDashboard(dashboard)

    // Update charts
    this.updateCurrentDashboard()
  }

  updateCurrentDashboard() {
    if (this.currentDashboard === "regional") {
      this.updateRegionalCharts()
      this.updateRegionalStats()
    } else {
      this.updateProductCharts()
      this.updateProductStats()
    }
  }

  updateRegionalCharts() {
    const data = window.dataLoader.getFilteredData()

    // Update each regional chart
    Object.values(this.regionalCharts).forEach((chart) => {
      if (chart && typeof chart.update === "function") {
        chart.update(data)
      }
    })
  }

  updateProductCharts() {
    const data = window.dataLoader.getFilteredData()

    // Update each product chart
    Object.values(this.productCharts).forEach((chart) => {
      if (chart && typeof chart.update === "function") {
        chart.update(data)
      }
    })
  }

  updateRegionalStats() {
    const data = window.dataLoader.getFilteredData()

    const totalSales = d3.sum(data, (d) => d.sale_dollars)
    const activeCounties = new Set(data.map((d) => d.county)).size
    const activeStores = new Set(data.map((d) => d.store_name)).size

    // Find top county
    const countySales = d3.rollup(
      data,
      (v) => d3.sum(v, (d) => d.sale_dollars),
      (d) => d.county,
    )
    const topCounty = Array.from(countySales.entries()).sort((a, b) => b[1] - a[1])[0]

    document.getElementById("regional-total-sales").textContent = d3.format("$,.0f")(totalSales)
    document.getElementById("active-counties").textContent = d3.format(",")(activeCounties)
    document.getElementById("top-county").textContent = topCounty ? topCounty[0] : "-"
    document.getElementById("regional-active-stores").textContent = d3.format(",")(activeStores)
  }

  updateProductStats() {
    const data = window.dataLoader.getFilteredData()

    const totalSales = d3.sum(data, (d) => d.sale_dollars)
    const uniqueProducts = new Set(data.map((d) => d.item_description)).size
    const avgPrice = d3.mean(data, (d) => d.state_bottle_retail)

    // Find top category
    const categorySales = d3.rollup(
      data,
      (v) => d3.sum(v, (d) => d.sale_dollars),
      (d) => d.category_name,
    )
    const topCategory = Array.from(categorySales.entries()).sort((a, b) => b[1] - a[1])[0]

    document.getElementById("product-total-sales").textContent = d3.format("$,.0f")(totalSales)
    document.getElementById("unique-products").textContent = d3.format(",")(uniqueProducts)
    document.getElementById("top-category").textContent = topCategory ? topCategory[0] : "-"
    document.getElementById("product-avg-price").textContent = d3.format("$,.2f")(avgPrice || 0)
  }
}

// Initialize dashboard when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("Dashboard loaded")
  window.dashboard = new Dashboard()
  initializeDashboardPreviews()
})

function initializeDashboardPreviews() {
  // You can add small preview charts here or just keep the SVG placeholders
  console.log("Dashboard previews initialized")
}
