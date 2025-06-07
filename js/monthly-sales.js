// Student 1: Monthly Sales Chart Implementation
document.addEventListener("DOMContentLoaded", async () => {
  console.log("Monthly Sales page loaded - Student 1 implement your chart here")

  // Load data
  const data = await window.loadData()

  // Declare the d3 variable
  const d3 = window.d3

  // Initialize your D3.js chart here
  function initMonthlySalesChart() {
    const container = d3.select("#monthly-sales-chart")

    // Remove placeholder
    container.select(".chart-placeholder").remove()

    // Add your D3.js code here
    console.log("Student 1: Implement your monthly sales trend chart here")

    // Example structure:
    /*
    const margin = {top: 20, right: 30, bottom: 40, left: 50};
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
    
    const svg = container.append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Your chart implementation here
    */
  }

  // Initialize chart
  initMonthlySalesChart()

  // Filter functionality
  document.getElementById("reset-filters")?.addEventListener("click", () => {
    document.getElementById("year-filter").value = "all"
    document.getElementById("county-filter").value = "all"
    initMonthlySalesChart()
  })
})
