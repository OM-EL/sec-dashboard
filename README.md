# Security Dashboard - React 18 + Tailwind CSS 3 + Apache ECharts

A modern, interactive security vulnerability dashboard built with React 18, styled with Tailwind CSS 3, and powered by Apache ECharts for beautiful data visualizations.

## 🚀 Features

- **Modern Stack**: React 18 with latest features
- **Beautiful UI**: Tailwind CSS 3 with custom gradients and animations
- **Interactive Charts**: Apache ECharts for dynamic data visualization
- **Real-time Updates**: Animated security metrics racing chart
- **Responsive Design**: Works on desktop and mobile devices
- **Performance Optimized**: Efficient animations and reduced motion support

## 📊 Components Overview

### 1. Main Dashboard (`App.jsx`)
- **Real-time Security Metrics**: Shows vulnerability counts across teams
- **Racing Bar Chart**: Animated visualization of security improvements
- **Interactive Controls**: Play/pause, speed control, sound toggle
- **Team Details**: Detailed vulnerability breakdown by team and project
- **Performance Indicators**: Top movers, improvement tracking

### 2. ECharts Visualization (`SecurityEChart.jsx`)
- **Professional Charts**: Horizontal bar chart with line overlay
- **Rich Tooltips**: Detailed vulnerability information on hover
- **Smooth Animations**: Fluid transitions between data points
- **Team Performance**: Security scores vs vulnerability counts

### 3. Styling (`index.css`)
- **Tailwind Integration**: Full Tailwind CSS setup
- **Custom Components**: Slider, scrollbar, and animation utilities
- **Performance Optimized**: Reduced motion support for accessibility
- **Modern Design**: Gradients, shadows, and blur effects

## 🛠️ Tech Stack

- **React 18**: Latest React with concurrent features
- **Vite**: Fast build tool and development server
- **Tailwind CSS 3**: Utility-first CSS framework
- **Apache ECharts**: Professional charting library
- **React Spring**: Fluid animations and transitions

## 📦 Dependencies

### Core Dependencies
- `react`: ^18.2.0
- `react-dom`: ^18.2.0
- `echarts`: ^5.4.3
- `echarts-for-react`: ^3.0.2

### UI & Animation
- `tailwindcss`: ^4.1.11
- `react-spring`: ^9.7.3
- `react-confetti`: ^6.4.0
- `@tsparticles/react`: ^3.0.0

### Development Tools
- `vite`: ^5.1.0
- `@vitejs/plugin-react`: ^4.2.1
- `autoprefixer`: ^10.4.21
- `postcss`: ^8.5.6

## 🎨 Design System

