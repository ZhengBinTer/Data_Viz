
// --- Chart Dimensions ---
const margin = { top: 40, right: 20, bottom: 80, left: 100 };
const chartWidth = 850; 
const chartHeight = 500;
const innerWidth = chartWidth - margin.left - margin.right;
const innerHeight = chartHeight - margin.top - margin.bottom;

// --- D3 Selections ---
const scatterPlotContainer = d3.select("#price-volume-chart");
const tooltip = d3.select("#tooltip");
const legendContainer = d3.select("#price-volume-legend");
const insightsList = d3.select("#price-insights-list"); 

// --- Scatter Plot SVG Setup ---
scatterPlotContainer.select("svg").remove(); // Ensure clean slate
const scatterSvg = scatterPlotContainer
    .append("svg")
    .attr("width", chartWidth)
    .attr("height", chartHeight)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// --- Scales and Axes ---
const xScale = d3.scaleLinear();
const yScale = d3.scaleLinear();

const xAxisGroup = scatterSvg.append("g")
    .attr("transform", `translate(0,${innerHeight})`);
const yAxisGroup = scatterSvg.append("g");

// Axis Labels
scatterSvg.append("text")
    .attr("class", "x-axis-label")
    .attr("x", innerWidth / 2)
    .attr("y", innerHeight + margin.bottom - 20)
    .attr("fill", "#000")
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .text("Average Sale Price (USD)");

scatterSvg.append("text")
    .attr("class", "y-axis-label")
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left + 20)
    .attr("x", -innerHeight / 2)
    .attr("dy", "1em")
    .attr("fill", "#000")
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .text("Total Volume Sold (Liters)");

// --- Color Scale for Categories ---
const categoryColorScale = d3.scaleOrdinal(d3.schemeCategory10); // D3's default categorical colors


