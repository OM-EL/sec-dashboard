import { useState, useEffect, useRef } from 'react'
import { useSpring, animated } from 'react-spring'
import Confetti from 'react-confetti'
import Particles from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'
import metricsData from './metrics.json'
import './App.css'

function App() {
  const [currentFrame, setCurrentFrame] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [previousRankings, setPreviousRankings] = useState({})
  const [previousScores, setPreviousScores] = useState({})
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showConfetti, setShowConfetti] = useState(false)
  const [particlesInit, setParticlesInit] = useState(false)
  const [celebratingTeam, setCelebratingTeam] = useState(null)
  const [streaks, setStreaks] = useState({})
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [currentFunFact, setCurrentFunFact] = useState("🎯 Security is a team sport - shortest bar wins!")
  const intervalRef = useRef(null)

  // Add Easter eggs and fun facts
  const funFacts = [
    "🎯 La sécurité est un sport d'équipe - la barre la plus courte gagne !",
    "🔒 Chaque vulnérabilité corrigée réduit votre barre !",
    "🚀 Petites améliorations = barres plus courtes = grandes victoires !",
    "🛡️ La défense réduit la barre - offensive contre les vulnérabilités !",
    "⚡ La vitesse compte, mais les barres plus courtes comptent plus !",
    "🎨 Code propre = moins de vulnérabilités = barres plus courtes !",
    "🔥 Cohérence en sécurité = barres constamment plus courtes !",
    "🌟 Chaque vulnérabilité corrigée raccourcit votre barre !",
    "🏆 L'équipe avec la barre la plus courte mène la course !",
    "💪 Les champions de sécurité ont les barres les plus courtes !"
  ]

  // Fonction d'effet sonore (simplifiée)
  const playSound = (type) => {
    if (!soundEnabled) return
    
    // Create simple beep sounds using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.value = type === 'levelup' ? 1000 : 600
    oscillator.type = 'sine'
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.2)
  }

  const colors = {
    FOO: '#e74c3c',
    ITO: '#3498db', 
    PMF: '#2980b9',
    SAM: '#27ae60',
    STT: '#f39c12',
    ULE: '#9b59b6'
  }

  // Initialize particles engine
  const initParticles = async (engine) => {
    await loadSlim(engine)
    setParticlesInit(true)
  }

  // Rotation des faits amusants (simplifiée)
  useEffect(() => {
    const factInterval = setInterval(() => {
      setCurrentFunFact(funFacts[Math.floor(Math.random() * funFacts.length)])
    }, 10000) // Longer interval for better performance
    
    return () => clearInterval(factInterval)
  }, [])

  // Always run useEffect hooks - move all logic inside
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 100)
    
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (isPlaying && !isLoading) {
      const uniqueDates = [...new Set(metricsData.map(item => item.date))].sort()
      intervalRef.current = setInterval(() => {
        setCurrentFrame(prev => {
          const newFrame = prev + 1
          if (newFrame >= uniqueDates.length) {
            setIsPlaying(false)
            return uniqueDates.length - 1 // Stay at the last frame instead of resetting
          }
          return newFrame
        })
      }, 1500 / speed) // Increased interval for smoother performance (was 1000 / speed)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isPlaying, speed, isLoading])

  // Traitement des données simplifié pour de meilleures performances
  useEffect(() => {
    if (!isLoading && metricsData && metricsData.length > 0) {
      const uniqueDates = [...new Set(metricsData.map(item => item.date))].sort()
      const currentDate = uniqueDates[currentFrame]
      
      if (currentDate) {
        const currentDateData = metricsData.filter(item => item.date === currentDate)
        const teamAggregates = {}

        currentDateData.forEach(item => {
          if (!teamAggregates[item.team]) {
            teamAggregates[item.team] = {
              security_score: 0,
              vuln_total_team: item.vuln_total_team,
              projects: []
            }
          }
          teamAggregates[item.team].projects.push(item)
        })

        Object.keys(teamAggregates).forEach(team => {
          const projects = teamAggregates[team].projects
          teamAggregates[team].security_score = Math.round(
            projects.reduce((sum, p) => sum + p.security_score, 0) / projects.length
          )
        })

        const currentRankings = {}
        const currentScores = {}
        
        Object.entries(teamAggregates).forEach(([team, data], index) => {
          currentRankings[team] = index + 1
          currentScores[team] = data.security_score
        })

        // Simple streak tracking without complex achievement system
        Object.keys(currentScores).forEach(team => {
          const currentVulns = teamAggregates[team]?.vuln_total_team || 0
          const previousVulns = previousScores[team] || currentVulns
          
          if (currentVulns < previousVulns) {
            setStreaks(prev => ({
              ...prev,
              [team]: (prev[team] || 0) + 1
            }))
          } else if (currentVulns > previousVulns) {
            setStreaks(prev => ({
              ...prev,
              [team]: 0
            }))
          }
        })

        setPreviousRankings(currentRankings)
        setPreviousScores(currentScores)
      }
    }
  }, [currentFrame, isLoading])

  // Early returns after all hooks
  if (isLoading) {
    return (
      <div className="app">
        <div className="loading">Loading...</div>
      </div>
    )
  }

  if (!metricsData || metricsData.length === 0) {
    return (
      <div className="app">
        <div className="error">No data available. Please check metrics.json file.</div>
      </div>
    )
  }

  // Get unique dates
  const uniqueDates = [...new Set(metricsData.map(item => item.date))].sort()
  const currentDate = uniqueDates[currentFrame]

  // Aggregate team scores for current date
  const aggregateTeamScores = () => {
    const currentDateData = metricsData.filter(item => item.date === currentDate)
    const teamAggregates = {}

    currentDateData.forEach(item => {
      if (!teamAggregates[item.team]) {
        teamAggregates[item.team] = {
          security_score: 0,
          vuln_total_team: item.vuln_total_team,
          projects: [],
          total_critical: 0,
          total_high: 0,
          total_medium: 0,
          total_low: 0
        }
      }

      teamAggregates[item.team].projects.push(item)
      teamAggregates[item.team].total_critical += item.critical_count
      teamAggregates[item.team].total_high += item.high_count
      teamAggregates[item.team].total_medium += item.medium_count || 0
      teamAggregates[item.team].total_low += item.low_count || 0
    })

    // Calculate average security score per team
    Object.keys(teamAggregates).forEach(team => {
      const projects = teamAggregates[team].projects
      teamAggregates[team].security_score = Math.round(
        projects.reduce((sum, p) => sum + p.security_score, 0) / projects.length
      )
    })

    return teamAggregates
  }

  const teamData = aggregateTeamScores()
  const sortedTeams = Object.entries(teamData)
    .sort(([,a], [,b]) => a.vuln_total_team - b.vuln_total_team)
    .slice(0, 10)

  // Trouver le maximum de vulnérabilités pour le calcul de la largeur des barres (inversé pour l'affichage)
  const maxVulns = Math.max(...sortedTeams.map(([,data]) => data.vuln_total_team))
  const minVulns = Math.min(...sortedTeams.map(([,data]) => data.vuln_total_team))

  // Calculate call-outs
  const calculateCallouts = () => {
    const currentRankings = {}
    const currentScores = {}
    
    sortedTeams.forEach(([team, data], index) => {
      currentRankings[team] = index + 1
      currentScores[team] = data.security_score
    })

    let topMover = null
    let slowestMover = null
    let darkHorse = null
    let maxIncrease = -Infinity
    let minIncrease = Infinity

    Object.keys(currentScores).forEach(team => {
      const currentScore = currentScores[team]
      const previousScore = previousScores[team] || currentScore
      const scoreDelta = currentScore - previousScore
      
      if (scoreDelta > maxIncrease) {
        maxIncrease = scoreDelta
        topMover = { team, delta: scoreDelta }
      }
      
      if (scoreDelta <= minIncrease) {
        minIncrease = scoreDelta
        slowestMover = { team, delta: scoreDelta }
      }

      const currentRank = currentRankings[team]
      const previousRank = previousRankings[team] || currentRank
      const rankImprovement = previousRank - currentRank
      
      if (rankImprovement >= 3 && !darkHorse) {
        darkHorse = { team, improvement: rankImprovement }
      }
    })

    return { topMover, slowestMover, darkHorse }
  }

  const { topMover, slowestMover, darkHorse } = calculateCallouts()

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const resetRace = () => {
    setCurrentFrame(0)
    setPreviousRankings({})
    setPreviousScores({})
    setIsPlaying(false)
    setSelectedTeam(null)
    setStreaks({})
    setShowConfetti(false)
    setCelebratingTeam(null)
  }

  const handleParticlesInit = (main) => {
    loadSlim(main)
    setParticlesInit(true)
  }

  const particlesConfig = {
    particles: {
      number: {
        value: 20, // Réduit de 50 pour de meilleures performances
        density: {
          enable: true,
          area: 1000
        }
      },
      color: {
        value: ["#e74c3c", "#3498db", "#2980b9", "#27ae60", "#f39c12"]
      },
      shape: {
        type: "circle" // Simplifié de "star"
      },
      opacity: {
        value: 0.4, // Opacité réduite
        random: false
      },
      size: {
        value: 2,
        random: false // Disabled random for better performance
      },
      move: {
        enable: true,
        speed: 1, // Vitesse réduite
        direction: "none",
        random: false,
        straight: false,
        outMode: "bounce"
      }
    },
    interactivity: {
      detectsOn: "canvas",
      events: {
        onHover: {
          enable: false // Disabled for better performance
        },
        onClick: {
          enable: false // Disabled for better performance
        }
      }
    },
    retina_detect: false // Disabled for better performance
  }

  return (
    <div className="app w-full min-h-screen">
      {/* Confetti celebration */}
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          numberOfPieces={200}
          recycle={false}
          colors={['#e74c3c', '#3498db', '#2980b9', '#27ae60', '#f39c12', '#9b59b6']}
        />
      )}
      
      {/* Background particles */}
      <Particles
        id="tsparticles"
        init={initParticles}
        options={particlesConfig}
        className="particles-bg"
      />
      
      <header className="w-full">
        <h1 className="text-center">🛡️ Course aux Vulnérabilités de Sécurité - La Barre la Plus Courte Gagne ! {celebratingTeam && `- ${celebratingTeam} prend la tête ! 🔥`}</h1>
        <div className="fun-fact-banner">
          <span className="fun-fact-text">{currentFunFact}</span>
          <span className="visual-guide">📊 Barres plus longues = Plus de vulnérabilités | 🏆 Barres plus courtes = Moins de vulnérabilités = Gagnant !</span>
        </div>
        <div className="controls">
          <button onClick={togglePlayPause} className="play-btn">
            {isPlaying ? '⏸️ Pause' : '▶️ Lecture'}
          </button>
          <button onClick={resetRace} className="reset-btn">🔄 Réinitialiser</button>
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)} 
            className={`sound-btn ${soundEnabled ? 'enabled' : 'disabled'}`}
          >
            {soundEnabled ? '🔊 Son ACTIVÉ' : '🔇 Son DÉSACTIVÉ'}
          </button>
          <div className="speed-control">
            <label>Vitesse: {speed}x</label>
            <input
              type="range"
              min="0.2"
              max="3"
              step="0.2"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
            />
          </div>
        </div>
      </header>

      <main>
        <div className="date-display">
          <div className="date-text">
            {new Date(currentDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${((currentFrame + 1) / uniqueDates.length) * 100}%` }}
              />
            </div>
            <div className="progress-text">
              {currentFrame + 1} / {uniqueDates.length} points de contrôle
            </div>
          </div>
        </div>

        <div className="chart-container w-full max-w-none">
          <div className="chart-header">
            <h3>🎯 Nombre de Vulnérabilités par Équipe (Longueur de barre = Nombre de vulnérabilités)</h3>
            <div className="scale-reference">
              <span className="scale-text">Échelle: 0 vulnérabilités</span>
              <div className="scale-bar" style={{ width: '0%', background: '#4CAF50' }}></div>
              <span className="scale-text">→ {maxVulns} vulnérabilités</span>
              <div className="scale-bar" style={{ width: '100%', background: '#FF4444' }}></div>
            </div>
          </div>
          <div className="chart w-full">
            {sortedTeams.map(([team, data], index) => (
              <BarItem
                key={team}
                team={team}
                data={data}
                index={index}
                maxVulns={maxVulns}
                minVulns={minVulns}
                color={colors[team]}
                onClick={() => setSelectedTeam(selectedTeam === team ? null : team)}
                isSelected={selectedTeam === team}
                rank={index + 1}
                streak={streaks[team] || 0}
                isCelebrating={celebratingTeam === team}
                />
              ))}
            </div>
            
            {/* Podium effects for top 3 */}
            <div className="podium-effects">
              {sortedTeams.slice(0, 3).map(([team, data], index) => (
                <div 
                  key={team}
                  className={`podium-glow position-${index + 1}`}
                  style={{
                    transform: `translateY(${index * 60}px)`,
                    background: `radial-gradient(circle, ${colors[team]}30, transparent)`
                  }}
                />
              ))}
            </div>
        </div>

        {selectedTeam && (
          <div className="team-details">
            <h3>📊 {selectedTeam} Team Details</h3>
            <div className="details-grid">
              <div className="detail-card">
                <h4>Total des Vulnérabilités</h4>
                <div className="big-number">{teamData[selectedTeam].vuln_total_team}</div>
              </div>
              <div className="detail-card critical">
                <h4>Critical</h4>
                <div className="big-number">{teamData[selectedTeam].total_critical}</div>
              </div>
              <div className="detail-card high">
                <h4>High</h4>
                <div className="big-number">{teamData[selectedTeam].total_high}</div>
              </div>
              <div className="detail-card medium">
                <h4>Medium</h4>
                <div className="big-number">{teamData[selectedTeam].total_medium}</div>
              </div>
              <div className="detail-card low">
                <h4>Low</h4>
                <div className="big-number">{teamData[selectedTeam].total_low}</div>
              </div>
            </div>
            <div className="projects-list">
              <h4>Projects ({teamData[selectedTeam].projects.length})</h4>
              <div className="projects-grid">
                {teamData[selectedTeam].projects.map((project, idx) => (
                  <div key={idx} className="project-card">
                    <div className="project-name">{project.project}</div>
                    <div className="project-score">Score: {project.security_score}</div>
                    <div className="project-vulns">{project.vuln_total_project} vulnérabilités</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="callouts">
          <div className="callout top-mover">
            <h3>🚀 Top Mover</h3>
            <div className="team-name">{topMover?.team || '-'}</div>
            <div className="value">
              {topMover ? `+${topMover.delta.toFixed(1)}` : '-'}
            </div>
            {topMover && <div className="sparkle">✨</div>}
          </div>
          <div className="callout slowest-mover">
            <h3>� Needs Boost</h3>
            <div className="team-name">{slowestMover?.team || '-'}</div>
            <div className="value">
              {slowestMover ? `${slowestMover.delta.toFixed(1)}` : '-'}
            </div>
            {slowestMover && <div className="alert-pulse">⚠️</div>}
          </div>
          <div className="callout dark-horse">
            <h3>� Dark Horse</h3>
            <div className="team-name">{darkHorse?.team || '-'}</div>
            <div className="value">
              {darkHorse ? `+${darkHorse.improvement} ranks` : '-'}
            </div>
            {darkHorse && <div className="shooting-star">⭐</div>}
          </div>
        </div>

        {/* Confettis simplifiés pour les grandes victoires seulement */}
        {showConfetti && (
          <div className="confetti-container">
            <Confetti
              width={window.innerWidth}
              height={window.innerHeight}
              numberOfPieces={100} // Réduit de 500
              recycle={false}
              onConfettiComplete={() => setShowConfetti(false)}
            />
          </div>
        )}
      </main>
    </div>
  )
}

const BarItem = ({ team, data, index, maxVulns, minVulns, color, onClick, isSelected, rank, streak, isCelebrating }) => {
  // Calculer la largeur de la barre : directement proportionnelle au nombre de vulnérabilités (plus intuitif)
  // Use the actual vulnerability count as a proportion of the maximum
  const barWidth = Math.max((data.vuln_total_team / maxVulns) * 100, 5) // Largeur minimale de 5%
  
  // Animations simplifiées pour de meilleures performances
  const springProps = useSpring({
    transform: `translateY(${index * 60}px)`,
    width: `${barWidth}%`,
    config: { tension: 200, friction: 25 } // Tension réduite pour une animation plus fluide
  })

  const getRankIcon = () => {
    if (rank === 1) return '👑'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return rank
  }

  const getTeamMood = () => {
    if (data.vuln_total_team <= 20) return '😎'  // Très peu de vulnérabilités
    if (data.vuln_total_team <= 35) return '😊'  // Faibles vulnérabilités
    if (data.vuln_total_team <= 50) return '🙂'  // Vulnérabilités modérées
    if (data.vuln_total_team <= 70) return '😐'  // Vulnérabilités élevées
    return '😰'  // Trop de vulnérabilités
  }

  return (
    <animated.div
      className={`bar-item ${isSelected ? 'selected' : ''} ${isCelebrating ? 'celebrating' : ''}`}
      style={{
        transform: springProps.transform,
        position: 'absolute',
        left: 0,
        width: '100%',
        height: '50px',
        display: 'flex',
        alignItems: 'center',
        zIndex: 10 - index,
        cursor: 'pointer'
      }}
      onClick={onClick}
    >
      <div className="rank-indicator">
        <span className="rank-number">{getRankIcon()}</span>
      </div>
      <div className="team-label">
        {team}
        <span className="team-mood">{getTeamMood()}</span>
        {streak > 0 && <span className="streak-indicator">🔥{streak}</span>}
      </div>
      <div className="bar-container">
        <animated.div
          className="bar"
          style={{
            width: springProps.width,
            backgroundColor: color,
            height: '40px',
            borderRadius: '20px',
            position: 'relative',
            transition: 'all 0.2s ease', // Temps de transition réduit
            border: data.vuln_total_team > 70 ? '2px solid #ff4444' : '2px solid rgba(255,255,255,0.2)',
            minWidth: '20px',
            // Dégradé simplifié pour de meilleures performances
            background: data.vuln_total_team > 70 ? 
              `linear-gradient(135deg, ${color}, #ff4444)` : 
              color
          }}
        >
          <div className="vulnerability-info">
            <span className="vuln-count">{data.vuln_total_team} vulns</span>
            <span className="vuln-percentage">({Math.round((data.vuln_total_team / maxVulns) * 100)}%)</span>
          </div>
          
          {/* Indicateurs simplifiés */}
          {data.vuln_total_team === maxVulns && (
            <div className="max-vulns-indicator">🚨 PLUS DE VULNS</div>
          )}
          
          {/* Effets de pulsation complexes supprimés pour de meilleures performances */}
        </animated.div>
      </div>
    </animated.div>
  )
}

