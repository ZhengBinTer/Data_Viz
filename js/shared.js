// Shared functionality across all pages
document.addEventListener("DOMContentLoaded", () => {
  // Set current date
  const now = new Date()
  const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" }
  const dateElement = document.getElementById("current-date")
  if (dateElement) {
    dateElement.textContent = now.toLocaleDateString("en-US", options)
  }

  // Highlight current page in sidebar
  const currentPage = window.location.pathname.split("/").pop() || "index.html"
  const menuItems = document.querySelectorAll(".sidebar-menu li")

  menuItems.forEach((item) => {
    const link = item.querySelector("a")
    if (link && link.getAttribute("href") === currentPage) {
      item.classList.add("active")
    } else {
      item.classList.remove("active")
    }
  })

  // Common data loading function
  window.loadData = async () => {
    try {
      // Load your CSV data here
      // const data = await d3.csv('data/Cleaned_Liquor_Sales.csv');
      console.log("Data loading function - implement CSV loading here")
      return []
    } catch (error) {
      console.error("Error loading data:", error)
      return []
    }
  }

  // Common utility functions
  window.formatCurrency = (value) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value)

  window.formatNumber = (value) => new Intl.NumberFormat("en-US").format(value)
})
