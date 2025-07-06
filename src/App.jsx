import { useState, useEffect, useRef } from 'react'
import { useSpring, animated } from 'react-spring'
import Confetti from 'react-confetti'
import SecurityEChart from './SecurityEChart'
import VulnerabilityHeatmap from './VulnerabilityHeatmap'
import FloatingDatePopup from './components/FloatingDatePopup'
import { Card, MetricCard, Button, ProgressBar, SectionHeader, Grid, Callout, Loading, Badge } from './components/UIComponents'
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
  // Removed particles to fix React hook issues

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
              vuln_total_team: 0,
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

        Object.keys(teamAggregates).forEach(team => {
          const projects = teamAggregates[team].projects
          teamAggregates[team].security_score = Math.round(
            projects.reduce((sum, p) => sum + p.security_score, 0) / projects.length
          )
          // Calculate total vulnerabilities consistently
          teamAggregates[team].vuln_total_team = 
            teamAggregates[team].total_critical + 
            teamAggregates[team].total_high + 
            teamAggregates[team].total_medium + 
            teamAggregates[team].total_low
        })

        const currentRankings = {}
        const currentScores = {}
        
        Object.entries(teamAggregates).forEach(([team, data], index) => {
          currentRankings[team] = index + 1
          currentScores[team] = data.security_score
        })

        // Simple streak tracking without complex achievement system
        Object.keys(teamAggregates).forEach(team => {
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
          <Loading size="lg" className="mx-auto mb-4" />
          <div className="text-xl font-semibold text-white">Loading Dashboard...</div>
          <div className="text-gray-400">Preparing security metrics</div>
        </div>
      </div>
    )
  }

  if (!metricsData || metricsData.length === 0) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex items-center justify-center">
        <Card variant="highlight" className="text-center bg-red-900/20 border-red-700/50">
          <div className="text-6xl mb-4">⚠️</div>
          <div className="text-xl font-semibold text-red-400 mb-2">No Data Available</div>
          <div className="text-gray-400">Please check the metrics.json file</div>
        </Card>
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
          vuln_total_team: 0, // Initialize to 0, will be calculated
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

    // Calculate team totals correctly
    Object.keys(teamAggregates).forEach(team => {
      const projects = teamAggregates[team].projects
      // Calculate average security score per team
      teamAggregates[team].security_score = Math.round(
        projects.reduce((sum, p) => sum + p.security_score, 0) / projects.length
      )
      // Calculate total vulnerabilities from sum of all severity levels
      teamAggregates[team].vuln_total_team = 
        teamAggregates[team].total_critical + 
        teamAggregates[team].total_high + 
        teamAggregates[team].total_medium + 
        teamAggregates[team].total_low
    })

    return teamAggregates
  }

  const teamData = aggregateTeamScores()
  const sortedTeams = Object.entries(teamData)
    .sort(([,a], [,b]) => a.vuln_total_team - b.vuln_total_team)
    .slice(0, 10)

  // Find the actual maximum and minimum vulnerabilities across ALL teams (not just sorted)
  const allTeamVulns = Object.values(teamData).map(data => data.vuln_total_team)
  const maxVulns = Math.max(...allTeamVulns)
  const minVulns = Math.min(...allTeamVulns)
  
  // Find which team has the maximum vulnerabilities
  const teamWithMaxVulns = Object.entries(teamData).find(([,data]) => data.vuln_total_team === maxVulns)?.[0]

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
    // Removed particles functionality
  }

  // Removed particles config to fix React hook issues

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white relative overflow-hidden">
      {/* Animated background dots - Pure Tailwind */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-2 h-2 bg-blue-500/20 rounded-full animate-ping"></div>
        <div className="absolute w-1 h-1 bg-purple-500/20 rounded-full animate-pulse top-1/5 left-4/5"></div>
        <div className="absolute w-3 h-3 bg-green-500/20 rounded-full animate-bounce top-3/5 left-1/5"></div>
        <div className="absolute w-1 h-1 bg-red-500/20 rounded-full animate-ping top-4/5 left-3/5"></div>
        <div className="absolute w-2 h-2 bg-yellow-500/20 rounded-full animate-pulse top-2/5 right-10"></div>
        <div className="absolute w-1 h-1 bg-indigo-500/20 rounded-full animate-bounce top-1/3 left-1/2"></div>
        <div className="absolute w-2 h-2 bg-pink-500/20 rounded-full animate-ping top-3/4 left-2/5"></div>
        <div className="absolute w-1 h-1 bg-cyan-500/20 rounded-full animate-pulse top-1/2 left-1/6"></div>
      </div>
      
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
      {/* Removed Particles component to fix React hook issues */}
      
      {/* Header */}
      <header className="relative z-10 w-full p-6 border-b border-gray-700/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-4xl font-bold text-center bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4">
            🛡️ Security Champion Dashboard – Tribute to ISO
            {celebratingTeam && (
              <span className="block text-lg md:text-xl text-yellow-400 mt-2">
                🔥 {celebratingTeam} is leading the charge!
              </span>
            )}
          </h1>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 max-w-7xl mx-auto p-6">
        {/* Summary Statistics */}
        <Card className="mb-8">
          <SectionHeader 
            title="Security Overview"
            subtitle="Total vulnerabilities across all teams"
            icon="📊"
          />
          <Grid cols={4} gap={4}>
            <MetricCard
              title="Total Critical"
              value={Object.values(teamData).reduce((sum, team) => sum + team.total_critical, 0)}
              color="red"
              icon="🔴"
            />
            <MetricCard
              title="Total High"
              value={Object.values(teamData).reduce((sum, team) => sum + team.total_high, 0)}
              color="orange"
              icon="🟠"
            />
            <MetricCard
              title="Total Medium"
              value={Object.values(teamData).reduce((sum, team) => sum + team.total_medium, 0)}
              color="yellow"
              icon="🟡"
            />
            <MetricCard
              title="Total Low"
              value={Object.values(teamData).reduce((sum, team) => sum + team.total_low, 0)}
              color="blue"
              icon="🔵"
            />
          </Grid>
        </Card>

        {/* Charts - Vertical Layout with Consistent Heights */}
        <div className="space-y-8">
          <div className="w-full h-[500px]">
            <SecurityEChart 
              data={metricsData}
              currentFrame={currentFrame}
              colors={colors}
            />
          </div>
          <div className="w-full h-[500px]">
            <VulnerabilityHeatmap 
              data={metricsData}
              currentFrame={currentFrame}
              colors={colors}
            />
          </div>
        </div>

        {/* Racing Chart */}
        <Card className="mb-6">
          <SectionHeader 
            title="Vulnerability Count by Team"
            subtitle="Bar length = Number of vulnerabilities"
            icon="🎯"
          />
          
          {/* Scale reference */}
          <div className="flex items-center justify-center space-x-4 mt-4 mb-6 text-xs">
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
          
          <div className="relative h-[500px] overflow-hidden">
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
                teamWithMaxVulns={teamWithMaxVulns}
              />
            ))}
          </div>
        </Card>

        {/* Team Details */}
        {selectedTeam && (
          <Card className="mb-6">
            <SectionHeader 
              title={`${selectedTeam} Team Details`}
              icon="📊"
            />
            
            <Grid cols={5} gap={4} className="mb-6">
              <MetricCard
                title="Total Vulnerabilities"
                value={teamData[selectedTeam].vuln_total_team}
                color="gray"
              />
              <MetricCard
                title="Critical"
                value={teamData[selectedTeam].total_critical}
                color="red"
              />
              <MetricCard
                title="High"
                value={teamData[selectedTeam].total_high}
                color="orange"
              />
              <MetricCard
                title="Medium"
                value={teamData[selectedTeam].total_medium}
                color="yellow"
              />
              <MetricCard
                title="Low"
                value={teamData[selectedTeam].total_low}
                color="blue"
              />
            </Grid>
            
            <div>
              <h4 className="text-lg font-semibold mb-3 text-white">
                Projects ({teamData[selectedTeam].projects.length})
              </h4>
              <Grid cols={3} gap={4}>
                {teamData[selectedTeam].projects.map((project, idx) => (
                  <div key={idx} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600/50">
                    <div className="font-medium text-blue-300 mb-1">{project.project}</div>
                    <div className="text-sm text-gray-400">Score: {project.security_score}</div>
                    <div className="text-sm text-red-400">{project.vuln_total_project} vulnerabilities</div>
                  </div>
                ))}
              </Grid>
            </div>
          </Card>
        )}

        {/* Callouts */}
        <Grid cols={3} gap={6}>
          <Callout
            title="Top Mover"
            value={topMover?.team || '-'}
            description={topMover ? `+${topMover.delta.toFixed(1)}` : '-'}
            color="green"
            icon="🚀"
          />
          <Callout
            title="Needs Boost"
            value={slowestMover?.team || '-'}
            description={slowestMover ? `${slowestMover.delta.toFixed(1)}` : '-'}
            color="orange"
            icon="🐢"
          />
          <Callout
            title="Dark Horse"
            value={darkHorse?.team || '-'}
            description={darkHorse ? `+${darkHorse.improvement} ranks` : '-'}
            color="purple"
            icon="🦄"
          />
        </Grid>
      </main>

      {/* Floating Date Popup */}
      <FloatingDatePopup
        currentDate={currentDate}
        currentFrame={currentFrame}
        totalFrames={uniqueDates.length}
        onFrameChange={(frame) => setCurrentFrame(frame)}
        isPlaying={isPlaying}
        speed={speed}
        onPlayPause={togglePlayPause}
        onReset={resetRace}
        onSpeedChange={setSpeed}
        soundEnabled={soundEnabled}
        onSoundToggle={() => setSoundEnabled(!soundEnabled)}
      />
    </div>
  )
}

const BarItem = ({ team, data, index, maxVulns, minVulns, color, onClick, isSelected, rank, streak, isCelebrating, teamWithMaxVulns }) => {
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
          <Badge color="orange" size="sm">
            🔥{streak}
          </Badge>
        )}
      </div>
      
      {/* Bar container */}
      <div className="flex-1 mx-4">
        <animated.div
          className={`h-8 rounded-full relative transition-all duration-200 min-w-5 ${
            data.vuln_total_team > 70 ? 'ring-2 ring-red-500' : ''
          }`}
          style={{
            width: springProps.width,
            backgroundColor: data.vuln_total_team > 70 ? 
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
          {team === teamWithMaxVulns && (
            <div className="absolute -top-8 left-2">
              <Badge color="red" size="sm" className="font-bold">
                🚨 MOST VULNERABILITIES
              </Badge>
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
