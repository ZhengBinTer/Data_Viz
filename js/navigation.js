// Navigation functionality with dropdown support
document.addEventListener("DOMContentLoaded", () => {
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
    })
  })

  // Set active states based on current page
  setActiveNavigation()

  // Handle mobile sidebar toggle (if needed)
  setupMobileNavigation()
})

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

function setupMobileNavigation() {
  // Add mobile toggle button if needed
  const sidebar = document.querySelector(".sidebar")
  const mainContent = document.querySelector(".main-content")

  // Create mobile toggle button
  const mobileToggle = document.createElement("button")
  mobileToggle.className = "mobile-toggle"
  mobileToggle.innerHTML = '<i class="fas fa-bars"></i>'
  mobileToggle.style.cssText = `
    display: none;
    position: fixed;
    top: 20px;
    left: 20px;
    z-index: 1001;
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: 5px;
    padding: 10px;
    cursor: pointer;
  `

  document.body.appendChild(mobileToggle)

  // Show mobile toggle on small screens
  function checkMobile() {
    if (window.innerWidth <= 768) {
      mobileToggle.style.display = "block"
      sidebar.classList.add("mobile-hidden")
    } else {
      mobileToggle.style.display = "none"
      sidebar.classList.remove("mobile-hidden", "mobile-show")
    }
  }

  // Mobile toggle functionality
  mobileToggle.addEventListener("click", () => {
    sidebar.classList.toggle("mobile-show")
  })

  // Close sidebar when clicking outside on mobile
  document.addEventListener("click", (e) => {
    if (window.innerWidth <= 768 && !sidebar.contains(e.target) && !mobileToggle.contains(e.target)) {
      sidebar.classList.remove("mobile-show")
    }
  })

  // Check on load and resize
  checkMobile()
  window.addEventListener("resize", checkMobile)

  // Add mobile styles
  const mobileStyles = document.createElement("style")
  mobileStyles.textContent = `
    @media (max-width: 768px) {
      .sidebar.mobile-hidden {
        transform: translateX(-100%);
      }
      .sidebar.mobile-show {
        transform: translateX(0);
      }
      .main-content {
        margin-left: 0;
      }
    }
  `
  document.head.appendChild(mobileStyles)
}
