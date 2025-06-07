# Iowa Liquor Sales - Business Intelligence Dashboard Template

## Project Overview
This template provides a complete structure for creating an interactive data visualization dashboard analyzing Iowa liquor sales data using D3.js. The dashboard features two main sections with 8 different chart types following your storyboard requirements.

## Dashboard Structure

### 📊 Dashboard 1: Regional Sales Overview
- **Monthly Sales Trend** (Line Chart) - Shows temporal sales patterns
- **Sales by County** (Map) - Geographic distribution with hover tooltips
- **Sales by City** (Bar Chart) - Top performing cities with click filtering
- **Top Stores by Sales** (Bar Chart) - Best performing retail outlets

### 🛍️ Dashboard 2: Product & Category Intelligence  
- **Top-Selling Categories** (Bar Chart) - Revenue by liquor type
- **Top-Selling Brands** (Bar Chart) - Individual brand performance
- **Sales by Bottle Size** (Pie Chart) - Packaging size preferences
- **Price vs Volume Sold** (Scatter Plot) - Price-volume correlation analysis

## Features Implemented
- ✅ **Navigation System** - Toggle between two dashboards
- ✅ **Interactive Filtering** - Separate filters for each dashboard
- ✅ **Data Loading** - Loads your Cleaned_Liquor_Sales.csv file
- ✅ **Responsive Design** - Works on desktop and mobile
- ✅ **Loading Indicator** - Shows progress while loading data
- ✅ **Summary Statistics** - Real-time stats for each dashboard
- ✅ **Chart Templates** - Starter code for all 8 charts

## File Structure
\`\`\`
├── index.html              # Main dashboard with navigation
├── styles.css             # Complete styling for both dashboards
├── data/
│   └── Cleaned_Liquor_Sales.csv  # Your dataset (place here)
├── js/
│   ├── data-loader.js     # Handles CSV loading and filtering
│   ├── dashboard.js       # Main dashboard controller
│   └── charts/            # Chart implementations (8 files)
│       ├── monthly-trend.js
│       ├── county-map.js
│       ├── city-sales.js
│       ├── top-stores.js
│       ├── top-categories.js
│       ├── top-brands.js
│       ├── bottle-size.js
│       └── price-volume.js
└── README.md
\`\`\`

## Setup Instructions
1. **Place your data file**: Put `Cleaned_Liquor_Sales.csv` in the `data/` folder
2. **Open index.html** in a web browser
3. **Implement charts**: Each team member implements 2 charts using the provided templates
4. **Test interactions**: Verify filtering and navigation work correctly

## Chart Implementation Guide
Each chart template includes:
- Basic structure and initialization
- Data aggregation examples
- Console logging for debugging
- Placeholder for D3.js rendering code

### Example Implementation Pattern:
\`\`\`javascript
// 1. Initialize chart structure in init()
// 2. Process data in update(data)
// 3. Create D3 scales and axes
// 4. Render chart elements
// 5. Add interactivity (hover, click)
\`\`\`

## Team Assignment Suggestion
- **Student 1**: Monthly Trend + County Map
- **Student 2**: City Sales + Top Stores  
- **Student 3**: Top Categories + Top Brands
- **Student 4**: Bottle Size + Price Volume

## Interactive Features to Implement
- **Hover Tooltips** - Show detailed information
- **Click Filtering** - Filter other charts when elements are clicked
- **Zoom/Pan** - For detailed exploration
- **Smooth Transitions** - Use D3 transitions for updates

## Data Processing
The template automatically:
- Loads and parses your CSV file
- Converts data types (dates, numbers)
- Adds computed fields (year, month, profit margin)
- Filters invalid records
- Populates filter dropdowns

## Browser Compatibility
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Next Steps
1. Implement the 8 chart classes using D3.js
2. Add interactive features (tooltips, filtering, zooming)
3. Test with your actual dataset
4. Customize styling and colors
5. Add any additional features required

The template provides a solid foundation that meets all your project requirements. Each chart template includes data aggregation examples and structure to help you get started quickly!
