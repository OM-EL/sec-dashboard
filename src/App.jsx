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
  const [achievements, setAchievements] = useState([])
  const [particlesInit, setParticlesInit] = useState(false)
  const [celebratingTeam, setCelebratingTeam] = useState(null)
  const [streaks, setStreaks] = useState({})
  const [milestones, setMilestones] = useState({})
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [hallOfFame, setHallOfFame] = useState({})
  const [teamStats, setTeamStats] = useState({})
  const [currentFunFact, setCurrentFunFact] = useState("🎯 Security is a team sport!")
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

  // Sound effect function
  const playSound = (type) => {
    if (!soundEnabled) return
    
    // Create simple beep sounds using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    const frequencies = {
      achievement: 800,
      levelup: 1000,
      warning: 400
    }
    
    oscillator.frequency.value = frequencies[type] || 600
    oscillator.type = 'sine'
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.3)
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

  // Rotate fun facts
  useEffect(() => {
    const factInterval = setInterval(() => {
      setCurrentFunFact(funFacts[Math.floor(Math.random() * funFacts.length)])
    }, 8000)
    
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
      }, 1000 / speed)
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

  // Achievement system
  const triggerAchievement = (type, team, value) => {
    const newAchievement = {
      id: Date.now() + Math.random(),
      type,
      team,
      value,
      timestamp: Date.now()
    }
    
    setAchievements(prev => [...prev, newAchievement])
    
    // Play sound effect
    playSound(type === 'first_place' ? 'levelup' : 'achievement')
    
    // Trigger confetti for major achievements
    if (type === 'milestone' || type === 'comeback' || type === 'perfect_security') {
      setShowConfetti(true)
      setCelebratingTeam(team)
      setTimeout(() => {
        setShowConfetti(false)
        setCelebratingTeam(null)
      }, 3000)
    }
    
    // Auto-remove achievement after 5 seconds
    setTimeout(() => {
      setAchievements(prev => prev.filter(a => a.id !== newAchievement.id))
    }, 5000)
  }

  // Achievement checking system
  const checkAchievements = (currentRankings, currentScores, prevRankings, prevScores) => {
    Object.keys(currentScores).forEach(team => {
      const currentVulns = teamData[team]?.vuln_total_team || 0
      const previousVulns = prevScores[team] || currentVulns
      const currentRank = currentRankings[team]
      const previousRank = prevRankings[team] || currentRank
      
      // Perfect security achievement (very few vulnerabilities)
      if (currentVulns <= 15 && previousVulns > 15) {
        triggerAchievement('perfect_security', team, currentVulns)
      }
      
      // Milestone achievements (good vulnerability reduction)
      if (currentVulns <= 25 && previousVulns > 25) {
        triggerAchievement('milestone', team, 25)
      }
      
      // Comeback achievement (moved up 3+ positions)
      if (previousRank - currentRank >= 3) {
        triggerAchievement('comeback', team, previousRank - currentRank)
      }
      
      // Improvement streak (reducing vulnerabilities)
      if (currentVulns < previousVulns) {
        setStreaks(prev => ({
          ...prev,
          [team]: (prev[team] || 0) + 1
        }))
        
        if ((streaks[team] || 0) >= 3) {
          triggerAchievement('hot_streak', team, streaks[team])
        }
      } else if (currentVulns > previousVulns) {
        setStreaks(prev => ({
          ...prev,
          [team]: 0
        }))
      }
      
      // First place achievement
      if (currentRank === 1 && previousRank !== 1) {
        triggerAchievement('first_place', team, currentRank)
      }
    })
  }

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

        const sortedTeams = Object.entries(teamAggregates)
          .sort(([,a], [,b]) => a.vuln_total_team - b.vuln_total_team)
          .slice(0, 10)

        const currentRankings = {}
        const currentScores = {}
        
        sortedTeams.forEach(([team, data], index) => {
          currentRankings[team] = index + 1
          currentScores[team] = data.security_score
        })

        // Check for achievements and milestones
        checkAchievements(currentRankings, currentScores, previousRankings, previousScores)

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
    setAchievements([])
    setStreaks({})
    setMilestones({})
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
        value: 50,
        density: {
          enable: true,
          area: 800
        }
      },
      color: {
        value: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7"]
      },
      shape: {
        type: "star"
      },
      opacity: {
        value: 0.6,
        random: true
      },
      size: {
        value: 3,
        random: true
      },
      move: {
        enable: true,
        speed: 2,
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
          enable: true,
          mode: "repulse"
        },
        onClick: {
          enable: true,
          mode: "push"
        }
      }
    },
    retina_detect: true
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
      
      {/* Achievement notifications */}
      <div className="achievements-container">
        {achievements.map(achievement => (
          <AchievementNotification key={achievement.id} achievement={achievement} />
        ))}
      </div>
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

        {showConfetti && (
          <div className="confetti-container">
            <Confetti
              width={window.innerWidth}
              height={window.innerHeight}
              numberOfPieces={500}
              recycle={false}
              onConfettiComplete={() => setShowConfetti(false)}
            />
          </div>
        )}

        {particlesInit && (
          <Particles
            id="tsparticles"
            init={handleParticlesInit}
            options={{
              particles: {
                number: {
                  value: 50,
                  density: {
                    enable: true,
                    value_area: 800
                  }
                },
                color: {
                  value: "#ffffff"
                },
                shape: {
                  type: "circle",
                  stroke: {
                    width: 0,
                    color: "#000000"
                  },
                  polygon: {
                    nb_sides: 5
                  }
                },
                opacity: {
                  value: 0.5,
                  random: false,
                  anim: {
                    enable: false,
                    speed: 1,
                    opacity_min: 0.1,
                    sync: false
                  }
                },
                size: {
                  value: 5,
                  random: true,
                  anim: {
                    enable: false,
                    speed: 40,
                    size_min: 0.1,
                    sync: false
                  }
                },
                line_linked: {
                  enable: true,
                  distance: 150,
                  color: "#ffffff",
                  opacity: 0.4,
                  width: 1
                },
                move: {
                  enable: true,
                  speed: 6,
                  direction: "none",
                  random: false,
                  straight: false,
                  bounce: false,
                  attract: {
                    enable: false,
                    rotateX: 600,
                    rotateY: 1200
                  }
                }
              },
              interactivity: {
                detect_on: "canvas",
                events: {
                  onhover: {
                    enable: true,
                    mode: "repulse"
                  },
                  onclick: {
                    enable: true,
                    mode: "push"
                  },
                  resize: true
                },
                modes: {
                  grab: {
                    distance: 400,
                    line_linked: {
                      opacity: 1
                    }
                  },
                  bubble: {
                    distance: 400,
                    size: 40,
                    duration: 2,
                    opacity: 8,
                    speed: 3
                  },
                  repulse: {
                    distance: 200,
                    duration: 2
                  },
                  push: {
                    particles_nb: 4
                  },
                  remove: {
                    particles_nb: 2
                  }
                }
              },
              retina_detect: true
            }}
          />
        )}
      </main>
    </div>
  )
}

