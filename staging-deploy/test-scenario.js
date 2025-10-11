#!/usr/bin/env node
/**
 * Test complet du flux de mentoring Token4Good RGB
 * ===============================================
 * 
 * Ce script teste le scénario complet :
 * 1. Création de comptes mentor/mentee
 * 2. Demande de mentoring
 * 3. Assignation et réalisation du mentoring
 * 4. Émission de tokens T4G via RGB
 * 5. Achat de service avec les tokens
 */

const axios = require('axios');
const fs = require('fs');

// Configuration
const CONFIG = {
  BACKEND_URL: 'http://localhost:3000',
  FRONTEND_URL: 'http://localhost:4200',
  
  // Comptes de test
  MENTOR: {
    email: 'mentor.test@token4good.com',
    firstname: 'Alice',
    lastname: 'Mentor',
    username: 'alice_mentor',
    role: 'mentor',
    bio: 'Experte en développement Web3 et blockchain'
  },
  
  MENTEE: {
    email: 'mentee.test@token4good.com', 
    firstname: 'Bob',
    lastname: 'Student',
    username: 'bob_student',
    role: 'mentee',
    bio: 'Étudiant passionné par la blockchain'
  },
  
  // Service à acheter
  SERVICE: {
    title: 'Consultation stratégie blockchain',
    description: 'Session de conseil pour implémenter une stratégie blockchain',
    price_tokens: 50,
    category: 'consulting'
  }
};

class Token4GoodTester {
  constructor() {
    this.results = {
      steps: [],
      errors: [],
      tokens_earned: 0,
      tokens_spent: 0,
      final_balance: 0
    };
    
    this.mentorToken = null;
    this.menteeToken = null;
    this.mentoringRequestId = null;
    this.proofId = null;
    this.serviceId = null;
  }

