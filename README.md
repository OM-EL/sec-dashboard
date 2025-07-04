# Tableau de Bord de Sécurité

Un tableau de bord de métriques de sécurité en temps réel construit avec React et Vite, avec des graphiques à barres animées pour visualiser les scores de sécurité des équipes au fil du temps.

## 🚀 Fonctionnalités

- **Animation en Temps Réel**: Regardez les scores de sécurité évoluer dans le temps avec des animations fluides
- **Graphique de Course Interactif**: Graphique à barres animé montrant les classements et scores de sécurité des équipes
- **Détails des Équipes**: Cliquez sur n'importe quelle équipe pour voir la répartition détaillée des vulnérabilités
- **Contrôles de Lecture**: Lecture, pause et contrôle de la vitesse d'animation
- **Design Responsif**: Interface moderne qui fonctionne sur différentes tailles d'écran

## 📋 Prérequis

- Node.js (v16 ou plus récent)
- npm ou yarn comme gestionnaire de paquets

## 🛠️ Installation

1. Clonez le dépôt:
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
