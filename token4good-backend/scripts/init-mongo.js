// MongoDB initialization script
db = db.getSiblingDB('token4good');

// Create collections
db.createCollection('users');
db.createCollection('mentoring_requests');
db.createCollection('proofs');
db.createCollection('transactions');

// Create indexes for better performance

// Users collection indexes
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "lightning_address": 1 }, { unique: true });
db.users.createIndex({ "role": 1 });
db.users.createIndex({ "created_at": 1 });

// Mentoring requests indexes
db.mentoring_requests.createIndex({ "mentee_id": 1 });
db.mentoring_requests.createIndex({ "mentor_id": 1 });
db.mentoring_requests.createIndex({ "status": 1 });
db.mentoring_requests.createIndex({ "created_at": 1 });
db.mentoring_requests.createIndex({ "tags": 1 });

// Proofs collection indexes
db.proofs.createIndex({ "rgb_contract_id": 1 }, { unique: true });
db.proofs.createIndex({ "mentor_id": 1 });
db.proofs.createIndex({ "mentee_id": 1 });
db.proofs.createIndex({ "request_id": 1 });
db.proofs.createIndex({ "status": 1 });
db.proofs.createIndex({ "created_at": 1 });

// Transactions collection indexes
db.transactions.createIndex({ "user_id": 1 });
db.transactions.createIndex({ "transaction_type": 1 });
db.transactions.createIndex({ "status": 1 });
db.transactions.createIndex({ "created_at": 1 });
db.transactions.createIndex({ "lightning_payment_hash": 1 });

// Insert sample data for development
if (db.users.countDocuments() === 0) {
    print("Inserting sample data...");
    
    // Sample users
    db.users.insertMany([
        {
            id: "admin-123",
            email: "admin@token4good.com",
            firstname: "Admin",
            lastname: "User",
            lightning_address: "admin@lightning.token4good.com",
            role: "SERVICE_PROVIDER",
            username: "admin",
            bio: "System administrator",
            score: 1000,
            avatar: null,
            created_at: new Date(),
            updated_at: new Date(),
            is_active: true,
            wallet_address: null,
            preferences: {}
        },
        {
            id: "student-456",
            email: "student@example.com",
            firstname: "Student",
            lastname: "Example",
            lightning_address: "student456@lightning.token4good.com",
            role: "STUDENT",
            username: "student456",
            bio: "Computer science student",
            score: 50,
            avatar: null,
            created_at: new Date(),
            updated_at: new Date(),
            is_active: true,
            wallet_address: null,
            preferences: {}
        },
        {
            id: "alumni-789",
            email: "alumni@example.com",
            firstname: "Alumni",
            lastname: "Example",
            lightning_address: "alumni789@lightning.token4good.com",
            role: "ALUMNI",
            username: "alumni789",
            bio: "Software engineer and mentor",
            score: 500,
            avatar: null,
            created_at: new Date(),
            updated_at: new Date(),
            is_active: true,
            wallet_address: null,
            preferences: {}
        }
    ]);

    // Sample mentoring requests
    db.mentoring_requests.insertMany([
        {
            id: "req-001",
            title: "Help with Rust programming",
            description: "I need help understanding ownership and borrowing in Rust",
            status: "Open",
            mentee_id: "student-456",
            mentor_id: null,
            tags: ["rust", "programming", "ownership"],
            created_at: new Date(),
            updated_at: new Date()
        },
        {
            id: "req-002",
            title: "Career guidance in tech",
            description: "Looking for advice on career transition to software development",
            status: "Assigned",
            mentee_id: "student-456",
            mentor_id: "alumni-789",
            tags: ["career", "advice", "tech"],
            created_at: new Date(),
            updated_at: new Date()
        }
    ]);

    print("Sample data inserted successfully!");
}

print("MongoDB initialization completed!");