// --- Main Update Function ---
function updateChartAndInsights(rawData) {
    const groupedData = d3.rollups(
        rawData,
        v => ({
            Avg_Sale: d3.mean(v, d => +d["Sale (Dollars)"] || 0),
            Total_Volume_Sold_Liters: d3.sum(v, d => +d["Volume Sold (Liters)"] || 0)
        }),
        d => d["Category Name"]
    ).map(([CategoryName, values]) => ({ CategoryName, ...values }));

    const scatterData = groupedData.filter(d => d.Avg_Sale > 0 && d.Total_Volume_Sold_Liters > 0);

    // --- Update Scales ---
    xScale.domain([0, d3.max(scatterData, d => d.Avg_Sale) * 1.1]).range([0, innerWidth]);
    yScale.domain([0, d3.max(scatterData, d => d.Total_Volume_Sold_Liters) * 1.1]).range([innerHeight, 0]);

    // Update Axes
    xAxisGroup.call(d3.axisBottom(xScale).ticks(10).tickFormat(d3.format("$,.2f")));
    yAxisGroup.call(d3.axisLeft(yScale));

    // --- Draw/Update Circles ---
    const circles = scatterSvg.selectAll("circle")
        .data(scatterData, d => d.CategoryName); // Use CategoryName as key for object constancy

    // Exit old circles
    circles.exit().remove();

    // Enter new circles
    circles.enter().append("circle")
        .attr("r", 0) // Start with radius 0 for animation
        .attr("fill", d => categoryColorScale(d.CategoryName))
        .attr("opacity", 0.7)
        .merge(circles) // Merge enter and update selections
        .transition().duration(750) // Animate changes
        .attr("cx", d => xScale(d.Avg_Sale))
        .attr("cy", d => yScale(d.Total_Volume_Sold_Liters))
        .attr("r", 5) // Circle size (radius) set to 5
        .on("end", function() { // Re-attach event listeners after transition
            d3.select(this)
                .on("mouseover", function(event, d) {
                    tooltip.transition().duration(200).style("opacity", 1);
                    tooltip.html(`<strong>${d.CategoryName}</strong><br>Price: $${d.Avg_Sale.toFixed(2)}<br>Volume: ${d.Total_Volume_Sold_Liters.toFixed(0)} L`)
                        .style("left", `${event.pageX + 15}px`)
                        .style("top", `${event.pageY - 28}px`);
                })
                .on("mousemove", function(event) {
                    tooltip
                        .style("left", `${event.pageX + 15}px`)
                        .style("top", `${event.pageY - 28}px`);
                })
                .on("mouseout", function() {
                    tooltip.transition().duration(300).style("opacity", 0);
                });
        });

    // --- Update Statistics Cards ---
    const totalAvgPrice = d3.mean(scatterData, d => d.Avg_Sale) || 0;
    const totalVolume = d3.sum(scatterData, d => d.Total_Volume_Sold_Liters) || 0;
    const uniqueCategories = scatterData.length;

    d3.select("#overallAvgPrice").text(`$${totalAvgPrice.toFixed(2)}`);
    d3.select("#overallTotalVolume").text(`${totalVolume.toFixed(0)} L`);
    d3.select("#uniqueCategoryCount").text(uniqueCategories);


    // --- Generate Dynamic Price Insights ---
    insightsList.html(""); // Clear previous insights

    if (scatterData.length === 0) {
        insightsList.append("li").text("No price insights available for the current data.");
    } else {
        const sortedByPrice = [...scatterData].sort((a, b) => b.Avg_Sale - a.Avg_Sale);
        const sortedByVolume = [...scatterData].sort((a, b) => b.Total_Volume_Sold_Liters - a.Total_Volume_Sold_Liters);

        const highestPriceCategory = sortedByPrice[0];
        if (highestPriceCategory) {
            insightsList.append("li").html(`<strong>${highestPriceCategory.CategoryName}</strong> has the highest average sale price of <strong>$${highestPriceCategory.Avg_Sale.toFixed(2)}</strong>.`);
        }

        const highestVolumeCategory = sortedByVolume[0];
        if (highestVolumeCategory && (scatterData.length === 1 || highestVolumeCategory.CategoryName !== highestPriceCategory.CategoryName)) {
            insightsList.append("li").html(`<strong>${highestVolumeCategory.CategoryName}</strong> has the largest total volume sold at <strong>${highestVolumeCategory.Total_Volume_Sold_Liters.toFixed(0)} L</strong>.`);
        }

        const lowVolumeHighPrice = scatterData.filter(d =>
            d.Avg_Sale > totalAvgPrice * 1.2 && d.Total_Volume_Sold_Liters < (totalVolume / uniqueCategories * 0.5) // Significantly above avg price, significantly below avg volume per category
        ).sort((a, b) => b.Avg_Sale - a.Avg_Sale);

        if (lowVolumeHighPrice.length > 0) {
            insightsList.append("li").html(`Some categories like <strong>${lowVolumeHighPrice.slice(0, 2).map(d => `${d.CategoryName}`).join(", ")}${lowVolumeHighPrice.length > 2 ? '...' : ''}</strong> tend to have higher prices with relatively lower volumes, suggesting a more niche or premium market.`);
        }

        const highVolumeLowPrice = scatterData.filter(d =>
            d.Avg_Sale < totalAvgPrice * 0.8 && d.Total_Volume_Sold_Liters > (totalVolume / uniqueCategories * 1.5) // Significantly below avg price, significantly above avg volume per category
        ).sort((a, b) => b.Total_Volume_Sold_Liters - a.Total_Volume_Sold_Liters);

        if (highVolumeLowPrice.length > 0) {
            insightsList.append("li").html(`Conversely, <strong>${highVolumeLowPrice.slice(0, 2).map(d => `${d.CategoryName}`).join(", ")}${highVolumeLowPrice.length > 2 ? '...' : ''}</strong> demonstrate strong sales volumes at more accessible price points, indicating popular, high-volume products.`);
        }

        // Insight 5: Balanced Categories (Moderate Price, Moderate Volume)
        const balancedCategories = scatterData.filter(d =>
            d.Avg_Sale >= totalAvgPrice * 0.8 && d.Avg_Sale <= totalAvgPrice * 1.2 &&
            d.Total_Volume_Sold_Liters >= (totalVolume / uniqueCategories * 0.8) && d.Total_Volume_Sold_Liters <= (totalVolume / uniqueCategories * 1.2)
        );

        if (balancedCategories.length > 0) {
            insightsList.append("li").html(`Several categories, such as <strong>${balancedCategories.slice(0, 2).map(d => `${d.CategoryName}`).join(", ")}${balancedCategories.length > 2 ? '...' : ''}</strong>, show a balanced performance in terms of both average price and total volume sold.`);
        }


        if (insightsList.html() === "") { // Fallback if no specific insights generated
             insightsList.append("li").text("Explore the scatter plot to find patterns between price and volume across different categories. Some categories might defy typical trends!");
        }
    }


    // --- Create Legend ---
    legendContainer.html("");

    legendContainer.selectAll(".legend-item")
        .data(scatterData.sort((a, b) => a.CategoryName.localeCompare(b.CategoryName))) 
        .enter()
        .append("div")
        .attr("class", "legend-item")
        .html(d =>
            `<span class="legend-color" style="background:${categoryColorScale(d.CategoryName)}"></span> ${d.CategoryName}`
        );
}


d3.csv("data/small_dataset.csv").then(data => {
 
    updateChartAndInsights(data);
    scatterPlotContainer.select(".chart-placeholder").remove();
}).catch(error => {
    console.error("Error loading the CSV data:", error);
    scatterPlotContainer.html("<p style='color: red; text-align: center;'>Error loading data. Please check CSV path and format.</p>");
    d3.select("#overallAvgPrice").text("N/A");
    d3.select("#overallTotalVolume").text("N/A");
    d3.select("#uniqueCategoryCount").text("N/A");
    insightsList.html("");
    insightsList.append("li").text("Error loading data for insights.");
});