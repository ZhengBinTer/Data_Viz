// Student 2: Geographic Chart Implementation - True US Counties Choropleth Map
document.addEventListener("DOMContentLoaded", async () => {
  console.log("Geographic page loaded - Creating US Counties Choropleth Map focused on Iowa")

  const d3 = window.d3
  const topojson = window.topojson // Declare topojson variable
  const container = d3.select("#geographic-chart")
  container.select(".chart-placeholder").remove()

  try {
    // Load CSV data and US geographic data
    const [csvData, us] = await Promise.all([
      d3.csv("data/Cleaned_Liquor_Sales.csv"),
      d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/counties-albers-10m.json"),
    ])

    console.log("✅ Data loaded successfully")
    console.log("CSV records:", csvData.length)
    console.log("US counties loaded:", us.objects.counties.geometries.length)

    // Parse and clean CSV data
    csvData.forEach((d) => {
      d.sales = +d["Sale (Dollars)"] || 0
      d.volume = +d["Volume Sold (Liters)"] || 0
      d.county = d.County ? d.County.trim().toUpperCase() : "UNKNOWN"
      d.city = d.City ? d.City.trim() : "Unknown"
      d.storeName = d["Store Name"] ? d["Store Name"].trim() : "Unknown"
      d.bottlesSold = +d["Bottles Sold"] || 0
    })

    // Filter valid data
    const validData = csvData.filter((d) => d.sales > 0 && d.county !== "UNKNOWN")
    console.log("Valid records:", validData.length)

    // Calculate county sales totals
    const countySales = d3.rollup(
      validData,
      (v) => ({
        totalSales: d3.sum(v, (d) => d.sales),
        totalVolume: d3.sum(v, (d) => d.volume),
        recordCount: v.length,
        avgSales: d3.mean(v, (d) => d.sales),
        uniqueStores: new Set(v.map((d) => d.storeName)).size,
        uniqueCities: new Set(v.map((d) => d.city)).size,
        totalBottlesSold: d3.sum(v, (d) => d.bottlesSold),
      }),
      (d) => d.county,
    )

    // Calculate city sales
    const citySales = d3.rollup(
      validData,
      (v) => ({
        totalSales: d3.sum(v, (d) => d.sales),
        totalVolume: d3.sum(v, (d) => d.volume),
        storeCount: new Set(v.map((d) => d.storeName)).size,
        county: v[0].county,
      }),
      (d) => d.city,
    )

    // Create Iowa county name to FIPS mapping (Iowa FIPS codes start with 19)
    const iowaCountyFips = createIowaCountyFipsMapping()

    drawUSChoroplethMap(countySales, citySales, validData, us, iowaCountyFips)
  } catch (error) {
    console.error("❌ Failed to load data:", error)
    showErrorMessage(container)
  }

  function createIowaCountyFipsMapping() {
    // Iowa FIPS codes for counties (19 = Iowa state code)
    // This maps county names to their FIPS codes
    const iowaFips = {
      ADAIR: "19001",
      ADAMS: "19003",
      ALLAMAKEE: "19005",
      APPANOOSE: "19007",
      AUDUBON: "19009",
      BENTON: "19011",
      "BLACK HAWK": "19013",
      BOONE: "19015",
      BREMER: "19017",
      BUCHANAN: "19019",
      "BUENA VISTA": "19021",
      BUTLER: "19023",
      CALHOUN: "19025",
      CARROLL: "19027",
      CASS: "19029",
      CEDAR: "19031",
      "CERRO GORDO": "19033",
      CHEROKEE: "19035",
      CHICKASAW: "19037",
      CLARKE: "19039",
      CLAY: "19041",
      CLAYTON: "19043",
      CLINTON: "19045",
      CRAWFORD: "19047",
      DALLAS: "19049",
      DAVIS: "19051",
      DECATUR: "19053",
      DELAWARE: "19055",
      "DES MOINES": "19057",
      DICKINSON: "19059",
      DUBUQUE: "19061",
      EMMET: "19063",
      FAYETTE: "19065",
      FLOYD: "19067",
      FRANKLIN: "19069",
      FREMONT: "19071",
      GREENE: "19073",
      GRUNDY: "19075",
      GUTHRIE: "19077",
      HAMILTON: "19079",
      HANCOCK: "19081",
      HARDIN: "19083",
      HARRISON: "19085",
      HENRY: "19087",
      HOWARD: "19089",
      HUMBOLDT: "19091",
      IDA: "19093",
      IOWA: "19095",
      JACKSON: "19097",
      JASPER: "19099",
      JEFFERSON: "19101",
      JOHNSON: "19103",
      JONES: "19105",
      KEOKUK: "19107",
      KOSSUTH: "19109",
      LEE: "19111",
      LINN: "19113",
      LOUISA: "19115",
      LUCAS: "19117",
      LYON: "19119",
      MADISON: "19121",
      MAHASKA: "19123",
      MARION: "19125",
      MARSHALL: "19127",
      MILLS: "19129",
      MITCHELL: "19131",
      MONONA: "19133",
      MONROE: "19135",
      MONTGOMERY: "19137",
      MUSCATINE: "19139",
      "O'BRIEN": "19141",
      OSCEOLA: "19143",
      PAGE: "19145",
      "PALO ALTO": "19147",
      PLYMOUTH: "19149",
      POCAHONTAS: "19151",
      POLK: "19153",
      POTTAWATTAMIE: "19155",
      POWESHIEK: "19157",
      RINGGOLD: "19159",
      SAC: "19161",
      SCOTT: "19163",
      SHELBY: "19165",
      SIOUX: "19167",
      STORY: "19169",
      TAMA: "19171",
      TAYLOR: "19173",
      UNION: "19175",
      "VAN BUREN": "19177",
      WAPELLO: "19179",
      WARREN: "19181",
      WASHINGTON: "19183",
      WAYNE: "19185",
      WEBSTER: "19187",
      WINNEBAGO: "19189",
      WINNESHIEK: "19191",
      WOODBURY: "19193",
      WORTH: "19195",
      WRIGHT: "19197",
    }
    return iowaFips
  }

  function drawUSChoroplethMap(countySales, citySales, validData, us, iowaCountyFips) {
    // Clear previous content
    container.selectAll("*").remove()

    // Create main wrapper
    const mapWrapper = container
      .append("div")
      .attr("class", "map-wrapper")
      .style("display", "flex")
      .style("width", "100%")
      .style("height", "100%")
      .style("min-height", "700px")
      .style("gap", "20px")

    // Map container (left side)
    const mapContainer = mapWrapper
      .append("div")
      .attr("class", "map-area")
      .style("flex", "1")
      .style("min-width", "0")
      .style("height", "100%")
      .style("position", "relative")
      .style("background-color", "#f8f9fa")
      .style("border", "1px solid #d1d5db")
      .style("border-radius", "8px")
      .style("padding", "20px")

    // Info container (right side)
    const infoContainer = mapWrapper
      .append("div")
      .attr("class", "info-area")
      .style("width", "320px")
      .style("flex-shrink", "0")
      .style("height", "100%")
      .style("display", "flex")
      .style("flex-direction", "column")
      .style("gap", "15px")
      .style("overflow-y", "auto")

    // Map dimensions
    const containerRect = mapContainer.node().getBoundingClientRect()
    const margin = { top: 100, right: 20, bottom: 20, left: 20 }
    const width = Math.max(800, containerRect.width - 40) - margin.left - margin.right
    const height = Math.max(500, containerRect.height - 40) - margin.top - margin.bottom

    // Create SVG
    const svg = mapContainer
      .append("svg")
      .attr("width", "100%")
      .attr("height", height + margin.top + margin.bottom)
      .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .style("background-color", "white")
      .style("border-radius", "4px")

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`)

    // Add title
    const title = g
      .append("text")
      .attr("class", "map-title")
      .attr("x", width / 2)
      .attr("y", -70)
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .style("font-weight", "bold")
      .style("fill", "#333")
      .text("US Counties - Iowa Liquor Sales Choropleth")

    // Color scale for choropleth
    const salesValues = Array.from(countySales.values()).map((d) => d.totalSales)
    const maxSales = d3.max(salesValues)
    const minSales = d3.min(salesValues)

    // Use a more contrasting color scheme for better visibility
    const color = d3.scaleQuantize().domain([minSales, maxSales]).range([
      "#f7fbff", // Very light blue (lowest sales)
      "#deebf7", // Light blue
      "#c6dbef", // Light-medium blue
      "#9ecae1", // Medium blue
      "#6baed6", // Medium-dark blue
      "#4292c6", // Dark blue
      "#2171b5", // Darker blue
      "#08519c", // Very dark blue
      "#08306b", // Darkest blue (highest sales)
    ])

    console.log("Sales range:", d3.format("$,.0f")(minSales), "to", d3.format("$,.0f")(maxSales))

    // Create value map for FIPS lookup
    const valueMap = new Map()
    countySales.forEach((data, countyName) => {
      const fips = iowaCountyFips[countyName]
      if (fips) {
        valueMap.set(fips, data.totalSales)
      }
    })

    // Convert topojson to geojson
    const counties = topojson.feature(us, us.objects.counties)
    const states = topojson.feature(us, us.objects.states)
    const stateMesh = topojson.mesh(us, us.objects.states, (a, b) => a !== b)

    // Create path generator (using Albers USA projection)
    const path = d3.geoPath()

    // Set up zoom behavior
    const zoom = d3
      .zoom()
      .scaleExtent([1, 8])
      .on("zoom", (event) => {
        const { transform } = event
        g.selectAll("path").attr("transform", transform)
        g.selectAll("text.county-label").attr("transform", (d) => {
          const centroid = path.centroid(d)
          return `translate(${transform.applyX(centroid[0])}, ${transform.applyY(centroid[1])})`
        })
      })

    svg.call(zoom)

    // Create map group for counties and states
    const mapGroup = g.append("g").attr("class", "map-group")

    // Draw all US counties (background)
    const countyPaths = mapGroup
      .selectAll(".county")
      .data(counties.features)
      .enter()
      .append("path")
      .attr("class", "county")
      .attr("d", path)
      .attr("fill", (d) => {
        const fips = d.id
        const sales = valueMap.get(fips)
        return sales ? color(sales) : "#f0f0f0"
      })
      .attr("stroke", "white")
      .attr("stroke-width", 0.5)
      .style("cursor", (d) => (valueMap.has(d.id) ? "pointer" : "default"))
      .on("mouseover", function (event, d) {
        const fips = d.id
        const sales = valueMap.get(fips)

        if (sales) {
          // Find county name from FIPS
          const countyName = Object.keys(iowaCountyFips).find((name) => iowaCountyFips[name] === fips)
          const countyData = countySales.get(countyName)

          if (countyData) {
            // Highlight county
            d3.select(this).attr("stroke", "#333").attr("stroke-width", 2).style("filter", "brightness(1.1)")

            // Show tooltip
            showTooltip(event, countyName, countyData)
            updateInfoPanel(countyName, countyData, validData)
          }
        }
      })
      .on("mouseout", function (event, d) {
        const fips = d.id
        const sales = valueMap.get(fips)

        if (sales) {
          // Reset county style
          d3.select(this).attr("stroke", "white").attr("stroke-width", 0.5).style("filter", "brightness(1)")

          // Remove tooltip
          d3.selectAll(".map-tooltip").remove()
        }
      })
      .on("click", (event, d) => {
        const fips = d.id
        const sales = valueMap.get(fips)

        if (sales) {
          const countyName = Object.keys(iowaCountyFips).find((name) => iowaCountyFips[name] === fips)
          const countyData = countySales.get(countyName)
          if (countyData) {
            showCountyDetails(countyName, countyData, validData)
          }
        }
      })

    // Draw state boundaries
    mapGroup
      .append("path")
      .datum(stateMesh)
      .attr("fill", "none")
      .attr("stroke", "#333")
      .attr("stroke-width", 1)
      .attr("stroke-linejoin", "round")
      .attr("d", path)

    // Highlight Iowa state boundary
    const iowaState = states.features.find((d) => d.id === "19") // Iowa FIPS code
    if (iowaState) {
      mapGroup
        .append("path")
        .datum(iowaState)
        .attr("fill", "none")
        .attr("stroke", "#e53935")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5")
        .attr("d", path)
    }

    // Function to zoom to Iowa
    function zoomToIowa() {
      if (iowaState) {
        const bounds = path.bounds(iowaState)
        const dx = bounds[1][0] - bounds[0][0]
        const dy = bounds[1][1] - bounds[0][1]
        const x = (bounds[0][0] + bounds[1][0]) / 2
        const y = (bounds[0][1] + bounds[1][1]) / 2
        const scale = Math.min(8, 0.9 / Math.max(dx / width, dy / height))
        const translate = [width / 2 - scale * x, height / 2 - scale * y]

        svg
          .transition()
          .duration(1500)
          .call(zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale))

        // Update title
        title.transition().duration(1500).text("Iowa Counties - Liquor Sales Choropleth")
      }
    }

    // Function to reset zoom
    function resetZoom() {
      svg.transition().duration(1500).call(zoom.transform, d3.zoomIdentity)

      // Update title
      title.transition().duration(1500).text("US Counties - Iowa Liquor Sales Choropleth")
    }

    // Auto-zoom to Iowa on initial load
    setTimeout(() => {
      console.log("🎯 Auto-focusing on Iowa...")
      zoomToIowa()
    }, 1000)

    // Create info panels
    createColorLegend(infoContainer, color, minSales, maxSales)
    createStatsPanel(infoContainer, countySales)
    createInfoPanel(infoContainer)
    createTopCitiesPanel(infoContainer, citySales)

    console.log("✅ US choropleth map rendered successfully with Iowa zoom functionality")
  }

  function showTooltip(event, countyName, countyData) {
    d3.selectAll(".map-tooltip").remove()

    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "map-tooltip")
      .style("position", "absolute")
      .style("background", "rgba(0,0,0,0.9)")
      .style("color", "white")
      .style("padding", "12px")
      .style("border-radius", "6px")
      .style("font-size", "13px")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .style("z-index", "1000")
      .style("box-shadow", "0 4px 8px rgba(0,0,0,0.3)")

    tooltip.transition().duration(200).style("opacity", 1)

    tooltip.html(`
      <div style="font-weight: bold; margin-bottom: 8px; color: #4fc3f7; font-size: 14px;">${countyName} County, Iowa</div>
      <div style="margin-bottom: 4px;"><strong>Total Sales:</strong> $${d3.format(",.0f")(countyData.totalSales)}</div>
      <div style="margin-bottom: 4px;"><strong>Volume:</strong> ${d3.format(",.0f")(countyData.totalVolume)} L</div>
      <div style="margin-bottom: 4px;"><strong>Cities:</strong> ${countyData.uniqueCities}</div>
      <div style="margin-bottom: 4px;"><strong>Stores:</strong> ${countyData.uniqueStores}</div>
      <div><strong>Avg Sale:</strong> $${d3.format(",.0f")(countyData.avgSales)}</div>
    `)

    const tooltipNode = tooltip.node()
    const tooltipRect = tooltipNode.getBoundingClientRect()
    let left = event.pageX + 10
    let top = event.pageY - 10

    if (left + tooltipRect.width > window.innerWidth) {
      left = event.pageX - tooltipRect.width - 10
    }
    if (top + tooltipRect.height > window.innerHeight) {
      top = event.pageY - tooltipRect.height - 10
    }

    tooltip.style("left", left + "px").style("top", top + "px")
  }

  function updateInfoPanel(countyName, countyData, allData) {
    const infoPanel = d3.select(".county-info-panel")

    const countyFilteredData = allData.filter((d) => d.county === countyName.toUpperCase())
    const countyCities = d3.rollup(
      countyFilteredData,
      (v) => d3.sum(v, (d) => d.sales),
      (d) => d.city,
    )
    const topCities = Array.from(countyCities.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)

    let citiesHtml = ""
    if (topCities.length > 0) {
      citiesHtml = `
        <div style="margin-top: 15px;">
          <div style="font-weight: bold; margin-bottom: 8px; color: #333; font-size: 14px;">Top Cities:</div>
          ${topCities
            .map(
              ([city, sales], i) => `
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 12px;">
              <span style="color: #666;">${i + 1}. ${city}</span>
              <span style="font-weight: bold; color: #333;">$${d3.format(".2s")(sales)}</span>
            </div>
          `,
            )
            .join("")}
        </div>
      `
    }

    infoPanel.html(`
      <h4 style="margin: 0 0 15px 0; color: #333; font-size: 16px;">${countyName} County, Iowa</h4>
      <div class="info-item">
        <span class="info-label">Total Sales:</span>
        <span class="info-value">$${d3.format(",.0f")(countyData.totalSales)}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Volume Sold:</span>
        <span class="info-value">${d3.format(",.0f")(countyData.totalVolume)} L</span>
      </div>
      <div class="info-item">
        <span class="info-label">Cities:</span>
        <span class="info-value">${countyData.uniqueCities}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Stores:</span>
        <span class="info-value">${countyData.uniqueStores}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Bottles Sold:</span>
        <span class="info-value">${d3.format(",")(countyData.totalBottlesSold)}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Average Sale:</span>
        <span class="info-value">$${d3.format(",.0f")(countyData.avgSales)}</span>
      </div>
      ${citiesHtml}
    `)
  }

  function showCountyDetails(countyName, countyData, allData) {
    const countyFilteredData = allData.filter((d) => d.county === countyName.toUpperCase())
    const countyCities = d3.rollup(
      countyFilteredData,
      (v) => ({
        sales: d3.sum(v, (d) => d.sales),
        volume: d3.sum(v, (d) => d.volume),
        stores: new Set(v.map((d) => d.storeName)).size,
      }),
      (d) => d.city,
    )

    const cityList = Array.from(countyCities.entries())
      .sort((a, b) => b[1].sales - a[1].sales)
      .slice(0, 10)
      .map(([city, data], i) => `${i + 1}. ${city}: $${d3.format(",.0f")(data.sales)} (${data.stores} stores)`)
      .join("\n")

    alert(`${countyName} County, Iowa Details:

Total Sales: $${d3.format(",.0f")(countyData.totalSales)}
Volume: ${d3.format(",.0f")(countyData.totalVolume)} L
Cities: ${countyData.uniqueCities}
Stores: ${countyData.uniqueStores}
Bottles Sold: ${d3.format(",")(countyData.totalBottlesSold)}

Top Cities:
${cityList}`)
  }

  function createColorLegend(container, colorScale, minValue, maxValue) {
    const legend = container
      .append("div")
      .attr("class", "color-legend")
      .style("background-color", "#f8f9fa")
      .style("border", "1px solid #d1d5db")
      .style("border-radius", "8px")
      .style("padding", "16px")

    legend
      .append("h4")
      .style("margin", "0 0 12px 0")
      .style("font-size", "14px")
      .style("color", "#374151")
      .text("Sales Volume")

    const legendSvg = legend.append("svg").attr("width", "100%").attr("height", "80")

    // Create gradient for legend
    const gradient = legendSvg
      .append("defs")
      .append("linearGradient")
      .attr("id", "legend-gradient")
      .attr("x1", "0%")
      .attr("x2", "100%")

    const steps = 9
    const colors = d3.schemeBlues[9]

    for (let i = 0; i < steps; i++) {
      gradient
        .append("stop")
        .attr("offset", `${(i / (steps - 1)) * 100}%`)
        .attr("stop-color", colors[i])
    }

    legendSvg
      .append("rect")
      .attr("x", 0)
      .attr("y", 20)
      .attr("width", "100%")
      .attr("height", 20)
      .style("fill", "url(#legend-gradient)")
      .style("stroke", "#ccc")

    // Add scale labels
    legendSvg
      .append("text")
      .attr("x", 0)
      .attr("y", 55)
      .style("font-size", "12px")
      .style("fill", "#666")
      .text(`$${d3.format(".2s")(minValue)}`)

    legendSvg
      .append("text")
      .attr("x", "100%")
      .attr("y", 55)
      .attr("text-anchor", "end")
      .style("font-size", "12px")
      .style("fill", "#666")
      .text(`$${d3.format(".2s")(maxValue)}`)

    legendSvg
      .append("text")
      .attr("x", "50%")
      .attr("y", 55)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", "#666")
      .text(`$${d3.format(".2s")((minValue + maxValue) / 2)}`)
  }

  function createStatsPanel(container, countySales) {
    const stats = container
      .append("div")
      .attr("class", "map-stats-panel")
      .style("background-color", "#f8f9fa")
      .style("border", "1px solid #d1d5db")
      .style("border-radius", "8px")
      .style("padding", "16px")

    stats
      .append("h4")
      .style("margin", "0 0 12px 0")
      .style("font-size", "14px")
      .style("color", "#374151")
      .text("Iowa County Statistics")

    const salesValues = Array.from(countySales.values())
    const totalCounties = salesValues.length
    const totalSales = d3.sum(salesValues, (d) => d.totalSales)
    const avgCountySales = d3.mean(salesValues, (d) => d.totalSales)

    const topCounties = Array.from(countySales.entries())
      .sort((a, b) => d3.descending(a[1].totalSales, b[1].totalSales))
      .slice(0, 5)

    stats
      .append("div")
      .style("margin-bottom", "8px")
      .style("font-size", "12px")
      .html(`<strong>Active Counties:</strong> ${totalCounties}`)

    stats
      .append("div")
      .style("margin-bottom", "8px")
      .style("font-size", "12px")
      .html(`<strong>Total Sales:</strong> $${d3.format(",.0f")(totalSales)}`)

    stats
      .append("div")
      .style("margin-bottom", "12px")
      .style("font-size", "12px")
      .html(`<strong>Avg per County:</strong> $${d3.format(",.0f")(avgCountySales)}`)

    stats
      .append("div")
      .style("font-weight", "bold")
      .style("margin-bottom", "8px")
      .style("font-size", "12px")
      .text("Top 5 Counties:")

    topCounties.forEach((county, i) => {
      stats
        .append("div")
        .style("font-size", "11px")
        .style("margin-bottom", "4px")
        .style("color", "#666")
        .style("cursor", "pointer")
        .html(`${i + 1}. ${county[0]} - $${d3.format(".2s")(county[1].totalSales)}`)
    })
  }

  function createInfoPanel(container) {
    const infoPanel = container
      .append("div")
      .attr("class", "county-info-panel")
      .style("background-color", "#f8f9fa")
      .style("border", "1px solid #d1d5db")
      .style("border-radius", "8px")
      .style("padding", "16px")
      .style("min-height", "200px")

    infoPanel.html(`
      <h4 style="margin: 0 0 15px 0; color: #333; font-size: 16px;">County Details</h4>
      <div style="color: #666; font-style: italic;">Hover over an Iowa county to see details</div>
    `)

    if (!document.querySelector("#info-item-styles")) {
      const style = document.createElement("style")
      style.id = "info-item-styles"
      style.textContent = `
        .info-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 12px;
        }
        .info-label {
          color: #666;
        }
        .info-value {
          font-weight: bold;
          color: #333;
        }
      `
      document.head.appendChild(style)
    }
  }

  function createTopCitiesPanel(container, citySales) {
    const citiesPanel = container
      .append("div")
      .attr("class", "top-cities-panel")
      .style("background-color", "#f8f9fa")
      .style("border", "1px solid #d1d5db")
      .style("border-radius", "8px")
      .style("padding", "16px")

    citiesPanel
      .append("h4")
      .style("margin", "0 0 12px 0")
      .style("font-size", "14px")
      .style("color", "#374151")
      .text("Top Cities in Iowa")

    const topCities = Array.from(citySales.entries())
      .sort((a, b) => d3.descending(a[1].totalSales, b[1].totalSales))
      .slice(0, 10)

    topCities.forEach((city, i) => {
      const cityDiv = citiesPanel
        .append("div")
        .style("display", "flex")
        .style("justify-content", "space-between")
        .style("align-items", "center")
        .style("margin-bottom", "6px")
        .style("padding", "4px 8px")
        .style("background-color", i < 3 ? "#e3f2fd" : "transparent")
        .style("border-radius", "4px")
        .style("font-size", "11px")
        .style("cursor", "pointer")

      const leftDiv = cityDiv.append("div")
      leftDiv
        .append("div")
        .style("font-weight", "bold")
        .style("color", "#333")
        .text(`${i + 1}. ${city[0]}`)

      leftDiv.append("div").style("font-size", "10px").style("color", "#666").text(`${city[1].storeCount} stores`)

      cityDiv
        .append("div")
        .style("text-align", "right")
        .style("font-weight", "bold")
        .style("color", "#333")
        .text(d3.format("$.2s")(city[1].totalSales))
    })
  }

  function showErrorMessage(container) {
    container
      .append("div")
      .attr("class", "error-message")
      .style("padding", "20px")
      .style("text-align", "center")
      .style("color", "#dc3545")
      .html(`
        <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 10px;"></i>
        <p><strong>Error loading map data</strong></p>
        <p>Please ensure data files are accessible and try again.</p>
      `)
  }
})
