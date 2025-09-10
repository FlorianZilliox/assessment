// why-modal.js - Gestion du modal "Why does it matter?"

export class WhyModal {
  constructor() {
    this.isOpen = false;
    this.currentQuestion = null;
  }

  initialize() {
    // Bind events for modal
    document.getElementById('why-tab').addEventListener('click', () => {
      this.openModal();
    });

    document.getElementById('why-modal-close').addEventListener('click', () => {
      this.closeModal();
    });

    document.getElementById('why-modal-backdrop').addEventListener('click', (e) => {
      if (e.target.id === 'why-modal-backdrop') {
        this.closeModal();
      }
    });

    document.getElementById('why-got-it-btn').addEventListener('click', () => {
      this.closeModal();
    });

    // ESC key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.closeModal();
      }
    });
  }

  openModal(question = null) {
    // Use provided question or fall back to current question
    const targetQuestion = question || this.currentQuestion;
    
    if (!targetQuestion || !targetQuestion.whyContent || !targetQuestion.whyContent.whyMatters) {
      return; // No content available
    }
    
    // Update modal content
    this.updateModalContent(targetQuestion);
    
    // Show modal
    document.getElementById('why-modal-backdrop').classList.add('active');
    document.getElementById('why-modal').classList.add('active');
    this.isOpen = true;
  }

  updateModalContent(question) {
    if (!question || !question.whyContent || !question.whyContent.whyMatters) {
      return;
    }

    // Update modal content
    document.getElementById('why-question-number').textContent = question.id;
    document.getElementById('why-matters-content').textContent = question.whyContent.whyMatters;
    
    // Update lists
    const doneWellList = document.getElementById('when-done-well-list');
    doneWellList.innerHTML = '';
    question.whyContent.whenDoneWell.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item;
      doneWellList.appendChild(li);
    });
    
    const problemsList = document.getElementById('problems-without-list');
    problemsList.innerHTML = '';
    question.whyContent.problemsWithout.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item;
      problemsList.appendChild(li);
    });
  }

  closeModal() {
    document.getElementById('why-modal-backdrop').classList.remove('active');
    document.getElementById('why-modal').classList.remove('active');
    this.isOpen = false;
  }

  updateTabVisibility(visible) {
    const whyTab = document.getElementById('why-tab');
    whyTab.style.display = visible ? 'flex' : 'none';
    
    // Close modal if hiding tab
    if (!visible && this.isOpen) {
      this.closeModal();
    }
  }

  updateTabState(question) {
    this.currentQuestion = question;
    
    const whyTab = document.getElementById('why-tab');
    if (question && question.whyContent && question.whyContent.whyMatters) {
      whyTab.classList.remove('disabled');
    } else {
      whyTab.classList.add('disabled');
      // Close modal if current question has no content
      if (this.isOpen) {
        this.closeModal();
      }
    }
    
    // If modal is open and question changed, update content immediately
    if (this.isOpen && question && question.whyContent && question.whyContent.whyMatters) {
      this.updateModalContent(question);
    }
  }

  getIsOpen() {
    return this.isOpen;
  }
}