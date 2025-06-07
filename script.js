document.addEventListener("DOMContentLoaded", () => {
  // Set current date
  const now = new Date()
  const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" }
  document.getElementById("current-date").textContent = now.toLocaleDateString("en-US", options)

  // Toggle sidebar on mobile
  const toggleSidebar = document.querySelector(".toggle-sidebar")
  const sidebar = document.querySelector(".sidebar")

  toggleSidebar.addEventListener("click", () => {
    sidebar.classList.toggle("active")
  })

  // Navigation
  const menuItems = document.querySelectorAll(".sidebar-menu li")
  const contentSections = document.querySelectorAll(".content-section")

  menuItems.forEach((item) => {
    item.addEventListener("click", function () {
      // Update active menu item
      menuItems.forEach((i) => i.classList.remove("active"))
      this.classList.add("active")

      // Show corresponding content section
      const target = this.getAttribute("data-target")
      contentSections.forEach((section) => {
        section.classList.remove("active")
        if (section.id === target) {
          section.classList.add("active")
        }
      })

      // Update page title
      const pageTitle = document.querySelector(".page-title h1")
      pageTitle.textContent = this.textContent.trim()

      // Close sidebar on mobile after navigation
      if (window.innerWidth <= 768) {
        sidebar.classList.remove("active")
      }
    })
  })

  // Placeholder for D3.js chart initialization
  function initCharts() {
    console.log("Charts would be initialized here with D3.js")
    // You'll add your D3.js code here to initialize each chart
  }

  // Call chart initialization
  initCharts()
})
