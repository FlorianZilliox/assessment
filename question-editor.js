// question-editor.js - Éditeur de questions avec modal

export class QuestionEditor {
  constructor(adminManager) {
    this.adminManager = adminManager;
    this.currentQuestion = null;
    this.currentDimension = null;
    this.isEditMode = false;
    
    this.createModal();
    this.bindEvents();
  }

  /**
   * Crée le modal d'édition
   */
  createModal() {
    const modal = document.createElement('div');
    modal.id = 'question-editor-modal';
    modal.className = 'modal-backdrop';
    modal.innerHTML = `
      <div class="modal-content question-editor-content">
        <div class="modal-header">
          <h3 id="editor-title">Edit Question</h3>
          <button class="modal-close" id="editor-close">&times;</button>
        </div>
        
        <div class="modal-body">
          <form id="question-form">
            <!-- Informations de base -->
            <div class="form-section">
              <h4>📝 Basic Information</h4>
              
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Question ID</label>
                  <input type="text" id="question-id" class="form-input" readonly>
                </div>
                <div class="form-group">
                  <label class="form-label">Type</label>
                  <select id="question-type" class="form-input">
                    <option value="A">Type A - Scale 1-6</option>
                    <option value="B">Type B - Options with frequency</option>
                    <option value="C">Type C - Options with levels</option>
                  </select>
                </div>
              </div>
              
              <div class="form-group">
                <label class="form-label">Dimension</label>
                <select id="question-dimension" class="form-input">
                  <!-- Options peuplées dynamiquement -->
                </select>
              </div>
              
              <div class="form-group">
                <label class="form-label">Question text *</label>
                <textarea id="question-text" class="form-input" rows="3" 
                          placeholder="Enter the question text..." required></textarea>
                <small class="form-help">The main question text as it will appear to users.</small>
              </div>
            </div>

            <!-- Options (Types B et C) -->
            <div class="form-section" id="options-section" style="display: none;">
              <h4>⚙️ Answer options</h4>
              <div id="options-container">
                <!-- Options dynamiques -->
              </div>
              <button type="button" id="add-option-btn" class="btn btn-secondary btn-small">
                ➕ Add option
              </button>
            </div>

            <!-- Contenu éducatif "Why does it matter" -->
            <div class="form-section">
              <h4>📚 Educational content "Why does it matter?"</h4>
              
              <div class="form-group">
                <label class="form-label">Why it matters *</label>
                <textarea id="why-matters" class="form-input" rows="3" 
                          placeholder="Explain why this practice is important..." required></textarea>
                <small class="form-help">Explanation of the "why" of this practice.</small>
              </div>
              
              <div class="form-group">
                <label class="form-label">When done well *</label>
                <div id="when-done-well-container">
                  <!-- Liste dynamique -->
                </div>
                <button type="button" id="add-done-well-btn" class="btn btn-secondary btn-small">
                  ➕ Add item
                </button>
                <small class="form-help">Benefits when this practice is properly applied.</small>
              </div>
              
              <div class="form-group">
                <label class="form-label">Problems without this practice *</label>
                <div id="problems-without-container">
                  <!-- Liste dynamique -->
                </div>
                <button type="button" id="add-problem-btn" class="btn btn-secondary btn-small">
                  ➕ Add item
                </button>
                <small class="form-help">Problems that occur without this practice.</small>
              </div>
            </div>
          </form>
        </div>
        
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" id="editor-cancel">Cancel</button>
          <button type="button" class="btn btn-secondary" id="editor-preview">👁️ Preview</button>
          <button type="button" class="btn btn-primary" id="editor-save">💾 Save</button>
        </div>
      </div>
    `;

    // Ajouter les styles CSS
    const style = document.createElement('style');
    style.textContent = `
      .question-editor-content {
        max-width: 800px;
        max-height: 90vh;
        overflow-y: auto;
        width: 95%;
      }
      
      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 24px;
        border-bottom: 1px solid var(--color-border);
        background: var(--color-sidebar-bg);
        border-radius: var(--radius-lg) var(--radius-lg) 0 0;
      }
      
      .modal-header h3 {
        margin: 0;
        color: var(--color-primary);
      }
      
      .modal-close {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        padding: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--radius-sm);
        color: var(--color-text-secondary);
      }
      
      .modal-close:hover {
        background: var(--color-bg);
        color: var(--color-text);
      }
      
      .modal-body {
        padding: 24px;
      }
      
      .modal-footer {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
        padding: 20px 24px;
        border-top: 1px solid var(--color-border);
        background: var(--color-sidebar-bg);
        border-radius: 0 0 var(--radius-lg) var(--radius-lg);
      }
      
      .form-section {
        margin-bottom: 32px;
        padding: 20px;
        background: var(--color-sidebar-bg);
        border-radius: var(--radius-md);
        border: 1px solid var(--color-border);
      }
      
      .form-section h4 {
        margin: 0 0 16px 0;
        color: var(--color-primary);
        font-size: var(--font-size-h3);
      }
      
      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }
      
      .form-help {
        color: var(--color-text-secondary);
        font-size: var(--font-size-body-small);
        margin-top: 4px;
      }
      
      .option-item, .list-item {
        display: flex;
        gap: 8px;
        margin-bottom: 8px;
        align-items: flex-start;
      }
      
      .option-item input, .list-item input {
        flex: 1;
      }
      
      .option-value {
        width: 80px;
      }
      
      .remove-btn {
        background: var(--color-danger);
        color: white;
        border: none;
        border-radius: var(--radius-sm);
        padding: 6px 10px;
        cursor: pointer;
        font-size: 12px;
      }
      
      @media (max-width: 768px) {
        .question-editor-content {
          width: 98%;
          margin: 1vh;
        }
        
        .form-row {
          grid-template-columns: 1fr;
        }
        
        .modal-footer {
          flex-direction: column;
        }
      }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(modal);
    
    this.modal = modal;
  }

  /**
   * Lie les événements
   */
  bindEvents() {
    // Fermeture du modal
    this.modal.querySelector('#editor-close').addEventListener('click', () => this.close());
    this.modal.querySelector('#editor-cancel').addEventListener('click', () => this.close());
    
    // Clic sur le backdrop
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.close();
    });
    
    // ESC pour fermer
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal.classList.contains('active')) {
        this.close();
      }
    });
    
    // Change de type de question
    this.modal.querySelector('#question-type').addEventListener('change', (e) => {
      this.updateOptionsSection(e.target.value);
    });
    
    // Boutons d'action
    this.modal.querySelector('#editor-save').addEventListener('click', () => this.save());
    this.modal.querySelector('#editor-preview').addEventListener('click', () => this.preview());
    
    // Gestion des listes dynamiques
    this.modal.querySelector('#add-option-btn').addEventListener('click', () => this.addOption());
    this.modal.querySelector('#add-done-well-btn').addEventListener('click', () => this.addListItem('when-done-well'));
    this.modal.querySelector('#add-problem-btn').addEventListener('click', () => this.addListItem('problems-without'));
  }

  /**
   * Ouvre l'éditeur pour une nouvelle question
   */
  openForNew(dimensionId) {
    this.isEditMode = false;
    this.currentQuestion = null;
    this.currentDimension = this.adminManager.getDimension(dimensionId);
    
    this.modal.querySelector('#editor-title').textContent = 'New question';
    this.populateDimensionSelect(dimensionId);
    this.resetForm();
    this.show();
  }

  /**
   * Ouvre l'éditeur pour modifier une question existante
   */
  openForEdit(questionId) {
    this.isEditMode = true;
    this.currentQuestion = this.adminManager.getQuestion(questionId);
    
    if (!this.currentQuestion) {
      console.error('Question not found:', questionId);
      return;
    }
    
    this.currentDimension = this.adminManager.getDimension(this.currentQuestion.dimensionId);
    
    this.modal.querySelector('#editor-title').textContent = `Edit question ${questionId}`;
    this.populateDimensionSelect();
    this.populateForm();
    this.show();
  }

  /**
   * Affiche le modal
   */
  show() {
    this.modal.classList.add('active');
    setTimeout(() => {
      this.modal.querySelector('#question-text').focus();
    }, 300);
  }

  /**
   * Cache le modal
   */
  close() {
    this.modal.classList.remove('active');
  }

  /**
   * Peuple le select des dimensions
   */
  populateDimensionSelect(selectedId = null) {
    const select = this.modal.querySelector('#question-dimension');
    const data = this.adminManager.getCurrentData();
    
    select.innerHTML = data.dimensions.map(dim => 
      `<option value="${dim.id}" ${dim.id === (selectedId || this.currentQuestion?.dimensionId) ? 'selected' : ''}>
        ${dim.name}
      </option>`
    ).join('');
  }

  /**
   * Remet le formulaire à zéro
   */
  resetForm() {
    this.modal.querySelector('#question-id').value = 'New (auto-generated)';
    this.modal.querySelector('#question-type').value = 'A';
    this.modal.querySelector('#question-text').value = '';
    this.modal.querySelector('#why-matters').value = '';
    
    this.updateOptionsSection('A');
    this.resetListContainer('when-done-well-container');
    this.resetListContainer('problems-without-container');
    
    // Ajouter un élément par défaut dans chaque liste
    this.addListItem('when-done-well');
    this.addListItem('problems-without');
  }

  /**
   * Remplit le formulaire avec les données de la question
   */
  populateForm() {
    if (!this.currentQuestion) return;
    
    this.modal.querySelector('#question-id').value = this.currentQuestion.id;
    this.modal.querySelector('#question-type').value = this.currentQuestion.type;
    this.modal.querySelector('#question-text').value = this.currentQuestion.text;
    
    // Contenu éducatif
    const whyContent = this.currentQuestion.whyContent || {};
    this.modal.querySelector('#why-matters').value = whyContent.whyMatters || '';
    
    // Options pour types B et C
    this.updateOptionsSection(this.currentQuestion.type);
    if (this.currentQuestion.options) {
      this.populateOptions(this.currentQuestion.options);
    }
    
    // Listes éducatives
    this.populateList('when-done-well', whyContent.whenDoneWell || []);
    this.populateList('problems-without', whyContent.problemsWithout || []);
  }

  /**
   * Met à jour la section des options selon le type
   */
  updateOptionsSection(type) {
    const section = this.modal.querySelector('#options-section');
    const container = this.modal.querySelector('#options-container');
    
    if (type === 'A') {
      section.style.display = 'none';
    } else {
      section.style.display = 'block';
      container.innerHTML = '';
      
      // Ajouter une option par défaut
      this.addOption();
    }
  }

  /**
   * Ajoute une option (Types B et C)
   */
  addOption(label = '', value = '') {
    const container = this.modal.querySelector('#options-container');
    const index = container.children.length;
    
    const div = document.createElement('div');
    div.className = 'option-item';
    div.innerHTML = `
      <input type="text" placeholder="Option text" value="${label}" class="form-input" data-field="label">
      <input type="number" placeholder="Value" value="${value}" class="form-input option-value" data-field="value" min="1" max="6">
      <button type="button" class="remove-btn" onclick="this.parentElement.remove()">×</button>
    `;
    
    container.appendChild(div);
  }

  /**
   * Remplit les options existantes
   */
  populateOptions(options) {
    const container = this.modal.querySelector('#options-container');
    container.innerHTML = '';
    
    options.forEach(option => {
      this.addOption(option.label, option.value);
    });
  }

  /**
   * Ajoute un élément à une liste (when done well, problems without)
   */
  addListItem(listType, value = '') {
    const container = this.modal.querySelector(`#${listType}-container`);
    
    const div = document.createElement('div');
    div.className = 'list-item';
    div.innerHTML = `
      <input type="text" placeholder="Enter an item..." value="${value}" class="form-input">
      <button type="button" class="remove-btn" onclick="this.parentElement.remove()">×</button>
    `;
    
    container.appendChild(div);
  }

