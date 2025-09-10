// admin-manager.js - Gestionnaire principal de l'interface d'administration

import { ConfigManager } from './config-manager.js';
import { JSONBinClient } from './jsonbin-client.js';

export class AdminManager {
  constructor() {
    this.binId = '68c02404ae596e708fe8260f'; // VOTRE BIN ID CORRECT
    this.apiKey = null;
    this.currentData = null;
    this.originalData = null;
    this.hasChanges = false;
    this.jsonBinClient = null;
    
    // UI Elements cache
    this.ui = {
      totalQuestions: document.getElementById('total-questions'),
      currentVersion: document.getElementById('current-version'),
      lastModified: document.getElementById('last-modified'),
      syncStatus: document.getElementById('sync-status'),
      jsonbinStatus: document.getElementById('jsonbin-status'),
      publishBtn: document.getElementById('publish-btn'),
      dimensionsContainer: document.getElementById('dimensions-container')
    };
  }

  /**
   * Initialise l'AdminManager avec l'API key
   */
  async initialize(apiKey) {
    this.apiKey = apiKey;
    this.jsonBinClient = new JSONBinClient(this.binId, apiKey);
    
    // Charger la configuration actuelle
    await this.loadConfiguration();
    this.originalData = JSON.parse(JSON.stringify(this.currentData)); // Deep copy
    
    // Mettre à jour l'interface
    this.updateUI();
    await this.checkConnectivity();
    
    console.log('✅ AdminManager initialized');
  }

  /**
   * Charge la configuration depuis JSONBin ou fallback local
   */
  async loadConfiguration() {
    try {
      this.currentData = await ConfigManager.loadConfiguration();
      if (!this.currentData) {
        throw new Error('No configuration available');
      }
      console.log('📊 Configuration loaded:', this.generateReport());
    } catch (error) {
      console.error('Error loading configuration:', error);
      throw error;
    }
  }

  /**
   * Met à jour l'interface utilisateur
   */
  updateUI() {
    if (!this.currentData) return;

    // Mettre à jour les statistiques
    this.ui.totalQuestions.textContent = this.currentData.questions?.length || 0;
    this.ui.currentVersion.textContent = this.currentData.config?.version || '?';
    
    const lastModified = this.currentData.config?.lastModified;
    this.ui.lastModified.textContent = lastModified ? 
      new Date(lastModified).toLocaleDateString('fr-FR') : '-';

    // Mettre à jour le bouton de publication
    this.ui.publishBtn.disabled = !this.hasChanges;
    this.ui.publishBtn.textContent = this.hasChanges ? 
      '🚀 Publish Changes' : '✅ No Changes';

    // Populer les dimensions
    this.populateDimensions();
  }

  /**
   * Vérifie la connectivité avec JSONBin
   */
  async checkConnectivity() {
    const connected = await ConfigManager.checkConnectivity();
    
    this.ui.jsonbinStatus.className = connected ? 
      'status-indicator connected' : 'status-indicator disconnected';
    
    this.ui.syncStatus.textContent = connected ? 'JSONBin' : 'Local';
    
    return connected;
  }

  /**
   * Popule l'interface avec les dimensions et questions
   */
  populateDimensions() {
    if (!this.currentData?.dimensions) return;

    this.ui.dimensionsContainer.innerHTML = '';

    this.currentData.dimensions.forEach(dimension => {
      const questions = this.currentData.questions.filter(q => q.dimensionId === dimension.id);
      
      const section = this.createDimensionSection(dimension, questions);
      this.ui.dimensionsContainer.appendChild(section);
    });
  }

  /**
   * Crée une section de dimension
   */
  createDimensionSection(dimension, questions) {
    const section = document.createElement('div');
    section.className = 'dimension-section';
    section.dataset.dimensionId = dimension.id;
    
    section.innerHTML = `
      <div class="dimension-header">
        <span class="dimension-name">${dimension.name}</span>
        <div style="display: flex; align-items: center; gap: 12px;">
          <span class="dimension-count">${questions.length}</span>
          <button class="btn btn-secondary btn-small add-question-btn" 
                  data-dimension="${dimension.id}" title="Add question">
            ➕
          </button>
        </div>
      </div>
      <div class="dimension-questions">
        ${questions.map(q => this.createQuestionItem(q, dimension)).join('')}
      </div>
    `;

    // Bind events
    const header = section.querySelector('.dimension-header');
    header.addEventListener('click', (e) => {
      if (!e.target.classList.contains('add-question-btn')) {
        section.classList.toggle('expanded');
      }
    });

    // Bind add question button - delegated to AdminApp
    // Event delegation handles this in AdminApp

    return section;
  }