const AchievementNotification = ({ achievement }) => {
  const slideIn = useSpring({
    from: { x: 100, opacity: 0 },
    to: { x: 0, opacity: 1 },
    config: { tension: 300, friction: 30 }
  })

  const getAchievementDetails = () => {
    switch (achievement.type) {
      case 'perfect_security':
        return {
          icon: '�️',
          title: 'Sécurité Parfaite !',
          message: `${achievement.team} a une barre ultra-courte - seulement ${achievement.value} vulnérabilités !`,
          color: '#FFD700'
        }
      case 'milestone':
        return {
          icon: '🎯',
          title: 'Jalon de Sécurité !',
          message: `${achievement.team} a réduit sa barre - vulnérabilités en dessous de ${achievement.value} !`,
          color: '#4ECDC4'
        }
      case 'comeback':
        return {
          icon: '🚀',
          title: 'Retour Spectaculaire !',
          message: `${achievement.team} a considérablement raccourci sa barre - bondi de ${achievement.value} positions !`,
          color: '#FF6B6B'
        }
      case 'hot_streak':
        return {
          icon: '🔥',
          title: 'Série de Succès !',
          message: `${achievement.team} a réduit sa barre ${achievement.value} fois de suite !`,
          color: '#FFA500'
        }
      case 'first_place':
        return {
          icon: '👑',
          title: 'Champion de Sécurité !',
          message: `${achievement.team} a la barre la plus courte - le moins de vulnérabilités !`,
          color: '#FFD700'
        }
      default:
        return {
          icon: '🎉',
          title: 'Réussite !',
          message: `${achievement.team} a fait quelque chose de formidable !`,
          color: '#96CEB4'
        }
    }
  }

  const details = getAchievementDetails()

  return (
    <animated.div 
      className="achievement-notification"
      style={{
        transform: `translateX(${slideIn.x}%)`,
        opacity: slideIn.opacity,
        borderColor: details.color,
        background: `linear-gradient(135deg, ${details.color}20, ${details.color}10)`
      }}
    >
      <div className="achievement-icon">{details.icon}</div>
      <div className="achievement-content">
        <div className="achievement-title">{details.title}</div>
        <div className="achievement-message">{details.message}</div>
      </div>
    </animated.div>
  )
}

export default App
