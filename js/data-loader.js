import * as d3 from "d3"

class DataLoader {
  constructor() {
    this.rawData = []
    this.filteredData = []
    this.regionalFilters = {
      county: "all",
      year: "all",
    }
    this.productFilters = {
      category: "all",
      priceRange: "all",
    }
    this.currentDashboard = "regional"
  }

  async loadData() {
    try {
      console.log("Loading Iowa Liquor Sales data...")

      // Show loading indicator
      document.getElementById("loading-indicator").classList.remove("hidden")

      // Load the CSV file
      this.rawData = await d3.csv("data/Cleaned_Liquor_Sales.csv")

      console.log(`Loaded ${this.rawData.length} records`)

      this.processData()
      this.populateFilters()
      this.filteredData = [...this.rawData]

      // Hide loading indicator
      document.getElementById("loading-indicator").classList.add("hidden")

      return this.rawData
    } catch (error) {
      console.error("Error loading data:", error)
      document.getElementById("loading-indicator").innerHTML =
        '<div class="spinner"></div><p>Error loading data. Please check if Cleaned_Liquor_Sales.csv exists in the data folder.</p>'
      throw error
    }
  }

  processData() {
    // Process and clean the data
    this.rawData.forEach((d) => {
      // Convert date string to Date object
      d.date = new Date(d.date)

      // Convert numeric fields
      d.bottles_sold = +d.bottles_sold || 0
      d.sale_dollars = +d.sale_dollars || 0
      d.volume_sold_liters = +d.volume_sold_liters || 0
      d.state_bottle_cost = +d.state_bottle_cost || 0
      d.state_bottle_retail = +d.state_bottle_retail || 0

      // Add computed fields
      d.year = d.date.getFullYear()
      d.month = d.date.getMonth()
      d.profit_margin = d.sale_dollars - d.bottles_sold * d.state_bottle_cost

      // Clean text fields
      d.county = d.county ? d.county.trim() : "Unknown"
      d.city = d.city ? d.city.trim() : "Unknown"
      d.category_name = d.category_name ? d.category_name.trim() : "Unknown"
      d.item_description = d.item_description ? d.item_description.trim() : "Unknown"
      d.store_name = d.store_name ? d.store_name.trim() : "Unknown"
    })

    // Remove any invalid records
    this.rawData = this.rawData.filter((d) => d.sale_dollars > 0 && d.bottles_sold > 0 && !isNaN(d.date.getTime()))

    console.log(`Processed ${this.rawData.length} valid records`)
  }

  populateFilters() {
    // Populate regional filters
    this.populateCountyFilter()
    this.populateYearFilter()

    // Populate product filters
    this.populateCategoryFilter()
  }

  populateCountyFilter() {
    const counties = [...new Set(this.rawData.map((d) => d.county))].sort()
    const countySelect = document.getElementById("county-filter")

    // Clear existing options except "All Counties"
    countySelect.innerHTML = '<option value="all">All Counties</option>'

    counties.forEach((county) => {
      const option = document.createElement("option")
      option.value = county
      option.textContent = county
      countySelect.appendChild(option)
    })
  }

  populateYearFilter() {
    const years = [...new Set(this.rawData.map((d) => d.year))].sort()
    const yearSelect = document.getElementById("year-filter")

    // Clear existing options except "All Years"
    yearSelect.innerHTML = '<option value="all">All Years</option>'

    years.forEach((year) => {
      const option = document.createElement("option")
      option.value = year
      option.textContent = year
      yearSelect.appendChild(option)
    })
  }

  populateCategoryFilter() {
    const categories = [...new Set(this.rawData.map((d) => d.category_name))].sort()
    const categorySelect = document.getElementById("category-filter")

    // Clear existing options except "All Categories"
    categorySelect.innerHTML = '<option value="all">All Categories</option>'

    categories.forEach((category) => {
      const option = document.createElement("option")
      option.value = category
      option.textContent = category
      categorySelect.appendChild(option)
    })
  }

  applyFilters() {
    this.filteredData = this.rawData.filter((d) => {
      if (this.currentDashboard === "regional") {
        // Regional filters
        if (this.regionalFilters.county !== "all" && d.county !== this.regionalFilters.county) return false
        if (this.regionalFilters.year !== "all" && d.year !== +this.regionalFilters.year) return false
      } else {
        // Product filters
        if (this.productFilters.category !== "all" && d.category_name !== this.productFilters.category) return false

        if (this.productFilters.priceRange !== "all") {
          const price = d.state_bottle_retail
          switch (this.productFilters.priceRange) {
            case "0-20":
              if (price >= 20) return false
              break
            case "20-50":
              if (price < 20 || price >= 50) return false
              break
            case "50-100":
              if (price < 50 || price >= 100) return false
              break
            case "100+":
              if (price < 100) return false
              break
          }
        }
      }
      return true
    })

    // Trigger dashboard update
    if (window.dashboard) {
      window.dashboard.updateCurrentDashboard()
    }
  }

  setRegionalFilter(filterType, value) {
    this.regionalFilters[filterType] = value
    if (this.currentDashboard === "regional") {
      this.applyFilters()
    }
  }

  setProductFilter(filterType, value) {
    this.productFilters[filterType] = value
    if (this.currentDashboard === "product") {
      this.applyFilters()
    }
  }

  switchDashboard(dashboard) {
    this.currentDashboard = dashboard
    this.applyFilters()
  }

  getFilteredData() {
    return this.filteredData
  }

  resetRegionalFilters() {
    this.regionalFilters = {
      county: "all",
      year: "all",
    }

    // Reset UI
    document.getElementById("county-filter").value = "all"
    document.getElementById("year-filter").value = "all"

    if (this.currentDashboard === "regional") {
      this.applyFilters()
    }
  }

  resetProductFilters() {
    this.productFilters = {
      category: "all",
      priceRange: "all",
    }

    // Reset UI
    document.getElementById("category-filter").value = "all"
    document.getElementById("price-range-filter").value = "all"

    if (this.currentDashboard === "product") {
      this.applyFilters()
    }
  }
}

// Global data loader instance
window.dataLoader = new DataLoader()
