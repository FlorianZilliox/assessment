// question-manager.js - Gestion des questions et scoring
import { ScoreNormalizer } from './score-normalizer.js';

export class QuestionManager {
  constructor() {
    this.currentQuestionIndex = 0;
    this.scores = {};
    this.allQuestions = [];
    this.TOTAL_QUESTIONS = 0;
  }

  setupQuestions(assessmentData) {
    this.allQuestions = [];
    let questionIndex = 0;

    assessmentData.dimensions.forEach((dimension, dimIndex) => {
      const dimQuestions = assessmentData.questions
        .filter(q => q.dimensionId === dimension.id);

      dimQuestions.forEach((question, qIndex) => {
        this.allQuestions.push({
          ...question,
          dimensionIndex: dimIndex,
          dimensionName: dimension.name,
          dimensionDescription: dimension.description,
          questionInDimension: qIndex + 1,
          totalInDimension: dimQuestions.length,
          globalIndex: questionIndex
        });
        questionIndex++;
      });
    });

    this.TOTAL_QUESTIONS = this.allQuestions.length;
    
    const questionsWithWhy = this.allQuestions.filter(q => 
      q.whyContent && q.whyContent.whyMatters
    ).length;
    
    console.log(`🎯 Loaded ${this.TOTAL_QUESTIONS} questions, ${questionsWithWhy} with complete why content`);
    
    if (this.TOTAL_QUESTIONS !== 36) {
      console.warn(`⚠️ Expected 36 questions but loaded ${this.TOTAL_QUESTIONS}`);
    }
    
    if (questionsWithWhy !== this.TOTAL_QUESTIONS) {
      console.warn(`⚠️ ${this.TOTAL_QUESTIONS - questionsWithWhy} questions missing why content`);
    }
  }

  getCurrentQuestion() {
    return this.allQuestions[this.currentQuestionIndex];
  }

  selectScore(scoreOrOption) {
    const currentQuestion = this.getCurrentQuestion();
    
    if (currentQuestion.type === 'A') {
      this.scores[currentQuestion.id] = {
        rawValue: scoreOrOption,
        normalizedScore: scoreOrOption,
        type: 'A'
      };
    } else {
      const normalizedScore = ScoreNormalizer.normalizeScore(currentQuestion, scoreOrOption);
      this.scores[currentQuestion.id] = {
        rawValue: scoreOrOption,
        normalizedScore: normalizedScore,
        type: currentQuestion.type
      };
    }

    this.updateUIAfterSelection();
  }

  selectOption(optionLabel) {
    this.selectScore(optionLabel);
  }

  updateUIAfterSelection() {
    document.querySelectorAll('.score-btn, .option-btn').forEach(btn => {
      btn.classList.remove('selected');
    });

    const currentQuestion = this.getCurrentQuestion();
    const storedScore = this.scores[currentQuestion.id];

    if (storedScore) {
      if (currentQuestion.type === 'A') {
        const scoreBtn = document.querySelector(`[data-score="${storedScore.rawValue}"]`);
        if (scoreBtn) scoreBtn.classList.add('selected');
      } else {
        const optionBtn = document.querySelector(`[data-option="${storedScore.rawValue}"]`);
        if (optionBtn) optionBtn.classList.add('selected');
      }
      
      document.getElementById('next-btn').disabled = false;
    }
  }

  updateQuestion() {
    const currentQuestion = this.getCurrentQuestion();
    const progress = ((this.currentQuestionIndex + 1) / this.TOTAL_QUESTIONS) * 100;

    document.getElementById('progress-fill').style.width = `${progress}%`;
    document.getElementById('dimension-name').textContent = currentQuestion.dimensionName;
    document.getElementById('question-counter').textContent = `${this.currentQuestionIndex + 1} / ${this.TOTAL_QUESTIONS}`;
    document.getElementById('question-text').textContent = currentQuestion.text;

    this.showScoringInterface(currentQuestion);

    document.getElementById('prev-btn').disabled = this.currentQuestionIndex === 0;
    document.getElementById('next-btn').textContent = 
      this.currentQuestionIndex === this.TOTAL_QUESTIONS - 1 ? 'Finish' : 'Next';

    const existingScore = this.scores[currentQuestion.id];
    document.getElementById('next-btn').disabled = !existingScore;

    const whyTab = document.getElementById('why-tab');
    if (currentQuestion.whyContent && currentQuestion.whyContent.whyMatters) {
      whyTab.classList.remove('disabled');
    } else {
      whyTab.classList.add('disabled');
    }
  }

  showScoringInterface(question) {
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
    
    document.querySelectorAll('.score-btn').forEach(btn => {
      btn.classList.remove('selected');
    });

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
      return true;
    }
    return false;
  }

  nextQuestion() {
    const currentQuestion = this.getCurrentQuestion();
    
    if (!this.scores[currentQuestion.id]) {
      alert('Please select a score before continuing');
      return false;
    }

    if (this.currentQuestionIndex < this.TOTAL_QUESTIONS - 1) {
      this.currentQuestionIndex++;
      this.updateQuestion();
      return true;
    } else {
      return 'finished';
    }
  }

  isAnswered(questionId) {
    return !!this.scores[questionId];
  }

  getScores() {
    return this.scores;
  }

  setScores(scores) {
    this.scores = scores;
  }

  getCurrentIndex() {
    return this.currentQuestionIndex;
  }

  setCurrentIndex(index) {
    this.currentQuestionIndex = index;
  }

  getTotalQuestions() {
    return this.TOTAL_QUESTIONS;
  }

  getAllQuestions() {
    return this.allQuestions;
  }

  reset() {
    this.currentQuestionIndex = 0;
    this.scores = {};
  }
}