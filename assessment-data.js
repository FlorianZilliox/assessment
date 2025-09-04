// assessment-data.js - Assessment data management (now loads from CSV)

// Note: assessmentData, allQuestions, and TOTAL_QUESTIONS are now loaded from CSV
// This file only contains the ScoreNormalizer and initialization logic

// Score Normalizer Class
class ScoreNormalizer {
  static normalizeScore(question, selectedOption) {
    switch(question.type) {
      case 'A':
        // Direct 1-6 score
        return parseInt(selectedOption);
        
      case 'B':
      case 'C':
        // Find the option and return its normalized value
        if (question.options) {
          const option = question.options.find(o => o.label === selectedOption);
          return option ? option.value : null;
        }
        return null;
        
      default:
        console.warn('Unknown question type:', question.type);
        return null;
    }
  }
  
  static getQuestionTypeLabel(type) {
    switch(type) {
      case 'A': return 'Maturity Scale (1-6)';
      case 'B': return 'Frequency/Count';
      case 'C': return 'Binary with Quality';
      default: return 'Unknown Type';
    }
  }
}