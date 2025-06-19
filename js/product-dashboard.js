// Product Dashboard Controller - Using Regional Dashboard Template
document.addEventListener("DOMContentLoaded", async () => {
  console.log("Product Dashboard loaded - Using regional dashboard template")

  let dashboardData = null

  try {
    // Load data once for all charts
    dashboardData = await d3.csv("data/small_dataset.csv")

    // Parse and clean data
    dashboardData.forEach((d) => {
      d["Sale (Dollars)"] = +d["Sale (Dollars)"] || 0
      d["Volume Sold (Liters)"] = +d["Volume Sold (Liters)"] || 0
      d["Bottle Volume (ml)"] = +d["Bottle Volume (ml)"] || 0
      d.Date = new Date(d.Date)
    })

    // Filter valid data
    dashboardData = dashboardData.filter(
      (d) => d["Sale (Dollars)"] > 0 && d["Category Name"] && d["Item Description"] && d.Date,
    )

    console.log("Dashboard data loaded:", dashboardData.length, "records")

    // Populate category filter
    populateCategoryFilter(dashboardData)

    // Initialize all charts
    initializeAllCharts()

    // Setup filter event listeners
    setupFilters()
  } catch (error) {
    console.error("Error loading dashboard data:", error)
    showErrorMessage()
  }

  function populateCategoryFilter(data) {
    const categories = [...new Set(data.map((d) => d["Category Name"]))].sort()
    const categorySelect = d3.select("#category-filter")

    categories.forEach((category) => {
      categorySelect.append("option").attr("value", category).text(category)
    })
  }

  function initializeAllCharts() {
    if (!dashboardData) return

    // Initialize all 4 charts with dashboard data
    initCategoriesFromExisting(dashboardData)
    initBrandsFromExisting(dashboardData)
    initBottleSizeFromExisting(dashboardData)
    initPriceVolumeFromExisting(dashboardData)
  }

  function setupFilters() {
    // Month filter
    d3.select("#month-filter").on("change", () => {
      updateAllCharts()
    })

    // Category filter
    d3.select("#category-filter").on("change", () => {
      updateAllCharts()
    })

    // Reset filters
    d3.select("#reset-filters").on("click", () => {
      d3.select("#month-filter").property("value", "all")
      d3.select("#category-filter").property("value", "all")
      updateAllCharts()
    })
  }

  function updateAllCharts() {
    if (!dashboardData) return

    const filteredData = getFilteredData()

    // Update all charts with filtered data
    initCategoriesFromExisting(filteredData)
    initBrandsFromExisting(filteredData)
    initBottleSizeFromExisting(filteredData)
    initPriceVolumeFromExisting(filteredData)
  }

  function getFilteredData() {
    let filtered = dashboardData

    const selectedMonth = d3.select("#month-filter").property("value")
    const selectedCategory = d3.select("#category-filter").property("value")

    if (selectedMonth !== "all") {
      filtered = filtered.filter((d) => d.Date.getMonth() + 1 === Number.parseInt(selectedMonth))
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((d) => d["Category Name"] === selectedCategory)
    }

    return filtered
  }

  // Chart 5: Top Categories (Reusing categories.js logic) - EXPANDED WIDTH
  function initCategoriesFromExisting(data) {
    const container = d3.select("#top-categories-chart")
    container.selectAll("*").remove()

    // Group by category and sum sales
    const categorySales = d3.rollup(
      data,
      (v) => d3.sum(v, (d) => d["Sale (Dollars)"]),
      (d) => d["Category Name"],
    )

    const sortedCategories = Array.from(categorySales)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10) // Top 10 categories

    if (sortedCategories.length === 0) {
      container
        .append("div")
        .attr("class", "no-data-message")
        .style("padding", "20px")
        .style("text-align", "center")
        .style("color", "#666")
        .html("<i class='fas fa-info-circle'></i><p>No category data available</p>")
      return
    }

    // EXPANDED DIMENSIONS - Fill more of the dashboard space
    const margin = { top: 20, right: 40, bottom: 80, left: 200 }
    const containerWidth = container.node().getBoundingClientRect().width || 600
    const width = containerWidth - margin.left - margin.right - 20 // Account for padding
    const height = 360 - margin.top - margin.bottom

    const svg = container
      .append("svg")
      .attr("width", containerWidth)
      .attr("height", 360)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(sortedCategories, (d) => d[1]) * 1.1])
      .range([0, width])

    const yScale = d3
      .scaleBand()
      .domain(sortedCategories.map((d) => d[0]))
      .range([0, height])
      .padding(0.1)

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10)

    // Add X axis
    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).ticks(8).tickFormat(d3.format("$.2s")))
      .selectAll("text")
      .attr("font-size", "11px")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)")

    // Add Y axis
    svg.append("g").call(d3.axisLeft(yScale)).selectAll("text").attr("font-size", "12px")

    // Add bars with animation
    svg
      .selectAll(".bar")
      .data(sortedCategories)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("y", (d) => yScale(d[0]))
      .attr("x", 0)
      .attr("height", yScale.bandwidth())
      .attr("fill", (d) => colorScale(d[0]))
      .attr("width", 0)
      .transition()
      .duration(800)
      .delay((d, i) => i * 50)
      .attr("width", (d) => xScale(d[1]))

    // Add labels
    svg
      .selectAll(".bar-label")
      .data(sortedCategories)
      .enter()
      .append("text")
      .attr("class", "bar-label")
      .attr("x", 0)
      .attr("y", (d) => yScale(d[0]) + yScale.bandwidth() / 2)
      .attr("dy", "0.35em")
      .text((d) => d3.format("$,.0f")(d[1]))
      .attr("font-size", "10px")
      .attr("fill", "#333")
      .transition()
      .duration(800)
      .delay((d, i) => i * 50)
      .attr("x", (d) => xScale(d[1]) + 5)

    // Add X axis label
    svg
      .append("text")
      .attr("class", "x-axis-label")
      .attr("text-anchor", "middle")
      .attr("x", width / 2)
      .attr("y", height + 70)
      .text("Total Sales (Dollars)")
      .attr("font-size", "12px")
      .attr("fill", "#555")
  }

  // Chart 6: Top Brands (Reusing brands.js logic) - EXPANDED WIDTH
  function initBrandsFromExisting(data) {
    const container = d3.select("#top-brands-chart")
    container.selectAll("*").remove()

    // Group by item description and sum sales
    const brandSales = d3.rollup(
      data,
      (v) => d3.sum(v, (d) => d["Sale (Dollars)"]),
      (d) => d["Item Description"],
    )

    const sortedBrands = Array.from(brandSales)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10) // Top 10 brands

    if (sortedBrands.length === 0) {
      container
        .append("div")
        .attr("class", "no-data-message")
        .style("padding", "20px")
        .style("text-align", "center")
        .style("color", "#666")
        .html("<i class='fas fa-info-circle'></i><p>No brand data available</p>")
      return
    }

    // Calculate dynamic left margin based on longest label
    const tempSvg = d3.select("body").append("svg").attr("class", "temp-svg").style("visibility", "hidden")
    let maxLabelWidth = 0
    const yAxisLabelFontSize = 12

    sortedBrands.forEach((d) => {
      const textElement = tempSvg.append("text").attr("font-size", `${yAxisLabelFontSize}px`).text(d[0])
      const bbox = textElement.node().getBBox()
      maxLabelWidth = Math.max(maxLabelWidth, bbox.width)
      textElement.remove()
    })
    tempSvg.remove()

    const dynamicLeftMargin = Math.min(maxLabelWidth + 50, 280)

    // EXPANDED DIMENSIONS - Fill more of the dashboard space
    const containerWidth = container.node().getBoundingClientRect().width || 600
    const margin = { top: 20, right: 40, bottom: 80, left: dynamicLeftMargin }
    const width = containerWidth - margin.left - margin.right - 20 // Account for padding
    const height = 360 - margin.top - margin.bottom

    const svg = container
      .append("svg")
      .attr("width", containerWidth)
      .attr("height", 360)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(sortedBrands, (d) => d[1]) * 1.1])
      .range([0, width])

    const yScale = d3
      .scaleBand()
      .domain(sortedBrands.map((d) => d[0]))
      .range([0, height])
      .padding(0.1)

    const singleBarColor = "#e53935" // Red color from brands.js

    // Add X axis
    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).ticks(8).tickFormat(d3.format("$.2s")))
      .selectAll("text")
      .attr("font-size", "11px")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)")

    // Add Y axis
    svg
      .append("g")
      .call(d3.axisLeft(yScale))
      .selectAll("text")
      .attr("font-size", `${yAxisLabelFontSize}px`)
      .attr("text-anchor", "end")
      .style("white-space", "nowrap")

    // Add bars with animation
    svg
      .selectAll(".bar")
      .data(sortedBrands)
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

    // Add labels
    svg
      .selectAll(".bar-label")
      .data(sortedBrands)
      .enter()
      .append("text")
      .attr("class", "bar-label")
      .attr("x", 0)
      .attr("y", (d) => yScale(d[0]) + yScale.bandwidth() / 2)
      .attr("dy", "0.35em")
      .text((d) => d3.format("$,.0f")(d[1]))
      .attr("font-size", "10px")
      .attr("fill", "#333")
      .transition()
      .duration(800)
      .delay((d, i) => i * 50)
      .attr("x", (d) => xScale(d[1]) + 5)

    // Add X axis label
    svg
      .append("text")
      .attr("class", "x-axis-label")
      .attr("text-anchor", "middle")
      .attr("x", width / 2)
      .attr("y", height + 70)
      .text("Total Sales (Dollars)")
      .attr("font-size", "12px")
      .attr("fill", "#555")
  }

  // Chart 7: Bottle Size (Reusing bottle-size.js logic) - EXPANDED SIZE
  function initBottleSizeFromExisting(data) {
    const container = d3.select("#bottle-size-chart")
    container.selectAll("*").remove()

    // Calculate total sales volume per bottle size
    const volumeByBottleSize = d3.rollup(
      data,
      (v) => d3.sum(v, (d) => d["Sale (Dollars)"]),
      (d) => +d["Bottle Volume (ml)"],
    )

    const dataArray = Array.from(volumeByBottleSize, ([key, value]) => ({ volume: key, totalSales: value }))

    if (dataArray.length === 0) {
      container
        .append("div")
        .attr("class", "no-data-message")
        .style("padding", "20px")
        .style("text-align", "center")
        .style("color", "#666")
        .html("<i class='fas fa-info-circle'></i><p>No bottle size data available</p>")
      return
    }

    // Implement "Others" grouping
    const totalVolume = d3.sum(dataArray, (d) => d.totalSales)
    const thresholdPercentage = 0.05 // 5% threshold

    dataArray.sort((a, b) => b.totalSales - a.totalSales)

    const mainSlices = []
    let otherTotalSales = 0

    dataArray.forEach((d) => {
      const percentage = d.totalSales / totalVolume
      if (percentage >= thresholdPercentage) {
        mainSlices.push(d)
      } else {
        otherTotalSales += d.totalSales
      }
    })

    if (otherTotalSales > 0) {
      mainSlices.push({
        volume: "Others",
        totalSales: otherTotalSales,
      })
    }

    mainSlices.sort((a, b) => {
      if (a.volume === "Others") return 1
      if (b.volume === "Others") return -1
      return b.totalSales - a.totalSales
    })

    // EXPANDED DIMENSIONS - Fill more of the dashboard space
    const containerWidth = container.node().getBoundingClientRect().width || 600
    const width = containerWidth - 40 // Account for padding
    const height = 360
    const radius = Math.min(width, height) / 2 - 30

    const svg = container
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`)

    const color = d3.scaleOrdinal(d3.schemeCategory10)
    const pie = d3.pie().value((d) => d.totalSales)
    const arc = d3.arc().innerRadius(0).outerRadius(radius)

    const arcs = svg.selectAll(".arc").data(pie(mainSlices)).enter().append("g").attr("class", "arc")

    arcs
      .append("path")
      .attr("d", arc)
      .attr("fill", (d) => color(d.data.volume))
      .attr("stroke", "white")
      .style("stroke-width", "2px")
      .style("opacity", 0.8)

    // Add percentage labels
    arcs
      .append("text")
      .attr("transform", (d) => `translate(${arc.centroid(d)})`)
      .attr("dy", "0.35em")
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", "black")
      .text((d) => `${((d.data.totalSales / totalVolume) * 100).toFixed(1)}%`)
      .style("pointer-events", "none")
  }

  // Chart 8: Price vs Volume (Reusing price-analysis.js logic) - EXPANDED SIZE
  function initPriceVolumeFromExisting(data) {
    const container = d3.select("#price-volume-chart")
    container.selectAll("*").remove()

    // Group by category and calculate averages
    const groupedData = d3
      .rollups(
        data,
        (v) => ({
          Avg_Sale: d3.mean(v, (d) => +d["Sale (Dollars)"] || 0),
          Total_Volume_Sold_Liters: d3.sum(v, (d) => +d["Volume Sold (Liters)"] || 0),
        }),
        (d) => d["Category Name"],
      )
      .map(([CategoryName, values]) => ({ CategoryName, ...values }))

    const scatterData = groupedData.filter((d) => d.Avg_Sale > 0 && d.Total_Volume_Sold_Liters > 0)

    if (scatterData.length === 0) {
      container
        .append("div")
        .attr("class", "no-data-message")
        .style("padding", "20px")
        .style("text-align", "center")
        .style("color", "#666")
        .html("<i class='fas fa-info-circle'></i><p>No price/volume data available</p>")
      return
    }

    // EXPANDED DIMENSIONS - Fill more of the dashboard space
    const containerWidth = container.node().getBoundingClientRect().width || 600
    const margin = { top: 20, right: 40, bottom: 60, left: 80 }
    const width = containerWidth - margin.left - margin.right - 20 // Account for padding
    const height = 360 - margin.top - margin.bottom

    const svg = container
      .append("svg")
      .attr("width", containerWidth)
      .attr("height", 360)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(scatterData, (d) => d.Avg_Sale) * 1.1])
      .range([0, width])

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(scatterData, (d) => d.Total_Volume_Sold_Liters) * 1.1])
      .range([height, 0])

    const categoryColorScale = d3.scaleOrdinal(d3.schemeCategory10)

    // Add X axis
    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).ticks(8).tickFormat(d3.format("$,.2f")))

    // Add Y axis
    svg.append("g").call(d3.axisLeft(yScale).ticks(8))

    // Add circles
    svg
      .selectAll("circle")
      .data(scatterData)
      .enter()
      .append("circle")
      .attr("cx", (d) => xScale(d.Avg_Sale))
      .attr("cy", (d) => yScale(d.Total_Volume_Sold_Liters))
      .attr("r", 0)
      .attr("fill", (d) => categoryColorScale(d.CategoryName))
      .attr("opacity", 0.7)
      .transition()
      .duration(750)
      .attr("r", 6) // Slightly larger circles for better visibility

    // Add axis labels
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height + 50)
      .attr("fill", "#000")
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .text("Average Sale Price (USD)")

    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -60)
      .attr("x", -height / 2)
      .attr("dy", "1em")
      .attr("fill", "#000")
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .text("Total Volume Sold (Liters)")
  }

  function showErrorMessage() {
    d3.selectAll(".chart-body").html(`
      <div class="error-message" style="text-align: center; padding: 40px;">
        <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: #dc3545; margin-bottom: 10px;"></i>
        <p><strong>Error Loading Data</strong></p>
        <p>Please check that 'data/small_dataset.csv' exists and is accessible.</p>
      </div>
    `)
  }
})