  /**
   * Crée un élément question
   */
  createQuestionItem(question, dimension) {
    return `
      <div class="question-item" data-question-id="${question.id}">
        <div class="question-id">${question.id}</div>
        <div class="question-content">
          <div class="question-text">${this.escapeHtml(question.text)}</div>
          <div class="question-meta">
            Type ${question.type} • ${dimension.name}
            ${question.whyContent ? ' • 📚 Educational content' : ' • ⚠️ Missing educational content'}
          </div>
        </div>
        <div class="question-actions">
          <button class="btn btn-secondary btn-small edit-question-btn" 
                  data-question-id="${question.id}" title="Edit">
            ✏️
          </button>
          <button class="btn btn-secondary btn-small duplicate-question-btn" 
                  data-question-id="${question.id}" title="Duplicate">
            📄
          </button>
          <button class="btn btn-secondary btn-small delete-question-btn" 
                  data-question-id="${question.id}" title="Delete">
            🗑️
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Met à jour une question
   */
  updateQuestion(questionId, updates) {
    const questionIndex = this.currentData.questions.findIndex(q => q.id === questionId);
    if (questionIndex === -1) {
      throw new Error(`Question ${questionId} not found`);
    }

    // Mettre à jour la question
    this.currentData.questions[questionIndex] = {
      ...this.currentData.questions[questionIndex],
      ...updates
    };

    this.markAsChanged();
    this.updateUI();
    this.showNotification('Question updated', 'success');
  }

  /**
   * Ajoute une nouvelle question
   */
  addQuestion(dimensionId, questionData) {
    const newId = this.generateQuestionId();
    
    const newQuestion = {
      id: newId,
      dimensionId: dimensionId,
      text: questionData.text,
      type: questionData.type,
      options: questionData.options || null,
      whyContent: questionData.whyContent || {
        whyMatters: '',
        whenDoneWell: [],
        problemsWithout: []
      }
    };

    // Valider la question
    if (!ConfigManager.validateQuestion(newQuestion)) {
      throw new Error('Invalid question');
    }

    this.currentData.questions.push(newQuestion);
    this.updateMetadata();
    this.markAsChanged();
    this.updateUI();
    this.showNotification('Question added', 'success');
    
    return newQuestion;
  }

  /**
   * Supprime une question
   */
  deleteQuestion(questionId) {
    const questionIndex = this.currentData.questions.findIndex(q => q.id === questionId);
    if (questionIndex === -1) {
      throw new Error(`Question ${questionId} not found`);
    }

    const question = this.currentData.questions[questionIndex];
    
    if (!confirm(`Delete question ${questionId}: "${question.text.substring(0, 50)}..." ?`)) {
      return;
    }

    this.currentData.questions.splice(questionIndex, 1);
    this.updateMetadata();
    this.markAsChanged();
    this.updateUI();
    this.showNotification('Question deleted', 'success');
  }

  /**
   * Duplique une question
   */
  duplicateQuestion(questionId) {
    const originalQuestion = this.currentData.questions.find(q => q.id === questionId);
    if (!originalQuestion) {
      throw new Error(`Question ${questionId} not found`);
    }

    const newQuestion = {
      ...JSON.parse(JSON.stringify(originalQuestion)), // Deep copy
      id: this.generateQuestionId(),
      text: originalQuestion.text + ' (copie)'
    };

    this.currentData.questions.push(newQuestion);
    this.updateMetadata();
    this.markAsChanged();
    this.updateUI();
    this.showNotification('Question duplicated', 'success');
    
    return newQuestion;
  }

  /**
   * Génère un nouvel ID de question
   */
  generateQuestionId() {
    const existingIds = this.currentData.questions.map(q => q.id);
    const maxId = Math.max(...existingIds);
    return maxId + 1;
  }

  /**
   * Met à jour les métadonnées
   */
  updateMetadata() {
    this.currentData.config.totalQuestions = this.currentData.questions.length;
    this.currentData.config.lastModified = new Date().toISOString();
    this.currentData.config.modifiedBy = 'admin';
  }

  /**
   * Marque les données comme modifiées
   */
  markAsChanged() {
    this.hasChanges = true;
    this.updateUI();
  }

  /**
   * Publie les modifications sur JSONBin
   */
  async publishChanges() {
    if (!this.hasChanges) {
      this.showNotification('No changes to publish', 'info');
      return;
    }

    if (!this.jsonBinClient) {
      throw new Error('JSONBin client not initialized');
    }

    try {
      // Valider les données avant publication
      this.validateData();
      
      // Incrémenter la version
      this.incrementVersion();
      
      // Confirmer la publication
      const changeCount = this.getChangeCount();
      if (!confirm(`Publish ${changeCount} change(s) to JSONBin?`)) {
        return;
      }

      // VRAIE PUBLICATION vers JSONBin
      this.showNotification('Publishing to JSONBin...', 'info');
      
      // Mettre à jour les métadonnées
      this.updateMetadata();
      
      // Publier réellement vers JSONBin
      const result = await this.jsonBinClient.update(this.currentData);
      
      // Succès
      this.originalData = JSON.parse(JSON.stringify(this.currentData));
      this.hasChanges = false;
      this.updateUI();
      
      this.showNotification(`✅ Published successfully (v${this.currentData.config.version})`, 'success');
      
      console.log('✅ Published to JSONBin:', result);
      
    } catch (error) {
      console.error('Publication error:', error);
      this.showNotification('❌ Error during publication: ' + error.message, 'error');
      throw error;
    }
  }

  /**
   * Valide toutes les données avant publication
   */
  validateData() {
    if (!ConfigManager.validateConfiguration(this.currentData)) {
      throw new Error('Invalid configuration');
    }
    
    // Validations supplémentaires
    if (this.currentData.questions.length === 0) {
      throw new Error('At least one question required');
    }
    
    console.log('✅ Data validation passed');
  }

  /**
   * Incrémente la version (semver)
   */
  incrementVersion() {
    const currentVersion = this.currentData.config.version;
    const parts = currentVersion.split('.');
    const patch = parseInt(parts[2]) + 1;
    this.currentData.config.version = `${parts[0]}.${parts[1]}.${patch}`;
  }

  /**
   * Compte le nombre de modifications
   */
  getChangeCount() {
    // Simplification : compare le JSON stringifié
    const current = JSON.stringify(this.currentData.questions.sort((a,b) => a.id - b.id));
    const original = JSON.stringify(this.originalData.questions.sort((a,b) => a.id - b.id));
    
    if (current !== original) {
      return 'plusieurs'; // Simplification
    }
    return 0;
  }

  /**
   * Restaure la configuration par défaut
   */
  async resetToDefault() {
    if (!confirm('Reset configuration to default? All changes will be lost.')) {
      return;
    }

    try {
      // Recharger depuis questions-data.js
      const { ASSESSMENT_DATA } = await import('./questions-data.js');
      this.currentData = JSON.parse(JSON.stringify(ASSESSMENT_DATA));
      this.originalData = JSON.parse(JSON.stringify(ASSESSMENT_DATA));
      this.hasChanges = false;
      
      this.updateUI();
      this.showNotification('Configuration reset to default', 'success');
      
    } catch (error) {
      console.error('Reset error:', error);
      this.showNotification('Error during reset', 'error');
    }
  }

  /**
   * Génère un rapport de configuration
   */
  generateReport() {
    return ConfigManager.generateReport(this.currentData);
  }

  /**
   * Exporte la configuration en JSON
   */
  exportAsJSON() {
    const dataStr = JSON.stringify(this.currentData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `pod-assessment-config-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    this.showNotification('Configuration exported', 'success');
  }

  /**
   * Utilitaires
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  showNotification(message, type = 'info') {
    // Cette fonction sera liée à l'AdminApp
    if (window.adminApp) {
      window.adminApp.showNotification(message, type);
    } else {
      console.log(`[${type.toUpperCase()}] ${message}`);
    }
  }

  /**
   * Getters
   */
  hasUnsavedChanges() {
    return this.hasChanges;
  }

  getCurrentData() {
    return this.currentData;
  }

  getQuestion(questionId) {
    return this.currentData.questions.find(q => q.id === questionId);
  }

  getDimension(dimensionId) {
    return this.currentData.dimensions.find(d => d.id === dimensionId);
  }
}