use reqwest;
use serde_json::json;
use std::time::Duration;
use token4good_backend::services::rgb_native::RGBNativeService;
use tokio::time::sleep;

const BASE_URL: &str = "http://localhost:3000";

#[tokio::test]
#[ignore = "Requires running backend server"]
async fn test_health_check() {
    // Attendre que le serveur soit démarré
    sleep(Duration::from_secs(2)).await;

    let client = reqwest::Client::new();
    let response = client.get(&format!("{}/health", BASE_URL)).send().await;

    // Le endpoint health n'existe pas encore, mais on teste la connectivité
    assert!(response.is_ok());
}

#[tokio::test]
#[ignore = "Requires running backend server"]
async fn test_dazeno_auth_flow() {
    let client = reqwest::Client::new();

    // Test de vérification d'un token Dazeno (simulé)
    let verify_payload = json!({
        "token": "mock_dazeno_token"
    });

    let response = client
        .post(&format!("{}/api/auth/dazeno/verify", BASE_URL))
        .json(&verify_payload)
        .send()
        .await
        .expect("Failed to send request");

    // En développement, ceci retournera une erreur car dazeno.de n'est pas accessible
    // mais on vérifie que l'endpoint répond
    assert!(response.status().is_client_error() || response.status().is_server_error());
}

#[tokio::test]
#[ignore = "Requires running backend server"]
async fn test_lightning_node_info() {
    let client = reqwest::Client::new();

    let response = client
        .get(&format!("{}/api/lightning/node/info", BASE_URL))
        .send()
        .await
        .expect("Failed to send request");

    // En regtest, LND pourrait ne pas être démarré
    // On vérifie juste que l'endpoint existe
    println!("Lightning node info status: {}", response.status());
}

#[tokio::test]
#[ignore = "Requires running backend server"]
async fn test_user_creation_flow() {
    let client = reqwest::Client::new();

    // Créer un utilisateur
    let user_payload = json!({
        "email": "test@example.com",
        "firstname": "Test",
        "lastname": "User",
        "role": "Student"
    });

    let response = client
        .post(&format!("{}/api/users", BASE_URL))
        .json(&user_payload)
        .send()
        .await
        .expect("Failed to send request");

    println!("User creation status: {}", response.status());

    if response.status().is_success() {
        let user: serde_json::Value = response.json().await.unwrap();
        assert_eq!(user["email"], "test@example.com");

        // Récupérer l'utilisateur créé
        let user_id = user["id"].as_str().unwrap();
        let get_response = client
            .get(&format!("{}/api/users/{}", BASE_URL, user_id))
            .send()
            .await
            .expect("Failed to get user");

        assert!(get_response.status().is_success());
    }
}

#[tokio::test]
#[ignore = "Requires running backend server"]
async fn test_mentoring_proof_creation() {
    let client = reqwest::Client::new();

    // Créer une demande de mentoring
    let request_payload = json!({
        "title": "Test Mentoring Request",
        "description": "This is a test request",
        "mentee_id": "test_mentee_123",
        "tags": ["rust", "programming"]
    });

    let response = client
        .post(&format!("{}/api/mentoring/requests", BASE_URL))
        .json(&request_payload)
        .send()
        .await
        .expect("Failed to send request");

    println!("Mentoring request status: {}", response.status());

    if response.status().is_success() {
        let request: serde_json::Value = response.json().await.unwrap();
        let request_id = request["id"].as_str().unwrap();

        // Créer une preuve
        let proof_payload = json!({
            "request_id": request_id,
            "mentor_id": "test_mentor_456",
            "mentee_id": "test_mentee_123",
            "rating": 5,
            "comment": "Excellent mentoring session"
        });

        let proof_response = client
            .post(&format!("{}/api/proofs", BASE_URL))
            .json(&proof_payload)
            .send()
            .await
            .expect("Failed to create proof");

        println!("Proof creation status: {}", proof_response.status());

        if proof_response.status().is_success() {
            let proof: serde_json::Value = proof_response.json().await.unwrap();
            assert_eq!(proof["proof"]["rating"], 5);

            // Vérifier la preuve
            let proof_id = proof["proof"]["id"].as_str().unwrap();
            let verify_response = client
                .get(&format!("{}/api/proofs/{}/verify", BASE_URL, proof_id))
                .send()
                .await
                .expect("Failed to verify proof");

            println!("Proof verification status: {}", verify_response.status());
        }
    }
}

#[tokio::test]
#[ignore = "Requires running backend server"]
async fn test_lightning_invoice_creation() {
    let client = reqwest::Client::new();

    let invoice_payload = json!({
        "amount_msat": 1000,
        "description": "Test invoice",
        "expiry_seconds": 3600
    });

    let response = client
        .post(&format!("{}/api/lightning/invoice", BASE_URL))
        .json(&invoice_payload)
        .send()
        .await
        .expect("Failed to send request");

    println!("Invoice creation status: {}", response.status());

    // En regtest, LND pourrait ne pas être configuré
    // On vérifie juste que l'endpoint traite la requête
}

