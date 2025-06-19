// Student 6: Brands Chart Implementation
document.addEventListener("DOMContentLoaded", async () => {
  console.log("Brands page loaded - Student 6 implement your chart here");

  const d3 = window.d3;
  const container = d3.select("#brands-chart");

  // Remove placeholder initially
  container.select(".chart-placeholder").remove();

  // Load data from CSV
  // Using the small_dataset.csv as requested for column names
  d3.csv("data/small_dataset.csv") // Assuming this is the correct path to your main dataset
    .then((data) => {
      // Parse and clean data (similar to monthly-sales.js)
      data.forEach((d) => {
        // Using column names from small_dataset.csv
        d["Sale (Dollars)"] = +d["Sale (Dollars)"]; // Convert to number
        d.Date = new Date(d.Date); // Parse date
      });

      // Filter out invalid sales data based on column names from small_dataset.csv
      const validData = data.filter((d) => d["Sale (Dollars)"] > 0 && d["Item Description"] && d.Date);

      if (validData.length === 0) {
        console.warn("No valid data after loading CSV for Brands chart.");
        container
          .append("div")
          .attr("class", "error-message")
          .style("padding", "20px")
          .style("text-align", "center")
          .style("color", "#666")
          .html(`
            <i class="fas fa-info-circle" style="font-size: 2rem; margin-bottom: 10px;"></i>
            <p><strong>No data available</strong></p>
            <p>No valid sales data found to generate the Brands chart.</p>
          `);
        return;
      }

      // Populate category filter dynamically based on "Category Name" from small_dataset.csv
      const categories = Array.from(new Set(validData.map(d => d["Category Name"]))).filter(c => c).sort();
      const categoryFilterSelect = document.getElementById("category-filter");
      // Clear existing options, but keep "All Categories" if it's the first option
      while (categoryFilterSelect.options.length > 1) {
        categoryFilterSelect.remove(1);
      }
      categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        categoryFilterSelect.appendChild(option);
      });

      // Define a single color for all bars - now red
      const singleBarColor = "#e53935"; // A shade of red
      const hoverBarColor = d3.color(singleBarColor).darker(0.75); // Darker shade for hover

      function initBrandsChart() {
        // Clear previous chart if any
        container.html("");

        const categoryFilter = document.getElementById("category-filter").value;
        const monthFilter = document.getElementById("month-filter").value;

        // Filter data based on selections
        let filteredData = validData;

        if (categoryFilter !== "all") {
          filteredData = filteredData.filter(
            (d) => d["Category Name"] === categoryFilter
          );
        }

        if (monthFilter !== "all") {
          // Date objects store month as 0-indexed (0 for January, 11 for December)
          filteredData = filteredData.filter(
            (d) => d.Date.getMonth() + 1 === parseInt(monthFilter)
          );
        }

        if (filteredData.length === 0) {
          console.warn("No data after filtering for Brands chart.");
          container
            .append("div")
            .attr("class", "error-message")
            .style("padding", "20px")
            .style("text-align", "center")
            .style("color", "#666")
            .html(`
              <i class="fas fa-info-circle" style="font-size: 2rem; margin-bottom: 10px;"></i>
              <p><strong>No data available</strong></p>
              <p>No sales data found for the selected filters.</p>
              <p>Please adjust your category or month filters.</p>
            `);
          return;
        }

        // Group data by item description (brand/product) and sum sales
        // Using "Item Description" and "Sale (Dollars)" from small_dataset.csv
        const brandSales = d3.rollup(
          filteredData,
          (v) => d3.sum(v, (d) => d["Sale (Dollars)"]),
          (d) => d["Item Description"]
        );

        // Convert to array and sort by sales in descending order
        const sortedBrands = Array.from(brandSales)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10); // Get top 10 brands/products


        // Calculate dynamic left margin based on the longest label
        // Temporarily append a dummy SVG to measure text width
        const tempSvg = d3.select("body").append("svg").attr("class", "temp-svg").style("visibility", "hidden");
        let maxLabelWidth = 0;
        const yAxisLabelFontSize = 14; // Matches the font size set below for Y-axis labels

        sortedBrands.forEach(d => {
          const textElement = tempSvg.append("text")
            .attr("font-size", `${yAxisLabelFontSize}px`)
            .text(d[0]);
          const bbox = textElement.node().getBBox();
          maxLabelWidth = Math.max(maxLabelWidth, bbox.width);
          textElement.remove(); // Clean up temporary text element
        });
        tempSvg.remove(); // Clean up temporary SVG

        // Add some padding to the maxLabelWidth
        const dynamicLeftMargin = maxLabelWidth + 50; // 50px for padding and axis line/ticks

        // Adjust margin to give more space for labels
        const margin = { top: 20, right: 100, bottom: 40, left: dynamicLeftMargin }; // Dynamic left margin
        const chartWidth = container.node().getBoundingClientRect().width - margin.left - margin.right;

        // Dynamically adjust height based on number of bars and desired bar height/padding
        const barHeight = 30; // Increased bar height for better visibility
        const barPadding = 10;
        const totalBarSpace = sortedBrands.length * (barHeight + barPadding);
        const chartHeight = totalBarSpace + margin.top + margin.bottom;


        const svg = container
          .append("svg")
          .attr("width", chartWidth + margin.left + margin.right)
          .attr("height", chartHeight) // Use adjusted chartHeight
          .append("g")
          .attr("transform", `translate(${margin.left},${margin.top})`);

        // X scale
        const xScale = d3
          .scaleLinear()
          .domain([0, d3.max(sortedBrands, (d) => d[1]) * 1.2]) // Increased padding by 20%
          .range([0, chartWidth]);

        // Y scale
        const yScale = d3
          .scaleBand()
          .domain(sortedBrands.map((d) => d[0]))
          .range([0, totalBarSpace]) // Range is total space for bars
          .padding(barPadding / (barHeight + barPadding)); // Adjust padding based on new barHeight

        // Add X axis
        svg
          .append("g")
          .attr("transform", `translate(0,${totalBarSpace})`) // Translate to the bottom of the bars
          .call(d3.axisBottom(xScale).tickFormat(d3.format("$.2s")))
          .selectAll("text")
          .attr("font-size", "14px"); // Increased font size

        // Add Y axis
        svg.append("g")
          .call(d3.axisLeft(yScale))
          .selectAll("text")
          .attr("font-size", `${yAxisLabelFontSize}px`) // Use dynamic font size
          .attr("text-anchor", "end") // Ensure text aligns to the right edge of the axis line
          .style("white-space", "nowrap"); // Prevent text wrapping, allowing full name to show

        // Bars
        svg
          .selectAll(".bar")
          .data(sortedBrands)
          .enter()
          .append("rect")
          .attr("class", "bar")
          .attr("y", (d) => yScale(d[0]))
          .attr("x", 0)
          .attr("height", yScale.bandwidth()) // Use yScale.bandwidth() for bar height
          .attr("fill", singleBarColor) // Apply single color for all bars - now red
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
                  .attr("fill", hoverBarColor); // Use the pre-calculated darker color
              })
              .on("mouseout", function(event, d) {
                // Revert to original color on mouseout
                d3.select(this)
                  .transition() // Smooth transition for visual effect
                  .duration(200) // Transition duration
                  .attr("fill", singleBarColor); // Original single color
              });
          });


        // Add labels for bars
        svg
          .selectAll(".bar-label")
          .data(sortedBrands)
          .enter()
          .append("text")
          .attr("class", "bar-label")
          .attr("x", 0) // Start labels at x=0
          .attr("y", (d) => yScale(d[0]) + yScale.bandwidth() / 2)
          .attr("dy", "0.35em")
          .text((d) => d3.format("$,.0f")(d[1]))
          .attr("font-size", "12px") // Increased font size
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
          .attr("y", chartHeight - 5) // Adjusted position based on new chartHeight
          .text("Total Sales (Dollars)")
          .attr("font-size", "14px") // Increased font size
          .attr("fill", "#555");
      }

      // Initial chart render after data is loaded
      initBrandsChart();

      // Filter functionality - Re-render chart on filter change
      document.getElementById("category-filter")?.addEventListener("change", initBrandsChart);
      document.getElementById("month-filter")?.addEventListener("change", initBrandsChart);
      document.getElementById("reset-filters")?.addEventListener("click", () => {
        document.getElementById("category-filter").value = "all";
        document.getElementById("month-filter").value = "all";
        initBrandsChart();
      });
    })
    .catch((error) => {
      console.error("❌ Failed to load CSV data for brands:", error);
      container
        .append("div")
        .attr("class", "error-message")
        .style("padding", "20px")
        .style("text-align", "center")
        .style("color", "#dc3545")
        .html(`
          <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 10px;"></i>
          <p><strong>Error loading dataset</strong></p>
          <p>Please check that 'data/Cleaned_Liquor_Sales.csv' exists and is accessible for the Brands chart.</p>
        `);
    });
});
