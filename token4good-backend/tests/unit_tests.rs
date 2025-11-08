use token4good_backend::services::rgb_native::RGBNativeService;

#[test]
fn test_rgb_service_creation() {
    let service = RGBNativeService::new();
    assert!(
        service.is_ok(),
        "RGB service should be created successfully"
    );
}

#[tokio::test]
async fn test_proof_validation() {
    let service = RGBNativeService::new().expect("Failed to create RGB service");

    // Test with invalid rating (should be 0-5)
    let result = service
        .create_proof_contract(
            "mentor_test",
            "mentee_test",
            "request_123",
            10, // Invalid rating
            None,
        )
        .await;

    assert!(result.is_err(), "Should fail with invalid rating");
}

#[tokio::test]
async fn test_proof_creation_with_valid_data() {
    let service = RGBNativeService::new().expect("Failed to create RGB service");

    let result = service
        .create_proof_contract(
            "mentor_alice",
            "mentee_bob",
            "request_001",
            5,
            Some("Excellent mentoring session".to_string()),
        )
        .await;

    assert!(
        result.is_ok(),
        "Proof creation should succeed with valid data"
    );

    if let Ok((contract_id, signature)) = result {
        assert!(!contract_id.is_empty(), "Contract ID should not be empty");
        assert!(!signature.is_empty(), "Signature should not be empty");
    }
}

#[tokio::test]
async fn test_rating_boundaries() {
    let service = RGBNativeService::new().unwrap();

    // Test rating 0 (valid)
    let result_0 = service
        .create_proof_contract("m1", "m2", "r1", 0, None)
        .await;
    assert!(result_0.is_ok(), "Rating 0 should be valid");

    // Test rating 5 (valid)
    let result_5 = service
        .create_proof_contract("m3", "m4", "r2", 5, None)
        .await;
    assert!(result_5.is_ok(), "Rating 5 should be valid");

    // Test rating 6 (invalid)
    let result_6 = service
        .create_proof_contract("m5", "m6", "r3", 6, None)
        .await;
    assert!(result_6.is_err(), "Rating 6 should be invalid");
}

#[tokio::test]
async fn test_proof_verification() {
    let service = RGBNativeService::new().unwrap();

    // Create a proof
    let (contract_id, signature) = service
        .create_proof_contract("mentor1", "mentee1", "req1", 4, None)
        .await
        .expect("Failed to create proof");

    // Verify the proof
    let is_valid = service
        .verify_proof(&contract_id, &signature)
        .await
        .expect("Failed to verify proof");

    assert!(is_valid, "Proof should be valid");
}

#[tokio::test]
async fn test_list_proofs() {
    let service = RGBNativeService::new().unwrap();

    // Create some proofs
    let _ = service
        .create_proof_contract("m1", "me1", "r1", 5, None)
        .await;
    let _ = service
        .create_proof_contract("m2", "me2", "r2", 4, None)
        .await;

    // List all proofs
    let proofs = service.list_proofs().await.expect("Failed to list proofs");

    assert!(proofs.len() >= 2, "Should have at least 2 proofs");
}