  // Utility pour faire des requêtes HTTP
  async makeRequest(method, url, data = null, token = null) {
    try {
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const config = {
        method,
        url: `${CONFIG.BACKEND_URL}${url}`,
        headers,
        ...(data && { data })
      };
      
      const response = await axios(config);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data || error.message,
        status: error.response?.status
      };
    }
  }

  // Log des étapes
  logStep(step, success, details = '') {
    const timestamp = new Date().toISOString();
    const status = success ? '✅' : '❌';
    const message = `${status} [${timestamp}] ${step}`;
    
    console.log(message);
    if (details) console.log(`   ${details}`);
    
    this.results.steps.push({
      timestamp,
      step,
      success,
      details
    });
    
    if (!success) {
      this.results.errors.push({ step, details });
    }
  }

  // 1. Création des comptes de test
  async createTestAccounts() {
    console.log('\n🔧 ÉTAPE 1: Création des comptes de test');
    
    // Créer le compte mentor
    const mentorResult = await this.makeRequest('POST', '/api/auth/register', {
      ...CONFIG.MENTOR,
      provider: 'dazeno',
      token: 'fake-dazeno-token-mentor'
    });
    
    if (mentorResult.success) {
      this.mentorToken = mentorResult.data.token;
      this.logStep('Création compte mentor', true, `Token: ${this.mentorToken?.substr(0, 20)}...`);
    } else {
      this.logStep('Création compte mentor', false, mentorResult.error);
      return false;
    }
    
    // Créer le compte mentee
    const menteeResult = await this.makeRequest('POST', '/api/auth/register', {
      ...CONFIG.MENTEE,
      provider: 'dazeno', 
      token: 'fake-dazeno-token-mentee'
    });
    
    if (menteeResult.success) {
      this.menteeToken = menteeResult.data.token;
      this.logStep('Création compte mentee', true, `Token: ${this.menteeToken?.substr(0, 20)}...`);
    } else {
      this.logStep('Création compte mentee', false, menteeResult.error);
      return false;
    }
    
    return true;
  }

  // 2. Création d'une demande de mentoring
  async createMentoringRequest() {
    console.log('\n📝 ÉTAPE 2: Création demande de mentoring');
    
    const requestData = {
      title: 'Aide pour comprendre le protocole RGB',
      description: 'J\'aimerais comprendre comment fonctionne RGB et comment l\'intégrer dans une dApp',
      category: 'blockchain',
      tags: ['RGB', 'Bitcoin', 'dApp', 'protocol']
    };
    
    const result = await this.makeRequest(
      'POST', 
      '/api/mentoring/requests', 
      requestData, 
      this.menteeToken
    );
    
    if (result.success) {
      this.mentoringRequestId = result.data.id;
      this.logStep('Création demande mentoring', true, `ID: ${this.mentoringRequestId}`);
      return true;
    } else {
      this.logStep('Création demande mentoring', false, result.error);
      return false;
    }
  }

  // 3. Assignation du mentor
  async assignMentor() {
    console.log('\n👨‍🏫 ÉTAPE 3: Assignation du mentor');
    
    const result = await this.makeRequest(
      'POST',
      `/api/mentoring/requests/${this.mentoringRequestId}/assign`,
      {},
      this.mentorToken
    );
    
    if (result.success) {
      this.logStep('Assignation mentor', true, 'Mentor assigné à la demande');
      return true;
    } else {
      this.logStep('Assignation mentor', false, result.error);
      return false;
    }
  }

  // 4. Création de la preuve de mentoring (RGB)
  async createMentoringProof() {
    console.log('\n🏆 ÉTAPE 4: Création preuve de mentoring');
    
    const proofData = {
      request_id: this.mentoringRequestId,
      mentor_id: 'mentor-uuid', // À récupérer dynamiquement 
      mentee_id: 'mentee-uuid', // À récupérer dynamiquement
      rating: 5,
      comment: 'Excellent mentoring! J\'ai maintenant une bonne compréhension de RGB.'
    };
    
    const result = await this.makeRequest(
      'POST',
      '/api/mentoring/proofs',
      proofData,
      this.mentorToken
    );
    
    if (result.success) {
      this.proofId = result.data.proof.id;
      this.results.tokens_earned = 50; // Supposons 50 tokens T4G par mentoring réussi
      this.logStep('Création preuve RGB', true, 
        `Proof ID: ${this.proofId}, Tokens gagnés: ${this.results.tokens_earned}`);
      return true;
    } else {
      this.logStep('Création preuve RGB', false, result.error);
      return false;
    }
  }

  // 5. Vérification des tokens T4G
  async checkTokenBalance() {
    console.log('\n💰 ÉTAPE 5: Vérification solde tokens');
    
    const result = await this.makeRequest(
      'GET',
      '/api/users/me/wallet',
      null,
      this.mentorToken
    );
    
    if (result.success) {
      const balance = result.data.balance_tokens || 0;
      this.results.final_balance = balance;
      this.logStep('Vérification solde', true, `Balance: ${balance} T4G tokens`);
      return balance >= this.results.tokens_earned;
    } else {
      this.logStep('Vérification solde', false, result.error);
      return false;
    }
  }

  // 6. Création d'un service à acheter
  async createService() {
    console.log('\n🛍️ ÉTAPE 6: Création service à acheter');
    
    const result = await this.makeRequest(
      'POST',
      '/api/services',
      CONFIG.SERVICE,
      this.mentorToken
    );
    
    if (result.success) {
      this.serviceId = result.data.id;
      this.logStep('Création service', true, `Service ID: ${this.serviceId}`);
      return true;
    } else {
      this.logStep('Création service', false, result.error);
      return false;
    }
  }

  // 7. Achat du service avec tokens T4G
  async buyServiceWithTokens() {
    console.log('\n💳 ÉTAPE 7: Achat service avec tokens T4G');
    
    const purchaseData = {
      service_id: this.serviceId,
      payment_method: 'tokens',
      amount_tokens: CONFIG.SERVICE.price_tokens
    };
    
    const result = await this.makeRequest(
      'POST',
      `/api/services/${this.serviceId}/purchase`,
      purchaseData,
      this.menteeToken // Le mentee achète le service du mentor
    );
    
    if (result.success) {
      this.results.tokens_spent = CONFIG.SERVICE.price_tokens;
      this.results.final_balance -= this.results.tokens_spent;
      this.logStep('Achat service', true, 
        `Service acheté pour ${this.results.tokens_spent} tokens`);
      return true;
    } else {
      this.logStep('Achat service', false, result.error);
      return false;
    }
  }

  // 8. Rapport final
  generateReport() {
    console.log('\n📊 RAPPORT FINAL');
    console.log('================');
    
    const totalSteps = this.results.steps.length;
    const successfulSteps = this.results.steps.filter(s => s.success).length;
    const successRate = ((successfulSteps / totalSteps) * 100).toFixed(1);
    
    console.log(`📈 Taux de réussite: ${successRate}% (${successfulSteps}/${totalSteps})`);
    console.log(`💰 Tokens gagnés: ${this.results.tokens_earned} T4G`);
    console.log(`💸 Tokens dépensés: ${this.results.tokens_spent} T4G`);
    console.log(`💳 Solde final: ${this.results.final_balance} T4G`);
    
    if (this.results.errors.length > 0) {
      console.log('\n❌ ERREURS RENCONTRÉES:');
      this.results.errors.forEach((error, i) => {
        console.log(`${i + 1}. ${error.step}: ${error.details}`);
      });
    }
    
    // Sauvegarder le rapport
    const reportFile = `test-report-${new Date().toISOString().split('T')[0]}.json`;
    fs.writeFileSync(reportFile, JSON.stringify(this.results, null, 2));
    console.log(`\n📄 Rapport sauvegardé: ${reportFile}`);
  }

  // Exécution du test complet
  async runFullTest() {
    console.log('🚀 DÉBUT DU TEST TOKEN4GOOD RGB');
    console.log('================================');
    
    try {
      // Exécuter toutes les étapes séquentiellement
      if (!await this.createTestAccounts()) return;
      if (!await this.createMentoringRequest()) return;
      if (!await this.assignMentor()) return;
      if (!await this.createMentoringProof()) return;
      if (!await this.checkTokenBalance()) return;
      if (!await this.createService()) return;
      if (!await this.buyServiceWithTokens()) return;
      
      console.log('\n🎉 TEST COMPLET RÉUSSI!');
      
    } catch (error) {
      console.error('\n💥 ERREUR CRITIQUE:', error.message);
      this.logStep('Test global', false, error.message);
    } finally {
      this.generateReport();
    }
  }
}

// Execution
if (require.main === module) {
  const tester = new Token4GoodTester();
  tester.runFullTest().catch(console.error);
}

module.exports = Token4GoodTester;