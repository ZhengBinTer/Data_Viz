// Student 6: Price Analysis Charts Implementation
document.addEventListener("DOMContentLoaded", async () => {
  console.log("Price Analysis page loaded - Student 6 implement your charts here")

  // Load data
  const data = await window.loadData()

  // Declare d3 variable
  const d3 = window.d3

  // Initialize Price vs Volume Scatter Plot
  function initPriceVolumeChart() {
    const container = d3.select("#price-volume-chart")

    // Remove placeholder
    container.select(".chart-placeholder").remove()

    // Add your D3.js scatter plot code here
    console.log("Student 6: Implement your price vs volume scatter plot here")
  }

  // Initialize Bottle Size Pie Chart
  function initBottleSizeChart() {
    const container = d3.select("#bottle-size-chart")

    // Remove placeholder
    container.select(".chart-placeholder").remove()

    // Add your D3.js pie chart code here
    console.log("Student 6: Implement your bottle size pie chart here")
  }

  // Initialize both charts
  initPriceVolumeChart()
  initBottleSizeChart()
})
