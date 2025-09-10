// results-calculator.js - Calculs des résultats et génération des recommandations

export class ResultsCalculator {
  constructor() {
    this.dimensionScores = {};
    this.overallScore = 0;
    this.focusAreas = [];
    this.chart = null;
  }

  calculateResults(assessmentData, scores, allQuestions) {
    this.dimensionScores = {};
    
    // Calculate average score for each dimension using normalized scores
    assessmentData.dimensions.forEach(dimension => {
      const dimensionQuestions = assessmentData.questions.filter(q => q.dimensionId === dimension.id);
      let totalScore = 0;
      let questionCount = 0;

      dimensionQuestions.forEach(question => {
        const scoreData = scores[question.id];
        if (scoreData && scoreData.normalizedScore) {
          totalScore += scoreData.normalizedScore;
          questionCount++;
        }
      });

      this.dimensionScores[dimension.id] = {
        average: questionCount > 0 ? totalScore / questionCount : 0,
        total: totalScore,
        count: questionCount,
        name: dimension.name
      };
    });

    // Calculate overall score using normalized scores
    const allNormalizedScores = Object.values(scores)
      .map(scoreData => scoreData.normalizedScore)
      .filter(score => score !== null && score !== undefined);
    
    this.overallScore = allNormalizedScores.length > 0 ? 
      allNormalizedScores.reduce((sum, score) => sum + score, 0) / allNormalizedScores.length : 0;

    // Generate focus areas and recommendations
    this.generateFocusAreas(allQuestions, scores);
  }

  generateFocusAreas(allQuestions, scores) {
    this.focusAreas = [];
    
    // 1. Identify lowest scoring dimensions (urgent)
    const sortedDimensions = Object.entries(this.dimensionScores)
      .sort((a, b) => a[1].average - b[1].average);
    
    const lowestDimensions = sortedDimensions.slice(0, 2);
    
    // 2. Identify specific low-scoring questions within any dimension
    const lowScoringQuestions = [];
    allQuestions.forEach(question => {
      const scoreData = scores[question.id];
      if (scoreData && scoreData.normalizedScore <= 3) {
        lowScoringQuestions.push({
          question: question,
          score: scoreData.normalizedScore,
          dimension: question.dimensionName
        });
      }
    });
    
    // Sort by score (lowest first)
    lowScoringQuestions.sort((a, b) => a.score - b.score);
    
    // 3. Generate recommendations based on analysis
    
    // Critical issues (scores 1-2)
    const criticalIssues = lowScoringQuestions.filter(q => q.score <= 2);
    if (criticalIssues.length > 0) {
      this.focusAreas.push({
        priority: 'CRITICAL',
        title: 'Immediate Action Required',
        description: `${criticalIssues.length} critical gap${criticalIssues.length > 1 ? 's' : ''} identified that need immediate attention.`,
        recommendations: criticalIssues.slice(0, 3).map(item => 
          `Address: ${item.question.text.substring(0, 80)}${item.question.text.length > 80 ? '...' : ''}`
        )
      });
    }
    
    // Dimension-level recommendations
    if (lowestDimensions.length > 0 && lowestDimensions[0][1].average < 4) {
      const worstDimension = lowestDimensions[0];
      this.focusAreas.push({
        priority: 'HIGH',
        title: `Strengthen ${worstDimension[1].name}`,
        description: `This dimension scored ${worstDimension[1].average.toFixed(1)}/6 and represents the biggest opportunity for improvement.`,
        recommendations: this.getDimensionRecommendations(worstDimension[0])
      });
    }
    
    // Secondary focus area
    if (lowestDimensions.length > 1 && lowestDimensions[1][1].average < 4.5) {
      const secondDimension = lowestDimensions[1];
      this.focusAreas.push({
        priority: 'MEDIUM',
        title: `Develop ${secondDimension[1].name}`,
        description: `Secondary focus area scoring ${secondDimension[1].average.toFixed(1)}/6.`,
        recommendations: this.getDimensionRecommendations(secondDimension[0]).slice(0, 2)
      });
    }
    
    // If everything is good, focus on excellence
    if (this.overallScore >= 4.5 && this.focusAreas.length === 0) {
      const bestDimension = sortedDimensions[sortedDimensions.length - 1];
      this.focusAreas.push({
        priority: 'OPTIMIZE',
        title: 'Drive Excellence',
        description: `Strong overall performance (${this.overallScore.toFixed(1)}/6). Focus on optimization and sharing best practices.`,
        recommendations: [
          `Leverage ${bestDimension[1].name} as a strength to mentor other teams`,
          'Document and share successful practices with other pods',
          'Explore advanced techniques and continuous optimization'
        ]
      });
    }
  }
  
