// session-manager.js - Gestion de la sauvegarde et restauration de session

export class SessionManager {
  constructor() {
    this.SESSION_KEY = 'podAssessmentSession';
  }

  saveSession(currentQuestionIndex, scores, podName, quarter, startTime) {
    const sessionData = {
      currentQuestionIndex: currentQuestionIndex,
      scores: scores,
      podName: podName,
      quarter: quarter,
      startTime: startTime
    };
    
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
  }

  loadSavedSession() {
    const saved = localStorage.getItem(this.SESSION_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        
        // Only restore if assessment was in progress
        if (data.podName && data.quarter && data.startTime) {
          return data;
        }
      } catch (e) {
        console.error('Error loading saved session:', e);
      }
    }
    
    return null;
  }

  shouldRestoreSession(sessionData) {
    if (!sessionData) return false;
    
    return confirm(
      `Continue your previous assessment for ${sessionData.podName} - ${sessionData.quarter}?`
    );
  }

  clearSession() {
    localStorage.removeItem(this.SESSION_KEY);
  }

  hasSession() {
    return localStorage.getItem(this.SESSION_KEY) !== null;
  }
}