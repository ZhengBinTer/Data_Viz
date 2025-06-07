// Student 2: Geographic Chart Implementation
document.addEventListener("DOMContentLoaded", async () => {
  console.log("Geographic page loaded - Student 2 implement your chart here")

  // Load data
  const data = await window.loadData()

  // Declare the d3 variable
  const d3 = window.d3

  // Initialize your D3.js map here
  function initGeographicChart() {
    const container = d3.select("#geographic-chart")

    // Remove placeholder
    container.select(".chart-placeholder").remove()

    // Add your D3.js map code here
    console.log("Student 2: Implement your Iowa county map here")

    // You'll need Iowa GeoJSON data for this
    // Example structure:
    /*
    const width = 800;
    const height = 500;
    
    const svg = container.append("svg")
      .attr("width", width)
      .attr("height", height);
    
    // Load Iowa counties GeoJSON and render map
    */
  }

  // Initialize chart
  initGeographicChart()
})
