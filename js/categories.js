// Student 5: Top 10 Bestselling Items by Bottles Sold Chart Implementation
document.addEventListener("DOMContentLoaded", async () => {
  console.log("Categories page loaded - Student 5 implement your chart here");

  const d3 = window.d3;
  const container = d3.select("#categories-chart");
  const monthFilter = document.getElementById("month-filter");
  const categoryFilter = document.getElementById("category-filter");

  // Remove placeholder initially
  container.select(".chart-placeholder").remove();

  // Create a tooltip div and append it to the body
  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0) // Initially hidden
    .style("position", "absolute")
    .style("background-color", "white")
    .style("border", "1px solid #ccc")
    .style("padding", "8px")
    .style("border-radius", "4px")
    .style("pointer-events", "none") // Ensures tooltip doesn't block mouse events
    .style("font-size", "12px")
    .style("color", "#333");

  // Load data from CSV
  d3.csv("data/dataset.csv")
    .then((data) => {
      // Parse and clean data
      data.forEach((d) => {
        d["Bottles Sold"] = +d["Bottles Sold"]; // Convert to number
        d.Date = new Date(d.Date); // Parse date
        d["Sale (Dollars)"] = +d["Sale (Dollars)"]; // Ensure Sale (Dollars) is parsed as a number
      });

      // Filter out invalid bottles sold data (e.g., negative or zero) and missing item description/date
      const validData = data.filter((d) => d["Bottles Sold"] > 0 && d["Item Description"] && d.Date && d["Category Name"] && d["Sale (Dollars)"] >= 0);

      if (validData.length === 0) {
        console.warn("No valid data after loading CSV for Top 10 Bestselling Items chart.");
        container
          .append("div")
          .attr("class", "error-message")
          .style("padding", "20px")
          .style("text-align", "center")
          .style("color", "#666")
          .html(`
            <i class="fas fa-info-circle" style="font-size: 2rem; margin-bottom: 10px;"></i>
            <p><strong>No data available</strong></p>
            <p>No valid item sales data found to generate the Top 10 Bestselling Items chart.</p>
          `);
        return;
      }

      // Populate category filter dynamically
      const uniqueCategories = Array.from(new Set(validData.map(d => d["Category Name"]))).sort();
      uniqueCategories.forEach(category => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
      });


      function initCategoriesChart() {
        // Clear previous chart if any
        container.html("");

        const selectedMonth = monthFilter ? monthFilter.value : "all";
        const selectedCategory = categoryFilter ? categoryFilter.value : "all"; // Default to all categories

        // Filter data based on selections
        let filteredData = validData;

        if (selectedMonth !== "all") {
          filteredData = filteredData.filter(
            (d) => d.Date.getMonth() + 1 === parseInt(selectedMonth)
          );
        }

        if (selectedCategory !== "all") {
            filteredData = filteredData.filter(
                (d) => d["Category Name"] === selectedCategory
            );
        }

        if (filteredData.length === 0) {
          console.warn("No data after filtering for Top 10 Bestselling Items chart.");
          container
            .append("div")
            .attr("class", "error-message")
            .style("padding", "20px")
            .style("text-align", "center")
            .style("color", "#666")
            .html(`
              <i class="fas fa-info-circle" style="font-size: 2rem; margin-bottom: 10px;"></i>
              <p><strong>No data available</strong></p>
              <p>No item sales data found for the selected filters. Please adjust your filters.</p>
            `);
          return;
        }

        // Group data by Item Description and sum both Bottles Sold and Sale (Dollars)
        const itemMetrics = d3.rollup(
          filteredData,
          (v) => ({
            bottlesSold: d3.sum(v, (d) => d["Bottles Sold"]),
            totalSales: d3.sum(v, (d) => d["Sale (Dollars)"])
          }),
          (d) => d["Item Description"]
        );

        // Convert to array and sort by bottles sold (always descending)
        let sortedItems = Array.from(itemMetrics)
          .sort(([, a], [, b]) => b.bottlesSold - a.bottlesSold); // Default to descending sort based on bottlesSold


        // Take top 10 after sorting
        sortedItems = sortedItems.slice(0, 10);

        const itemsList = sortedItems.map(d => d[0]);

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


        const margin = { top: 20, right: 30, bottom: 40, left: 200 };
        const chartWidth = chartContainer.node().getBoundingClientRect().width - margin.left - margin.right;
        // Adjust chart height based on number of items and desired bar spacing
        const chartHeight = Math.min(400, sortedItems.length * 40 + margin.top + margin.bottom);


        const svg = chartContainer
          .append("svg")
          .attr("width", "100%")
          .attr("height", chartHeight + margin.top + margin.bottom)
          .attr("viewBox", `0 0 ${chartWidth + margin.left + margin.right} ${chartHeight + margin.top + margin.bottom}`)
          .attr("preserveAspectRatio", "xMidYMid meet")
          .append("g")
          .attr("transform", `translate(${margin.left},${margin.top})`);


        // X scale
        const xScale = d3
          .scaleLinear()
          .domain([0, d3.max(sortedItems, (d) => d[1].bottlesSold) * 1.2]) // Max bottles sold, with some padding
          .range([0, chartWidth]);

        // Y scale
        const yScale = d3
          .scaleBand()
          .domain(sortedItems.map((d) => d[0]))
          .range([0, chartHeight])
          .padding(0.1);

        // Add X axis
        svg
          .append("g")
          .attr("transform", `translate(0,${chartHeight})`)
          .call(d3.axisBottom(xScale).tickFormat(d3.format(".2s"))) // Format as short form numbers
          .selectAll("text")
          .attr("font-size", "12px");

        // Add Y axis
        svg.append("g").call(d3.axisLeft(yScale)).selectAll("text").attr("font-size", "12px");

        // Bars
        svg
          .selectAll(".bar")
          .data(sortedItems)
          .enter()
          .append("rect")
          .attr("class", "bar")
          .attr("y", (d) => yScale(d[0]))
          .attr("x", 0)
          .attr("height", yScale.bandwidth())
          .attr("fill", "#dc3545") // Set fill color to red
          // Initial state for animation
          .attr("width", 0) // Start with zero width
          .transition() // Animate the width
          .duration(800) // Duration of the animation in milliseconds
          .delay((d, i) => i * 50) // Stagger animation for each bar
          .attr("width", (d) => xScale(d[1].bottlesSold)) // Animate to full width
          .on("end", function() { // Re-attach mouse events after animation ends
            d3.select(this)
              .on("mouseover", function(event, d) {
                // Show tooltip on mouseover
                tooltip.transition()
                  .duration(200)
                  .style("opacity", .9);
                tooltip.html(`Item: <strong>${d[0]}</strong><br/>Bottles Sold: <strong>${d3.format(",.0f")(d[1].bottlesSold)}</strong><br/>Total Sales: <strong>${d3.format("$,.2f")(d[1].totalSales)}</strong>`)
                  .style("left", (event.pageX + 10) + "px")
                  .style("top", (event.pageY - 28) + "px");

                // Darken the bar color on mouseover
                d3.select(this)
                  .transition() // Smooth transition for visual effect
                  .duration(200) // Transition duration
                  .attr("fill", d3.color("#dc3545").darker(0.75)); // Darken the red color
              })
              .on("mouseout", function(event, d) {
                // Hide tooltip on mouseout
                tooltip.transition()
                  .duration(500)
                  .style("opacity", 0);

                // Revert to original color on mouseout
                d3.select(this)
                  .transition() // Smooth transition for visual effect
                  .duration(200) // Transition duration
                  .attr("fill", "#dc3545"); // Original red color
              });
          });


        // Add labels for bars
        svg
          .selectAll(".bar-label")
          .data(sortedItems)
          .enter()
          .append("text")
          .attr("class", "bar-label")
          .attr("x", 0) // Start labels at x=0
          .attr("y", (d) => yScale(d[0]) + yScale.bandwidth() / 2)
          .attr("dy", "0.35em")
          .text((d) => d3.format(",.0f")(d[1].bottlesSold)) // Format bottles sold with commas
          .attr("font-size", "10px")
          .attr("fill", "#333")
          // Animate the labels
          .transition()
          .duration(800) // Match bar animation duration
          .delay((d, i) => i * 50) // Match bar animation delay
          .attr("x", (d) => xScale(d[1].bottlesSold) + 5); // Animate to final position

        // Add X axis label
        svg
          .append("text")
          .attr("class", "x-axis-label")
          .attr("text-anchor", "middle")
          .attr("x", chartWidth / 2)
          .attr("y", chartHeight + margin.bottom - 5)
          .text("Total Bottles Sold")
          .attr("font-size", "12px")
          .attr("fill", "#555");
      }

      // Initial chart render after data is loaded
      initCategoriesChart();

      // Event Listeners for filters
      if (monthFilter) {
        monthFilter.addEventListener("change", initCategoriesChart);
      }
      if (categoryFilter) {
        categoryFilter.addEventListener("change", initCategoriesChart);
      }

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
          <p>Please check that 'data/dataset.csv' exists and is accessible for the Top 10 Bestselling Items chart.</p>
        `);
    });
});
