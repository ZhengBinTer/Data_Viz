const width = 600,
    height = 600,
    radius = Math.min(width, height) / 2;

// Select the chart container and append SVG
const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`);

// Color scale (domain will be updated dynamically)
const color = d3.scaleOrdinal(d3.schemeCategory10); 

const tooltip = d3.select("#tooltip");
const legendContainer = d3.select("#legend");
const preferencesList = d3.select("#preferences-list"); // Select the preferences list

// Arc generators for the pie chart
const pie = d3.pie().value(d => d[1]).sort(null); // Value is the totalSales now
const arc = d3.arc().innerRadius(0).outerRadius(radius - 10);
const outerArc = d3.arc().innerRadius(0).outerRadius(radius);

let rawDataGlobal; // Store raw data globally after initial load

/* -------- Main drawing and updating routine -------- */
function updateChart() {
    if (!rawDataGlobal) return;

    const selectedMonth = document.getElementById("month-select").value;
    const selectedCategory = document.getElementById("category-select").value;

    let filteredData = rawDataGlobal;

    if (selectedMonth !== "all") {
        filteredData = filteredData.filter(d => {
            // Updated date parsing format
            const saleDate = d3.timeParse("%Y-%m-%d")(d.Date);
            return saleDate && d3.timeFormat("%m/%Y")(saleDate) === selectedMonth;
        });
    }

    if (selectedCategory !== "all") {
        filteredData = filteredData.filter(d => d["Category Name"] === selectedCategory); // Using "Category Name" from CSV
    }

    // Calculate total sales volume per bottle size
    const volumeByBottleSize = d3.rollup(
        filteredData,
        v => d3.sum(v, d => +d["Sale (Dollars)"]), // Sum sales dollars, as per original JS
        d => +d["Bottle Volume (ml)"] // Group by Bottle Volume (ml)
    );

    // Convert map to array of objects for easier processing
    let dataArray = Array.from(volumeByBottleSize, ([key, value]) => ({ volume: key, totalSales: value }));

    // --- Implement "Others" grouping ---
    const totalVolume = d3.sum(dataArray, d => d.totalSales); // This is actually total Sales (Dollars)
    const thresholdPercentage = 0.05; // 5% threshold for grouping
    
    // Sort data in descending order of totalSales for consistent "Others" grouping
    dataArray.sort((a, b) => b.totalSales - a.totalSales);

    let mainSlices = [];
    let otherTotalSales = 0;
    let otherVolumes = []; // To keep track of volumes grouped into others

    dataArray.forEach(d => {
        const percentage = (d.totalSales / totalVolume);
        if (percentage >= thresholdPercentage) {
            mainSlices.push(d);
        } else {
            otherTotalSales += d.totalSales;
            otherVolumes.push(d.volume);
        }
    });

    // Add 'Others' slice if there are any small items grouped
    if (otherTotalSales > 0) {
        mainSlices.push({
            volume: 'Others', // Label for the combined slice
            totalSales: otherTotalSales,
            otherVolumes: otherVolumes // Store original volumes for potential tooltip/detail
        });
    }

    // Sort the mainSlices again, ensuring 'Others' is at the end if desired, or by size descending
    mainSlices.sort((a, b) => {
        if (a.volume === 'Others') return 1; // Send 'Others' to the end
        if (b.volume === 'Others') return -1; // Send 'Others' to the end
        return b.totalSales - a.totalSales; // Sort others by totalSales descending
    });

    // Update the color scale domain based on the current slices (including 'Others')
    color.domain(mainSlices.map(d => d.volume));

    // Clear previous chart elements
    svg.selectAll("*").remove();

    // Generate pie arcs from the processed data
    const arcs = pie(mainSlices.map(d => [d.volume, d.totalSales]));

    // Draw slices
    const path = svg.selectAll("arc")
        .data(arcs)
        .enter()
        .append("path")
        .attr("d", arc)
        .attr("fill", d => color(d.data[0])) // Use d.data[0] for the volume/label
        .attr("stroke", "white")
        .style("stroke-width", "2px")
        .style("opacity", 0.8)
        .on("mouseover", (event, d) => {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);

            const percentage = (d.data[1] / totalVolume * 100).toFixed(1);
            let tooltipContent = `<strong>${d.data[0]} ml:</strong> $${d.data[1].toFixed(2)} (${percentage}%)`; // Changed "liters" to "$"
            
            // If it's the 'Others' slice, add details about the grouped volumes
            if (d.data[0] === 'Others' && d.data[2].otherVolumes) {
                tooltipContent += `<br>Includes: ${d.data[2].otherVolumes.join(', ')} ml`;
            }

            tooltip.html(tooltipContent)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");

            d3.select(event.currentTarget)
                .transition()
                .duration(200)
                .style("opacity", 1)
                .attr("transform", `scale(1.03)`); // Slight scale up on hover
        })
        .on("mouseout", (event, d) => {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);

            d3.select(event.currentTarget)
                .transition()
                .duration(200)
                .style("opacity", 0.8)
                .attr("transform", `scale(1)`); // Scale down on mouse out
        });

    // Add labels (for direct labels on slices, if desired, otherwise rely on legend)
    svg.selectAll("text")
        .data(arcs)
        .enter()
        .append("text")
        .attr("transform", d => `translate(${arc.centroid(d)})`)
        .attr("dy", "0.35em")
        .style("text-anchor", "middle")
        .style("font-size", "12px")
        .style("fill", "black") // You might need to adjust color for contrast
        .text(d => `${(d.data[1] / totalVolume * 100).toFixed(1)}%`)
        .style("pointer-events", "none"); // Prevents text from blocking mouse events on slices

    // --- Update Statistics and Insights ---
    // These should use the *original* data before grouping for accurate numbers on individual sizes
    const originalSortedData = Array.from(volumeByBottleSize, ([key, value]) => ({ volume: key, totalSales: value }))
                                .sort((a, b) => b.totalSales - a.totalSales);

    if (originalSortedData.length > 0) {
        d3.select("#mostPopularSize").text(`${originalSortedData[0].volume} ml`);
        const mostPopularShare = (originalSortedData[0].totalSales / totalVolume * 100).toFixed(1);
        d3.select("#revenueShare").text(`${mostPopularShare}%`);
    } else {
        d3.select("#mostPopularSize").text("N/A");
        d3.select("#revenueShare").text("N/A");
    }

    // Update Size Varieties: This should be the count of *original* unique sizes
    d3.select("#sizeVarieties").text(volumeByBottleSize.size);

    // Update Size Preferences insights
    preferencesList.html("");
    let insights = [];

    if (totalVolume === 0) {
        insights.push("No sales data available for the selected filters.");
    } else {
        // Insight for the largest slice (from original data)
        const topOriginalSlice = originalSortedData[0];
        if (topOriginalSlice) {
            const percentage = (topOriginalSlice.totalSales / totalVolume * 100).toFixed(1);
            insights.push(`The ${topOriginalSlice.volume} ml bottle size accounts for ${percentage}% of sales, indicating strong consumer preference.`);
        }

        // Add an insight if 'Others' slice is substantial
        if (otherTotalSales > 0 && (otherTotalSales / totalVolume) >= thresholdPercentage) {
             const percentage = (otherTotalSales / totalVolume * 100).toFixed(1);
             insights.push(`Combined smaller bottle sizes (less than ${thresholdPercentage*100}% each) constitute ${percentage}% of total sales, reflecting diverse or niche demands.`);
        }
    }

    if (insights.length === 0 && dataArray.length > 0) { // dataArray here means original, before grouping
        insights.push("Diverse bottle sizes are contributing to sales in this period.");
    }

    insights.forEach(insight => {
        preferencesList.append("li").text(insight);
    });

    // --- Create Legend ---
    legendContainer.html(""); // Clear existing legend

    legendContainer.selectAll(".legend-item")
        .data(mainSlices) // Use mainSlices for legend (includes 'Others')
        .enter()
        .append("div")
        .attr("class", "legend-item")
        .html(d =>
            `<span class="legend-color" style="background:${color(d.volume)}"></span> ${d.volume} ml`
        );
}

// Initial data load and event listener setup
d3.csv("data/small_dataset.csv").then(data => { // Path updated here
    rawDataGlobal = data;
    updateChart(); 

    document.getElementById("confirm").addEventListener("click", updateChart);

    // Populate month and category dropdowns (ensure this logic is still needed/correct)
    const monthSelect = document.getElementById("month-select");
    const categorySelect = document.getElementById("category-select");

    // Populate unique months
    const uniqueMonths = [...new Set(data.map(d => d3.timeFormat("%m/%Y")(d3.timeParse("%Y-%m-%d")(d.Date))))].sort(); // Updated date parsing format
    uniqueMonths.forEach(month => {
        const option = document.createElement('option');
        option.value = month;
        option.textContent = d3.timeFormat("%B %Y")(d3.timeParse("%m/%Y")(month));
        monthSelect.appendChild(option);
    });

    // Populate unique categories (you might already have hardcoded these in HTML)
    const uniqueCategories = [...new Set(data.map(d => d["Category Name"]))].sort(); // Using "Category Name"
    uniqueCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });

}).catch(error => {
    console.error("Error loading the CSV data:", error);
    svg.append("text")
        .attr("x", 0)
        .attr("y", 0)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("fill", "red")
        .text("Error loading data.");
    d3.select("#mostPopularSize").text("Error");
    d3.select("#revenueShare").text("Error");
    d3.select("#sizeVarieties").text("Error");
    preferencesList.html("<li>Error loading insights.</li>");
});