  /**
   * Remplit une liste
   */
  populateList(listType, items) {
    this.resetListContainer(`${listType}-container`);
    items.forEach(item => {
      this.addListItem(listType, item);
    });
    
    // Ajouter un élément vide pour permettre l'ajout
    if (items.length === 0) {
      this.addListItem(listType);
    }
  }

  /**
   * Vide un conteneur de liste
   */
  resetListContainer(containerId) {
    this.modal.querySelector(`#${containerId}`).innerHTML = '';
  }

  /**
   * Sauvegarde la question
   */
  save() {
    try {
      const formData = this.collectFormData();
      this.validateFormData(formData);
      
      if (this.isEditMode) {
        this.adminManager.updateQuestion(this.currentQuestion.id, formData);
      } else {
        this.adminManager.addQuestion(formData.dimensionId, formData);
      }
      
      this.close();
      
    } catch (error) {
      alert(`Error: ${error.message}`);
      console.error('Save error:', error);
    }
  }

  /**
   * Collecte les données du formulaire
   */
  collectFormData() {
    const form = this.modal.querySelector('#question-form');
    
    const data = {
      dimensionId: form.querySelector('#question-dimension').value,
      text: form.querySelector('#question-text').value.trim(),
      type: form.querySelector('#question-type').value,
      whyContent: {
        whyMatters: form.querySelector('#why-matters').value.trim(),
        whenDoneWell: this.collectListItems('when-done-well-container'),
        problemsWithout: this.collectListItems('problems-without-container')
      }
    };
    
    // Options pour types B et C
    if (data.type !== 'A') {
      data.options = this.collectOptions();
    }
    
    return data;
  }

