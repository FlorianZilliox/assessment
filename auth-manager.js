// auth-manager.js - Gestionnaire d'authentification pour l'interface admin

export class AuthManager {
  constructor() {
    this.API_KEY_STORAGE = 'pod_admin_api_key';
    this.SESSION_KEY = 'pod_admin_session';
    this.SESSION_TIMEOUT = 2 * 60 * 60 * 1000; // 2 heures en millisecondes
    
    // Hash SHA-256 du mot de passe admin "meetic"
    this.EXPECTED_HASH = '268f3baa91cfcf8e589527592b6a2a83bb90dc7f62fd15074727574c2aee2387';
    
    // VOTRE VRAIE CLÉ API JSONBIN
    this.DEFAULT_API_KEY = '$2a$10$DKyKukZrNMcqj0wiQLHVY.2HBeY0orXIz7EopKimvmKNzTmK4lLN6';
    
    this.currentSession = null;
    this.currentApiKey = null;
  }

  /**
   * Authentifie l'admin avec mot de passe
   */
  async authenticate(password) {
    try {
      const hash = await this.hashPassword(password);
      
      if (hash !== this.EXPECTED_HASH) {
        return { success: false, error: 'Incorrect password' };
      }
      
      // Utiliser directement votre API key
      let apiKey = this.getStoredApiKey();
      
      if (!apiKey) {
        // Utiliser votre vraie clé JSONBin
        apiKey = this.DEFAULT_API_KEY;
        console.log('Using configured JSONBin API key');
        this.storeApiKey(apiKey);
      }
      
      // Créer la session
      this.createSession();
      this.currentApiKey = apiKey;
      
      return { 
        success: true, 
        apiKey: apiKey,
        sessionDuration: this.SESSION_TIMEOUT / 1000 / 60 // en minutes
      };
      
    } catch (error) {
      console.error('Authentication error:', error);
      return { success: false, error: 'Authentication error' };
    }
  }

