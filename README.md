# ML Experiment Log Viewer

A modern, interactive web application for visualizing and comparing machine learning experiment logs. Built with Vue 3, PrimeVue, and Chart.js.

## Features

### Core Functionality
- **📁 CSV File Upload**: Drag & drop or browse to upload experiment logs
- **🔍 Data Validation**: Comprehensive CSV parsing with error handling
- **📊 Interactive Visualization**: Line charts with zoom, pan, and tooltip support
- **🎛️ Flexible Selection**: Multi-select experiments and metrics
- **📈 Real-time Updates**: Dynamic chart updates based on selections
- **💾 Data Export**: Export filtered data to CSV format
- **💿 Session Persistence**: Save and restore selections using localStorage

### Advanced Features
- **🔎 Search & Filter**: Search experiments and filter metrics by name
- **🎨 Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **⚡ Performance**: Efficient handling of large datasets (25k+ rows)
- **🎭 Multiple Chart Types**: Line and area chart visualization options
- **🎯 Detailed Analytics**: Statistical summaries for selected metrics
- **🌐 Sample Data**: Built-in sample dataset for quick testing

## Tech Stack

- **Frontend Framework**: Vue 3 with Composition API
- **UI Library**: PrimeVue with Aura theme
- **State Management**: Pinia
- **Charts**: Chart.js with vue-chartjs
- **CSV Parsing**: PapaParse
- **Language**: TypeScript for type safety
- **Build Tool**: Vite
- **Styling**: Custom CSS with PrimeVue theming

## Data Format

The application expects CSV files with the following columns:

```csv
experiment_id,metric_name,step,value
exp_001,loss,0,2.3456
exp_001,accuracy,0,0.1234
exp_001,loss,1,1.9876
exp_001,accuracy,1,0.2345
```

### Column Descriptions
- `experiment_id`: Unique identifier for each training run
- `metric_name`: Type of metric (e.g., loss, accuracy, f1_score)
- `step`: Training step or epoch number
- `value`: Numerical value of the metric at that step

## Getting Started

### Prerequisites
- Node.js 16+ and npm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ml-experiment-log-viewer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
npm run preview
```

## Usage Guide

### 1. Upload Data
- Drag and drop a CSV file onto the upload zone
- Or click "Browse Files" to select a file
- Use "Load Sample CSV" for quick testing with 25k sample rows

### 2. Select Experiments
- Browse the list of available experiments
- Use the search box to filter experiments by ID
- Select one or multiple experiments using checkboxes
- View experiment statistics and available metrics

### 3. Choose Metrics
- Select metrics from the filtered list based on chosen experiments
- Use the search box to filter metrics by name
- View statistical summaries (min, max, average) for selected metrics

### 4. Visualize Data
- Interactive line charts show metric trends over training steps
- Use chart controls to toggle legend, grid, and data points
- Switch between line and area chart types
- Zoom (Ctrl + mouse wheel) and pan (Shift + drag) for detailed exploration
- Hover over data points for detailed tooltips

### 5. Export Data
- Export selected experiment and metric data to CSV
- Maintains original data format for further analysis

## Project Structure

```
src/
├── components/           # Vue components
│   ├── FileUpload.vue   # CSV file upload with validation
│   ├── ExperimentList.vue # Experiment selection interface
│   ├── MetricSelector.vue # Metric filtering and selection
│   └── ChartDisplay.vue  # Interactive chart visualization
├── store/               # Pinia state management
│   └── experimentStore.ts # Main application state
├── types/               # TypeScript type definitions
│   └── experiment.ts    # Data model interfaces
├── utils/               # Utility functions
│   └── csvParser.ts     # CSV parsing and validation logic
├── App.vue              # Main application component
├── main.ts             # Application entry point
└── style.css           # Global styles and theme
```

## Key Features Explained

### CSV Parsing & Validation
- Robust error handling for malformed data
- Required column validation
- Data type checking and conversion
- Progress feedback during large file processing

### State Management
- Centralized state with Pinia
- Reactive computed properties for derived data
- Session persistence for user preferences
- Efficient data filtering and selection

### Chart Visualization
- Chart.js integration with Vue 3
- Custom color palette for multiple series
- Interactive zoom and pan capabilities
- Responsive design with mobile optimization
- Customizable display options

### Performance Optimization
- Efficient data structures for large datasets
- Lazy computation of chart data
- Debounced search and filtering
- Memory-efficient CSV parsing

## Browser Support

- Chrome/Chromium 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by MLflow, Weights & Biases, and other ML experiment tracking tools
- Built with modern web technologies for optimal performance
- Designed with data scientists and ML engineers in mind