const BarItem = ({ team, data, index, maxVulns, minVulns, color, onClick, isSelected, rank, streak, isCelebrating }) => {
  // Calculate bar width: directly proportional to vulnerability count (more intuitive)
  // Use the actual vulnerability count as a proportion of the maximum
  const barWidth = Math.max((data.vuln_total_team / maxVulns) * 100, 5) // Minimum 5% width
  
  const springProps = useSpring({
    transform: `translateY(${index * 60}px)`,
    width: `${barWidth}%`,
    config: { tension: 300, friction: 30 }
  })

  const celebrationProps = useSpring({
    scale: isCelebrating ? 1.05 : 1,
    shadowOpacity: isCelebrating ? 0.8 : 0.2,
    config: { tension: 300, friction: 20 }
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
    if (data.vuln_total_team <= 90) return '😟'  // Many vulnerabilities
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
            transform: `scale(${celebrationProps.scale})`,
            boxShadow: isCelebrating ? 
              `0px 0px 30px ${color}80, 0px 0px 60px ${color}40` : 
              '0px 4px 15px rgba(0,0,0,0.2)',
            transition: 'all 0.3s ease',
            border: data.vuln_total_team > 70 ? '2px solid #ff4444' : '2px solid rgba(255,255,255,0.2)',
            minWidth: '20px',
            // Add gradient overlay for high vulnerability teams
            background: data.vuln_total_team > 70 ? 
              `linear-gradient(135deg, ${color}, #ff4444)` : 
              data.vuln_total_team > 50 ? 
              `linear-gradient(135deg, ${color}, #ffaa44)` : 
              color
          }}
        >
          <div className="vulnerability-info">
            <span className="vuln-count">{data.vuln_total_team} vulns</span>
            <span className="vuln-percentage">({Math.round((data.vuln_total_team / maxVulns) * 100)}%)</span>
          </div>
          
          {/* Warning indicator for high vulnerabilities */}
          {data.vuln_total_team > 70 && (
            <div className="warning-indicator">⚠️</div>
          )}
          
          {/* Special indicator for team with most vulnerabilities */}
          {data.vuln_total_team === maxVulns && (
            <div className="max-vulns-indicator">🚨 MOST VULNS</div>
          )}
          
          {/* Pulse effect for very high vulnerabilities */}
          {data.vuln_total_team > 90 && (
            <div className="pulse-ring" style={{ borderColor: '#ff4444' }}></div>
          )}
        </animated.div>
        <span className="score-label">{data.vuln_total_team} vulns</span>
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