  /**
   * Hash un mot de passe en SHA-256
   */
  async hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }

  /**
   * Génère un hash SHA-256 pour un mot de passe donné (utilitaire)
   */
  static async generatePasswordHash(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    console.log(`Password hash for "${password}": ${hashHex}`);
    return hashHex;
  }

  /**
   * Récupère l'API key stockée
   */
  getStoredApiKey() {
    try {
      const stored = localStorage.getItem(this.API_KEY_STORAGE);
      if (stored) {
        // Optionnel : déchiffrer si chiffré
        return stored;
      }
    } catch (error) {
      console.warn('Error retrieving stored API key:', error);
    }
    return null;
  }

  /**
   * Stocke l'API key
   */
  storeApiKey(apiKey) {
    try {
      // Optionnel : chiffrer avant stockage
      localStorage.setItem(this.API_KEY_STORAGE, apiKey);
    } catch (error) {
      console.warn('Error storing API key:', error);
    }
  }

  /**
   * Demande l'API key à l'admin
   */
  async promptForApiKey() {
    return new Promise((resolve) => {
      const modal = this.createApiKeyModal();
      document.body.appendChild(modal);
      
      const input = modal.querySelector('#api-key-input');
      const confirmBtn = modal.querySelector('#api-key-confirm');
      const cancelBtn = modal.querySelector('#api-key-cancel');
      
      const cleanup = () => {
        document.body.removeChild(modal);
      };
      
      confirmBtn.addEventListener('click', () => {
        const apiKey = input.value.trim();
        cleanup();
        resolve(apiKey || null);
      });
      
      cancelBtn.addEventListener('click', () => {
        cleanup();
        resolve(null);
      });
      
      // Focus sur l'input
      setTimeout(() => input.focus(), 100);
    });
  }

  /**
   * Crée le modal pour saisir l'API key
   */
  createApiKeyModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-backdrop';
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.5); z-index: 10000;
      display: flex; align-items: center; justify-content: center;
    `;
    
    modal.innerHTML = `
      <div class="modal-content" style="
        background: white; border-radius: 12px; padding: 32px;
        max-width: 500px; margin: 20px; box-shadow: 0 20px 25px rgba(0,0,0,0.1);
      ">
        <h3 style="margin: 0 0 16px 0; color: #1F2937;">🔑 API Configuration</h3>
        <p style="margin: 0 0 24px 0; color: #6B7280; line-height: 1.5;">
          First login: please enter your JSONBin API key to publish changes.
        </p>
        <input 
          type="text" 
          id="api-key-input" 
          placeholder="$2a$10$..." 
          style="
            width: 100%; padding: 12px 16px; border: 1px solid #E5E7EB;
            border-radius: 8px; font-family: monospace; font-size: 14px;
            margin-bottom: 24px;
          "
        />
        <div style="display: flex; gap: 12px; justify-content: flex-end;">
          <button id="api-key-cancel" style="
            padding: 10px 20px; background: #F3F4F6; color: #374151;
            border: none; border-radius: 8px; cursor: pointer;
          ">Cancel</button>
          <button id="api-key-confirm" style="
            padding: 10px 20px; background: #FF6B35; color: white;
            border: none; border-radius: 8px; cursor: pointer;
          ">Confirm</button>
        </div>
      </div>
    `;
    
    return modal;
  }

  /**
   * Test si l'API key est valide
   */
  async testApiKey(apiKey) {
    try {
      const response = await fetch(`https://api.jsonbin.io/v3/b/68c02404ae596e708fe8260f/latest`, {
        headers: {
          'X-Master-Key': apiKey
        }
      });
      return response.ok;
    } catch (error) {
      console.warn('Error testing API key:', error);
      return false;
    }
  }

  /**
   * Crée une nouvelle session
   */
  createSession() {
    const session = {
      timestamp: Date.now(),
      expires: Date.now() + this.SESSION_TIMEOUT
    };
    
    sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    this.currentSession = session;
  }

  /**
   * Vérifie si la session est valide
   */
  isSessionValid() {
    try {
      const stored = sessionStorage.getItem(this.SESSION_KEY);
      if (!stored) return false;
      
      const session = JSON.parse(stored);
      const now = Date.now();
      
      if (now > session.expires) {
        this.logout();
        return false;
      }
      
      this.currentSession = session;
      return true;
    } catch (error) {
      console.warn('Error checking session:', error);
      return false;
    }
  }

  /**
   * Rafraîchit la session (étend le timeout)
   */
  refreshSession() {
    if (this.currentSession) {
      this.currentSession.expires = Date.now() + this.SESSION_TIMEOUT;
      sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(this.currentSession));
    }
  }

  /**
   * Récupère l'API key de la session courante
   */
  getCurrentApiKey() {
    return this.isSessionValid() ? this.DEFAULT_API_KEY : null;
  }

  /**
   * Temps restant de la session en millisecondes
   */
  getSessionTimeRemaining() {
    if (!this.currentSession) return 0;
    return Math.max(0, this.currentSession.expires - Date.now());
  }

  /**
   * Déconnexion
   */
  logout() {
    sessionStorage.removeItem(this.SESSION_KEY);
    this.currentSession = null;
    this.currentApiKey = null;
  }

  /**
   * Supprime l'API key stockée (déconnexion complète)
   */
  clearStoredApiKey() {
    localStorage.removeItem(this.API_KEY_STORAGE);
    this.logout();
  }

  /**
   * Auto-déconnexion après timeout
   */
  startSessionMonitoring(onExpired = null) {
    setInterval(() => {
      if (this.currentSession && !this.isSessionValid()) {
        console.log('🚪 Session expired, logging out');
        if (onExpired) onExpired();
      }
    }, 60000); // Vérifier toutes les minutes
  }

  /**
   * Définit le hash du mot de passe (à utiliser lors de la configuration)
   */
  setExpectedPasswordHash(hash) {
    this.EXPECTED_HASH = hash;
  }
}