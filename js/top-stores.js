// Student 4: Top Stores Chart Implementation
document.addEventListener("DOMContentLoaded", async () => {
  console.log("Top Stores page loaded - Student 4 implement your chart here");

  const chartContainer = d3.select("#top-stores-chart");
  const chartPlaceholder = chartContainer.select(".chart-placeholder");
  const monthFilter = d3.select("#month-filter"); // Select the new month filter dropdown

  let rawLoadedData = []; // Store the full raw data

  try {
    // Load data - assuming small_dataset.csv is accessible.
    const data = await d3.csv("data/small_dataset.csv");

    if (!data || data.length === 0) {
      console.error("No data loaded or dataset is empty.");
      chartPlaceholder.html("<i class=\"fas fa-exclamation-triangle\"></i><p>Error: No data available to display.</p><small>Please ensure 'small_dataset.csv' is correctly loaded.</small>");
      return;
    }

    // Parse dates to ensure month filtering works correctly
    data.forEach(d => {
      d.parsedDate = new Date(d.Date); // Assuming 'Date' column is in a parseable format
      d.month = d.parsedDate.getMonth() + 1; // getMonth() is 0-indexed
    });

    rawLoadedData = data; // Store the loaded and parsed data

    console.log("Data loaded successfully:", rawLoadedData.length, "rows");

    // Initialize chart with all data (default)
    initTopStoresChart(rawLoadedData);

    // Add event listener for month filter change
    monthFilter.on("change", () => {
      const selectedMonth = monthFilter.property("value");
      let filteredData = rawLoadedData;

      if (selectedMonth !== "all") {
        const monthNum = +selectedMonth; // Convert to number
        filteredData = rawLoadedData.filter(d => d.month === monthNum);
      }

      // Re-initialize chart with filtered data
      initTopStoresChart(filteredData);
    });

  } catch (error) {
    console.error("Error loading or processing data for Top Stores Chart:", error);
    chartPlaceholder.html(`<i class="fas fa-exclamation-triangle\"></i><p>Error loading chart data.</p><small>${error.message || 'An unknown error occurred.'}</small>`);
  }

  // Initialize your D3.js chart function
  function initTopStoresChart(dataToRender) {
    // Remove placeholder once data is ready to be rendered
    chartPlaceholder.remove();

    // Process data to get top 10 revenue generating stores
    const validData = dataToRender.filter(d => d["Sale (Dollars)"] != null && !isNaN(+d["Sale (Dollars)"]));

    if (validData.length === 0) {
      console.warn("No valid sales data found after filtering.");
      chartContainer.html("<i class=\"fas fa-exclamation-triangle\"></i><p>No valid sales data to display after filtering.</p>");
      // Clear existing SVG if no valid data
      chartContainer.select("svg").remove();
      return;
    }

    const salesByStore = d3.rollups(validData,
      v => d3.sum(v, d => +d["Sale (Dollars)"]), // Sum 'Sale (Dollars)'
      d => d["Store Name"] // Group by 'Store Name'
    )
    .map(([storeName, totalSales]) => ({ storeName, totalSales }));

    // Sort and get top 10 (for horizontal bar chart, sort in ascending for better visual flow from bottom to top)
    const top10Stores = salesByStore.sort((a, b) => a.totalSales - b.totalSales).slice(Math.max(0, salesByStore.length - 10));

    if (top10Stores.length === 0) {
      console.warn("Could not determine top 10 stores from data.");
      chartContainer.html("<i class=\"fas fa-exclamation-triangle\"></i><p>Could not determine top 10 stores. Data might be insufficient.</p>");
      // Clear existing SVG if no top 10 stores
      chartContainer.select("svg").remove();
      return;
    }

    // Clear any existing SVG to prevent duplicates on redraw
    chartContainer.select("svg").remove();

    // Set up dimensions
    const parentWidth = chartContainer.node().getBoundingClientRect().width;
    const margin = { top: 40, right: 120, bottom: 60, left: 350 }; // Increased left margin for full store names
    const width = parentWidth - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Create SVG container
    const svg = chartContainer.append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add chart title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -margin.top / 2)
        .attr("text-anchor", "middle")
        .attr("class", "chart-title")
        .style("font-size", "1.4em")
        .style("font-weight", "bold")
        .text("Top 10 Revenue Generating Stores");

    // X-axis scale (sales in dollars - now horizontal)
    const x = d3.scaleLinear()
      .domain([0, d3.max(top10Stores, d => d.totalSales) * 1.1]) // 10% padding for max value
      .range([0, width]);

    // Y-axis scale (store names - now vertical)
    const y = d3.scaleBand()
      .domain(top10Stores.map(d => d.storeName))
      .range([height, 0]) // Range is from height to 0 for proper vertical display
      .padding(0.2);

    // Add X-axis (bottom)
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.format("$,.0f"))) // Format as currency
      .selectAll("text")
      .style("font-size", "1em");

    // Add Y-axis (left)
    svg.append("g")
      .call(d3.axisLeft(y))
      .selectAll("text")
      .style("font-size", "1em")
      .style("text-anchor", "end"); // Ensure text is right-aligned to the axis

    // Add X-axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 20) // Adjusted position
        .attr("text-anchor", "middle")
        .attr("class", "axis-label")
        .style("font-size", "1.1em")
        .text("Total Sales (Dollars)"); // Label changed

    // Add Y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 20) // Adjusted position
        .attr("x", -height / 2)
        .attr("text-anchor", "middle")
        .attr("class", "axis-label")
        .style("font-size", "1.1em")
        .text("Store Name"); // Label changed

    // Create bars with transitions
    const bars = svg.selectAll(".bar")
      .data(top10Stores)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", 0) // Start from left for animation
      .attr("y", d => y(d.storeName))
      .attr("width", 0) // Start width at 0 for animation
      .attr("height", y.bandwidth())
      .attr("fill", "red") // Changed bar color to red
      .transition() // Add transition
      .duration(750) // Transition duration in milliseconds
      .ease(d3.easeBounceOut) // Easing function for a bouncy effect
      .attr("width", d => x(d.totalSales)); // Animate to final width

    // Add data labels on top of bars
    svg.selectAll(".bar-value")
      .data(top10Stores)
      .enter().append("text")
      .attr("class", "bar-value")
      .attr("x", d => {
        // Adjust position if label might exceed container width
        const textWidth = d3.format("$,.0f")(d.totalSales).length * 9; // Approximate text width
        if (x(d.totalSales) + textWidth + 5 > width) { // If it exceeds the chart area
          return x(d.totalSales) - 5; // Position inside the bar, from the right
        }
        return x(d.totalSales) + 5; // Position outside the bar, from the left
      })
      .attr("y", d => y(d.storeName) + y.bandwidth() / 2 + 5) // Centered vertically in the bar
      .attr("text-anchor", d => {
        const textWidth = d3.format("$,.0f")(d.totalSales).length * 9;
        if (x(d.totalSales) + textWidth + 5 > width) {
          return "end"; // Align text to the end (right) if positioned inside
        }
        return "start"; // Align text to the start (left)
      })
      .style("font-size", "0.9em")
      .style("fill", "black")
      .text(d => d3.format("$,.0f")(d.totalSales));

    // Add tooltips
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "1px")
      .style("border-radius", "5px")
      .style("padding", "10px")
      .style("pointer-events", "none")
      .style("font-size", "1em");

    // Add mouse events to the bars
    svg.selectAll(".bar")
      .on("mouseover", function(event, d) {
          tooltip.transition()
              .duration(200)
              .style("opacity", .9);
          tooltip.html(`<strong>${d.storeName}</strong><br/>Sales: $${d.totalSales.toLocaleString()}`)
              .style("left", (event.pageX + 10) + "px")
              .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function(event, d) {
          tooltip.transition()
              .duration(500)
              .style("opacity", 0);
      });

    // Add a simple resize observer to redraw chart on resize
    if (!chartContainer.node().__resizeObserver__) {
        const resizeObserver = new ResizeObserver(() => {
            chartContainer.select("svg").remove();
            initTopStoresChart(rawLoadedData); // Use rawLoadedData for resizing as well
        });
        resizeObserver.observe(chartContainer.node());
        chartContainer.node().__resizeObserver__ = resizeObserver;
    }
  }
});
