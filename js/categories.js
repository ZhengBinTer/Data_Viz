// Student 5: Categories Chart Implementation
document.addEventListener("DOMContentLoaded", async () => {
  console.log("Categories page loaded - Student 5 implement your chart here")

  // Load data
  const data = await window.loadData()

  // Declare the d3 variable
  const d3 = window.d3

  // Initialize your D3.js chart here
  function initCategoriesChart() {
    const container = d3.select("#categories-chart")

    // Remove placeholder
    container.select(".chart-placeholder").remove()

    // Add your D3.js horizontal bar chart code here
    console.log("Student 5: Implement your categories horizontal bar chart here")
  }

  // Initialize chart
  initCategoriesChart()
})
