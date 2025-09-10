// jsonbin-client.js - Client pour l'API JSONBin

export class JSONBinClient {
  constructor(binId, apiKey) {
    this.binId = binId;
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.jsonbin.io/v3';
    this.timeout = 10000; // 10 secondes
  }

  /**
   * Lit les données depuis JSONBin
   */
  async read() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseUrl}/b/${this.binId}/latest`, {
        method: 'GET',
        headers: {
          'X-Master-Key': this.apiKey,
          'Cache-Control': 'no-cache'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ JSONBin read successful');
      return result.record;

    } catch (error) {
      console.error('❌ JSONBin read error:', error);
      throw new Error(`Failed to read from JSONBin: ${error.message}`);
    }
  }

  /**
   * Écrit les données vers JSONBin
   */
  async update(data) {
    try {
      this.validateData(data);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseUrl}/b/${this.binId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': this.apiKey,
          'X-Bin-Versioning': 'false' // Écrase la version actuelle
        },
        body: JSON.stringify(data),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ JSONBin update successful:', result);
      return result;

    } catch (error) {
      console.error('❌ JSONBin update error:', error);
      throw new Error(`Failed to update JSONBin: ${error.message}`);
    }
  }

  /**
   * Crée une nouvelle version (snapshot)
   */
  async createVersion(data, versionName = null) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const headers = {
        'Content-Type': 'application/json',
        'X-Master-Key': this.apiKey,
        'X-Bin-Versioning': 'true'
      };

      if (versionName) {
        headers['X-Bin-Version-Name'] = versionName;
      }

      const response = await fetch(`${this.baseUrl}/b/${this.binId}`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(data),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ JSONBin version created:', result);
      return result;

    } catch (error) {
      console.error('❌ JSONBin version creation error:', error);
      throw new Error(`Failed to create JSONBin version: ${error.message}`);
    }
  }

  /**
   * Liste toutes les versions disponibles
   */
  async listVersions() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseUrl}/b/${this.binId}/versions`, {
        method: 'GET',
        headers: {
          'X-Master-Key': this.apiKey
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return result.versions || [];

    } catch (error) {
      console.error('❌ JSONBin list versions error:', error);
      throw new Error(`Failed to list JSONBin versions: ${error.message}`);
    }
  }

  /**
   * Lit une version spécifique
   */
  async readVersion(versionId) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseUrl}/b/${this.binId}/versions/${versionId}`, {
        method: 'GET',
        headers: {
          'X-Master-Key': this.apiKey
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return result.record;

    } catch (error) {
      console.error('❌ JSONBin read version error:', error);
      throw new Error(`Failed to read JSONBin version: ${error.message}`);
    }
  }

  /**
   * Teste la connectivité et les permissions
   */
  async testConnection() {
    try {
      const response = await fetch(`${this.baseUrl}/b/${this.binId}/meta`, {
        method: 'GET',
        headers: {
          'X-Master-Key': this.apiKey
        }
      });

      return {
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        hasReadAccess: response.status !== 403,
        hasWriteAccess: true // Assumé si read OK avec master key
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        hasReadAccess: false,
        hasWriteAccess: false
      };
    }
  }

  /**
   * Obtient les métadonnées du bin
   */
  async getBinMeta() {
    try {
      const response = await fetch(`${this.baseUrl}/b/${this.binId}/meta`, {
        method: 'GET',
        headers: {
          'X-Master-Key': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return result.metadata;

    } catch (error) {
      console.error('❌ JSONBin meta error:', error);
      throw new Error(`Failed to get JSONBin metadata: ${error.message}`);
    }
  }

  /**
   * Valide les données avant envoi
   */
  validateData(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Data must be a valid object');
    }

    // Vérifier la taille (JSONBin a une limite)
    const dataSize = JSON.stringify(data).length;
    const maxSize = 100 * 1024; // 100KB (limite généreuse)
    
    if (dataSize > maxSize) {
      throw new Error(`Data too large: ${dataSize} bytes (max: ${maxSize})`);
    }

    // Vérifications de structure de base
    if (!data.config || !data.questions || !data.dimensions) {
      throw new Error('Missing required data structure');
    }

    console.log(`📏 Data validated: ${dataSize} bytes, ${data.questions.length} questions`);
  }

  /**
   * Utilitaire pour retry avec backoff exponentiel
   */
  async withRetry(operation, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }
        
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(`🔄 Retry ${attempt}/${maxRetries} after ${delay}ms:`, error.message);
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  /**
   * Backup des données vers localStorage
   */
  backupToLocal(data, key = 'jsonbin_backup') {
    try {
      const backup = {
        data: data,
        timestamp: new Date().toISOString(),
        binId: this.binId
      };
      
      localStorage.setItem(key, JSON.stringify(backup));
      console.log('💾 Data backed up locally');
      
    } catch (error) {
      console.warn('⚠️ Local backup failed:', error);
    }
  }

  /**
   * Restaure depuis localStorage
   */
  restoreFromLocal(key = 'jsonbin_backup') {
    try {
      const backup = localStorage.getItem(key);
      if (backup) {
        const parsed = JSON.parse(backup);
        console.log('📂 Backup restored from:', parsed.timestamp);
        return parsed.data;
      }
    } catch (error) {
      console.warn('⚠️ Local restore failed:', error);
    }
    return null;
  }

  /**
   * Getters pour configuration
   */
  getBinId() {
    return this.binId;
  }

  getBaseUrl() {
    return this.baseUrl;
  }

  setTimeout(timeout) {
    this.timeout = timeout;
  }
}