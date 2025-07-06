import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';

const SecurityEChart = ({ data, currentFrame, colors }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      // Initialize ECharts instance
      chartInstance.current = echarts.init(chartRef.current);

      // Cleanup function
      return () => {
        if (chartInstance.current) {
          chartInstance.current.dispose();
        }
      };
    }
  }, []);

  useEffect(() => {
    if (chartInstance.current && data && data.length > 0) {
      updateChart();
    }
  }, [data, currentFrame]);

  const updateChart = () => {
    if (!data || data.length === 0) return;

    // Get unique dates and current date
    const uniqueDates = [...new Set(data.map(item => item.date))].sort();
    const currentDate = uniqueDates[currentFrame] || uniqueDates[0];

    // Filter data for current date
    const currentDateData = data.filter(item => item.date === currentDate);

    // Aggregate team data
    const teamAggregates = {};
    currentDateData.forEach(item => {
      if (!teamAggregates[item.team]) {
        teamAggregates[item.team] = {
          security_score: 0,
          vuln_total_team: 0, // Will be calculated
          projects: [],
          total_critical: 0,
          total_high: 0,
          total_medium: 0,
          total_low: 0
        };
      }

      teamAggregates[item.team].projects.push(item);
      teamAggregates[item.team].total_critical += item.critical_count;
      teamAggregates[item.team].total_high += item.high_count;
      teamAggregates[item.team].total_medium += item.medium_count || 0;
      teamAggregates[item.team].total_low += item.low_count || 0;
    });

    // Calculate team totals consistently
    Object.keys(teamAggregates).forEach(team => {
      const projects = teamAggregates[team].projects;
      teamAggregates[team].security_score = Math.round(
        projects.reduce((sum, p) => sum + p.security_score, 0) / projects.length
      );
      // Calculate total vulnerabilities from sum of all severity levels
      teamAggregates[team].vuln_total_team = 
        teamAggregates[team].total_critical + 
        teamAggregates[team].total_high + 
        teamAggregates[team].total_medium + 
        teamAggregates[team].total_low;
    });

    // Sort teams by vulnerability count (ascending - fewer vulnerabilities is better)
    const sortedTeams = Object.entries(teamAggregates)
      .sort(([,a], [,b]) => a.vuln_total_team - b.vuln_total_team);

    // Prepare data for horizontal bar chart
    const teamNames = sortedTeams.map(([team]) => team);
    const vulnCounts = sortedTeams.map(([, data]) => data.vuln_total_team);
    const securityScores = sortedTeams.map(([, data]) => data.security_score);

    // ECharts configuration
    const option = {
      title: {
        text: '🛡️ Security Vulnerabilities by Team',
        subtext: currentDate,
        left: 'center',
        textStyle: {
          color: '#fff',
          fontSize: 20,
          fontWeight: 'bold'
        },
        subtextStyle: {
          color: '#bbb',
          fontSize: 14
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: function(params) {
          const dataIndex = params[0].dataIndex;
          const team = teamNames[dataIndex];
          const teamData = teamAggregates[team];
          
          return `
            <div class="bg-gray-800 p-3 rounded-lg text-white">
              <div class="font-bold text-lg">${team}</div>
              <div class="text-sm mt-1">
                <div>Total Vulnerabilities: <span class="text-red-400">${teamData.vuln_total_team}</span></div>
                <div>Security Score: <span class="text-green-400">${teamData.security_score}</span></div>
                <div class="mt-2 text-xs">
                  <div>Critical: <span class="text-red-500">${teamData.total_critical}</span></div>
                  <div>High: <span class="text-orange-500">${teamData.total_high}</span></div>
                  <div>Medium: <span class="text-yellow-500">${teamData.total_medium}</span></div>
                  <div>Low: <span class="text-blue-500">${teamData.total_low}</span></div>
                </div>
              </div>
            </div>
          `;
        }
      },
      legend: {
        data: ['Vulnerabilities'],
        textStyle: {
          color: '#fff'
        },
        top: '8%'
      },
      grid: {
        left: '25%',
        right: '20%',
        bottom: '25%',
        top: '35%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'value',
          name: 'Vulnerabilities',
          nameLocation: 'middle',
          nameGap: 30,
          nameTextStyle: {
            color: '#fff',
            fontSize: 12
          },
          axisLabel: {
            color: '#fff',
            fontSize: 11
          },
          axisLine: {
            lineStyle: {
              color: '#fff'
            }
          },
          splitLine: {
            lineStyle: {
              color: '#444'
            }
          }
        }
      ],
      yAxis: {
        type: 'category',
        data: teamNames,
        axisLabel: {
          color: '#fff',
          fontSize: 12,
          interval: 0,
          margin: 15,
          width: 60,
          overflow: 'truncate'
        },
        axisLine: {
          lineStyle: {
            color: '#fff'
          }
        },
        axisTick: {
          show: false
        }
      },
      series: [
        {
          name: 'Vulnerabilities',
          type: 'bar',
          data: vulnCounts.map((count, index) => ({
            value: count,
            itemStyle: {
              color: colors[teamNames[index]] || '#e74c3c'
            }
          })),
          label: {
            show: true,
            position: 'right',
            color: '#fff',
            fontSize: 11,
            formatter: function(params) {
              const team = teamNames[params.dataIndex];
              const score = securityScores[params.dataIndex];
              return `${params.value} vulns (Score: ${score})`;
            },
            offset: [10, 0],
            rich: {
              vulns: {
                color: '#fff',
                fontSize: 11
              },
              score: {
                color: '#2ecc71',
                fontSize: 10
              }
            }
          },
          animationDuration: 1000,
          animationEasing: 'elasticOut',
          barWidth: '50%',
          barGap: '20%'
        }
      ],
      backgroundColor: 'transparent',
      animation: true,
      animationDuration: 1000,
      animationEasing: 'cubicOut'
    };

    // Update chart
    chartInstance.current.setOption(option, true);
  };

  return (
    <div className="w-full h-[500px] bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-lg p-4 backdrop-blur-sm border border-gray-700/50">
      <div
        ref={chartRef}
        className="w-full h-full"
        style={{ minHeight: '450px' }}
      />
    </div>
  );
};

export default SecurityEChart;
