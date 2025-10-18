use sqlx::{PgPool, Row};
use serde::{Deserialize, Serialize};
use std::error::Error;
use uuid::Uuid;

use crate::models::{
    user::User,
    proof::Proof,
    mentoring::{MentoringRequest, MentoringProof},
};

#[derive(Debug, sqlx::FromRow)]
struct ProofRow {
    pub id: String,
    pub contract_id: String,
    pub mentor_id: String,
    pub mentee_id: String,
    pub request_id: String,
    pub rating: i16,
    pub comment: String,
    pub status: String,
    pub signature: String,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Clone)]
pub struct DatabaseService {
    pool: PgPool,
}

impl DatabaseService {
    pub async fn new(database_url: &str) -> Result<Self, Box<dyn Error>> {
        tracing::info!("Attempting to connect to database: {}", database_url.split('@').last().unwrap_or("hidden"));

        match PgPool::connect(database_url).await {
            Ok(pool) => {
                tracing::info!("Database connection established");

                // Run migrations
                if let Err(e) = sqlx::migrate!("./migrations").run(&pool).await {
                    tracing::warn!("Migration failed (non-critical): {}", e);
                }

                Ok(Self { pool })
            }
            Err(e) => {
                tracing::warn!("Database connection failed: {}. Creating dummy pool", e);
                // For now, return error - we'll handle this in build_state
                Err(Box::new(e))
            }
        }
    }

