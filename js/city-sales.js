// Student 3: City Sales Chart Implementation
document.addEventListener("DOMContentLoaded", async () => {
  console.log("City Sales page loaded - Student 3 implement your chart here")

  // Load data
  const data = await window.loadData()

  // Declare the d3 variable
  const d3 = window.d3

  // Initialize your D3.js chart here
  function initCitySalesChart() {
    const container = d3.select("#city-sales-chart")

    // Remove placeholder
    container.select(".chart-placeholder").remove()

    // Add your D3.js horizontal bar chart code here
    console.log("Student 3: Implement your city sales horizontal bar chart here")
  }

  // Initialize chart
  initCitySalesChart()
})
