// Student 6: Brands Chart Implementation
document.addEventListener("DOMContentLoaded", async () => {
  console.log("Brands page loaded - Student 6 implement your chart here")

  // Load data
  const data = await window.loadData()

  // Declare the d3 variable
  const d3 = window.d3

  // Initialize your D3.js chart here
  function initBrandsChart() {
    const container = d3.select("#brands-chart")

    // Remove placeholder
    container.select(".chart-placeholder").remove()

    // Add your D3.js horizontal bar chart code here
    console.log("Student 6: Implement your top brands horizontal bar chart here")

    // Example structure:
    /*
    const margin = {top: 20, right: 30, bottom: 40, left: 150};
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
    
    const svg = container.append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Your horizontal bar chart implementation here
    // Include click filtering functionality
    */
  }

  // Initialize chart
  initBrandsChart()

  // Filter functionality
  document.getElementById("reset-filters")?.addEventListener("click", () => {
    document.getElementById("category-filter").value = "all"
    document.getElementById("month-filter").value = "all"
    initBrandsChart()
  })
})
