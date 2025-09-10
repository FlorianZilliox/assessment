// config-manager.js - Gestionnaire de configuration avec support JSONBin
import { ASSESSMENT_DATA } from './questions-data.js';

export class ConfigManager {
  static BIN_ID = '68c02404ae596e708fe8260f'; // VOTRE BIN ID CORRECT
  static API_URL = `https://api.jsonbin.io/v3/b/${this.BIN_ID}/latest`;
  static TIMEOUT = 5000; // 5 secondes
  static MAX_RETRIES = 3;

  /**
   * Charge la configuration depuis JSONBin avec fallback sur config locale
   */
  static async loadConfiguration() {
    try {
      console.log('🔄 Loading configuration from JSONBin...');
      
      const data = await this.fetchWithTimeout();
      
      if (this.validateConfiguration(data)) {
        console.log('✅ Configuration loaded from JSONBin successfully');
        console.log(`📊 Version: ${data.config.version}, Questions: ${data.questions.length}`);
        return data;
      } else {
        console.warn('⚠️ Invalid configuration from JSONBin, using local fallback');
        return ASSESSMENT_DATA;
      }
      
    } catch (error) {
      console.warn('🔄 JSONBin unavailable, using local configuration:', error.message);
      return ASSESSMENT_DATA;
    }
  }

  /**
   * Fetch avec timeout et retry
   */
  static async fetchWithTimeout(retries = 0) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT);
    
    try {
      const response = await fetch(this.API_URL, {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result.record;
      
    } catch (error) {
      clearTimeout(timeoutId);
      
      // Retry logic
      if (retries < this.MAX_RETRIES && !error.name === 'AbortError') {
        console.log(`🔄 Retry ${retries + 1}/${this.MAX_RETRIES} after error:`, error.message);
        await this.sleep(1000 * (retries + 1)); // Exponential backoff
        return this.fetchWithTimeout(retries + 1);
      }
      
      throw error;
    }
  }

  /**
   * Valide la structure de configuration
   */
  static validateConfiguration(data) {
    if (!data || typeof data !== 'object') {
      return false;
    }

    // Vérifier la structure de base
    if (!data.config || !data.dimensions || !data.questions || !data.scoreGuide) {
      console.error('❌ Missing required configuration sections');
      return false;
    }

    // Vérifier config
    const config = data.config;
    if (!config.totalQuestions || !config.version || typeof config.passingScore !== 'number') {
      console.error('❌ Invalid config section');
      return false;
    }

    // Vérifier dimensions
    if (!Array.isArray(data.dimensions) || data.dimensions.length !== 5) {
      console.error('❌ Expected exactly 5 dimensions');
      return false;
    }

    // Vérifier questions
    if (!Array.isArray(data.questions)) {
      console.error('❌ Questions must be an array');
      return false;
    }

    // Vérifier le nombre de questions
    if (data.questions.length !== config.totalQuestions) {
      console.error(`❌ Question count mismatch: expected ${config.totalQuestions}, got ${data.questions.length}`);
      return false;
    }

    // Vérifier chaque question
    for (const question of data.questions) {
      if (!this.validateQuestion(question)) {
        return false;
      }
    }

    // Vérifier que chaque dimension a des questions
    for (const dimension of data.dimensions) {
      const dimensionQuestions = data.questions.filter(q => q.dimensionId === dimension.id);
      if (dimensionQuestions.length === 0) {
        console.error(`❌ Dimension ${dimension.id} has no questions`);
        return false;
      }
    }

    return true;
  }

  /**
   * Valide une question individuelle
   */
  static validateQuestion(question) {
    // Champs obligatoires
    if (!question.id || !question.text || !question.dimensionId || !question.type) {
      console.error('❌ Question missing required fields:', question);
      return false;
    }

    // Type valide
    if (!['A', 'B', 'C'].includes(question.type)) {
      console.error('❌ Invalid question type:', question.type);
      return false;
    }

    // Type B et C doivent avoir des options
    if (question.type !== 'A' && (!question.options || !Array.isArray(question.options))) {
      console.error('❌ Question type B/C must have options:', question);
      return false;
    }

    // Vérifier whyContent
    if (!question.whyContent || !question.whyContent.whyMatters) {
      console.error('❌ Question missing whyContent.whyMatters:', question.id);
      return false;
    }

    if (!Array.isArray(question.whyContent.whenDoneWell) || question.whyContent.whenDoneWell.length === 0) {
      console.error('❌ Question missing whyContent.whenDoneWell:', question.id);
      return false;
    }

    if (!Array.isArray(question.whyContent.problemsWithout) || question.whyContent.problemsWithout.length === 0) {
      console.error('❌ Question missing whyContent.problemsWithout:', question.id);
      return false;
    }

    return true;
  }

  /**
   * Vérifie la connectivité JSONBin
   */
  static async checkConnectivity() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(this.API_URL, {
        method: 'HEAD',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response.ok;
      
    } catch (error) {
      return false;
    }
  }

  /**
   * Utilitaire pour sleep
   */
  static sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Génère un rapport de configuration
   */
  static generateReport(data) {
    if (!data) return 'No configuration data';

    const report = {
      version: data.config?.version || 'unknown',
      totalQuestions: data.questions?.length || 0,
      dimensions: data.dimensions?.length || 0,
      lastModified: data.config?.lastModified || 'unknown',
      questionsByDimension: {}
    };

    if (data.dimensions && data.questions) {
      data.dimensions.forEach(dim => {
        const count = data.questions.filter(q => q.dimensionId === dim.id).length;
        report.questionsByDimension[dim.name] = count;
      });
    }

    return report;
  }

  /**
   * Compare deux configurations
   */
  static compareConfigurations(config1, config2) {
    if (!config1 || !config2) {
      return { different: true, reason: 'Missing configuration' };
    }

    // Comparer versions
    if (config1.config?.version !== config2.config?.version) {
      return { 
        different: true, 
        reason: `Version mismatch: ${config1.config?.version} vs ${config2.config?.version}` 
      };
    }

    // Comparer nombre de questions
    if (config1.questions?.length !== config2.questions?.length) {
      return { 
        different: true, 
        reason: `Question count: ${config1.questions?.length} vs ${config2.questions?.length}` 
      };
    }

    return { different: false, reason: 'Configurations are identical' };
  }
}