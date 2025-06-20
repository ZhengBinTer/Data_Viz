// Student 6: Brands Chart Implementation
document.addEventListener("DOMContentLoaded", async () => {
  console.log("Brands page loaded - Student 6 implement your chart here");

  const d3 = window.d3;
  const container = d3.select("#brands-chart");

  // Remove placeholder initially
  container.select(".chart-placeholder").remove();

  // Load data from CSV
  d3.csv("data/dataset.csv") // Assuming this is the correct path to your main dataset
    .then((data) => {
      // Parse and clean data
      data.forEach((d) => {
        // Ensure all relevant fields are parsed as numbers
        d["Sale (Dollars)"] = +d["Sale (Dollars)"]; 
        d["State Bottle Cost"] = +d["State Bottle Cost"];
        d["State Bottle Retail"] = +d["State Bottle Retail"]; // New: Parse State Bottle Retail
        d["Bottles Sold"] = +d["Bottles Sold"];
        d.Date = new Date(d.Date); // Parse date
      });

      // Filter out invalid data (e.g., non-positive sales, missing category/profit data)
      const validData = data.filter(d => 
        // Ensure necessary columns for profit margin calculation are valid
        d["State Bottle Retail"] > 0 && 
        d["State Bottle Cost"] > 0 && 
        d["Category Name"] // Ensure Category Name exists
      );

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
            <p>No valid sales data found to generate the Average Profit Margin by Category chart.</p>
          `);
        return;
      }

      // Define a single color for all bars
      const singleBarColor = "#e53935"; // A shade of red
      const hoverBarColor = d3.color(singleBarColor).darker(0.75); // Darker shade for hover

      function initBrandsChart() {
        // Clear previous chart if any
        container.html("");

        // Group data by Category Name and calculate average profit margin per bottle
        const categoryProfitMargins = d3.rollup(
          validData, // Use validData directly as filters are removed
          v => {
            // For each item (d) in the group (v), calculate the profit per bottle: (State Bottle Retail - State Bottle Cost)
            const profitPerBottleValues = v.map(d => d["State Bottle Retail"] - d["State Bottle Cost"]);
            // Return the average of these individual profit per bottle values for the category
            return profitPerBottleValues.length > 0 ? d3.mean(profitPerBottleValues) : 0;
          },
          d => d["Category Name"]
        );

        // Convert to array and sort by average profit margin in descending order
        const sortedCategories = Array.from(categoryProfitMargins)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10); // Get top 10 categories by average profit margin


        // Calculate dynamic left margin based on the longest label
        const tempSvg = d3.select("body").append("svg").attr("class", "temp-svg").style("visibility", "hidden");
        let maxLabelWidth = 0;
        const yAxisLabelFontSize = 14; 

        sortedCategories.forEach(d => {
          const textElement = tempSvg.append("text")
            .attr("font-size", `${yAxisLabelFontSize}px`)
            .text(d[0]);
          const bbox = textElement.node().getBBox();
          maxLabelWidth = Math.max(maxLabelWidth, bbox.width);
          textElement.remove(); 
        });
        tempSvg.remove(); 

        // Add some padding to the maxLabelWidth
        // Increased dynamicLeftMargin to ensure full word display for Y-axis labels
        const dynamicLeftMargin = maxLabelWidth + 80; 

        // Adjust margin to give more space for labels
        // Adjusted left margin to use the new dynamicLeftMargin
        const margin = { top: 20, right: 100, bottom: 60, left: dynamicLeftMargin }; 
        const chartWidth = container.node().getBoundingClientRect().width - margin.left - margin.right;

        // Dynamically adjust height based on number of bars and desired bar height/padding
        const barHeight = 30; 
        const barPadding = 10;
        const totalBarSpace = sortedCategories.length * (barHeight + barPadding);
        const chartHeight = totalBarSpace + margin.top + margin.bottom;


        const svg = container
          .append("svg")
          .attr("width", chartWidth + margin.left + margin.right)
          .attr("height", chartHeight) 
          .append("g")
          .attr("transform", `translate(${margin.left},${margin.top})`);

        // X scale
        const xScale = d3
          .scaleLinear()
          .domain([0, d3.max(sortedCategories, (d) => d[1]) * 1.2]) 
          .range([0, chartWidth]);

        // Y scale
        const yScale = d3
          .scaleBand()
          .domain(sortedCategories.map((d) => d[0]))
          .range([0, totalBarSpace]) 
          .padding(barPadding / (barHeight + barPadding)); 

        // Add X axis
        svg
          .append("g")
          .attr("transform", `translate(0,${totalBarSpace})`) 
          .call(d3.axisBottom(xScale).tickFormat(d3.format("$.2f"))) // Format as currency with 2 decimal places
          .selectAll("text")
          .attr("font-size", "14px"); 

        // Add Y axis
        svg.append("g")
          .call(d3.axisLeft(yScale))
          .selectAll("text")
          .attr("font-size", `${yAxisLabelFontSize}px`) 
          .attr("text-anchor", "end") 
          .style("white-space", "nowrap"); 

        // Tooltip
        const tooltip = d3.select("#tooltip");

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
          .attr("fill", singleBarColor) 
          .attr("width", 0) 
          .transition() 
          .duration(800) 
          .delay((d, i) => i * 50) 
          .attr("width", (d) => xScale(d[1])) 
          .on("end", function() { 
            d3.select(this)
              .on("mouseover", function(event, d) {
                // Darken the bar color on mouseover
                d3.select(this)
                  .transition() 
                  .duration(200) 
                  .attr("fill", hoverBarColor); 

                // Show tooltip
                tooltip
                  .style("opacity", 1)
                  .html(`<strong>${d[0]}</strong><br>Avg Profit: ${d3.format("$,.2f")(d[1])}`)
                  .style("left", (event.pageX + 10) + "px")
                  .style("top", (event.pageY - 28) + "px");
              })
              .on("mouseout", function(event, d) {
                // Revert to original color on mouseout
                d3.select(this)
                  .transition() 
                  .duration(200) 
                  .attr("fill", singleBarColor); 

                // Hide tooltip
                tooltip.style("opacity", 0);
              });
          });


        // Add labels for bars
        svg
          .selectAll(".bar-label")
          .data(sortedCategories)
          .enter()
          .append("text")
          .attr("class", "bar-label")
          .attr("x", 0) 
          .attr("y", (d) => yScale(d[0]) + yScale.bandwidth() / 2)
          .attr("dy", "0.35em")
          .text((d) => d3.format("$,.2f")(d[1])) // Format as currency with 2 decimal places
          .attr("font-size", "12px") 
          .attr("fill", "#333")
          .transition()
          .duration(800) 
          .delay((d, i) => i * 50) 
          .attr("x", (d) => xScale(d[1]) + 5); 

        // Add X axis label
        svg
          .append("text")
          .attr("class", "x-axis-label")
          .attr("text-anchor", "middle")
          .attr("x", chartWidth / 2)
          .attr("y", chartHeight - (margin.bottom / 2) + 10) // Positioned more centrally for clarity
          .text("Average Profit Margin per Bottle (Dollars)") 
          .attr("font-size", "14px") 
          .attr("fill", "#555");

        // Add Y axis label
        svg
          .append("text")
          .attr("class", "y-axis-label")
          .attr("text-anchor", "middle")
          // Adjust transform translate to push the label further left
          .attr("transform", `translate(${-margin.left + 30}, ${chartHeight / 2}) rotate(-90)`) // Rotated and positioned to the left
          .text("Category Name")
          .attr("font-size", "14px")
          .attr("fill", "#555");
      }

      // Initial chart render after data is loaded
      initBrandsChart();
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
          <p>Please check that 'data/dataset.csv' exists and is accessible for the Brands chart.</p>
        `);
    });
});
