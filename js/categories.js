// Student 5: Categories Chart Implementation
document.addEventListener("DOMContentLoaded", async () => {
  console.log("Categories page loaded - Student 5 implement your chart here");

  const d3 = window.d3;
  const container = d3.select("#categories-chart");
  const monthFilter = document.getElementById("month-filter");
  // The categoryFilter element and related logic are removed as requested.

  // Remove placeholder initially
  container.select(".chart-placeholder").remove();

  // Load data from CSV
  d3.csv("data/small_dataset.csv")
    .then((data) => {
      // Parse and clean data
      data.forEach((d) => {
        d["Sale (Dollars)"] = +d["Sale (Dollars)"]; // Convert to number
        d.Date = new Date(d.Date); // Parse date
      });

      // Filter out invalid sales data (e.g., negative or zero sales)
      const validData = data.filter((d) => d["Sale (Dollars)"] > 0 && d["Category Name"] && d.Date);

      if (validData.length === 0) {
        console.warn("No valid data after loading CSV for Categories chart.");
        container
          .append("div")
          .attr("class", "error-message")
          .style("padding", "20px")
          .style("text-align", "center")
          .style("color", "#666")
          .html(`
            <i class="fas fa-info-circle" style="font-size: 2rem; margin-bottom: 10px;"></i>
            <p><strong>No data available</strong></p>
            <p>No valid sales data found to generate the Categories chart.</p>
          `);
        return;
      }

      // Populate category filter dynamically removed. Categories will now be based on all valid data.


      function initCategoriesChart() {
        // Clear previous chart if any
        container.html("");

        const selectedMonth = monthFilter ? monthFilter.value : "all"; // Handle if monthFilter is null

        // Filter data based on selections
        let filteredData = validData;

        if (selectedMonth !== "all") {
          filteredData = filteredData.filter(
            (d) => d.Date.getMonth() + 1 === parseInt(selectedMonth)
          );
        }

        // Category filter application logic removed as requested.

        if (filteredData.length === 0) {
          console.warn("No data after filtering for Categories chart.");
          container
            .append("div")
            .attr("class", "error-message")
            .style("padding", "20px")
            .style("text-align", "center")
            .style("color", "#666")
            .html(`
              <i class="fas fa-info-circle" style="font-size: 2rem; margin-bottom: 10px;"></i>
              <p><strong>No data available</strong></p>
              <p>No sales data found for the selected filters. Please adjust your filters.</p>
            `);
          return;
        }

        // Group data by category name and sum sales
        const categorySales = d3.rollup(
          filteredData,
          (v) => d3.sum(v, (d) => d["Sale (Dollars)"]),
          (d) => d["Category Name"]
        );

        // Convert to array and sort by sales in descending order
        const sortedCategories = Array.from(categorySales)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10); // Get top 10 categories

        const categoriesList = sortedCategories.map(d => d[0]);

        // Create main wrapper with side-by-side layout
        const chartWrapper = container
          .append("div")
          .attr("class", "chart-wrapper")
          .style("display", "flex")
          .style("width", "100%")
          .style("height", "100%")
          .style("min-height", "450px")
          .style("gap", "20px");

        // Chart container (left side)
        const chartContainer = chartWrapper
          .append("div")
          .attr("class", "chart-area")
          .style("flex", "1")
          .style("min-width", "0")
          .style("height", "100%");

        // Legend container (right side)
        const legendContainer = chartWrapper
          .append("div")
          .attr("class", "legend-area")
          .style("width", "250px")
          .style("flex-shrink", "0")
          .style("height", "100%")
          .style("display", "flex")
          .style("flex-direction", "column")
          .style("background-color", "#f8f9fa")
          .style("border", "1px solid #d1d5db")
          .style("border-radius", "8px")
          .style("padding", "15px")
          .style("overflow-y", "auto");

        const margin = { top: 20, right: 30, bottom: 40, left: 200 };
        const chartWidth = chartContainer.node().getBoundingClientRect().width - margin.left - margin.right;
        const chartHeight = Math.min(400, sortedCategories.length * 40 + margin.top + margin.bottom);

        const svg = chartContainer
          .append("svg")
          .attr("width", "100%")
          .attr("height", chartHeight + margin.top + margin.bottom)
          .attr("viewBox", `0 0 ${chartWidth + margin.left + margin.right} ${chartHeight + margin.top + margin.bottom}`)
          .attr("preserveAspectRatio", "xMidYMid meet")
          .append("g")
          .attr("transform", `translate(${margin.left},${margin.top})`);

        // Color scale
        const colorScale = d3.scaleOrdinal()
          .domain(categoriesList)
          .range(d3.schemeCategory10);

        // X scale
        const xScale = d3
          .scaleLinear()
          .domain([0, d3.max(sortedCategories, (d) => d[1]) * 1.2])
          .range([0, chartWidth]);

        // Y scale
        const yScale = d3
          .scaleBand()
          .domain(sortedCategories.map((d) => d[0]))
          .range([0, chartHeight])
          .padding(0.1);

        // Add X axis
        svg
          .append("g")
          .attr("transform", `translate(0,${chartHeight})`)
          .call(d3.axisBottom(xScale).tickFormat(d3.format("$.2s")))
          .selectAll("text")
          .attr("font-size", "12px");

        // Add Y axis
        svg.append("g").call(d3.axisLeft(yScale)).selectAll("text").attr("font-size", "12px");

        // Bars
        svg
          .selectAll(".bar")
          .data(sortedCategories)
          .enter()
          .append("rect")
          .attr("class", "bar")
          .attr("y", (d) => yScale(d[0]))
          .attr("x", 0)
          .attr("height", yScale.bandwidth())
          .attr("fill", (d) => colorScale(d[0])) // Apply color based on Category Name
          // Initial state for animation
          .attr("width", 0) // Start with zero width
          .transition() // Animate the width
          .duration(800) // Duration of the animation in milliseconds
          .delay((d, i) => i * 50) // Stagger animation for each bar
          .attr("width", (d) => xScale(d[1])) // Animate to full width
          .on("end", function() { // Re-attach mouse events after animation ends
            d3.select(this)
              .on("mouseover", function(event, d) {
                // Darken the bar color on mouseover
                d3.select(this)
                  .transition() // Smooth transition for visual effect
                  .duration(200) // Transition duration
                  .attr("fill", d3.color(colorScale(d[0])).darker(0.75)); // Darken the color
              })
              .on("mouseout", function(event, d) {
                // Revert to original color on mouseout
                d3.select(this)
                  .transition() // Smooth transition for visual effect
                  .duration(200) // Transition duration
                  .attr("fill", colorScale(d[0])); // Original color
              });
          });


        // Add labels for bars
        svg
          .selectAll(".bar-label")
          .data(sortedCategories)
          .enter()
          .append("text")
          .attr("class", "bar-label")
          .attr("x", 0) // Start labels at x=0
          .attr("y", (d) => yScale(d[0]) + yScale.bandwidth() / 2)
          .attr("dy", "0.35em")
          .text((d) => d3.format("$,.0f")(d[1]))
          .attr("font-size", "10px")
          .attr("fill", "#333")
          // Animate the labels
          .transition()
          .duration(800) // Match bar animation duration
          .delay((d, i) => i * 50) // Match bar animation delay
          .attr("x", (d) => xScale(d[1]) + 5); // Animate to final position

        // Add X axis label
        svg
          .append("text")
          .attr("class", "x-axis-label")
          .attr("text-anchor", "middle")
          .attr("x", chartWidth / 2)
          .attr("y", chartHeight + margin.bottom - 5)
          .text("Total Sales (Dollars)")
          .attr("font-size", "12px")
          .attr("fill", "#555");

        // Add Legend
        const legendItems = legendContainer
          .selectAll(".legend-item")
          .data(sortedCategories)
          .enter()
          .append("div")
          .attr("class", "legend-item")
          .style("display", "flex")
          .style("align-items", "center")
          .style("gap", "8px")
          .style("padding", "6px 0")
          .style("font-size", "12px")
          .style("line-height", "1.2")
          .style("border-bottom", "1px solid #e5e7eb");

        legendItems
          .append("div")
          .style("width", "12px")
          .style("height", "12px")
          .style("background-color", (d) => colorScale(d[0]))
          .style("border", "1px solid #ccc")
          .style("flex-shrink", "0");

        legendItems
          .append("span")
          .style("color", "#374151")
          .style("font-size", "11px")
          .style("line-height", "1.3")
          .text((d) => d[0]);
      }

      // Initial chart render after data is loaded
      initCategoriesChart();

      // Event Listeners for filters
      // Removed the category filter event listener.
      if (monthFilter) {
        monthFilter.addEventListener("change", initCategoriesChart);
      }
      // Removed: if (categoryFilter) { categoryFilter.addEventListener("change", initCategoriesChart); }


      // Optional: Handle window resize to redraw chart
      window.addEventListener('resize', () => {
        // Debounce resize event for performance
        if (this.resizeTimer) clearTimeout(this.resizeTimer);
        this.resizeTimer = setTimeout(() => {
          initCategoriesChart();
        }, 200);
      });

    })
    .catch((error) => {
      console.error("❌ Failed to load CSV data for categories:", error);
      container
        .append("div")
        .attr("class", "error-message")
        .style("padding", "20px")
        .style("text-align", "center")
        .style("color", "#dc3545")
        .html(`
          <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 10px;"></i>
          <p><strong>Error loading dataset</strong></p>
          <p>Please check that 'data/Cleaned_Liquor_Sales.csv' exists and is accessible for the Categories chart.</p>
        `);
    });
});
