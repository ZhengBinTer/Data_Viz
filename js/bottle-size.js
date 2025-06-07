// Student 7: Bottle Size Chart Implementation
document.addEventListener("DOMContentLoaded", async () => {
  console.log("Bottle Size page loaded - Student 7 implement your chart here")

  // Load data
  const data = await window.loadData()

  // Declare the d3 variable
  const d3 = window.d3

  // Initialize your D3.js chart here
  function initBottleSizeChart() {
    const container = d3.select("#bottle-size-chart")

    // Remove placeholder
    container.select(".chart-placeholder").remove()

    // Add your D3.js pie/donut chart code here
    console.log("Student 7: Implement your bottle size pie/donut chart here")

    // Example structure:
    /*
    const width = 500;
    const height = 400;
    const radius = Math.min(width, height) / 2;
    
    const svg = container.append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width/2},${height/2})`);
    
    // Your pie/donut chart implementation here
    // Include legend and hover interactions
    */
  }

  // Initialize chart
  initBottleSizeChart()

  // Filter functionality
  document.getElementById("reset-filters")?.addEventListener("click", () => {
    document.getElementById("category-filter").value = "all"
    document.getElementById("county-filter").value = "all"
    initBottleSizeChart()
  })
})
