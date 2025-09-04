// main.js - Main application logic

class PodAssessment {
  constructor() {
    this.currentQuestionIndex = 0;
    this.scores = {};
    this.podName = '';
    this.quarter = '';
    this.startTime = null;
    this.endTime = null;
    this.dataLoaded = false;
    
    this.initializeApp();
  }

  async initializeApp() {
    try {
      // Show loading message
      this.showLoadingMessage();
      
      // Initialize assessment data from CSV
      await initializeAssessmentData();
      this.dataLoaded = true;
      
      // Hide loading message and continue with normal initialization
      this.hideLoadingMessage();
      this.bindEvents();
      this.loadSavedSession();
      this.showScreen('start-screen');
      
    } catch (error) {
      console.error('Failed to initialize application:', error);
      this.showErrorMessage('Unable to load assessment configuration. Please refresh the page and try again.');
    }
  }

  showLoadingMessage() {
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loading-message';
    loadingDiv.className = 'screen';
    loadingDiv.innerHTML = `
      <div class="content-card">
        <div style="text-align: center;">
          <h2>Loading Assessment...</h2>
          <p style="margin-top: 20px; color: var(--color-text-secondary);">
            Please wait while we load the questions configuration.
          </p>
        </div>
      </div>
    `;
    document.querySelector('.app-container').appendChild(loadingDiv);
  }

  hideLoadingMessage() {
    const loadingDiv = document.getElementById('loading-message');
    if (loadingDiv) {
      loadingDiv.remove();
    }
  }

  showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'screen';
    errorDiv.innerHTML = `
      <div class="content-card">
        <div style="text-align: center;">
          <h2 style="color: var(--color-danger);">Configuration Error</h2>
          <p style="margin: 20px 0; color: var(--color-text-secondary);">
            ${message}
          </p>
          <button class="btn btn-primary" onclick="location.reload()">Retry</button>
        </div>
      </div>
    `;
    document.querySelector('.app-container').appendChild(errorDiv);
  }

  bindEvents() {
    // Start button
    document.getElementById('start-btn').addEventListener('click', () => {
      this.startAssessment();
    });

    // Score buttons (Type A)
    document.querySelectorAll('.score-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.selectScore(parseInt(e.target.dataset.score));
      });
    });

    // Navigation buttons
    document.getElementById('prev-btn').addEventListener('click', () => {
      this.previousQuestion();
    });

    document.getElementById('next-btn').addEventListener('click', () => {
      this.nextQuestion();
    });

    // Results buttons
    document.getElementById('restart-btn').addEventListener('click', () => {
      this.restartAssessment();
    });

    document.getElementById('export-csv').addEventListener('click', () => {
      this.exportCSV();
    });

    document.getElementById('export-pdf').addEventListener('click', () => {
      this.exportPDF();
    });

    // Add ripple effect to buttons
    document.querySelectorAll('.btn, .score-btn').forEach(btn => {
      btn.addEventListener('click', this.createRipple);
    });
  }

  createRipple(e) {
    const button = e.currentTarget;
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - button.offsetLeft - radius}px`;
    circle.style.top = `${e.clientY - button.offsetTop - radius}px`;
    circle.classList.add('ripple');

    const ripple = button.getElementsByClassName('ripple')[0];
    if (ripple) {
      ripple.remove();
    }

    button.appendChild(circle);
  }

  startAssessment() {
    if (!this.dataLoaded) {
      alert('Assessment data is still loading. Please wait a moment and try again.');
      return;
    }

    this.podName = document.getElementById('pod-name').value.trim();
    this.quarter = document.getElementById('quarter').value.trim();

    if (!this.podName || !this.quarter) {
      alert('Please fill in both Pod Name and Quarter');
      return;
    }

    this.startTime = new Date();
    this.currentQuestionIndex = 0;
    this.scores = {};
    
    this.showScreen('assessment-screen');
    this.updateQuestion();
    this.saveSession();
  }

  selectScore(scoreOrOption) {
    const currentQuestion = allQuestions[this.currentQuestionIndex];
    
    if (currentQuestion.type === 'A') {
      // Direct score for Type A
      this.scores[currentQuestion.id] = {
        rawValue: scoreOrOption,
        normalizedScore: scoreOrOption,
        type: 'A'
      };
    } else {
      // For Type B and C, store the selected option and normalized score
      const normalizedScore = ScoreNormalizer.normalizeScore(currentQuestion, scoreOrOption);
      this.scores[currentQuestion.id] = {
        rawValue: scoreOrOption,
        normalizedScore: normalizedScore,
        type: currentQuestion.type
      };
    }

    this.updateUIAfterSelection();
    this.saveSession();
  }

  selectOption(optionLabel) {
    this.selectScore(optionLabel);
  }

  updateUIAfterSelection() {
    // Clear all selections
    document.querySelectorAll('.score-btn, .option-btn').forEach(btn => {
      btn.classList.remove('selected');
    });

    const currentQuestion = allQuestions[this.currentQuestionIndex];
    const storedScore = this.scores[currentQuestion.id];

    if (storedScore) {
      if (currentQuestion.type === 'A') {
        // Select the score button
        const scoreBtn = document.querySelector(`[data-score="${storedScore.rawValue}"]`);
        if (scoreBtn) scoreBtn.classList.add('selected');
      } else {
        // Select the option button
        const optionBtn = document.querySelector(`[data-option="${storedScore.rawValue}"]`);
        if (optionBtn) optionBtn.classList.add('selected');
      }
      
      // Enable next button
      document.getElementById('next-btn').disabled = false;
    }
  }

  updateQuestion() {
    const currentQuestion = allQuestions[this.currentQuestionIndex];
    const progress = ((this.currentQuestionIndex + 1) / TOTAL_QUESTIONS) * 100;

    // Update progress bar
    document.getElementById('progress-fill').style.width = `${progress}%`;

    // Update header
    document.getElementById('dimension-name').textContent = currentQuestion.dimensionName;
    document.getElementById('question-counter').textContent = `${this.currentQuestionIndex + 1} / ${TOTAL_QUESTIONS}`;

    // Update question text
    document.getElementById('question-text').textContent = currentQuestion.text;

    // Show appropriate scoring interface based on question type
    this.showScoringInterface(currentQuestion);

    // Update navigation buttons
    document.getElementById('prev-btn').disabled = this.currentQuestionIndex === 0;
    document.getElementById('next-btn').textContent = 
      this.currentQuestionIndex === TOTAL_QUESTIONS - 1 ? 'Finish' : 'Next';

    // Check if question is already answered
    const existingScore = this.scores[currentQuestion.id];
    document.getElementById('next-btn').disabled = !existingScore;
  }

  showScoringInterface(question) {
    // Hide all scoring interfaces
    document.getElementById('type-a-scoring').style.display = 'none';
    document.getElementById('type-b-scoring').style.display = 'none';
    document.getElementById('type-c-scoring').style.display = 'none';

    switch (question.type) {
      case 'A':
        this.showTypeAInterface(question);
        break;
      case 'B':
        this.showTypeBInterface(question);
        break;
      case 'C':
        this.showTypeCInterface(question);
        break;
    }
  }

  showTypeAInterface(question) {
    document.getElementById('type-a-scoring').style.display = 'grid';
    
    // Clear all selections
    document.querySelectorAll('.score-btn').forEach(btn => {
      btn.classList.remove('selected');
    });

    // Show existing score if any
    const existingScore = this.scores[question.id];
    if (existingScore) {
      const scoreBtn = document.querySelector(`[data-score="${existingScore.rawValue}"]`);
      if (scoreBtn) scoreBtn.classList.add('selected');
    }
  }

  showTypeBInterface(question) {
    const container = document.getElementById('type-b-scoring');
    container.style.display = 'grid';
    container.innerHTML = '';

    question.options.forEach(option => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.dataset.option = option.label;
      btn.textContent = option.label;
      
      btn.addEventListener('click', () => {
        this.selectOption(option.label);
      });

      container.appendChild(btn);
    });

    // Show existing selection if any
    const existingScore = this.scores[question.id];
    if (existingScore) {
      const optionBtn = container.querySelector(`[data-option="${existingScore.rawValue}"]`);
      if (optionBtn) optionBtn.classList.add('selected');
    }
  }

  showTypeCInterface(question) {
    const container = document.getElementById('type-c-scoring');
    container.style.display = 'flex';
    container.innerHTML = '';

    question.options.forEach(option => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.dataset.option = option.label;
      btn.textContent = option.label;
      
      btn.addEventListener('click', () => {
        this.selectOption(option.label);
      });

      container.appendChild(btn);
    });

    // Show existing selection if any
    const existingScore = this.scores[question.id];
    if (existingScore) {
      const optionBtn = container.querySelector(`[data-option="${existingScore.rawValue}"]`);
      if (optionBtn) optionBtn.classList.add('selected');
    }
  }

  previousQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.updateQuestion();
    }
  }

  nextQuestion() {
    const currentQuestion = allQuestions[this.currentQuestionIndex];
    
    if (!this.scores[currentQuestion.id]) {
      alert('Please select a score before continuing');
      return;
    }

    if (this.currentQuestionIndex < TOTAL_QUESTIONS - 1) {
      this.currentQuestionIndex++;
      this.updateQuestion();
    } else {
      this.finishAssessment();
    }
  }

  finishAssessment() {
    this.endTime = new Date();
    this.calculateResults();
    this.showResults();
    this.showScreen('results-screen');
    this.clearSession();
  }

  calculateResults() {
    this.dimensionScores = {};
    
    // Calculate average score for each dimension using normalized scores
    assessmentData.dimensions.forEach(dimension => {
      const dimensionQuestions = dimension.questions;
      let totalScore = 0;
      let questionCount = 0;

      dimensionQuestions.forEach(question => {
        const scoreData = this.scores[question.id];
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
    const allNormalizedScores = Object.values(this.scores)
      .map(scoreData => scoreData.normalizedScore)
      .filter(score => score !== null && score !== undefined);
    
    this.overallScore = allNormalizedScores.length > 0 ? 
      allNormalizedScores.reduce((sum, score) => sum + score, 0) / allNormalizedScores.length : 0;

    // Generate focus areas and recommendations
    this.generateFocusAreas();
  }

  generateFocusAreas() {
    this.focusAreas = [];
    
    // 1. Identify lowest scoring dimensions (urgent)
    const sortedDimensions = Object.entries(this.dimensionScores)
      .sort((a, b) => a[1].average - b[1].average);
    
    const lowestDimensions = sortedDimensions.slice(0, 2);
    
    // 2. Identify specific low-scoring questions within any dimension
    const lowScoringQuestions = [];
    allQuestions.forEach(question => {
      const scoreData = this.scores[question.id];
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

  showResults() {
    // Update pod info
    document.getElementById('pod-results-title').textContent = 
      `${this.podName} - ${this.quarter}`;

    // Update overall score
    document.getElementById('overall-score').textContent = 
      this.overallScore.toFixed(1);

    // Update completion date
    document.getElementById('completion-date').textContent = 
      this.endTime.toLocaleDateString('fr-FR');

    // Create radar chart
    this.createRadarChart();
  }

  createRadarChart() {
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
          label: this.podName,
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

  exportCSV() {
    const csvData = this.generateCSVData();
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    a.style.display = 'none';
    a.href = url;
    a.download = `${this.podName}_${this.quarter}_Assessment.csv`;
    
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  generateCSVData() {
    let csv = 'Pod Assessment Results\n\n';
    csv += `Pod Name,${this.podName}\n`;
    csv += `Quarter,${this.quarter}\n`;
    csv += `Overall Score,${this.overallScore.toFixed(2)}\n`;
    csv += `Assessment Date,${this.endTime.toLocaleDateString('fr-FR')}\n\n`;

    // Focus Areas section
    if (this.focusAreas && this.focusAreas.length > 0) {
      csv += 'Main Focus Areas for Next Period\n';
      csv += 'Priority,Title,Description,Recommended Actions\n';
      
      this.focusAreas.forEach(area => {
        const actions = area.recommendations.join('; ');
        csv += `"${area.priority}","${area.title}","${area.description}","${actions}"\n`;
      });
      csv += '\n';
    }

    // Dimension scores
    csv += 'Dimension Scores\n';
    csv += 'Dimension,Average Score,Total Points,Questions Count\n';
    
    assessmentData.dimensions.forEach(dimension => {
      const score = this.dimensionScores[dimension.id];
      csv += `"${dimension.name}",${score.average.toFixed(2)},${score.total},${score.count}\n`;
    });

    csv += '\nDetailed Responses\n';
    csv += 'Question ID,Dimension,Question,Raw Response,Normalized Score\n';

    allQuestions.forEach(question => {
      const scoreData = this.scores[question.id];
      if (scoreData) {
        csv += `${question.id},"${question.dimensionName}","${question.text}","${scoreData.rawValue}",${scoreData.normalizedScore}\n`;
      } else {
        csv += `${question.id},"${question.dimensionName}","${question.text}","No Response","No Response"\n`;
      }
    });

    return csv;
  }

  exportPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Set up colors and fonts
    const primaryColor = [37, 99, 235]; // #2563EB
    const textColor = [31, 41, 55]; // #1F2937
    const secondaryColor = [107, 114, 128]; // #6B7280
    
    let yPos = 20;
    
    // Header
    doc.setFontSize(24);
    doc.setTextColor(...primaryColor);
    doc.text('Pod Delivery Assessment Report', 20, yPos);
    yPos += 15;
    
    // Subtitle
    doc.setFontSize(12);
    doc.setTextColor(...secondaryColor);
    doc.text(`${this.podName} - ${this.quarter}`, 20, yPos);
    yPos += 10;
    
    doc.text(`Assessment Date: ${this.endTime.toLocaleDateString('fr-FR')}`, 20, yPos);
    yPos += 20;
    
    // Overall Score Box
    doc.setFillColor(245, 245, 245);
    doc.rect(20, yPos - 5, 170, 25, 'F');
    doc.setFontSize(16);
    doc.setTextColor(...textColor);
    doc.text('Overall Score', 25, yPos + 5);
    doc.setFontSize(24);
    doc.setTextColor(...primaryColor);
    doc.text(this.overallScore.toFixed(1), 25, yPos + 15);
    yPos += 35;
    
    // Dimension Scores
    doc.setFontSize(16);
    doc.setTextColor(...textColor);
    doc.text('Dimension Scores', 20, yPos);
    yPos += 10;
    
    // Table header
    doc.setFontSize(10);
    doc.setTextColor(...secondaryColor);
    doc.text('Dimension', 20, yPos);
    doc.text('Score', 120, yPos);
    doc.text('Level', 150, yPos);
    yPos += 5;
    
    // Draw line
    doc.line(20, yPos, 190, yPos);
    yPos += 8;
    
    // Dimension rows
    doc.setTextColor(...textColor);
    assessmentData.dimensions.forEach((dimension) => {
      const score = this.dimensionScores[dimension.id];
      const level = this.getScoreLevel(score.average);
      
      // Handle long dimension names by breaking them manually
      let dimensionName = dimension.name;
      const maxWidth = 95; // Available width for dimension name
      
      // Check if name is too long and split it
      if (doc.getTextWidth(dimensionName) > maxWidth) {
        // Split long names at logical points
        if (dimensionName.includes('&')) {
          const parts = dimensionName.split('&');
          doc.text(parts[0].trim(), 20, yPos);
          doc.text('& ' + parts[1].trim(), 20, yPos + 4);
          yPos += 4; // Extra space for second line
        } else if (dimensionName.includes(' ')) {
          // Split at space if no &
          const words = dimensionName.split(' ');
          const midPoint = Math.ceil(words.length / 2);
          doc.text(words.slice(0, midPoint).join(' '), 20, yPos);
          doc.text(words.slice(midPoint).join(' '), 20, yPos + 4);
          yPos += 4; // Extra space for second line
        } else {
          // Fallback: just print it (might be cut)
          doc.text(dimensionName, 20, yPos);
        }
      } else {
        doc.text(dimensionName, 20, yPos);
      }
      
      doc.text(score.average.toFixed(1), 120, yPos);
      doc.text(level, 150, yPos);
      yPos += 8;
    });
    
    yPos += 15;
    
    // Add radar chart to PDF
    doc.setFontSize(14);
    doc.setTextColor(...textColor);
    // Center the chart title
    const chartTitle = 'Performance Radar Chart';
    const titleWidth = doc.getTextWidth(chartTitle);
    const titleXPos = (210 - titleWidth) / 2; // Center horizontally
    doc.text(chartTitle, titleXPos, yPos);
    yPos += 10;
    
    // Capture the radar chart as image and add to PDF
    try {
      const canvas = document.getElementById('radar-chart');
      if (canvas) {
        const chartImage = canvas.toDataURL('image/png');
        // Add chart image to PDF (centered and optimized size)
        const imgWidth = 160;
        const imgHeight = 160;
        const xPos = (210 - imgWidth) / 2; // Center horizontally (A4 width = 210mm)
        doc.addImage(chartImage, 'PNG', xPos, yPos, imgWidth, imgHeight);
        yPos += imgHeight + 10;
      }
    } catch (error) {
      console.warn('Could not add radar chart to PDF:', error);
    }
    
    // Main Focus Areas section
    if (this.focusAreas && this.focusAreas.length > 0) {
      // Check if we need a new page
      if (yPos > 220) {
        doc.addPage();
        yPos = 20;
      } else {
        yPos += 10;
      }
      
      doc.setFontSize(16);
      doc.setTextColor(...primaryColor);
      doc.text('Main Focus Areas for Next Period', 20, yPos);
      yPos += 15;
      
      this.focusAreas.forEach((area, index) => {
        // Check if we need a new page for this focus area
        if (yPos > 240) {
          doc.addPage();
          yPos = 20;
        }
        
        // Priority indicator with color coding
        doc.setFontSize(12);
        const priorityColors = {
          'CRITICAL': [239, 68, 68],    // Red
          'HIGH': [245, 158, 11],       // Orange  
          'MEDIUM': [59, 130, 246],     // Blue
          'OPTIMIZE': [16, 185, 129]    // Green
        };
        
        doc.setTextColor(...(priorityColors[area.priority] || textColor));
        doc.text(`${area.priority} PRIORITY`, 20, yPos);
        yPos += 8;
        
        // Title
        doc.setFontSize(14);
        doc.setTextColor(...textColor);
        doc.text(area.title, 20, yPos);
        yPos += 8;
        
        // Description
        doc.setFontSize(10);
        doc.setTextColor(...secondaryColor);
        const descLines = doc.splitTextToSize(area.description, 170);
        descLines.forEach(line => {
          doc.text(line, 20, yPos);
          yPos += 5;
        });
        yPos += 3;
        
        // Recommendations
        doc.setFontSize(10);
        doc.setTextColor(...textColor);
        doc.text('Recommended Actions:', 20, yPos);
        yPos += 6;
        
        area.recommendations.forEach((rec, recIndex) => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          
          doc.setTextColor(...textColor);
          const recLines = doc.splitTextToSize(`• ${rec}`, 165);
          recLines.forEach(line => {
            doc.text(line, 25, yPos);
            yPos += 4;
          });
        });
        
        yPos += 8;
      });
      
      yPos += 5;
    }
    
    // Score Guide
    // Check if we need a new page
    if (yPos > 200) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(14);
    doc.setTextColor(...textColor);
    doc.text('Score Guide', 20, yPos);
    yPos += 10;
    
    doc.setFontSize(9);
    Object.entries(assessmentData.scoreGuide).reverse().forEach(([score, guide]) => {
      doc.setTextColor(...this.getScoreColor(parseInt(score)));
      doc.text(`${score} - ${guide.level}:`, 20, yPos);
      doc.setTextColor(...textColor);
      doc.text(guide.description, 55, yPos);
      yPos += 6;
    });
    
    // New page for detailed responses
    doc.addPage();
    yPos = 20;
    
    doc.setFontSize(16);
    doc.setTextColor(...textColor);
    doc.text('Detailed Responses by Dimension', 20, yPos);
    yPos += 15;
    
    // Detailed responses
    assessmentData.dimensions.forEach((dimension) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(12);
      doc.setTextColor(...primaryColor);
      
      // Handle long dimension names in detailed section
      let dimensionName = dimension.name;
      const maxTitleWidth = 170;
      
      if (doc.getTextWidth(dimensionName) > maxTitleWidth) {
        if (dimensionName.includes('&')) {
          const parts = dimensionName.split('&');
          doc.text(parts[0].trim(), 20, yPos);
          doc.text('& ' + parts[1].trim(), 20, yPos + 6);
          yPos += 6; // Extra space for second line
        } else if (dimensionName.includes(' ')) {
          const words = dimensionName.split(' ');
          const midPoint = Math.ceil(words.length / 2);
          doc.text(words.slice(0, midPoint).join(' '), 20, yPos);
          doc.text(words.slice(midPoint).join(' '), 20, yPos + 6);
          yPos += 6; // Extra space for second line
        } else {
          doc.text(dimensionName, 20, yPos);
        }
      } else {
        doc.text(dimensionName, 20, yPos);
      }
      yPos += 8;
      
      dimension.questions.forEach((question) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        
        const scoreData = this.scores[question.id];
        doc.setFontSize(8);
        doc.setTextColor(...textColor);
        
        // Question text (wrapped)
        const questionLines = doc.splitTextToSize(`Q${question.id}: ${question.text}`, 150);
        questionLines.forEach((line, index) => {
          doc.text(line, 25, yPos);
          if (index === 0 && scoreData) {
            // Add score on the first line
            doc.setTextColor(...this.getScoreColor(scoreData.normalizedScore));
            doc.text(`Score: ${scoreData.normalizedScore}`, 175, yPos);
            doc.setTextColor(...textColor);
          }
          yPos += 4;
        });
        
        // Response details
        if (scoreData) {
          doc.setTextColor(...secondaryColor);
          doc.text(`Response: ${scoreData.rawValue}`, 30, yPos);
        } else {
          doc.setTextColor(...secondaryColor);
          doc.text('No response provided', 30, yPos);
        }
        yPos += 8;
      });
      
      yPos += 5;
    });
    
    // Footer on last page
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(...secondaryColor);
      doc.text(`Generated by Pod Assessment Tool - Page ${i} of ${pageCount}`, 20, 285);
    }
    
    // Save the PDF
    doc.save(`${this.podName}_${this.quarter}_Assessment.pdf`);
  }
  
  getScoreLevel(score) {
    if (score >= 5.5) return 'Mastered';
    if (score >= 4.5) return 'Proficient';
    if (score >= 3.5) return 'Capable';
    if (score >= 2.5) return 'Developing';
    if (score >= 1.5) return 'Struggling';
    return 'Not Present';
  }
  
  getScoreColor(score) {
    if (score >= 5) return [16, 185, 129]; // Green
    if (score >= 3) return [245, 158, 11]; // Orange
    return [239, 68, 68]; // Red
  }

  showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
      screen.style.display = 'none';
    });
    document.getElementById(screenId).style.display = 'flex';
  }

  restartAssessment() {
    this.currentQuestionIndex = 0;
    this.scores = {};
    this.podName = '';
    this.quarter = '';
    this.startTime = null;
    this.endTime = null;
    
    document.getElementById('pod-name').value = '';
    document.getElementById('quarter').value = '';
    
    this.showScreen('start-screen');
    this.clearSession();
  }

  saveSession() {
    const sessionData = {
      currentQuestionIndex: this.currentQuestionIndex,
      scores: this.scores,
      podName: this.podName,
      quarter: this.quarter,
      startTime: this.startTime
    };
    
    localStorage.setItem('podAssessmentSession', JSON.stringify(sessionData));
  }

  loadSavedSession() {
    const saved = localStorage.getItem('podAssessmentSession');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        
        // Only restore if assessment was in progress
        if (data.podName && data.quarter && data.startTime) {
          const shouldRestore = confirm(
            `Continue your previous assessment for ${data.podName} - ${data.quarter}?`
          );
          
          if (shouldRestore) {
            this.currentQuestionIndex = data.currentQuestionIndex;
            this.scores = data.scores;
            this.podName = data.podName;
            this.quarter = data.quarter;
            this.startTime = new Date(data.startTime);
            
            document.getElementById('pod-name').value = this.podName;
            document.getElementById('quarter').value = this.quarter;
            
            this.showScreen('assessment-screen');
            this.updateQuestion();
            return;
          }
        }
      } catch (e) {
        console.error('Error loading saved session:', e);
      }
    }
    
    this.clearSession();
  }

  clearSession() {
    localStorage.removeItem('podAssessmentSession');
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PodAssessment();
});