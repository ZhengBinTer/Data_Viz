// Student 1: Monthly Sales Chart Implementation
document.addEventListener("DOMContentLoaded", async () => {

  // Load data
  const d3 = window.d3
  const container = d3.select("#monthly-sales-chart")
  container.select(".chart-placeholder").remove()

// Load the smaller dataset
  d3.csv("data/dataset.csv")
    .then((data) => {
      const parseDate = d3.timeParse("%Y-%m-%d")  // <-- Updated parser
      const formatMonth = d3.timeFormat("%B")

      // Parse and clean data
      data.forEach((d) => {
        d.parsedDate = parseDate(d.Date)
        d.sales = +d["Sale (Dollars)"]
        d.category = d["Category Name"]
        d.county = d.County

        if (d.parsedDate) {
          d.month = new Date(d.parsedDate.getFullYear(), d.parsedDate.getMonth(), 1)
        }
      })

      // Filter out invalid data
      const validData = data.filter((d) => d.parsedDate && d.sales > 0 && d.category)

      // === County Dropdown Setup ===
      const allCounties = Array.from(new Set(validData.map((d) => d.county)))
        .filter((county) => county && county.trim() !== "") // Remove empty counties
        .sort()

      console.log("Available counties:", allCounties.length)

      const countySelect = d3.select("#county-filter")

      // Clear existing options except "All Counties"
      countySelect.selectAll("option.custom").remove()

      // Add county options
      countySelect
        .selectAll("option.custom")
        .data(allCounties)
        .enter()
        .append("option")
        .attr("value", (d) => d)
        .attr("class", "custom")
        .text((d) => d)

      function drawChart(filteredData) {
        // Clear any existing error messages first
        container.selectAll(".error-message").remove()

        // Clear previous chart and legend
        container.selectAll("svg").remove()
        container.selectAll(".chart-wrapper").remove()

        // === DYNAMIC TOP 10 CATEGORIES CALCULATION ===
        // Calculate top 10 categories based on the FILTERED data, not the entire dataset
        const salesByCategory = d3.rollup(
          filteredData,
          (v) => d3.sum(v, (d) => d.sales),
          (d) => d.category,
        )

        const top10Categories = Array.from(salesByCategory.entries())
          .sort((a, b) => d3.descending(a[1], b[1]))
          .slice(0, 10)
          .map((d) => d[0])

        console.log("Top 10 Categories for current filter:", top10Categories)
        console.log(
          "Category sales breakdown:",
          Array.from(salesByCategory.entries())
            .sort((a, b) => d3.descending(a[1], b[1]))
            .slice(0, 10)
            .map(([cat, sales]) => ({ category: cat, sales: d3.format("$,.0f")(sales) })),
        )

        // Filter data to only include the dynamically calculated top 10 categories
        const top10Data = filteredData.filter((d) => top10Categories.includes(d.category))

        // Group by category and month
        const categoryMonthData = d3.rollup(
          top10Data,
          (v) => d3.sum(v, (d) => d.sales),
          (d) => d.category,
          (d) => d3.timeFormat("%Y-%m")(d.month),
        )

        // Convert to array format for D3
        const categoryData = Array.from(categoryMonthData, ([category, monthMap]) => ({
          category,
          values: Array.from(monthMap, ([monthStr, sales]) => ({
            month: new Date(monthStr + "-01"),
            sales: sales,
          })).sort((a, b) => d3.ascending(a.month, b.month)),
        }))

        // Create main wrapper with side-by-side layout
        const chartWrapper = container
          .append("div")
          .attr("class", "chart-wrapper")
          .style("display", "flex")
          .style("width", "100%")
          .style("height", "100%")
          .style("min-height", "800px") // Increased from 600px
          .style("gap", "20px")

        // Chart container (left side)
        const chartContainer = chartWrapper
          .append("div")
          .attr("class", "chart-area")
          .style("flex", "1")
          .style("min-width", "0")
          .style("height", "100%")
          .style("min-height", "700px") // Increased from 500px

        // Legend container (right side)
        const legendContainer = chartWrapper
          .append("div")
          .attr("class", "legend-area")
          .style("width", "250px")
          .style("flex-shrink", "0")
          .style("height", "100%")
          .style("display", "flex")
          .style("flex-direction", "column")

        // Chart dimensions - INCREASED SIZE
        const containerRect = chartContainer.node().getBoundingClientRect()
        const margin = { top: 60, right: 40, bottom: 400, left: 140 } // Increased margins
        const width = Math.max(1200, containerRect.width - 40) - margin.left - margin.right // Increased from 900
        const height = Math.max(800, containerRect.height - 40) - margin.top - margin.bottom // Increased from 500

        // Create SVG in chart container
        const svg = chartContainer
          .append("svg")
          .attr("width", "100%")
          .attr("height", height + margin.top + margin.bottom)
          .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
          .attr("preserveAspectRatio", "xMidYMid meet")

        const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`)

        // Scales
        const allMonths = Array.from(new Set(top10Data.map((d) => d.month))).sort()
        const x = d3.scaleTime().domain(d3.extent(allMonths)).range([0, width])

        const maxSales = d3.max(categoryData, (c) => d3.max(c.values, (v) => v.sales))
        const y = d3
          .scaleLinear()
          .domain([0, maxSales * 1.1])
          .nice()
          .range([height, 0])

        // Dynamic color scale - updates based on current top 10 categories
        const color = d3.scaleOrdinal().domain(top10Categories).range([
          "#1f77b4", // Blue
          "#17becf", // Cyan/Teal
          "#7f7f7f", // Gray
          "#aec7e8", // Light Blue
          "#bcbd22", // Yellow/Gold
          "#9467bd", // Purple
          "#f7b6d3", // Light Pink
          "#8c564b", // Brown
          "#2ca02c", // Green
          "#ff7f0e", // Orange
        ])

        // Add axes
        g.append("g")
          .attr("class", "x-axis")
          .attr("transform", `translate(0,${height})`)
          .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%b")).ticks(d3.timeMonth.every(1)))
          .selectAll("text")
          .style("font-size", "16px") // Increased from 12px
          .style("font-weight", "bold")

        g.append("g")
          .attr("class", "y-axis")
          .call(
            d3
              .axisLeft(y)
              .tickFormat((d) => d3.format("$.2s")(d))
              .ticks(8),
          )
          .selectAll("text")
          .style("font-size", "16px") // Increased from 12px
          .style("font-weight", "bold")

        // Add axis labels
        g.append("text")
          .attr("class", "y-label")
          .attr("text-anchor", "middle")
          .attr("x", -height / 2)
          .attr("y", -60)
          .attr("transform", "rotate(-90)")
          .style("font-size", "18px") // Increased from 14px
          .style("font-weight", "bold")
          .style("fill", "#333")
          .text("Sales (Dollars)")

        g.append("text")
          .attr("class", "x-label")
          .attr("text-anchor", "middle")
          .attr("x", width / 2)
          .attr("y", height + 50)
          .style("font-size", "18px") // Increased from 14px
          .style("font-weight", "bold")
          .style("fill", "#333")
          .text("Month")

        // Line generator
        const line = d3
          .line()
          .x((d) => x(d.month))
          .y((d) => y(d.sales))
          .curve(d3.curveMonotoneX)

        // Add lines for each category
        categoryData.forEach((cat) => {
          // Add line
          g.append("path")
            .datum(cat.values)
            .attr("class", `line-${cat.category.replace(/[^a-zA-Z0-9]/g, "")}`)
            .attr("fill", "none")
            .attr("stroke", color(cat.category))
            .attr("stroke-width", 2.5)
            .attr("opacity", 0.8)
            .attr("d", line)

          // Add dots
          g.selectAll(`.dot-${cat.category.replace(/[^a-zA-Z0-9]/g, "")}`)
            .data(cat.values)
            .enter()
            .append("circle")
            .attr("class", `dot-${cat.category.replace(/[^a-zA-Z0-9]/g, "")}`)
            .attr("cx", (d) => x(d.month))
            .attr("cy", (d) => y(d.sales))
            .attr("r", 4)
            .attr("fill", color(cat.category))
            .attr("stroke", "white")
            .attr("stroke-width", 1)
            .style("cursor", "pointer")
            .on("mouseover", (event, d) => {
              // Tooltip
              const tooltip = d3
                .select("body")
                .append("div")
                .attr("class", "tooltip")
                .style("position", "absolute")
                .style("background", "rgba(0,0,0,0.8)")
                .style("color", "white")
                .style("padding", "8px")
                .style("border-radius", "4px")
                .style("font-size", "14px") // Increased from 12px
                .style("pointer-events", "none")
                .style("opacity", 0)
                .style("z-index", "1000")

              tooltip.transition().duration(200).style("opacity", 1)
              tooltip
                .html(`
                <strong>${cat.category}</strong><br/>
                ${formatMonth(d.month)}: $${d.sales.toLocaleString()}
              `)
                .style("left", event.pageX + 10 + "px")
                .style("top", event.pageY - 10 + "px")
            })
            .on("mouseout", () => {
              d3.selectAll(".tooltip").remove()
            })
        })

        // Create dynamic legend based on current top 10 categories
        const legend = legendContainer
          .append("div")
          .style("background-color", "#f8f9fa")
          .style("border", "1px solid #d1d5db")
          .style("border-radius", "4px")
          .style("padding", "12px")
          .style("font-family", "Arial, sans-serif")
          .style("height", "100%")
          .style("display", "flex")
          .style("flex-direction", "column")
          .style("overflow-y", "auto")

        // Legend title
        legend
          .append("div")
          .style("font-weight", "bold")
          .style("margin-bottom", "10px")
          .style("font-size", "16px") // Increased from 12px
          .style("color", "#374151")
          .text("Top 10 Categories")

        // Legend items container
        const legendItemsContainer = legend.append("div").style("flex", "1").style("overflow-y", "auto")

        // Legend items - now dynamic based on current filter
        const legendItems = legendItemsContainer
          .selectAll(".legend-item")
          .data(
            top10Categories.map((category) => ({
              category,
              sales: salesByCategory.get(category),
            })),
          )
          .enter()
          .append("div")
          .attr("class", "legend-item")
          .style("display", "flex")
          .style("align-items", "center")
          .style("gap", "8px")
          .style("padding", "6px 0")
          .style("cursor", "pointer")
          .style("font-size", "14px") // Increased from 12px
          .style("line-height", "1.2")
          .style("border-bottom", "1px solid #e5e7eb")

        // Color squares
        legendItems
          .append("div")
          .style("width", "12px")
          .style("height", "12px")
          .style("background-color", (d) => color(d.category))
          .style("border", "1px solid #ccc")
          .style("flex-shrink", "0")

        // Category text with sales amount
        legendItems
          .append("span")
          .style("color", "#374151")
          .style("font-size", "13px") // Increased from 11px
          .style("line-height", "1.3")
          .text((d) => {
            const categoryName = d.category.length > 15 ? d.category.substring(0, 15) + "..." : d.category
            const salesAmount = d3.format("$.2s")(d.sales)
            return `${categoryName} (${salesAmount})`
          })

        // Add interactivity to legend
        legendItems
          .on("mouseover", (event, d) => {
            // Highlight the corresponding line
            g.selectAll("path").style("opacity", 0.2)
            g.selectAll("circle").style("opacity", 0.2)
            g.select(`.line-${d.category.replace(/[^a-zA-Z0-9]/g, "")}`)
              .style("opacity", 1)
              .style("stroke-width", 4)
            g.selectAll(`.dot-${d.category.replace(/[^a-zA-Z0-9]/g, "")}`).style("opacity", 1)

            // Highlight legend item
            d3.select(event.currentTarget).style("background-color", "#e5e7eb")
          })
          .on("mouseout", (event, d) => {
            // Reset opacity
            g.selectAll("path").style("opacity", 0.8).style("stroke-width", 2.5)
            g.selectAll("circle").style("opacity", 1)

            // Reset legend item background
            d3.select(event.currentTarget).style("background-color", "transparent")
          })

        // Update statistics
        updateStatistics(categoryData, filteredData, salesByCategory)
      }

      function updateStatistics(categoryData, allFilteredData, salesByCategory) {
        // Calculate total sales across all categories and months for the filtered data
        const totalSales = d3.sum(allFilteredData, (d) => d.sales)

        // Calculate average monthly sales (total sales / 12 months)
        const avgMonthlySales = totalSales / 12

        // === FIND BEST MONTH (month with highest total sales) ===
        const salesByMonth = d3.rollup(
          allFilteredData,
          (v) => d3.sum(v, (d) => d.sales),
          (d) => d.month.getMonth(), // Get month number (0-11)
        )

        // Find the month with highest sales
        const bestMonthEntry = Array.from(salesByMonth.entries()).sort((a, b) => d3.descending(a[1], b[1]))[0] // Sort by sales descending, take first

        const bestMonthNumber = bestMonthEntry[0]
        const bestMonthSales = bestMonthEntry[1]

        // Convert month number to month name
        const monthNames = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ]
        const bestMonthName = monthNames[bestMonthNumber]

        // === CALCULATE GROWTH RATE AS PERCENTAGE (December vs January) ===
        const janSales = salesByMonth.get(0) || 0 // January = month 0
        const decSales = salesByMonth.get(11) || 0 // December = month 11

        // Calculate percentage growth: ((Dec - Jan) / Jan) * 100
        let growthRatePercent = 0
        if (janSales > 0) {
          growthRatePercent = ((decSales - janSales) / janSales) * 100
        }

        // === FIND BEST CATEGORY (highest total sales) ===
        const bestCategoryEntry = Array.from(salesByCategory.entries()).sort((a, b) => d3.descending(a[1], b[1]))[0]
        const bestCategoryName = bestCategoryEntry[0]
        const bestCategorySales = bestCategoryEntry[1]

        // Update the statistics in the analysis section (now 4 values)
        const statValues = document.querySelectorAll(".stat-value")
        if (statValues.length >= 4) {
          statValues[0].textContent = `${growthRatePercent >= 0 ? "+" : ""}${d3.format(".1f")(growthRatePercent)}%` // Growth Rate as percentage
          statValues[1].textContent = bestMonthName // Best Month (highest sales month)
          statValues[2].textContent =
            bestCategoryName.length > 20 ? bestCategoryName.substring(0, 20) + "..." : bestCategoryName // Best Category (truncated if too long)
          statValues[3].textContent = `$${d3.format(".2s")(avgMonthlySales)}` // Avg Monthly Sales
        }

        console.log("Statistics updated for filtered data:", {
          totalSales: d3.format("$,.0f")(totalSales),
          avgMonthlySales: d3.format("$,.0f")(avgMonthlySales),
          bestMonth: `${bestMonthName} ($${d3.format(",.0f")(bestMonthSales)})`,
          bestCategory: `${bestCategoryName} ($${d3.format(",.0f")(bestCategorySales)})`,
          growthRatePercent: `${d3.format(".1f")(growthRatePercent)}%`,
          growthRateExplanation: `((December: $${d3.format(",.0f")(decSales)} - January: $${d3.format(",.0f")(janSales)}) / January: $${d3.format(",.0f")(janSales)}) * 100`,
          monthlyBreakdown: Array.from(salesByMonth.entries())
            .sort((a, b) => d3.descending(a[1], b[1]))
            .map(([month, sales]) => ({
              month: monthNames[month],
              sales: d3.format("$,.0f")(sales),
            })),
        })
      }

      // Initial chart render
      drawChart(validData)

      // County filter event listener
      document.getElementById("county-filter").addEventListener("change", function () {
        const selectedCounty = this.value
        console.log("County filter changed to:", selectedCounty)

        // Clear any existing error messages immediately
        container.selectAll(".error-message").remove()

        // Filter the already loaded data
        let filtered
        if (selectedCounty === "all") {
          filtered = validData
        } else {
          filtered = validData.filter((d) => d.county === selectedCounty)
          console.log(`Filtered data for ${selectedCounty}:`, filtered.length, "records")
        }

        // Only redraw if we have data
        if (filtered.length > 0) {
          drawChart(filtered)
        } else {
          console.warn(`No data found for county: ${selectedCounty}`)
          container.selectAll(".chart-wrapper").remove()
          container
            .append("div")
            .attr("class", "error-message")
            .style("padding", "20px")
            .style("text-align", "center")
            .style("color", "#666")
            .html(`
        <i class="fas fa-info-circle" style="font-size: 2rem; margin-bottom: 10px;"></i>
        <p><strong>No data available</strong></p>
        <p>No sales data found for ${selectedCounty} county.</p>
        <p>Please select a different county or "All Counties".</p>
      `)
        }
      })

      // Reset filters
      document.getElementById("reset-filters").addEventListener("click", () => {
        console.log("Resetting filters")
        document.getElementById("county-filter").value = "all"
        drawChart(validData)
      })
    })
    .catch((error) => {
      console.error("❌ Failed to load CSV data:", error)
      container
        .append("div")
        .attr("class", "error-message")
        .style("padding", "20px")
        .style("text-align", "center")
        .style("color", "#dc3545")
        .html(`
      <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 10px;"></i>
      <p><strong>Error loading dataset</strong></p>
      <p>Please check that 'data/smaller_dataset.csv' exists and is accessible.</p>
    `)
    })
})
