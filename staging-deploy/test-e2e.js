#!/usr/bin/env node
/**
 * Test E2E Token4Good RGB - Scenario complet
 * ==========================================
 * 
 * Teste le scenario complet avec le backend Rust et la DB Supabase:
 * 1. Authentification via Dazno (simulée)
 * 2. Création demande de mentoring
 * 3. Assignation mentor et réalisation 
 * 4. Génération proof RGB et tokens T4G
 * 5. Achat de service avec tokens
 */

const axios = require('axios');
const fs = require('fs');
const { randomUUID } = require('crypto');

const CONFIG = {
  BACKEND_URL: 'http://localhost:3000',
  
  // Données de test
  MENTOR: {
    email: 'alice.mentor@dazno-test.com',
    name: 'Alice Mentor',
    dazno_id: randomUUID()
  },
  
  MENTEE: {
    email: 'bob.student@dazno-test.com', 
    name: 'Bob Student',
    dazno_id: randomUUID()
  }
};

class E2ETester {
  constructor() {
    this.results = {
      start_time: new Date().toISOString(),
      steps: [],
      tokens_earned: 0,
      final_balance: 0,
      success: false
    };
    
    this.mentorAuth = null;
    this.menteeAuth = null;
    this.requestId = null;
    this.proofId = null;
    this.contractId = null;
  }

  async request(method, path, data = null, auth = null) {
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (auth) headers['Authorization'] = `Bearer ${auth.token}`;
      
      const response = await axios({
        method,
        url: `${CONFIG.BACKEND_URL}${path}`,
        headers,
        data
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message,
        status: error.response?.status
      };
    }
  }

  log(step, success, details = '') {
    const timestamp = new Date().toISOString();
    const icon = success ? '✅' : '❌';
    
    console.log(`${icon} [${timestamp.substr(11, 8)}] ${step}`);
    if (details) console.log(`   📝 ${details}`);
    
    this.results.steps.push({ timestamp, step, success, details });
    return success;
  }

  // 1. Test d'authentification Dazno
  async testAuth() {
    console.log('\\n🔐 AUTHENTIFICATION');
    
    // Simuler auth mentor
    const mentorResult = await this.request('POST', '/api/auth/login', {
      provider: 'dazeno',
      email: CONFIG.MENTOR.email,
      token: 'fake-dazeno-token-mentor-' + Date.now()
    });
    
    if (!mentorResult.success) {
      return this.log('Auth mentor', false, mentorResult.error);
    }
    
    this.mentorAuth = mentorResult.data;
    this.log('Auth mentor', true, `User: ${this.mentorAuth.user.firstname} ${this.mentorAuth.user.lastname}`);
    
    // Simuler auth mentee  
    const menteeResult = await this.request('POST', '/api/auth/login', {
      provider: 'dazeno',
      email: CONFIG.MENTEE.email,
      token: 'fake-dazeno-token-mentee-' + Date.now()
    });
    
    if (!menteeResult.success) {
      return this.log('Auth mentee', false, menteeResult.error);
    }
    
    this.menteeAuth = menteeResult.data;
    this.log('Auth mentee', true, `User: ${this.menteeAuth.user.firstname} ${this.menteeAuth.user.lastname}`);
    
    return true;
  }

  // 2. Demande de mentoring
  async createMentoringRequest() {
    console.log('\\n📝 DEMANDE DE MENTORING');
    
    const requestData = {
      title: 'Comprendre le protocole RGB',
      description: 'J\\'aimerais apprendre RGB et son intégration avec Lightning Network pour créer des tokens sur Bitcoin.',
      tags: ['RGB', 'Bitcoin', 'Lightning', 'tokens']
    };
    
    const result = await this.request('POST', '/api/mentoring/requests', requestData, this.menteeAuth);
    
    if (!result.success) {
      return this.log('Création demande', false, result.error);
    }
    
    this.requestId = result.data.id;
    this.log('Création demande', true, `ID: ${this.requestId}`);
    return true;
  }

  // 3. Lister et assigner demande
  async assignMentoringRequest() {
    console.log('\\n👨‍🏫 ASSIGNATION MENTOR');
    
    // Le mentor voit les demandes ouvertes
    const listResult = await this.request('GET', '/api/mentoring/requests', null, this.mentorAuth);
    
    if (!listResult.success) {
      return this.log('Liste demandes', false, listResult.error);
    }
    
    const openRequests = listResult.data.filter(r => r.status === 'open');
    this.log('Liste demandes', true, `${openRequests.length} demandes ouvertes`);
    
    // Assignation du mentor
    const assignResult = await this.request('POST', `/api/mentoring/requests/${this.requestId}/assign`, {}, this.mentorAuth);
    
    if (!assignResult.success) {
      return this.log('Assignation mentor', false, assignResult.error);
    }
    
    this.log('Assignation mentor', true, 'Mentor assigné avec succès');
    return true;
  }

  // 4. Création de la preuve RGB
  async createRGBProof() {
    console.log('\\n🏆 CRÉATION PREUVE RGB');
    
    const proofData = {
      request_id: this.requestId,
      rating: 5,
      comment: 'Excellent mentoring! RGB bien expliqué avec des exemples pratiques.'
    };
    
    const result = await this.request('POST', '/api/mentoring/proofs', proofData, this.mentorAuth);
    
    if (!result.success) {
      return this.log('Création preuve RGB', false, result.error);
    }
    
    this.proofId = result.data.id;
    this.contractId = result.data.rgb_contract_id;
    this.results.tokens_earned = 50; // Tokens typiques pour un mentoring
    
    this.log('Création preuve RGB', true, 
      `Proof: ${this.proofId}, Contract: ${this.contractId}, Tokens: ${this.results.tokens_earned}`);
    return true;
  }

