import * as d3 from 'd3';

export class SecurityScoreRace {
  constructor(container, data) {
    this.container = container;
    this.data = data;
    this.width = 800;
    this.height = 600;
    this.margin = { top: 20, right: 30, bottom: 40, left: 200 };
    this.colors = {
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
    };
    
    this.initializeChart();
  }

  initializeChart() {
    // Clear any existing chart
    d3.select(this.container).selectAll("*").remove();

    this.svg = d3.select(this.container)
      .append("svg")
      .attr("width", this.width)
      .attr("height", this.height);

    this.chartArea = this.svg.append("g")
      .attr("transform", `translate(${this.margin.left},${this.margin.top})`);

    this.innerWidth = this.width - this.margin.left - this.margin.right;
    this.innerHeight = this.height - this.margin.top - this.margin.bottom;

    // Create scales
    this.xScale = d3.scaleLinear()
      .range([0, this.innerWidth]);

    this.yScale = d3.scaleBand()
      .range([0, this.innerHeight])
      .padding(0.1);

    // Create axes
    this.xAxis = this.chartArea.append("g")
      .attr("transform", `translate(0,${this.innerHeight})`);

    this.yAxis = this.chartArea.append("g");

    // Add title
    this.svg.append("text")
      .attr("x", this.width / 2)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .style("font-size", "20px")
      .style("font-weight", "bold")
      .text("Security Score Racing Chart");
  }

  updateChart(frameData) {
    // Process data for current frame
    const currentData = frameData.sort((a, b) => b.security_score - a.security_score);
    const teams = currentData.map(d => d.team);
    const maxScore = d3.max(currentData, d => d.security_score);

    // Update scales
    this.xScale.domain([0, maxScore]);
    this.yScale.domain(teams);

    // Update axes
    this.xAxis.transition()
      .duration(500)
      .call(d3.axisBottom(this.xScale));

    this.yAxis.transition()
      .duration(500)
      .call(d3.axisLeft(this.yScale));

    // Bind data to bars
    const bars = this.chartArea.selectAll(".bar")
      .data(currentData, d => d.team);

    // Enter new bars
    const barsEnter = bars.enter()
      .append("g")
      .attr("class", "bar");

    barsEnter.append("rect")
      .attr("fill", d => this.colors[d.team] || '#ccc')
      .attr("x", 0)
      .attr("width", 0)
      .attr("height", this.yScale.bandwidth())
      .attr("rx", 4);

    barsEnter.append("text")
      .attr("class", "score-text")
      .attr("y", this.yScale.bandwidth() / 2)
      .attr("dy", "0.35em")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("fill", "white");

    barsEnter.append("text")
      .attr("class", "vuln-text")
      .attr("y", this.yScale.bandwidth() / 2 + 15)
      .attr("dy", "0.35em")
      .style("font-size", "10px")
      .style("fill", "white");

    // Merge enter and update selections
    const barsUpdate = barsEnter.merge(bars);

    // Transition bars
    barsUpdate.transition()
      .duration(500)
      .attr("transform", d => `translate(0,${this.yScale(d.team)})`);

    barsUpdate.select("rect")
      .transition()
      .duration(500)
      .attr("width", d => this.xScale(d.security_score))
      .attr("fill", d => this.colors[d.team] || '#ccc');

    barsUpdate.select(".score-text")
      .transition()
      .duration(500)
      .attr("x", d => this.xScale(d.security_score) + 5)
      .text(d => d.security_score);

    barsUpdate.select(".vuln-text")
      .transition()
      .duration(500)
      .attr("x", d => this.xScale(d.security_score) + 5)
      .text(d => `${d.vuln_total_team} vulns`);

    // Exit old bars
    bars.exit().remove();
  }

  animate(data) {
    // Group data by date
    const dataByDate = d3.group(data, d => d.date);
    const dates = Array.from(dataByDate.keys()).sort();
    
    let currentIndex = 0;
    
    const animateFrame = () => {
      if (currentIndex < dates.length) {
        const currentDate = dates[currentIndex];
        const frameData = dataByDate.get(currentDate);
        
        // Update date display
        this.svg.select(".date-display").remove();
        this.svg.append("text")
          .attr("class", "date-display")
          .attr("x", this.width - 100)
          .attr("y", 50)
          .attr("text-anchor", "end")
          .style("font-size", "16px")
          .style("font-weight", "bold")
          .text(currentDate);
        
        this.updateChart(frameData);
        currentIndex++;
        
        setTimeout(animateFrame, 1000);
      }
    };
    
    animateFrame();
  }
}