### Color Palette
- **Primary**: Blue gradients (#3b82f6 to #1e40af)
- **Secondary**: Purple gradients (#8b5cf6 to #6366f1)
- **Success**: Green (#22c55e)
- **Warning**: Orange (#f59e0b)
- **Error**: Red (#ef4444)
- **Teams**: Custom colors for each team (FOO, ITO, PMF, SAM, STT, ULE)

### Typography
- **Font Family**: System fonts (Apple/Google/Microsoft)
- **Sizes**: Responsive typography with Tailwind classes
- **Weights**: Normal, medium, semibold, bold

### Animations
- **Smooth Transitions**: 200-500ms easing functions
- **Spring Physics**: React Spring for natural motion
- **Performance**: GPU-accelerated transforms
- **Accessibility**: Respects reduced motion preferences

## 📱 Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Tablet Support**: Adapted layouts for tablets
- **Desktop**: Full-featured desktop experience
- **Flexible Grid**: CSS Grid and Flexbox layouts

## 🔧 Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

4. **Preview Production Build**
   ```bash
   npm run preview
   ```

## 📊 Data Structure

The dashboard expects data in the following format:

```json
{
  "date": "2024-01-01",
  "team": "FOO",
  "project": "auth-service",
  "vuln_total_team": 45,
  "vuln_total_project": 12,
  "critical_count": 1,
  "high_count": 3,
  "medium_count": 5,
  "low_count": 3,
  "security_score": 65
}
```

## 🎯 Key Features Implemented

### 1. **Racing Bar Chart**
- Animated bars showing vulnerability counts
- Team rankings with crown/medal icons
- Mood indicators based on vulnerability levels
- Real-time updates with smooth transitions

### 2. **Apache ECharts Integration**
- Professional horizontal bar chart
- Line chart overlay for security scores
- Interactive tooltips with detailed information
- Smooth animations and theme customization

### 3. **Tailwind CSS Styling**
- Utility-first approach for rapid development
- Custom gradient backgrounds
- Responsive design patterns
- Dark theme with glass-morphism effects

### 4. **Performance Optimizations**
- Reduced particle count for better performance
- Simplified animations
- Efficient state management
- Debounced updates

### 5. **Interactive Controls**
- Play/pause animation
- Speed control slider
- Sound toggle
- Reset functionality

## 🔍 Browser Support

- **Chrome**: Full support
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support
- **Mobile**: iOS Safari, Chrome Mobile

## � Performance

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

## 📈 Future Enhancements

- [ ] Real-time data updates via WebSocket
- [ ] Export functionality (PDF, PNG)
- [ ] Team comparison views
- [ ] Historical trend analysis
- [ ] Custom time range selection
- [ ] Advanced filtering options

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## � License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **React Team**: For the amazing React 18 features
- **Tailwind CSS**: For the utility-first CSS framework
- **Apache ECharts**: For the professional charting library
- **Vite**: For the fast development experience
```bash
git clone https://github.com/OM-EL/sec-dashboard.git
cd sec-dashboard
```

2. Installez les dépendances:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 🏗️ Project Structure

```
sec-dashboard/
├── src/
│   ├── App.jsx          # Main application component
│   ├── App.css          # Application styles
│   ├── main.jsx         # Entry point
│   ├── index.css        # Global styles
│   └── metrics.json     # Security metrics data
├── public/
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
└── vite.config.js       # Vite configuration
```

## 📊 Data Structure

The dashboard uses data from `src/metrics.json`. The file contains an array of security metrics with the following structure:

### Data Format

```json
[
  {
    "date": "2024-01-01",
    "team": "Alpha",
    "project": "web-app",
    "security_score": 85,
    "vuln_critical": 0,
    "vuln_high": 2,
    "vuln_medium": 5,
    "vuln_low": 8,
    "vuln_info": 3,
    "vuln_total_team": 18,
    "compliance_score": 92,
    "last_scan": "2024-01-01T10:00:00Z"
  }
]
```

### Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `date` | string | Date of the metrics snapshot (YYYY-MM-DD format) |
| `team` | string | Team name (Alpha, Bravo, Charlie, etc.) |
| `project` | string | Project identifier within the team |
| `security_score` | number | Overall security score (0-100) |
| `vuln_critical` | number | Number of critical vulnerabilities |
| `vuln_high` | number | Number of high-severity vulnerabilities |
| `vuln_medium` | number | Number of medium-severity vulnerabilities |
| `vuln_low` | number | Number of low-severity vulnerabilities |
| `vuln_info` | number | Number of informational vulnerabilities |
| `vuln_total_team` | number | Total vulnerabilities for the team |
| `compliance_score` | number | Compliance score (0-100) |
| `last_scan` | string | Timestamp of the last security scan |

## 🎯 How It Works

### 1. Data Processing
- The application loads security metrics from `metrics.json`
- Data is grouped by date to create time-based frames
- Team scores are aggregated across all projects for each team

### 2. Animation System
- Uses `react-spring` for smooth animations
- Each frame represents a different date in the dataset
- Bars animate to new positions and sizes as scores change over time

### 3. Interactive Features
- **Play/Pause**: Control the animation playback
- **Speed Control**: Adjust animation speed from 0.2x to 3x
- **Team Selection**: Click on any team bar to view detailed metrics
- **Reset**: Return to the first frame and stop animation

### 4. Team Ranking
- Teams are ranked by their average security score
- Higher scores appear at the top of the chart
- Color-coded bars make it easy to track specific teams

## 🎨 Team Colors

Each team has a unique color scheme:
- **Alpha**: Red (#FF6B6B)
- **Bravo**: Teal (#4ECDC4)
- **Charlie**: Blue (#45B7D1)
- **Delta**: Green (#96CEB4)
- **Echo**: Yellow (#FFEAA7)
- **Foxtrot**: Purple (#DDA0DD)
- **Golf**: Orange (#FFA07A)
- **Hotel**: Mint (#98D8C8)
- **India**: Gold (#F7DC6F)
- **Juliet**: Lavender (#BB8FCE)

## 🔧 Customization

### Adding New Data
1. Update `src/metrics.json` with new security metrics
2. Ensure the data follows the required structure
3. The dashboard will automatically process and display new data

### Modifying Team Colors
Update the `colors` object in `src/App.jsx`:
```javascript
const colors = {
  Alpha: '#FF6B6B',
  // Add or modify team colors
}
```

### Styling
- Modify `src/App.css` for component-specific styles
- Update `src/index.css` for global styles

## 📱 Build and Deploy

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🐛 Issues and Support

If you encounter any issues or have questions, please [open an issue](https://github.com/OM-EL/sec-dashboard/issues) on GitHub.

## 🚀 Future Enhancements

- [ ] Export data to CSV/PDF
- [ ] Real-time data integration
- [ ] Advanced filtering options
- [ ] Historical trend analysis
- [ ] Team comparison tools
- [ ] Alert system for security threshold breaches