  /**
   * Collecte les options
   */
  collectOptions() {
    const container = this.modal.querySelector('#options-container');
    const options = [];
    
    Array.from(container.children).forEach(item => {
      const label = item.querySelector('[data-field="label"]').value.trim();
      const value = parseInt(item.querySelector('[data-field="value"]').value);
      
      if (label && !isNaN(value)) {
        options.push({ label, value });
      }
    });
    
    return options;
  }

  /**
   * Collecte les éléments d'une liste
   */
  collectListItems(containerId) {
    const container = this.modal.querySelector(`#${containerId}`);
    const items = [];
    
    Array.from(container.children).forEach(item => {
      const value = item.querySelector('input').value.trim();
      if (value) {
        items.push(value);
      }
    });
    
    return items;
  }

  /**
   * Valide les données du formulaire
   */
  validateFormData(data) {
    if (!data.text) {
      throw new Error('Question text is required');
    }
    
    if (!data.whyContent.whyMatters) {
      throw new Error('The "Why it matters" content is required');
    }
    
    if (data.whyContent.whenDoneWell.length === 0) {
      throw new Error('At least one "When done well" item is required');
    }
    
    if (data.whyContent.problemsWithout.length === 0) {
      throw new Error('At least one "Problems without this practice" item is required');
    }
    
    if (data.type !== 'A' && (!data.options || data.options.length === 0)) {
      throw new Error('Type B and C questions must have options');
    }
    
    if (data.options) {
      // Vérifier que les valeurs sont uniques
      const values = data.options.map(o => o.value);
      const uniqueValues = new Set(values);
      if (values.length !== uniqueValues.size) {
        throw new Error('Option values must be unique');
      }
    }
  }

