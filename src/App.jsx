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
    "🎯 Security is a team sport - shortest bar wins!",
    "🔒 Every vulnerability fixed shrinks your bar!",
    "🚀 Small improvements = shorter bars = big wins!",
    "🛡️ Defense shrinks the bar - offense against vulnerabilities!",
    "⚡ Speed matters, but shorter bars matter more!",
    "🎨 Clean code = fewer vulnerabilities = shorter bars!",
    "🔥 Consistency in security = consistently shorter bars!",
    "🌟 Every vulnerability fixed makes your bar shorter!",
    "🏆 The team with the shortest bar leads the race!",
    "💪 Security champions have the shortest bars!"
  ]

  // Sound effect function (simplified)
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
    FOO: '#FF6B6B',
    ITO: '#4ECDC4', 
    PMF: '#45B7D1',
    SAM: '#96CEB4',
    STT: '#FFEAA7',
    ULE: '#DDA0DD'
  }

  // Initialize particles engine
  const initParticles = async (engine) => {
    await loadSlim(engine)
    setParticlesInit(true)
  }

  // Rotate fun facts (simplified)
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

  // Simplified data processing for better performance
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

  // Find max vulnerabilities for bar width calculation (inverted for display)
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
        value: 20, // Reduced from 50 for better performance
        density: {
          enable: true,
          area: 1000
        }
      },
      color: {
        value: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7"]
      },
      shape: {
        type: "circle" // Simplified from "star"
      },
      opacity: {
        value: 0.4, // Reduced opacity
        random: false
      },
      size: {
        value: 2,
        random: false // Disabled random for better performance
      },
      move: {
        enable: true,
        speed: 1, // Reduced speed
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
    <div className="app">
      {/* Confetti celebration */}
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          numberOfPieces={200}
          recycle={false}
          colors={['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD']}
        />
      )}
      
      {/* Background particles */}
      <Particles
        id="tsparticles"
        init={initParticles}
        options={particlesConfig}
        className="particles-bg"
      />
      
      <header>
        <h1>🛡️ Security Vulnerability Race - Shortest Bar Wins! {celebratingTeam && `- ${celebratingTeam} is securing the lead! 🔥`}</h1>
        <div className="fun-fact-banner">
          <span className="fun-fact-text">{currentFunFact}</span>
          <span className="visual-guide">📊 Longer bars = More vulnerabilities | 🏆 Shorter bars = Fewer vulnerabilities = Winner!</span>
        </div>
        <div className="controls">
          <button onClick={togglePlayPause} className="play-btn">
            {isPlaying ? '⏸️ Pause' : '▶️ Play'}
          </button>
          <button onClick={resetRace} className="reset-btn">🔄 Reset</button>
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)} 
            className={`sound-btn ${soundEnabled ? 'enabled' : 'disabled'}`}
          >
            {soundEnabled ? '🔊 Sound ON' : '🔇 Sound OFF'}
          </button>
          <div className="speed-control">
            <label>Speed: {speed}x</label>
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
              {currentFrame + 1} / {uniqueDates.length} checkpoints
            </div>
          </div>
        </div>

        <div className="chart-container">
          <div className="chart-header">
            <h3>🎯 Team Vulnerability Count (Bar length = Vulnerability count)</h3>
            <div className="scale-reference">
              <span className="scale-text">Scale: 0 vulnerabilities</span>
              <div className="scale-bar" style={{ width: '0%', background: '#4CAF50' }}></div>
              <span className="scale-text">→ {maxVulns} vulnerabilities</span>
              <div className="scale-bar" style={{ width: '100%', background: '#FF4444' }}></div>
            </div>
          </div>
          <div className="chart">
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
                <h4>Total Vulnerabilities</h4>
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
                    <div className="project-vulns">{project.vuln_total_project} vulnerabilities</div>
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

        {/* Simplified confetti for major wins only */}
        {showConfetti && (
          <div className="confetti-container">
            <Confetti
              width={window.innerWidth}
              height={window.innerHeight}
              numberOfPieces={100} // Reduced from 500
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
  // Calculate bar width: directly proportional to vulnerability count (more intuitive)
  // Use the actual vulnerability count as a proportion of the maximum
  const barWidth = Math.max((data.vuln_total_team / maxVulns) * 100, 5) // Minimum 5% width
  
  // Simplified animations for better performance
  const springProps = useSpring({
    transform: `translateY(${index * 60}px)`,
    width: `${barWidth}%`,
    config: { tension: 200, friction: 25 } // Reduced tension for smoother animation
  })

  const getRankIcon = () => {
    if (rank === 1) return '👑'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return rank
  }

  const getTeamMood = () => {
    if (data.vuln_total_team <= 20) return '😎'  // Very few vulnerabilities
    if (data.vuln_total_team <= 35) return '😊'  // Low vulnerabilities
    if (data.vuln_total_team <= 50) return '🙂'  // Moderate vulnerabilities
    if (data.vuln_total_team <= 70) return '😐'  // Higher vulnerabilities
    return '😰'  // Too many vulnerabilities
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
            transition: 'all 0.2s ease', // Reduced transition time
            border: data.vuln_total_team > 70 ? '2px solid #ff4444' : '2px solid rgba(255,255,255,0.2)',
            minWidth: '20px',
            // Simplified gradient for better performance
            background: data.vuln_total_team > 70 ? 
              `linear-gradient(135deg, ${color}, #ff4444)` : 
              color
          }}
        >
          <div className="vulnerability-info">
            <span className="vuln-count">{data.vuln_total_team} vulns</span>
            <span className="vuln-percentage">({Math.round((data.vuln_total_team / maxVulns) * 100)}%)</span>
          </div>
          
          {/* Simplified indicators */}
          {data.vuln_total_team === maxVulns && (
            <div className="max-vulns-indicator">🚨 MOST VULNS</div>
          )}
          
          {/* Removed complex pulse effects for better performance */}
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
          title: 'Perfect Security!',
          message: `${achievement.team} has an ultra-short bar - only ${achievement.value} vulnerabilities!`,
          color: '#FFD700'
        }
      case 'milestone':
        return {
          icon: '🎯',
          title: 'Security Milestone!',
          message: `${achievement.team} shrunk their bar - vulnerabilities below ${achievement.value}!`,
          color: '#4ECDC4'
        }
      case 'comeback':
        return {
          icon: '🚀',
          title: 'Amazing Comeback!',
          message: `${achievement.team} dramatically shortened their bar - jumped ${achievement.value} positions!`,
          color: '#FF6B6B'
        }
      case 'hot_streak':
        return {
          icon: '🔥',
          title: 'Hot Streak!',
          message: `${achievement.team} shrunk their bar ${achievement.value} times in a row!`,
          color: '#FFA500'
        }
      case 'first_place':
        return {
          icon: '👑',
          title: 'Security Champion!',
          message: `${achievement.team} has the shortest bar - fewest vulnerabilities!`,
          color: '#FFD700'
        }
      default:
        return {
          icon: '🎉',
          title: 'Achievement!',
          message: `${achievement.team} did something awesome!`,
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
