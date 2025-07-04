import { useState, useEffect, useRef } from 'react'
import { useSpring, animated } from 'react-spring'
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
  const intervalRef = useRef(null)

  const colors = {
    Alpha: '#FF6B6B',
    Bravo: '#4ECDC4', 
    Charlie: '#45B7D1',
    Delta: '#96CEB4',
    Echo: '#FFEAA7',
    Foxtrot: '#DDA0DD',
    Golf: '#FFA07A',
    Hotel: '#98D8C8',
    India: '#F7DC6F',
    Juliet: '#BB8FCE'
  }

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
            return 0
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
          .sort(([,a], [,b]) => b.security_score - a.security_score)
          .slice(0, 10)

        const currentRankings = {}
        const currentScores = {}
        
        sortedTeams.forEach(([team, data], index) => {
          currentRankings[team] = index + 1
          currentScores[team] = data.security_score
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
    .sort(([,a], [,b]) => b.security_score - a.security_score)
    .slice(0, 10)

  const maxScore = Math.max(...sortedTeams.map(([,data]) => data.security_score))

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
  }

  return (
    <div className="app">
      <header>
        <h1>🏆 Security Score Race</h1>
        <div className="controls">
          <button onClick={togglePlayPause}>
            {isPlaying ? '⏸️ Pause' : '▶️ Play'}
          </button>
          <button onClick={resetRace}>🔄 Reset</button>
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
          {new Date(currentDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>

        <div className="chart-container">
          <div className="chart">
            {sortedTeams.map(([team, data], index) => (
              <BarItem
                key={team}
                team={team}
                data={data}
                index={index}
                maxScore={maxScore}
                color={colors[team]}
                onClick={() => setSelectedTeam(selectedTeam === team ? null : team)}
                isSelected={selectedTeam === team}
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
          <div className="callout">
            <h3>🏆 Top Mover</h3>
            <div className="team-name">{topMover?.team || '-'}</div>
            <div className="value">
              {topMover ? `+${topMover.delta.toFixed(1)}` : '-'}
            </div>
          </div>
          <div className="callout">
            <h3>🐢 Slowest Mover</h3>
            <div className="team-name">{slowestMover?.team || '-'}</div>
            <div className="value">
              {slowestMover ? `${slowestMover.delta.toFixed(1)}` : '-'}
            </div>
          </div>
          <div className="callout">
            <h3>🎯 Dark Horse</h3>
            <div className="team-name">{darkHorse?.team || '-'}</div>
            <div className="value">
              {darkHorse ? `+${darkHorse.improvement} ranks` : '-'}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

const BarItem = ({ team, data, index, maxScore, color, onClick, isSelected }) => {
  const springProps = useSpring({
    transform: `translateY(${index * 60}px)`,
    width: `${Math.max((data.security_score / maxScore) * 100, 2)}%`,
    config: { tension: 300, friction: 30 }
  })

  return (
    <animated.div
      className={`bar-item ${isSelected ? 'selected' : ''}`}
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
      <div className="team-label">{team}</div>
      <div className="bar-container">
        <animated.div
          className="bar"
          style={{
            width: springProps.width,
            backgroundColor: color,
            height: '40px',
            borderRadius: '20px',
            position: 'relative',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            transition: 'all 0.3s ease',
            border: '2px solid rgba(255,255,255,0.2)',
            minWidth: '20px'
          }}
        >
          <div className="vulnerability-info">
            <span className="vuln-count">{data.vuln_total_team} vulns</span>
          </div>
        </animated.div>
        <span className="score-label">{data.security_score}</span>
      </div>
    </animated.div>
  )
}

export default App