  getDimensionRecommendations(dimensionId) {
    const recommendations = {
      'workflow': [
        'Implement regular flow metrics tracking and review',
        'Establish clear WIP limits and flow policies',
        'Create visual management boards for bottleneck identification',
        'Set up dependency tracking and escalation processes'
      ],
      'rituals': [
        'Improve ceremony preparation and facilitation',
        'Increase stakeholder engagement in demos and reviews',
        'Establish regular retrospective action tracking',
        'Create ceremony effectiveness feedback loops'
      ],
      'visibility': [
        'Implement single source of truth for all work tracking',
        'Establish clear communication cadences with stakeholders',
        'Create documentation standards and knowledge sharing practices',
        'Set up transparent progress reporting mechanisms'
      ],
      'execution': [
        'Define and implement clear Definition of Ready/Done',
        'Establish quality gates and testing practices',
        'Create commitment planning and tracking processes',
        'Implement defect prevention and root cause analysis'
      ],
      'improvement': [
        'Establish systematic retrospective action implementation',
        'Create experimentation and learning frameworks',
        'Implement feedback loops and measurement practices',
        'Build celebration and knowledge sharing rituals'
      ]
    };
    
    return recommendations[dimensionId] || [
      'Focus on consistent application of best practices',
      'Establish measurement and feedback mechanisms',
      'Create team learning and development plans'
    ];
  }

  createRadarChart(assessmentData, podName) {
    const ctx = document.getElementById('radar-chart').getContext('2d');
    
    // Create multi-line labels for long dimension names
    const labels = assessmentData.dimensions.map(d => {
      const name = d.name;
      
      // Split long names into multiple lines
      if (name.includes('&')) {
        const parts = name.split('&');
        return [parts[0].trim(), '& ' + parts[1].trim()];
      } else if (name.length > 15) {
        // Split long names at space
        const words = name.split(' ');
        if (words.length > 1) {
          const midPoint = Math.ceil(words.length / 2);
          return [
            words.slice(0, midPoint).join(' '),
            words.slice(midPoint).join(' ')
          ];
        }
      }
      
      return name; // Return as single line if short enough
    });
    
    const data = assessmentData.dimensions.map(d => this.dimensionScores[d.id].average);

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: labels,
        datasets: [{
          label: podName,
          data: data,
          backgroundColor: 'rgba(37, 99, 235, 0.2)',
          borderColor: 'rgba(37, 99, 235, 1)',
          borderWidth: 2,
          pointBackgroundColor: 'rgba(37, 99, 235, 1)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        layout: {
          padding: {
            top: 20,
            right: 20,
            bottom: 20,
            left: 20
          }
        },
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          r: {
            beginAtZero: true,
            min: 0,
            max: 6,
            ticks: {
              stepSize: 1,
              font: {
                size: 14
              },
              backdropColor: 'rgba(255, 255, 255, 0.8)',
              backdropPadding: 4
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            },
            angleLines: {
              color: 'rgba(0, 0, 0, 0.1)'
            },
            pointLabels: {
              font: {
                size: 14,
                weight: 'bold'
              },
              color: '#1F2937',
              padding: 25,
              centerPointLabels: true
            }
          }
        },
        elements: {
          point: {
            radius: 8,
            hoverRadius: 10
          },
          line: {
            borderWidth: 3
          }
        }
      }
    });
  }

  getDimensionScores() {
    return this.dimensionScores;
  }

  getOverallScore() {
    return this.overallScore;
  }

  getFocusAreas() {
    return this.focusAreas;
  }
}