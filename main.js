// main.js - Main application orchestrator
import { ASSESSMENT_DATA, validateAssessmentData } from './questions-data.js';
import { ConfigManager } from './config-manager.js';
import { QuestionManager } from './question-manager.js';
import { ResultsCalculator } from './results-calculator.js';
import { ExportManager } from './export-manager.js';
import { WhyModal } from './why-modal.js';
import { SessionManager } from './session-manager.js';

class PodAssessment {
  constructor() {
    this.podName = '';
    this.quarter = '';
    this.startTime = null;
    this.endTime = null;
    this.dataLoaded = false;
    
    // Initialize modules
    this.questionManager = new QuestionManager();
    this.resultsCalculator = new ResultsCalculator();
    this.exportManager = new ExportManager();
    this.whyModal = new WhyModal();
    this.sessionManager = new SessionManager();
    
    this.initializeApp();
  }

  async initializeApp() {
    try {
      // Show loading indicator
      this.showLoadingMessage('Loading assessment configuration...');
      
      // Load configuration from JSONBin with fallback to local
      this.assessmentData = await ConfigManager.loadConfiguration();
      
      if (!this.assessmentData) {
        throw new Error('No configuration available');
      }
      
      // Validate the loaded configuration
      this.validateData();
      this.questionManager.setupQuestions(this.assessmentData);
      this.dataLoaded = true;
      
      // Initialize UI
      this.bindEvents();
      this.whyModal.initialize();
      this.loadSavedSession();
      this.showScreen('start-screen');
      
    } catch (error) {
      console.error('Failed to initialize application:', error);
      this.showErrorMessage('Unable to load assessment configuration. Please refresh the page and try again.');
    }
  }

  validateData() {
    const errors = validateAssessmentData();
    if (errors.length > 0) {
      console.error('Data validation errors:', errors);
      throw new Error('Assessment data validation failed: ' + errors.join(', '));
    }
    console.log('✅ Assessment data validation passed');
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

  showLoadingMessage(message) {
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loading-screen';
    loadingDiv.className = 'screen';
    loadingDiv.innerHTML = `
      <div class="content-card">
        <div style="text-align: center;">
          <h2>🔄 ${message}</h2>
          <div style="margin: 20px 0;">
            <div class="loading-spinner"></div>
          </div>
          <p style="color: var(--color-text-secondary);">
            This may take a few seconds...
          </p>
        </div>
      </div>
      <style>
        .loading-spinner {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 3px solid var(--color-border);
          border-radius: 50%;
          border-top-color: var(--color-primary);
          animation: spin 1s ease-in-out infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      </style>
    `;
    document.querySelector('.app-container').appendChild(loadingDiv);
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
    this.questionManager.reset();
    
    this.showScreen('assessment-screen');
    this.updateQuestion();
    this.saveSession();
  }

  selectScore(scoreOrOption) {
    this.questionManager.selectScore(scoreOrOption);
    this.saveSession();
  }

  updateQuestion() {
    this.questionManager.updateQuestion();
    this.whyModal.updateTabState(this.questionManager.getCurrentQuestion());
  }

  previousQuestion() {
    const moved = this.questionManager.previousQuestion();
    if (moved) {
      this.whyModal.updateTabState(this.questionManager.getCurrentQuestion());
    }
  }

  nextQuestion() {
    const result = this.questionManager.nextQuestion();
    if (result === 'finished') {
      this.finishAssessment();
    } else if (result === true) {
      this.whyModal.updateTabState(this.questionManager.getCurrentQuestion());
    }
  }

  finishAssessment() {
    this.endTime = new Date();
    this.calculateResults();
    this.showResults();
    this.showScreen('results-screen');
    this.sessionManager.clearSession();
  }

  calculateResults() {
    this.resultsCalculator.calculateResults(
      this.assessmentData, 
      this.questionManager.getScores(), 
      this.questionManager.getAllQuestions()
    );
  }

  showResults() {
    // Update pod info
    document.getElementById('pod-results-title').textContent = 
      `${this.podName} - ${this.quarter}`;

    // Update overall score
    document.getElementById('overall-score').textContent = 
      this.resultsCalculator.getOverallScore().toFixed(1);

    // Update completion date
    document.getElementById('completion-date').textContent = 
      this.endTime.toLocaleDateString('fr-FR');

    // Create radar chart
    this.resultsCalculator.createRadarChart(this.assessmentData, this.podName);
  }

  exportCSV() {
    this.exportManager.exportCSV(
      this.podName, 
      this.quarter, 
      this.resultsCalculator.getOverallScore(), 
      this.endTime,
      this.resultsCalculator.getFocusAreas(),
      this.resultsCalculator.getDimensionScores(),
      this.assessmentData,
      this.questionManager.getAllQuestions(),
      this.questionManager.getScores()
    );
  }

  exportPDF() {
    this.exportManager.exportPDF(
      this.podName, 
      this.quarter, 
      this.resultsCalculator.getOverallScore(), 
      this.endTime,
      this.resultsCalculator.getFocusAreas(),
      this.resultsCalculator.getDimensionScores(),
      this.assessmentData,
      this.questionManager.getAllQuestions(),
      this.questionManager.getScores()
    );
  }

  showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
      screen.style.display = 'none';
    });
    
    // Remove loading screen if exists
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.remove();
    }
    
    document.getElementById(screenId).style.display = 'flex';
    
    // Show/hide Why tab based on screen
    this.whyModal.updateTabVisibility(screenId === 'assessment-screen');
  }

  restartAssessment() {
    this.podName = '';
    this.quarter = '';
    this.startTime = null;
    this.endTime = null;
    
    this.questionManager.reset();
    
    document.getElementById('pod-name').value = '';
    document.getElementById('quarter').value = '';
    
    this.showScreen('start-screen');
    this.sessionManager.clearSession();
  }

  saveSession() {
    this.sessionManager.saveSession(
      this.questionManager.getCurrentIndex(),
      this.questionManager.getScores(),
      this.podName,
      this.quarter,
      this.startTime
    );
  }

  loadSavedSession() {
    const sessionData = this.sessionManager.loadSavedSession();
    if (sessionData && this.sessionManager.shouldRestoreSession(sessionData)) {
      this.questionManager.setCurrentIndex(sessionData.currentQuestionIndex);
      this.questionManager.setScores(sessionData.scores);
      this.podName = sessionData.podName;
      this.quarter = sessionData.quarter;
      this.startTime = new Date(sessionData.startTime);
      
      document.getElementById('pod-name').value = this.podName;
      document.getElementById('quarter').value = this.quarter;
      
      this.showScreen('assessment-screen');
      this.updateQuestion();
    } else {
      this.sessionManager.clearSession();
    }
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PodAssessment();
});