    // User operations
    pub async fn create_user(&self, user: &User) -> Result<(), Box<dyn Error>> {
        sqlx::query(
            r#"
            INSERT INTO users (id, email, firstname, lastname, lightning_address, role, username, bio, score, avatar, created_at, updated_at, is_active, wallet_address, preferences, is_onboarded)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
            "#
        )
        .bind(&user.id)
        .bind(&user.email)
        .bind(&user.firstname)
        .bind(&user.lastname)
        .bind(&user.lightning_address)
        .bind(user.role.to_string())
        .bind(&user.username)
        .bind(&user.bio)
        .bind(user.score as i32)
        .bind(&user.avatar)
        .bind(&user.created_at)
        .bind(&user.updated_at)
        .bind(user.is_active)
        .bind(&user.wallet_address)
        .bind(&user.preferences)
        .bind(user.is_onboarded)
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    pub async fn find_user_by_id(&self, id: &str) -> Result<Option<User>, Box<dyn Error>> {
        let row = sqlx::query(
            "SELECT id, email, firstname, lastname, lightning_address, role, username, bio, score, avatar, created_at, updated_at, is_active, wallet_address, preferences, email_verified, last_login, is_onboarded FROM users WHERE id = $1"
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await?;

        if let Some(row) = row {
            let user = User {
                id: row.try_get("id")?,
                email: row.try_get("email")?,
                firstname: row.try_get("firstname")?,
                lastname: row.try_get("lastname")?,
                lightning_address: row.try_get("lightning_address")?,
                role: row.try_get::<String, _>("role")?.parse().unwrap_or(crate::models::user::UserRole::Alumni),
                username: row.try_get("username")?,
                bio: row.try_get("bio").ok(),
                score: row.try_get::<i32, _>("score")? as u32,
                avatar: row.try_get("avatar").ok(),
                created_at: row.try_get("created_at")?,
                updated_at: row.try_get("updated_at")?,
                is_active: row.try_get("is_active")?,
                wallet_address: row.try_get("wallet_address").ok(),
                preferences: row.try_get("preferences")?,
                email_verified: row.try_get("email_verified").unwrap_or(false),
                last_login: row.try_get("last_login").ok(),
                is_onboarded: row.try_get("is_onboarded").unwrap_or(false),
            };
            Ok(Some(user))
        } else {
            Ok(None)
        }
    }

    pub async fn get_user_by_email(&self, email: &str) -> Result<Option<User>, Box<dyn Error>> {
        let row = sqlx::query!(
            "SELECT * FROM users WHERE email = $1",
            email
        )
        .fetch_optional(&self.pool)
        .await?;

        if let Some(row) = row {
            let user = User {
                id: row.id,
                email: row.email,
                firstname: row.firstname,
                lastname: row.lastname,
                lightning_address: row.lightning_address,
                role: row.role.parse().unwrap_or(crate::models::user::UserRole::Alumni),
                username: row.username,
                bio: row.bio,
                score: row.score as u32,
                avatar: row.avatar,
                created_at: row.created_at,
                updated_at: row.updated_at,
                is_active: row.is_active,
                wallet_address: row.wallet_address,
                preferences: row.preferences,
                email_verified: row.email_verified.unwrap_or(false),
                last_login: row.last_login,
                is_onboarded: row.is_onboarded.unwrap_or(false),
            };
            Ok(Some(user))
        } else {
            Ok(None)
        }
    }

    pub async fn ping(&self) -> Result<(), Box<dyn Error>> {
        sqlx::query_scalar::<_, i32>("SELECT 1")
            .fetch_one(&self.pool)
            .await?;
        Ok(())
    }

    // Proof operations - MentoringProof
    pub async fn create_proof(&self, proof: &MentoringProof) -> Result<(), Box<dyn Error>> {
        sqlx::query!(
            r#"
            INSERT INTO mentoring_proofs (id, mentor_id, mentee_id, request_id, rating, comment, contract_id, signature, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            "#,
            proof.id,
            proof.mentor_id,
            proof.mentee_id,
            proof.request_id,
            proof.rating as i16,
            proof.comment,
            proof.contract_id,
            proof.signature,
            proof.created_at,
            proof.updated_at
        )
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    // Regular Proof operations
    pub async fn create_proof_regular(&self, proof: Proof) -> Result<Proof, Box<dyn Error>> {
        sqlx::query!(
            r#"
            INSERT INTO proofs (id, mentor_id, mentee_id, request_id, rating, comment, contract_id, signature, status, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            "#,
            proof.id,
            proof.mentor_id,
            proof.mentee_id,
            proof.request_id,
            proof.rating as i16,
            proof.comment,
            proof.contract_id,
            proof.signature,
            proof.status.to_string(),
            proof.created_at,
            proof.updated_at
        )
        .execute(&self.pool)
        .await?;

        Ok(proof)
    }

    pub async fn get_proof_by_id(&self, id: &str) -> Result<Option<Proof>, Box<dyn Error>> {
        let row = sqlx::query!(
            "SELECT * FROM proofs WHERE id = $1",
            id
        )
        .fetch_optional(&self.pool)
        .await?;

        if let Some(row) = row {
            let proof = Proof {
                id: row.id,
                contract_id: row.contract_id,
                mentor_id: row.mentor_id,
                mentee_id: row.mentee_id,
                request_id: row.request_id,
                rating: row.rating as u8,
                comment: row.comment,
                status: row.status.parse().unwrap_or(crate::models::proof::ProofStatus::Pending),
                signature: row.signature,
                created_at: row.created_at,
                updated_at: row.updated_at,
            };
            Ok(Some(proof))
        } else {
            Ok(None)
        }
    }

    pub async fn get_proof_by_contract_id(&self, contract_id: &str) -> Result<Option<Proof>, Box<dyn Error>> {
        let row = sqlx::query!(
            "SELECT * FROM proofs WHERE contract_id = $1",
            contract_id
        )
        .fetch_optional(&self.pool)
        .await?;

        if let Some(row) = row {
            let proof = Proof {
                id: row.id,
                contract_id: row.contract_id,
                mentor_id: row.mentor_id,
                mentee_id: row.mentee_id,
                request_id: row.request_id,
                rating: row.rating as u8,
                comment: row.comment,
                status: row.status.parse().unwrap_or(crate::models::proof::ProofStatus::Pending),
                signature: row.signature,
                created_at: row.created_at,
                updated_at: row.updated_at,
            };
            Ok(Some(proof))
        } else {
            Ok(None)
        }
    }

    // Mentoring operations
    pub async fn create_request(&self, request: &MentoringRequest) -> Result<(), Box<dyn Error>> {
        sqlx::query(
            r#"
            INSERT INTO mentoring_requests (id, mentee_id, mentor_id, title, description, status, created_at, tags)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            "#
        )
        .bind(&request.id)
        .bind(&request.mentee_id)
        .bind(&request.mentor_id)
        .bind(&request.title)
        .bind(&request.description)
        .bind(&request.status)
        .bind(&request.created_at)
        .bind(serde_json::to_string(&request.tags).unwrap_or_default())
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    pub async fn find_request_by_id(&self, id: &str) -> Result<Option<MentoringRequest>, Box<dyn Error>> {
        let row = sqlx::query(
            "SELECT id, mentee_id, mentor_id, title, description, status, created_at, tags FROM mentoring_requests WHERE id = $1"
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await?;

        if let Some(row) = row {
            let tags_str: String = row.try_get("tags").unwrap_or_default();
            let tags: Vec<String> = serde_json::from_str(&tags_str).unwrap_or_default();
            
            let request = MentoringRequest {
                id: row.try_get("id")?,
                mentee_id: row.try_get("mentee_id")?,
                mentor_id: row.try_get("mentor_id").ok(),
                title: row.try_get("title")?,
                description: row.try_get("description")?,
                status: row.try_get("status")?,
                created_at: row.try_get("created_at")?,
                tags,
            };
            Ok(Some(request))
        } else {
            Ok(None)
        }
    }

    pub async fn update_request_status(&self, id: &str, status: &str) -> Result<(), Box<dyn Error>> {
        sqlx::query(
            "UPDATE mentoring_requests SET status = $1 WHERE id = $2"
        )
        .bind(status)
        .bind(id)
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    // Additional methods for mentoring routes
    pub async fn find_requests_by_status(&self, status: &str) -> Result<Vec<MentoringRequest>, Box<dyn Error>> {
        let rows = sqlx::query!(
            "SELECT * FROM mentoring_requests WHERE status = $1",
            status
        )
        .fetch_all(&self.pool)
        .await?;

        let requests = rows.into_iter().map(|row| MentoringRequest {
            id: row.id,
            mentee_id: row.mentee_id,
            mentor_id: row.mentor_id,
            category: row.category,
            message: row.message,
            status: row.status,
            created_at: row.created_at,
            updated_at: row.updated_at,
        }).collect();

        Ok(requests)
    }

    pub async fn find_proofs_by_mentor(&self, mentor_id: &str) -> Result<Vec<MentoringProof>, Box<dyn Error>> {
        let rows = sqlx::query!(
            "SELECT * FROM mentoring_proofs WHERE mentor_id = $1",
            mentor_id
        )
        .fetch_all(&self.pool)
        .await?;

        let proofs = rows.into_iter().map(|row| MentoringProof {
            id: row.id,
            mentor_id: row.mentor_id,
            mentee_id: row.mentee_id,
            request_id: row.request_id,
            rating: row.rating as u8,
            comment: row.comment,
            contract_id: row.contract_id,
            signature: row.signature,
            created_at: row.created_at,
            updated_at: row.updated_at,
        }).collect();

        Ok(proofs)
    }

    pub async fn find_proof_by_id(&self, id: &str) -> Result<Option<MentoringProof>, Box<dyn Error>> {
        let row = sqlx::query!(
            "SELECT * FROM mentoring_proofs WHERE id = $1",
            id
        )
        .fetch_optional(&self.pool)
        .await?;

        if let Some(row) = row {
            let proof = MentoringProof {
                id: row.id,
                mentor_id: row.mentor_id,
                mentee_id: row.mentee_id,
                request_id: row.request_id,
                rating: row.rating as u8,
                comment: row.comment,
                contract_id: row.contract_id,
                signature: row.signature,
                created_at: row.created_at,
                updated_at: row.updated_at,
            };
            Ok(Some(proof))
        } else {
            Ok(None)
        }
    }

    // Methods for proofs routes
    pub async fn get_proofs(&self, status: Option<crate::models::proof::ProofStatus>, mentor_id: Option<String>, mentee_id: Option<String>, limit: u32, offset: u32) -> Result<Vec<Proof>, Box<dyn Error>> {
        // Validation des paramètres d'entrée
        if limit > 1000 {
            return Err("Limit cannot exceed 1000 for performance reasons".into());
        }
        
        if offset > 1000000 {
            return Err("Offset too large".into());
        }

        // Validation des IDs UUID si fournis
        if let Some(ref mentor_id) = mentor_id {
            if !crate::middleware::validation::validate_uuid(mentor_id) {
                return Err("Invalid mentor_id format".into());
            }
        }
        
        if let Some(ref mentee_id) = mentee_id {
            if !crate::middleware::validation::validate_uuid(mentee_id) {
                return Err("Invalid mentee_id format".into());
            }
        }

        // Utilisation de requêtes préparées pour éviter l'injection SQL
        let result = match (status, mentor_id, mentee_id) {
            (None, None, None) => {
                sqlx::query_as!(
                    ProofRow,
                    "SELECT id, contract_id, mentor_id, mentee_id, request_id, rating, comment, status, signature, created_at, updated_at 
                     FROM proofs 
                     ORDER BY created_at DESC 
                     LIMIT $1 OFFSET $2",
                    limit as i64,
                    offset as i64
                ).fetch_all(&self.pool).await?
            },
            (Some(status), None, None) => {
                sqlx::query_as!(
                    ProofRow,
                    "SELECT id, contract_id, mentor_id, mentee_id, request_id, rating, comment, status, signature, created_at, updated_at 
                     FROM proofs 
                     WHERE status = $1 
                     ORDER BY created_at DESC 
                     LIMIT $2 OFFSET $3",
                    status.to_string(),
                    limit as i64,
                    offset as i64
                ).fetch_all(&self.pool).await?
            },
            (None, Some(mentor_id), None) => {
                sqlx::query_as!(
                    ProofRow,
                    "SELECT id, contract_id, mentor_id, mentee_id, request_id, rating, comment, status, signature, created_at, updated_at 
                     FROM proofs 
                     WHERE mentor_id = $1 
                     ORDER BY created_at DESC 
                     LIMIT $2 OFFSET $3",
                    mentor_id,
                    limit as i64,
                    offset as i64
                ).fetch_all(&self.pool).await?
            },
            (None, None, Some(mentee_id)) => {
                sqlx::query_as!(
                    ProofRow,
                    "SELECT id, contract_id, mentor_id, mentee_id, request_id, rating, comment, status, signature, created_at, updated_at 
                     FROM proofs 
                     WHERE mentee_id = $1 
                     ORDER BY created_at DESC 
                     LIMIT $2 OFFSET $3",
                    mentee_id,
                    limit as i64,
                    offset as i64
                ).fetch_all(&self.pool).await?
            },
            // Autres combinaisons avec requêtes préparées
            _ => {
                // Fallback avec query builder sécurisé
                self.get_proofs_with_all_filters(status, mentor_id, mentee_id, limit, offset).await?
            }
        };
        
        let proofs = result.into_iter().map(|row| Proof {
            id: row.id,
            contract_id: row.contract_id,
            mentor_id: row.mentor_id,
            mentee_id: row.mentee_id,
            request_id: row.request_id,
            rating: row.rating as u8,
            comment: row.comment,
            status: row.status.parse().unwrap_or(crate::models::proof::ProofStatus::Pending),
            signature: row.signature,
            created_at: row.created_at,
            updated_at: row.updated_at,
        }).collect();

        Ok(proofs)
    }

    // Méthode helper pour les cas complexes avec tous les filtres
    async fn get_proofs_with_all_filters(
        &self,
        status: Option<crate::models::proof::ProofStatus>,
        mentor_id: Option<String>,
        mentee_id: Option<String>,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<ProofRow>, Box<dyn Error>> {
        // Cette méthode utilise sqlx::QueryBuilder pour construire la requête de manière sécurisée
        let mut query_builder = sqlx::QueryBuilder::new(
            "SELECT id, contract_id, mentor_id, mentee_id, request_id, rating, comment, status, signature, created_at, updated_at FROM proofs WHERE 1=1"
        );

        if let Some(status) = status {
            query_builder.push(" AND status = ");
            query_builder.push_bind(status.to_string());
        }

        if let Some(mentor_id) = mentor_id {
            query_builder.push(" AND mentor_id = ");
            query_builder.push_bind(mentor_id);
        }

        if let Some(mentee_id) = mentee_id {
            query_builder.push(" AND mentee_id = ");
            query_builder.push_bind(mentee_id);
        }

        query_builder.push(" ORDER BY created_at DESC LIMIT ");
        query_builder.push_bind(limit as i64);
        query_builder.push(" OFFSET ");
        query_builder.push_bind(offset as i64);

        let query = query_builder.build_query_as::<ProofRow>();
        let result = query.fetch_all(&self.pool).await?;
        
        Ok(result)
    }

    // User methods for users routes
    pub async fn get_users(&self, role: Option<crate::models::user::UserRole>, limit: u32, offset: u32) -> Result<Vec<User>, Box<dyn Error>> {
        let mut query = "SELECT * FROM users WHERE 1=1".to_string();
        let mut params: Vec<String> = vec![];
        let mut param_count = 0;

        if let Some(role) = role {
            param_count += 1;
            query.push_str(&format!(" AND role = ${}", param_count));
            params.push(role.to_string());
        }

        param_count += 1;
        query.push_str(&format!(" LIMIT ${}", param_count));
        params.push(limit.to_string());

        param_count += 1;
        query.push_str(&format!(" OFFSET ${}", param_count));
        params.push(offset.to_string());

        let rows = sqlx::query(&query);
        let mut query_with_params = rows;
        for param in params {
            query_with_params = query_with_params.bind(param);
        }
        
        let result = query_with_params.fetch_all(&self.pool).await?;
        
        let users = result.into_iter().map(|row| User {
            id: row.get("id"),
            email: row.get("email"),
            firstname: row.get("firstname"),
            lastname: row.get("lastname"),
            lightning_address: row.get("lightning_address"),
            role: row.get::<String, _>("role").parse().unwrap_or(crate::models::user::UserRole::Alumni),
            username: row.get("username"),
            bio: row.get("bio"),
            score: row.get::<i32, _>("score") as u32,
            avatar: row.get("avatar"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
            is_active: row.get("is_active"),
            wallet_address: row.get("wallet_address"),
            preferences: row.get("preferences"),
            email_verified: row.get::<Option<bool>, _>("email_verified").unwrap_or(false),
            last_login: row.get("last_login"),
        }).collect();

        Ok(users)
    }

    pub async fn get_user_by_id(&self, user_id: &str) -> Result<Option<User>, Box<dyn Error>> {
        self.find_user_by_id(user_id).await
    }

    pub async fn update_user(&self, id: &str, payload: crate::models::user::UpdateUserRequest) -> Result<Option<User>, Box<dyn Error>> {
        // Build dynamic UPDATE query based on provided fields
        let mut updates = Vec::new();
        let mut values: Vec<String> = Vec::new();
        let mut param_count = 1;

        if let Some(username) = &payload.username {
            updates.push(format!("username = ${}", param_count));
            values.push(username.clone());
            param_count += 1;
        }
        if let Some(bio) = &payload.bio {
            updates.push(format!("bio = ${}", param_count));
            values.push(bio.clone());
            param_count += 1;
        }
        if let Some(avatar) = &payload.avatar {
            updates.push(format!("avatar = ${}", param_count));
            values.push(avatar.clone());
            param_count += 1;
        }
        if let Some(is_onboarded) = payload.is_onboarded {
            updates.push(format!("is_onboarded = ${}", param_count));
            values.push(is_onboarded.to_string());
            param_count += 1;
        }
        
        // Always update updated_at
        updates.push(format!("updated_at = NOW()"));

        if updates.is_empty() {
            return self.find_user_by_id(id).await;
        }

        let query = format!(
            "UPDATE users SET {} WHERE id = ${} RETURNING *",
            updates.join(", "),
            param_count
        );

        // For simplicity, we'll use a simpler approach with sqlx::query
        if let Some(is_onboarded) = payload.is_onboarded {
            sqlx::query(&format!("UPDATE users SET is_onboarded = $1, updated_at = NOW() WHERE id = $2"))
                .bind(is_onboarded)
                .bind(id)
                .execute(&self.pool)
                .await?;
        }

        if let Some(username) = &payload.username {
            sqlx::query(&format!("UPDATE users SET username = $1, updated_at = NOW() WHERE id = $2"))
                .bind(username)
                .bind(id)
                .execute(&self.pool)
                .await?;
        }

        if let Some(bio) = &payload.bio {
            sqlx::query(&format!("UPDATE users SET bio = $1, updated_at = NOW() WHERE id = $2"))
                .bind(bio)
                .bind(id)
                .execute(&self.pool)
                .await?;
        }

        if let Some(avatar) = &payload.avatar {
            sqlx::query(&format!("UPDATE users SET avatar = $1, updated_at = NOW() WHERE id = $2"))
                .bind(avatar)
                .bind(id)
                .execute(&self.pool)
                .await?;
        }

        self.find_user_by_id(id).await
    }

    pub async fn delete_user(&self, _id: &str) -> Result<bool, Box<dyn Error>> {
        // TODO: Implement user deletion logic
        Err("Not implemented".into())
    }

    pub async fn get_user_services(&self, _user_id: &str) -> Result<Vec<crate::routes::users::UserService>, Box<dyn Error>> {
        // TODO: Implement user services retrieval
        Ok(vec![])
    }
}