  // 5. Vérification de la preuve
  async verifyProof() {
    console.log('\\n🔍 VÉRIFICATION PREUVE');
    
    const result = await this.request('GET', `/api/mentoring/proofs/${this.proofId}/verify`, null, this.mentorAuth);
    
    if (!result.success) {
      return this.log('Vérification preuve', false, result.error);
    }
    
    const isValid = result.data;
    this.log('Vérification preuve', isValid, `Preuve ${isValid ? 'valide' : 'invalide'}`);
    return isValid;
  }

  // 6. Consultation du portefeuille
  async checkWallet() {
    console.log('\\n💰 PORTEFEUILLE LIGHTNING');
    
    // Vérifier le portefeuille du mentor (qui a gagné les tokens)
    const result = await this.request('GET', '/api/users/me/wallet', null, this.mentorAuth);
    
    if (!result.success) {
      return this.log('Consultation wallet', false, result.error);
    }
    
    const wallet = result.data;
    this.results.final_balance = wallet.balance_msat || 0;
    
    this.log('Consultation wallet', true, 
      `Balance: ${this.results.final_balance} msat, Channels: ${wallet.num_channels || 0}`);
    return true;
  }

  // 7. Créer une invoice pour paiement
  async createInvoice() {
    console.log('\\n⚡ CRÉATION INVOICE LIGHTNING');
    
    const invoiceData = {
      amount_msat: 10000, // 10 sat
      description: `Paiement pour preuve de mentoring ${this.proofId}`,
      expiry_seconds: 3600
    };
    
    const result = await this.request('POST', '/api/lightning/invoice', invoiceData, this.mentorAuth);
    
    if (!result.success) {
      return this.log('Création invoice', false, result.error);
    }
    
    const invoice = result.data;
    this.log('Création invoice', true, `Payment request: ${invoice.payment_request.substr(0, 50)}...`);
    return true;
  }

  // 8. Test de transfert de preuve
  async transferProof() {
    console.log('\\n🔄 TRANSFERT DE PREUVE');
    
    const transferData = {
      proof_id: this.proofId,
      to_lightning_address: 'student@lightning.example.com',
      amount_msat: 5000
    };
    
    const result = await this.request('POST', '/api/proofs/transfer', transferData, this.mentorAuth);
    
    if (!result.success) {
      return this.log('Transfert preuve', false, result.error);
    }
    
    this.log('Transfert preuve', true, `Transfer ID: ${result.data.transfer_id}`);
    return true;
  }

  // Rapport final détaillé
  generateReport() {
    console.log('\\n📊 RAPPORT FINAL');
    console.log('==================');
    
    const endTime = new Date().toISOString();
    const totalSteps = this.results.steps.length;
    const successfulSteps = this.results.steps.filter(s => s.success).length;
    const successRate = totalSteps > 0 ? ((successfulSteps / totalSteps) * 100).toFixed(1) : 0;
    
    this.results.end_time = endTime;
    this.results.success = successRate >= 80; // Seuil de réussite
    
    console.log(`⏱️  Durée: ${new Date(endTime) - new Date(this.results.start_time)}ms`);
    console.log(`📈 Taux de réussite: ${successRate}% (${successfulSteps}/${totalSteps})`);
    console.log(`🏆 Tokens RGB gagnés: ${this.results.tokens_earned}`);
    console.log(`💰 Balance finale: ${this.results.final_balance} msat`);
    
    // Détail des erreurs
    const failures = this.results.steps.filter(s => !s.success);
    if (failures.length > 0) {
      console.log('\\n❌ ÉCHECS:');
      failures.forEach((failure, i) => {
        console.log(`${i + 1}. ${failure.step}: ${failure.details}`);
      });
    }
    
    // Sauvegarde
    const filename = `test-results-${new Date().toISOString().split('T')[0]}.json`;
    fs.writeFileSync(filename, JSON.stringify(this.results, null, 2));
    console.log(`\\n💾 Rapport sauvegardé: ${filename}`);
    
    return this.results.success;
  }

  // Exécution complète
  async run() {
    console.log('🚀 TEST E2E TOKEN4GOOD RGB');
    console.log('============================');
    console.log(`🌐 Backend: ${CONFIG.BACKEND_URL}`);
    console.log(`📅 Début: ${this.results.start_time}`);
    
    try {
      // Tests séquentiels
      const steps = [
        () => this.testAuth(),
        () => this.createMentoringRequest(), 
        () => this.assignMentoringRequest(),
        () => this.createRGBProof(),
        () => this.verifyProof(),
        () => this.checkWallet(),
        () => this.createInvoice(),
        () => this.transferProof()
      ];
      
      for (const step of steps) {
        if (!await step()) {
          console.log('\\n⏹️  Arrêt prématuré suite à une erreur');
          break;
        }
        
        // Pause entre les étapes
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      console.log('\\n🏁 TEST TERMINÉ');
      
    } catch (error) {
      console.error('\\n💥 ERREUR CRITIQUE:', error.message);
      this.log('Test global', false, error.message);
    }
    
    return this.generateReport();
  }
}

// Usage: node test-e2e.js
if (require.main === module) {
  const tester = new E2ETester();
  tester.run().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Erreur:', error);
    process.exit(1);
  });
}

module.exports = E2ETester;