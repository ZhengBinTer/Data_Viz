// Enhanced Navigation functionality with sidebar toggle
document.addEventListener("DOMContentLoaded", () => {
  // Initialize sidebar toggle functionality
  initializeSidebarToggle()

  // Handle dropdown toggles
  const dropdownToggles = document.querySelectorAll(".dropdown-toggle")

  dropdownToggles.forEach((toggle) => {
    toggle.addEventListener("click", (e) => {
      e.preventDefault()

      const dropdown = toggle.closest(".dropdown")
      const dropdownMenu = dropdown.querySelector(".dropdown-menu")
      const arrow = dropdown.querySelector(".dropdown-arrow")

      // Close other dropdowns
      document.querySelectorAll(".dropdown").forEach((otherDropdown) => {
        if (otherDropdown !== dropdown) {
          otherDropdown.classList.remove("active")
          otherDropdown.querySelector(".dropdown-menu").classList.remove("show")
        }
      })

      // Toggle current dropdown
      dropdown.classList.toggle("active")
      dropdownMenu.classList.toggle("show")

      // If clicking on main dashboard link, also navigate
      if (!dropdown.classList.contains("active")) {
        window.location.href = toggle.getAttribute("href")
      }
    })
  })

  // Handle individual chart navigation
  const chartLinks = document.querySelectorAll(".dropdown-menu a")
  chartLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      // Allow normal navigation
      // Remove active class from siblings
      const parent = link.closest(".dropdown-menu")
      parent.querySelectorAll("li").forEach((li) => li.classList.remove("active"))

      // Add active class to clicked item
      link.closest("li").classList.add("active")

      // Close sidebar on mobile after navigation
      if (window.innerWidth <= 768) {
        closeSidebar()
      }
    })
  })

  // Set active states based on current page
  setActiveNavigation()
})

function initializeSidebarToggle() {
  const sidebar = document.querySelector(".sidebar")
  const mainContent = document.querySelector(".main-content")

  // Create toggle button
  const toggleButton = document.createElement("button")
  toggleButton.className = "sidebar-toggle"
  toggleButton.innerHTML = '<i class="fas fa-bars"></i>'
  toggleButton.setAttribute("aria-label", "Toggle Sidebar")
  toggleButton.setAttribute("title", "Toggle Sidebar")

  // Create close button for sidebar
  const closeButton = document.createElement("button")
  closeButton.className = "sidebar-close"
  closeButton.innerHTML = '<i class="fas fa-times"></i>'
  closeButton.setAttribute("aria-label", "Close Sidebar")
  closeButton.setAttribute("title", "Close Sidebar")

  // Create overlay for mobile
  const overlay = document.createElement("div")
  overlay.className = "sidebar-overlay"

  // Add elements to DOM
  document.body.appendChild(toggleButton)
  document.body.appendChild(overlay)
  sidebar.appendChild(closeButton)

  // State management
  let sidebarVisible = window.innerWidth > 768

  function updateSidebarState() {
    if (window.innerWidth <= 768) {
      // Mobile behavior
      if (sidebarVisible) {
        sidebar.classList.add("sidebar-visible")
        sidebar.classList.remove("sidebar-hidden")
        overlay.classList.add("active")
        toggleButton.innerHTML = '<i class="fas fa-times"></i>'
        document.body.style.overflow = "hidden"
      } else {
        sidebar.classList.remove("sidebar-visible")
        sidebar.classList.add("sidebar-hidden")
        overlay.classList.remove("active")
        toggleButton.innerHTML = '<i class="fas fa-bars"></i>'
        document.body.style.overflow = ""
      }
    } else {
      // Desktop behavior
      if (sidebarVisible) {
        sidebar.classList.remove("sidebar-hidden")
        sidebar.classList.add("sidebar-visible")
        mainContent.classList.remove("sidebar-closed")
        toggleButton.classList.remove("desktop-hidden")
        toggleButton.innerHTML = '<i class="fas fa-chevron-left"></i>'
      } else {
        sidebar.classList.add("sidebar-hidden")
        sidebar.classList.remove("sidebar-visible")
        mainContent.classList.add("sidebar-closed")
        toggleButton.classList.add("desktop-hidden")
        toggleButton.innerHTML = '<i class="fas fa-chevron-right"></i>'
      }
      overlay.classList.remove("active")
      document.body.style.overflow = ""
    }
  }

  function toggleSidebar() {
    sidebarVisible = !sidebarVisible
    updateSidebarState()

    // Save state to localStorage
    localStorage.setItem("sidebarVisible", sidebarVisible.toString())
  }

  function closeSidebar() {
    sidebarVisible = false
    updateSidebarState()
    localStorage.setItem("sidebarVisible", "false")
  }

  function openSidebar() {
    sidebarVisible = true
    updateSidebarState()
    localStorage.setItem("sidebarVisible", "true")
  }

  // Event listeners
  toggleButton.addEventListener("click", toggleSidebar)
  closeButton.addEventListener("click", closeSidebar)
  overlay.addEventListener("click", closeSidebar)

  // Keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    // ESC key to close sidebar
    if (e.key === "Escape" && sidebarVisible && window.innerWidth <= 768) {
      closeSidebar()
    }
    // Ctrl/Cmd + B to toggle sidebar
    if ((e.ctrlKey || e.metaKey) && e.key === "b") {
      e.preventDefault()
      toggleSidebar()
    }
  })

  // Handle window resize
  window.addEventListener("resize", () => {
    updateSidebarState()
  })

  // Restore saved state
  const savedState = localStorage.getItem("sidebarVisible")
  if (savedState !== null) {
    sidebarVisible = savedState === "true"
  }

  // Initial state update
  updateSidebarState()

  // Make functions globally available
  window.toggleSidebar = toggleSidebar
  window.closeSidebar = closeSidebar
  window.openSidebar = openSidebar
}

function setActiveNavigation() {
  const currentPage = window.location.pathname.split("/").pop() || "index.html"
  const menuItems = document.querySelectorAll(".sidebar-menu li")

  // Remove all active classes
  menuItems.forEach((item) => item.classList.remove("active"))

  // Set active based on current page
  if (currentPage === "index.html") {
    document.querySelector('a[href="index.html"]').closest("li").classList.add("active")
  } else if (
    ["regional-dashboard.html", "monthly-sales.html", "geographic.html", "city-sales.html", "top-stores.html"].includes(
      currentPage,
    )
  ) {
    const regionalDropdown = document.querySelector('a[href="regional-dashboard.html"]').closest(".dropdown")
    regionalDropdown.classList.add("active")
    regionalDropdown.querySelector(".dropdown-menu").classList.add("show")

    // Set active chart if on individual chart page
    if (currentPage !== "regional-dashboard.html") {
      const chartLink = document.querySelector(`a[href="${currentPage}"]`)
      if (chartLink) {
        chartLink.closest("li").classList.add("active")
      }
    }
  } else if (
    ["product-dashboard.html", "categories.html", "brands.html", "bottle-size.html", "price-analysis.html"].includes(
      currentPage,
    )
  ) {
    const productDropdown = document.querySelector('a[href="product-dashboard.html"]').closest(".dropdown")
    productDropdown.classList.add("active")
    productDropdown.querySelector(".dropdown-menu").classList.add("show")

    // Set active chart if on individual chart page
    if (currentPage !== "product-dashboard.html") {
      const chartLink = document.querySelector(`a[href="${currentPage}"]`)
      if (chartLink) {
        chartLink.closest("li").classList.add("active")
      }
    }
  }
}