  /**
   * Aperçu de la question
   */
  preview() {
    try {
      const formData = this.collectFormData();
      this.showPreviewModal(formData);
    } catch (error) {
      alert(`Preview error: ${error.message}`);
    }
  }

  /**
   * Affiche un modal d'aperçu
   */
  showPreviewModal(data) {
    const previewModal = document.createElement('div');
    previewModal.className = 'modal-backdrop';
    previewModal.innerHTML = `
      <div class="modal-content" style="max-width: 600px;">
        <div class="modal-header">
          <h3>👁️ Question preview</h3>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="question-preview">
            <h4>Question ${this.isEditMode ? this.currentQuestion.id : '(nouveau)'}</h4>
            <p><strong>Dimension:</strong> ${this.adminManager.getDimension(data.dimensionId).name}</p>
            <p><strong>Type:</strong> ${data.type}</p>
            <div class="question-text" style="font-size: 18px; margin: 20px 0; padding: 16px; background: var(--color-sidebar-bg); border-radius: 8px;">
              ${data.text}
            </div>
            
            ${data.options ? `
              <h5>Answer options:</h5>
              <ul>
                ${data.options.map(opt => `<li>${opt.label} (valeur: ${opt.value})</li>`).join('')}
              </ul>
            ` : ''}
            
            <h5>📚 Why does it matter?</h5>
            <p><strong>Why:</strong> ${data.whyContent.whyMatters}</p>
            
            <p><strong>When done well:</strong></p>
            <ul>${data.whyContent.whenDoneWell.map(item => `<li>${item}</li>`).join('')}</ul>
            
            <p><strong>Problems without this practice:</strong></p>
            <ul>${data.whyContent.problemsWithout.map(item => `<li>${item}</li>`).join('')}</ul>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary close-preview">Close</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(previewModal);
    previewModal.classList.add('active');
    
    // Events pour fermer
    previewModal.querySelector('.modal-close').addEventListener('click', () => {
      previewModal.remove();
    });
    previewModal.querySelector('.close-preview').addEventListener('click', () => {
      previewModal.remove();
    });
    previewModal.addEventListener('click', (e) => {
      if (e.target === previewModal) previewModal.remove();
    });
  }
}