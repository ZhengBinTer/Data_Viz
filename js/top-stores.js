// Student 4: Top Stores Chart Implementation
document.addEventListener("DOMContentLoaded", async () => {
  console.log("Top Stores page loaded - Student 4 implement your chart here")

  // Load data
  const data = await window.loadData()

  // Declare the d3 variable
  const d3 = window.d3

  // Initialize your D3.js chart here
  function initTopStoresChart() {
    const container = d3.select("#top-stores-chart")

    // Remove placeholder
    container.select(".chart-placeholder").remove()

    // Add your D3.js vertical bar chart code here
    console.log("Student 4: Implement your top stores vertical bar chart here")
  }

  // Initialize chart
  initTopStoresChart()
})