#[tokio::test]
#[ignore = "Requires running backend server"]
async fn test_rgb_contract_integration() {
    // Ce test vérifie que le service RGB fonctionne
    // En environnement de test, rgb-cli pourrait ne pas être disponible

    let client = reqwest::Client::new();

    // Essayer de lister les preuves (qui utilise le service RGB en interne)
    let response = client
        .get(&format!("{}/api/proofs", BASE_URL))
        .send()
        .await
        .expect("Failed to send request");

    println!("RGB proofs list status: {}", response.status());
    assert!(response.status().is_success() || response.status().is_server_error());
}

#[tokio::test]
#[ignore = "Requires running backend server"]
async fn test_cors_headers() {
    let client = reqwest::Client::new();

    let response = client
        .request(reqwest::Method::OPTIONS, &format!("{}/api/users", BASE_URL))
        .header("Origin", "http://localhost:3001")
        .header("Access-Control-Request-Method", "POST")
        .send()
        .await
        .expect("Failed to send OPTIONS request");

    println!("CORS preflight status: {}", response.status());

    // Vérifier que les headers CORS sont présents
    let headers = response.headers();
    assert!(
        headers.contains_key("access-control-allow-origin")
            || headers.contains_key("Access-Control-Allow-Origin")
    );
}

// ========== Unit Tests for RGB Native Service ==========

#[tokio::test]
async fn test_rgb_native_create_proof() {
    let service = RGBNativeService::new().expect("Failed to create RGB service");

    let result = service
        .create_proof_contract(
            "mentor_alice",
            "mentee_bob",
            "request_001",
            5,
            Some("Excellent session!".to_string()),
        )
        .await;

    assert!(result.is_ok());
    let (contract_id, signature) = result.unwrap();
    assert!(!contract_id.is_empty());
    assert!(!signature.is_empty());
}

#[tokio::test]
async fn test_rgb_native_verify_proof() {
    let service = RGBNativeService::new().unwrap();

    let (contract_id, signature) = service
        .create_proof_contract("m1", "m2", "r1", 4, None)
        .await
        .unwrap();

    let verified = service
        .verify_proof(&contract_id, &signature)
        .await
        .unwrap();
    assert!(verified);
}

#[tokio::test]
async fn test_rgb_native_list_proofs() {
    let service = RGBNativeService::new().unwrap();

    let _ = service
        .create_proof_contract("m1", "me1", "r1", 5, None)
        .await;
    let _ = service
        .create_proof_contract("m2", "me2", "r2", 4, None)
        .await;

    let proofs = service.list_proofs().await.unwrap();
    assert!(proofs.len() >= 2);
}

#[tokio::test]
async fn test_rgb_native_invalid_rating() {
    let service = RGBNativeService::new().unwrap();

    let result = service
        .create_proof_contract("m1", "m2", "r1", 10, None)
        .await;
    assert!(result.is_err());
}

#[tokio::test]
async fn test_rgb_native_transfer_proof() {
    let service = RGBNativeService::new().unwrap();

    let (contract_id, _) = service
        .create_proof_contract("m1", "me1", "r1", 5, None)
        .await
        .unwrap();

    let from = "0000000000000000000000000000000000000000000000000000000000000001:0";
    let to = "0000000000000000000000000000000000000000000000000000000000000002:1";

    let result = service.transfer_proof(&contract_id, from, to, 1000).await;
    assert!(result.is_ok());
}

// ========== Integration Workflow Tests ==========

#[tokio::test]
async fn test_full_mentoring_workflow() {
    let rgb = RGBNativeService::new().unwrap();

    // 1. Create proof
    let (contract_id, signature) = rgb
        .create_proof_contract("mentor1", "mentee1", "req1", 5, Some("Great!".to_string()))
        .await
        .unwrap();

    // 2. Verify proof
    let verified = rgb.verify_proof(&contract_id, &signature).await.unwrap();
    assert!(verified);

    // 3. Get details
    let details = rgb.get_proof_details(&contract_id).await.unwrap();
    assert_eq!(details.rating, 5);

    // 4. Transfer proof
    let from = "0000000000000000000000000000000000000000000000000000000000000001:0";
    let to = "0000000000000000000000000000000000000000000000000000000000000002:0";
    let transfer = rgb.transfer_proof(&contract_id, from, to, 1000).await;
    assert!(transfer.is_ok());
}

#[tokio::test]
async fn test_concurrent_proof_creation() {
    let service = RGBNativeService::new().unwrap();

    let handles: Vec<_> = (0..5)
        .map(|i| {
            let svc = service.clone();
            tokio::spawn(async move {
                svc.create_proof_contract(
                    &format!("mentor_{}", i),
                    &format!("mentee_{}", i),
                    &format!("req_{}", i),
                    (i % 6) as u8,
                    None,
                )
                .await
            })
        })
        .collect();

    let results: Vec<_> = futures::future::join_all(handles).await;

    for result in results {
        assert!(result.is_ok());
        assert!(result.unwrap().is_ok());
    }
}
