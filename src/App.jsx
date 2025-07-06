import { useState, useEffect, useRef } from 'react'
import { useSpring, animated } from 'react-spring'
import Confetti from 'react-confetti'
import Particles from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'
import SecurityEChart from './SecurityEChart'
import metricsData from './metrics.json'

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
      <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-xl font-semibold text-white">Loading Dashboard...</div>
          <div className="text-gray-400">Preparing security metrics</div>
        </div>
      </div>
    )
  }

  if (!metricsData || metricsData.length === 0) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center bg-red-900/20 border border-red-700/50 rounded-lg p-8">
          <div className="text-6xl mb-4">⚠️</div>
          <div className="text-xl font-semibold text-red-400 mb-2">No Data Available</div>
          <div className="text-gray-400">Please check the metrics.json file</div>
        </div>
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
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white relative overflow-hidden">
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
        className="absolute inset-0 z-0"
      />
      
      {/* Header */}
      <header className="relative z-10 w-full p-6 border-b border-gray-700/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-4xl font-bold text-center bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4">
            🛡️ Security Vulnerability Race Dashboard
            {celebratingTeam && (
              <span className="block text-lg md:text-xl text-yellow-400 mt-2">
                🔥 {celebratingTeam} is leading the charge!
              </span>
            )}
          </h1>
          
          {/* Fun fact banner */}
          <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-lg p-4 mb-6">
            <div className="text-center">
              <div className="text-sm md:text-base font-medium text-indigo-300 mb-2">
                {currentFunFact}
              </div>
              <div className="text-xs md:text-sm text-gray-400">
                📊 Longer bars = More vulnerabilities | 🏆 Shorter bars = Fewer vulnerabilities = Winner!
              </div>
            </div>
          </div>
          
          {/* Controls */}
          <div className="flex flex-wrap justify-center gap-4 items-center">
            <button 
              onClick={togglePlayPause}
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
            >
              {isPlaying ? '⏸️ Pause' : '▶️ Play'}
            </button>
            
            <button 
              onClick={resetRace}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
            >
              🔄 Reset
            </button>
            
            <button 
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg ${
                soundEnabled 
                  ? 'bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600' 
                  : 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700'
              }`}
            >
              {soundEnabled ? '🔊 Sound ON' : '🔇 Sound OFF'}
            </button>
            
            <div className="flex flex-col items-center space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Speed: {speed}x
              </label>
              <input
                type="range"
                min="0.2"
                max="3"
                step="0.2"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-24 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 max-w-7xl mx-auto p-6">
        {/* Date and Progress Display */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 mb-6 border border-gray-700/50">
          <div className="text-center mb-4">
            <div className="text-2xl md:text-3xl font-bold text-blue-400 mb-2">
              {new Date(currentDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            <div className="text-sm text-gray-400">
              Checkpoint {currentFrame + 1} of {uniqueDates.length}
            </div>
          </div>
          
          <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
              style={{ width: `${((currentFrame + 1) / uniqueDates.length) * 100}%` }}
            />
          </div>
        </div>

        {/* ECharts Visualization */}
        <div className="mb-8">
          <SecurityEChart 
            data={metricsData}
            currentFrame={currentFrame}
            colors={colors}
          />
        </div>

        {/* Racing Chart */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700/50 mb-6">
          <div className="mb-6">
            <h3 className="text-xl md:text-2xl font-bold text-center mb-2">
              🎯 Vulnerability Count by Team
            </h3>
            <div className="text-center text-sm text-gray-400">
              Bar length = Number of vulnerabilities
            </div>
            
            {/* Scale reference */}
            <div className="flex items-center justify-center space-x-4 mt-4 text-xs">
              <div className="flex items-center space-x-2">
                <span className="text-green-400">0 vulnerabilities</span>
                <div className="w-8 h-2 bg-green-500 rounded"></div>
              </div>
              <span className="text-gray-400">→</span>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-2 bg-red-500 rounded"></div>
                <span className="text-red-400">{maxVulns} vulnerabilities</span>
              </div>
            </div>
          </div>
          
          <div className="relative h-96 overflow-hidden">
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
        </div>

        {/* Team Details */}
        {selectedTeam && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700/50 mb-6">
            <h3 className="text-xl md:text-2xl font-bold mb-4 text-center">
              📊 {selectedTeam} Team Details
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                <h4 className="text-sm font-medium text-gray-300 mb-2">Total Vulnerabilities</h4>
                <div className="text-2xl font-bold text-red-400">{teamData[selectedTeam].vuln_total_team}</div>
              </div>
              
              <div className="bg-red-900/30 rounded-lg p-4 text-center border border-red-700/50">
                <h4 className="text-sm font-medium text-red-300 mb-2">Critical</h4>
                <div className="text-2xl font-bold text-red-400">{teamData[selectedTeam].total_critical}</div>
              </div>
              
              <div className="bg-orange-900/30 rounded-lg p-4 text-center border border-orange-700/50">
                <h4 className="text-sm font-medium text-orange-300 mb-2">High</h4>
                <div className="text-2xl font-bold text-orange-400">{teamData[selectedTeam].total_high}</div>
              </div>
              
              <div className="bg-yellow-900/30 rounded-lg p-4 text-center border border-yellow-700/50">
                <h4 className="text-sm font-medium text-yellow-300 mb-2">Medium</h4>
                <div className="text-2xl font-bold text-yellow-400">{teamData[selectedTeam].total_medium}</div>
              </div>
              
              <div className="bg-blue-900/30 rounded-lg p-4 text-center border border-blue-700/50">
                <h4 className="text-sm font-medium text-blue-300 mb-2">Low</h4>
                <div className="text-2xl font-bold text-blue-400">{teamData[selectedTeam].total_low}</div>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-3">
                Projects ({teamData[selectedTeam].projects.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teamData[selectedTeam].projects.map((project, idx) => (
                  <div key={idx} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600/50">
                    <div className="font-medium text-blue-300 mb-1">{project.project}</div>
                    <div className="text-sm text-gray-400">Score: {project.security_score}</div>
                    <div className="text-sm text-red-400">{project.vuln_total_project} vulnerabilities</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Callouts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-green-800/30 to-emerald-800/30 rounded-lg p-6 border border-green-700/50">
            <h3 className="text-lg font-bold text-green-300 mb-2 flex items-center">
              🚀 <span className="ml-2">Top Mover</span>
            </h3>
            <div className="text-2xl font-bold text-white mb-1">
              {topMover?.team || '-'}
            </div>
            <div className="text-lg text-green-400">
              {topMover ? `+${topMover.delta.toFixed(1)}` : '-'}
            </div>
            {topMover && <div className="text-xl">✨</div>}
          </div>
          
          <div className="bg-gradient-to-br from-orange-800/30 to-red-800/30 rounded-lg p-6 border border-orange-700/50">
            <h3 className="text-lg font-bold text-orange-300 mb-2 flex items-center">
              🐢 <span className="ml-2">Needs Boost</span>
            </h3>
            <div className="text-2xl font-bold text-white mb-1">
              {slowestMover?.team || '-'}
            </div>
            <div className="text-lg text-orange-400">
              {slowestMover ? `${slowestMover.delta.toFixed(1)}` : '-'}
            </div>
            {slowestMover && <div className="text-xl animate-pulse">⚠️</div>}
          </div>
          
          <div className="bg-gradient-to-br from-purple-800/30 to-pink-800/30 rounded-lg p-6 border border-purple-700/50">
            <h3 className="text-lg font-bold text-purple-300 mb-2 flex items-center">
              🦄 <span className="ml-2">Dark Horse</span>
            </h3>
            <div className="text-2xl font-bold text-white mb-1">
              {darkHorse?.team || '-'}
            </div>
            <div className="text-lg text-purple-400">
              {darkHorse ? `+${darkHorse.improvement} ranks` : '-'}
            </div>
            {darkHorse && <div className="text-xl animate-bounce">⭐</div>}
          </div>
        </div>
      </main>
    </div>
  )
}

const BarItem = ({ team, data, index, maxVulns, minVulns, color, onClick, isSelected, rank, streak, isCelebrating }) => {
  // Calculate bar width: directly proportional to vulnerability count
  const barWidth = Math.max((data.vuln_total_team / maxVulns) * 100, 5) // Minimum 5% width
  
  // Simplified animations for better performance
  const springProps = useSpring({
    transform: `translateY(${index * 60}px)`,
    width: `${barWidth}%`,
    config: { tension: 200, friction: 25 }
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
    if (data.vuln_total_team <= 70) return '😐'  // High vulnerabilities
    return '😰'  // Too many vulnerabilities
  }

  return (
    <animated.div
      className={`absolute left-0 w-full h-12 flex items-center z-10 cursor-pointer transition-all duration-200 ${
        isSelected ? 'bg-gray-700/30 rounded-lg' : ''
      } ${isCelebrating ? 'animate-pulse' : ''}`}
      style={{
        transform: springProps.transform,
        zIndex: 10 - index
      }}
      onClick={onClick}
    >
      {/* Rank indicator */}
      <div className="flex items-center justify-center w-12 h-12 text-lg font-bold">
        <span className="text-yellow-400">{getRankIcon()}</span>
      </div>
      
      {/* Team label */}
      <div className="flex items-center space-x-2 w-24 text-sm font-medium">
        <span className="text-white">{team}</span>
        <span className="text-lg">{getTeamMood()}</span>
        {streak > 0 && (
          <span className="text-orange-400 text-xs">🔥{streak}</span>
        )}
      </div>
      
      {/* Bar container */}
      <div className="flex-1 mx-4">
        <animated.div
          className={`h-8 rounded-full relative transition-all duration-200 ${
            data.vuln_total_team > 70 ? 'ring-2 ring-red-500' : ''
          }`}
          style={{
            width: springProps.width,
            backgroundColor: color,
            minWidth: '20px',
            background: data.vuln_total_team > 70 ? 
              `linear-gradient(135deg, ${color}, #ef4444)` : 
              color
          }}
        >
          {/* Vulnerability info */}
          <div className="absolute left-2 top-0 h-full flex items-center space-x-2 text-xs font-medium text-white">
            <span>{data.vuln_total_team} vulns</span>
            <span className="text-gray-200">
              ({Math.round((data.vuln_total_team / maxVulns) * 100)}%)
            </span>
          </div>
          
          {/* Max vulnerability indicator */}
          {data.vuln_total_team === maxVulns && (
            <div className="absolute -top-8 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
              🚨 MOST VULNERABILITIES
            </div>
          )}
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
