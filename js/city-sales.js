// Student 3: City Sales Chart Implementation
document.addEventListener("DOMContentLoaded", async () => {
  console.log("City Sales page loaded - Student 3 implement your chart here");

  // Declare the d3 variable
  const d3 = window.d3;

  // Load data directly using d3.csv
  // *** Updated path to include the 'data/' folder ***
  const data = await d3.csv("data/small_dataset.csv")
    .catch(error => {
      console.error("Error loading CSV data:", error);
      // Display a message to the user if data loading fails
      d3.select("#city-sales-chart").append("p")
        .style("color", "red")
        .text("Failed to load data. Please ensure 'small_dataset.csv' is in the 'data/' directory relative to your HTML file.");
      return []; // Return an empty array to prevent further errors
    });

  if (!data || data.length === 0) {
    console.log("No data loaded or data is empty.");
    return; // Stop execution if no data
  }

  console.log("Data loaded successfully:", data.length, "rows");
  console.log("First few rows of data:", data.slice(0, 5));

  // Function to get unique months from the dataset
  function getUniqueMonths(data) {
    const months = new Set();
    data.forEach(d => {
      // Assuming 'Date' column exists and is in 'MM/DD/YYYY' or similar format
      if (d["Date"]) {
        const date = new Date(d["Date"]);
        const year = date.getFullYear();
        // Format month as 'YYYY-MM' for consistent sorting and filtering
        // We still store YYYY-MM in the value for accurate filtering
        months.add(`${year}-${(date.getMonth() + 1).toString().padStart(2, '0')}`);
      }
    });
    const sortedMonths = Array.from(months).sort();
    return ["All Months", ...sortedMonths];
  }

  // Populate the month filter dropdown
  const monthFilter = d3.select("#month-filter");
  if (monthFilter.empty()) {
      // If the month-filter element doesn't exist, log a warning
      console.warn("Month filter dropdown not found. Please add a <select id='month-filter'></select> element to your HTML.");
      // Create a dummy element so the rest of the code doesn't break
      d3.select(".chart-header").append("select").attr("id", "month-filter");
      monthFilter = d3.select("#month-filter"); // Re-select the newly created element
  }

  const availableMonths = getUniqueMonths(data);
  monthFilter.selectAll("option")
    .data(availableMonths)
    .enter()
    .append("option")
    .attr("value", d => d)
    .text(d => {
      if (d === "All Months") return "All Months";
      const [year, month] = d.split('-');
      const date = new Date(year, parseInt(month) - 1, 1);
      // *** Removed year from display text ***
      return date.toLocaleString('en-US', { month: 'long' });
    });

  // Get the sort order filter dropdown
  const sortOrderFilter = d3.select("#sort-order-filter");
  if (sortOrderFilter.empty()) {
      console.warn("Sort order filter dropdown not found. Please add a <select id='sort-order-filter'></select> element to your HTML.");
      d3.select(".chart-header").append("select").attr("id", "sort-order-filter");
      sortOrderFilter = d3.select("#sort-order-filter");
  }

  // Event listener for month filter change
  monthFilter.on("change", function() {
    const selectedMonth = d3.select(this).property("value");
    const selectedSortOrder = sortOrderFilter.property("value");
    updateChart(selectedMonth, selectedSortOrder);
  });

  // Event listener for sort order filter change
  sortOrderFilter.on("change", function() {
    const selectedSortOrder = d3.select(this).property("value");
    const selectedMonth = monthFilter.property("value");
    updateChart(selectedMonth, selectedSortOrder);
  });

  // Function to render/update the chart based on selected month and sort order
  function updateChart(selectedMonth, sortOrder) {
    const container = d3.select("#city-sales-chart");

    // Remove existing chart elements for re-rendering
    container.select(".chart-placeholder").remove();
    container.select("svg").remove();

    let filteredData = data;
    if (selectedMonth !== "All Months") {
      filteredData = data.filter(d => {
        if (d["Date"]) {
          const date = new Date(d["Date"]);
          return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}` === selectedMonth;
        }
        return false;
      });
    }

    // Data processing: Aggregate sales by city from filtered data
    let citySales = d3.rollups(
      filteredData,
      v => d3.sum(v, d => {
        const salesValue = parseFloat(d["Sale (Dollars)"]);
        return isNaN(salesValue) ? 0 : salesValue;
      }),
      d => d["City"]
    )
    .map(([city, sales]) => ({ city, sales }))
    .filter(d => d.city && d.sales > 0);

    // Apply sorting based on sortOrder parameter
    if (sortOrder === "asc") {
      citySales.sort((a, b) => a.sales - b.sales);
    } else { // Default to descending
      citySales.sort((a, b) => b.sales - a.sales);
    }

    citySales = citySales.slice(0, 10); // Get top 10 cities after sorting

    console.log(`Processed city sales data for ${selectedMonth} with sort order ${sortOrder}:`, citySales);

    if (citySales.length === 0) {
      console.log(`No valid sales data to display for the chart for ${selectedMonth}.`);
      container.append("p")
        .style("color", "#555")
        .text(`No sales data available for charting for ${selectedMonth}.`);
      return;
    }

    // Set up chart dimensions
    const margin = { top: 40, right: 30, bottom: 60, left: 150 };
    const containerNode = container.node();
    const containerWidth = containerNode.getBoundingClientRect().width;
    const barHeight = 30;
    const paddingBetweenBars = 10;
    const requiredHeight = citySales.length * (barHeight + paddingBetweenBars) + margin.top + margin.bottom;
    const containerHeight = Math.max(300, requiredHeight);

    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    // Create the SVG element
    const svg = container.append("svg")
      .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3.scaleLinear()
      .domain([0, d3.max(citySales, d => d.sales) * 1.15])
      .range([0, width]);

    const yScale = d3.scaleBand()
      .domain(citySales.map(d => d.city))
      .range([0, height])
      .paddingInner(0.1)
      .paddingOuter(0.05);

    // Add X-axis
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.format(".2s")))
      .selectAll("text")
      .style("font-size", "12px")
      .style("fill", "#333");

    // Add Y-axis
    svg.append("g")
      .call(d3.axisLeft(yScale))
      .selectAll("text")
      .style("font-size", "14px")
      .style("fill", "#333");

    // Add bars with initial animation and hover effects
    const bars = svg.selectAll(".bar")
      .data(citySales, d => d.city) // Use city as key for object constancy
      .join(
        enter => enter.append("rect")
          .attr("class", "bar")
          .attr("y", d => yScale(d.city))
          .attr("height", yScale.bandwidth())
          .attr("x", 0)
          .attr("fill", "#E57373")
          .attr("rx", 5)
          .attr("ry", 5)
          .attr("width", 0) // Start with 0 width for animation
          .call(enter => enter.transition().duration(800).delay((d, i) => i * 50).attr("width", d => xScale(d.sales))),
        update => update
          .transition()
          .duration(800)
          .delay((d, i) => i * 50)
          .attr("y", d => yScale(d.city))
          .attr("height", yScale.bandwidth())
          .attr("width", d => xScale(d.sales))
          .attr("fill", "#E57373"),
        exit => exit.transition().duration(500).attr("width", 0).remove()
      );

    // Add sales labels on bars
    const labels = svg.selectAll(".bar-label")
      .data(citySales, d => d.city) // Use city as key for object constancy
      .join(
        enter => enter.append("text")
          .attr("class", "bar-label")
          .attr("x", 0)
          .attr("y", d => yScale(d.city) + yScale.bandwidth() / 2 + 5)
          .text(d => `$${d3.format(",.2f")(d.sales)}`)
          .style("font-size", "13px")
          .style("fill", "#555")
          .style("font-weight", "bold")
          .style("opacity", 0)
          .call(enter => enter.transition().duration(800).delay((d, i) => i * 50 + 400).attr("x", d => xScale(d.sales) + 8).style("opacity", 1)),
        update => update
          .transition()
          .duration(800)
          .delay((d, i) => i * 50 + 400)
          .attr("x", d => xScale(d.sales) + 8)
          .attr("y", d => yScale(d.city) + yScale.bandwidth() / 2 + 5)
          .text(d => `$${d3.format(",.2f")(d.sales)}`),
        exit => exit.transition().duration(500).style("opacity", 0).remove()
      );

    // Add interactivity: mouseover and mouseout effects
    bars.on("mouseover", function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("fill", "#D32F2F") // Darker red on hover
          .attr("transform", `scale(1.01,1)`); // Slightly scale up
      })
      .on("mouseout", function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("fill", "#E57373") // Revert to original red color
          .attr("transform", `scale(1,1)`); // Revert scale
      });

    // Add chart title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -margin.top / 2 + 10)
      .attr("text-anchor", "middle")
      .style("font-size", "22px")
      .style("font-weight", "bold")
      .style("fill", "#333")
      .text(`Top 10 Cities by Sales Volume (${selectedMonth === "All Months" ? "All Months" : new Date(selectedMonth).toLocaleString('en-US', { month: 'long' })})`); // Changed here


    // Add X-axis label
    svg.append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.bottom - 10})`)
      .style("text-anchor", "middle")
      .style("font-size", "15px")
      .style("fill", "#333")
      .text("Total Sales (Dollars)");

    // Handle responsiveness
    window.addEventListener("resize", () => {
      // Re-initialize chart on resize
      updateChart(monthFilter.property("value"), sortOrderFilter.property("value")); // Pass current selected month and sort order
    });
  }

  // Initial chart load with "All Months" and default descending sort
  updateChart("All Months", "desc");
});
