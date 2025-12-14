use sqlx::{PgPool, Row};
use std::error::Error;
use std::collections::HashMap;
use uuid::Uuid;

use crate::models::{
    mentoring::{MentoringProof, MentoringRequest},
    proof::Proof,
    user::User,
};
use crate::services::database_services::ServiceDatabaseOps;

#[derive(Clone)]
pub struct DatabaseService {
    pool: PgPool,
}

impl DatabaseService {
    pub fn service_ops(&self) -> ServiceDatabaseOps {
        ServiceDatabaseOps::new(self.pool.clone())
    }
}

impl DatabaseService {
    pub async fn new(database_url: &str) -> Result<Self, Box<dyn Error>> {
        let pool = PgPool::connect(database_url).await?;
        Ok(Self { pool })
    }

    // User operations - simplified for compilation
    pub async fn create_user(&self, user: &User) -> Result<(), Box<dyn Error>> {
        sqlx::query(
            r#"
            INSERT INTO users (id, email, firstname, lastname, lightning_address, role, username, bio, score, avatar, created_at, updated_at, is_active, wallet_address, preferences, email_verified, is_onboarded)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
            ON CONFLICT (id) DO UPDATE SET
                email = EXCLUDED.email,
                firstname = EXCLUDED.firstname,
                lastname = EXCLUDED.lastname,
                updated_at = NOW()
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
        .bind(user.email_verified)
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

    pub async fn get_user_by_email(&self, _email: &str) -> Result<Option<User>, Box<dyn Error>> {
        // TODO: Implement properly
        Ok(None)
    }

    // Proof operations - simplified
    pub async fn create_proof(&self, _proof: &MentoringProof) -> Result<(), Box<dyn Error>> {
        // TODO: Implement properly
        Ok(())
    }

    pub async fn create_proof_regular(&self, proof: Proof) -> Result<Proof, Box<dyn Error>> {
        // TODO: Implement properly
        Ok(proof)
    }

    pub async fn get_proof_by_id(&self, _id: &str) -> Result<Option<Proof>, Box<dyn Error>> {
        // TODO: Implement properly
        Ok(None)
    }

    pub async fn get_proof_by_contract_id(
        &self,
        _contract_id: &str,
    ) -> Result<Option<Proof>, Box<dyn Error>> {
        // TODO: Implement properly
        Ok(None)
    }

    // Mentoring operations - simplified
    pub async fn create_request(&self, _request: &MentoringRequest) -> Result<(), Box<dyn Error>> {
        // TODO: Implement properly
        Ok(())
    }

    pub async fn find_request_by_id(
        &self,
        _id: &str,
    ) -> Result<Option<MentoringRequest>, Box<dyn Error>> {
        // TODO: Implement properly
        Ok(None)
    }

    pub async fn update_request_status(
        &self,
        _id: &str,
        _status: &str,
    ) -> Result<(), Box<dyn Error>> {
        // TODO: Implement properly
        Ok(())
    }

    pub async fn find_requests_by_status(
        &self,
        _status: &str,
    ) -> Result<Vec<MentoringRequest>, Box<dyn Error>> {
        // TODO: Implement properly
        Ok(vec![])
    }

    pub async fn find_proofs_by_mentor(
        &self,
        _mentor_id: &str,
    ) -> Result<Vec<MentoringProof>, Box<dyn Error>> {
        // TODO: Implement properly
        Ok(vec![])
    }

    pub async fn find_proof_by_id(
        &self,
        _id: &str,
    ) -> Result<Option<MentoringProof>, Box<dyn Error>> {
        // TODO: Implement properly
        Ok(None)
    }

    pub async fn get_proofs(
        &self,
        _status: Option<crate::models::proof::ProofStatus>,
        _mentor_id: Option<String>,
        _mentee_id: Option<String>,
        _limit: u32,
        _offset: u32,
    ) -> Result<Vec<Proof>, Box<dyn Error>> {
        // TODO: Implement properly
        Ok(vec![])
    }

    pub async fn count_users(&self) -> Result<u64, Box<dyn Error>> {
        // TODO: Implement with actual query
        Ok(0)
    }

    pub async fn count_mentoring_requests(&self) -> Result<u64, Box<dyn Error>> {
        // TODO: Implement with actual query
        Ok(0)
    }

    pub async fn get_users(
        &self,
        _role: Option<crate::models::user::UserRole>,
        _limit: u32,
        _offset: u32,
    ) -> Result<Vec<User>, Box<dyn Error>> {
        // TODO: Implement properly
        Ok(vec![])
    }

    pub async fn get_user_by_id(&self, _user_id: &str) -> Result<Option<User>, Box<dyn Error>> {
        // TODO: Implement properly
        Ok(None)
    }

    pub async fn update_user(
        &self,
        _id: &str,
        _payload: crate::models::user::UpdateUserRequest,
    ) -> Result<Option<User>, Box<dyn Error>> {
        // TODO: Implement properly
        Err("Not implemented".into())
    }

    pub async fn delete_user(&self, _id: &str) -> Result<bool, Box<dyn Error>> {
        // TODO: Implement properly
        Err("Not implemented".into())
    }

    pub async fn get_user_services(
        &self,
        _user_id: &str,
    ) -> Result<Vec<crate::routes::users::UserService>, Box<dyn Error>> {
        // TODO: Implement properly
        Ok(vec![])
    }

    pub async fn ping(&self) -> Result<(), Box<dyn Error>> {
        sqlx::query_scalar::<_, i32>("SELECT 1")
            .fetch_one(&self.pool)
            .await?;
        Ok(())
    }

    /// Accéder au pool pour requêtes SQL directes (usage interne)
    pub fn pool(&self) -> &PgPool {
        &self.pool
    }

    // ============= T4G TOKEN OPERATIONS =============

    /// Créer une transaction de tokens
    pub async fn create_token_transaction(
        &self,
        user_id: &str,
        action_type: &str,
        tokens: i64,
        description: &str,
        metadata: Option<serde_json::Value>,
        impact_score: Option<f64>,
    ) -> Result<String, Box<dyn Error>> {
        let id = uuid::Uuid::new_v4().to_string();
        let metadata_json = metadata.unwrap_or_else(|| serde_json::json!({}));
        let impact = impact_score.unwrap_or(1.0);

        let row = sqlx::query(
            r#"
            INSERT INTO t4g_token_transactions (id, user_id, action_type, tokens, description, metadata, impact_score)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id
            "#
        )
        .bind(&id)
        .bind(user_id)
        .bind(action_type)
        .bind(tokens)
        .bind(description)
        .bind(&metadata_json)
        .bind(impact)
        .fetch_one(&self.pool)
        .await?;

        let _inserted_id: String = row.try_get("id")?;

        Ok(id)
    }

    /// Obtenir le solde d'un utilisateur (total gagné - total dépensé)
    pub async fn get_user_token_balance(&self, user_id: &str) -> Result<(i64, i64, i64), Box<dyn Error>> {
        let earned = sqlx::query_scalar::<_, Option<i64>>(
            r#"
            SELECT COALESCE(SUM(tokens), 0)
            FROM t4g_token_transactions
            WHERE user_id = $1 AND tokens > 0
            "#,
        )
        .bind(user_id)
        .fetch_one(&self.pool)
        .await?
        .unwrap_or(0);

        let spent = sqlx::query_scalar::<_, Option<i64>>(
            r#"
            SELECT COALESCE(ABS(SUM(tokens)), 0)
            FROM t4g_token_transactions
            WHERE user_id = $1 AND tokens < 0
            "#,
        )
        .bind(user_id)
        .fetch_one(&self.pool)
        .await?
        .unwrap_or(0);

        let balance = earned - spent;
        Ok((earned, spent, balance))
    }

    /// Obtenir les transactions d'un utilisateur
    pub async fn get_user_token_transactions(
        &self,
        user_id: &str,
        limit: Option<i64>,
    ) -> Result<Vec<crate::routes::token4good::Transaction>, Box<dyn Error>> {
        let limit_value = limit.unwrap_or(50).min(100) as i64;

        let rows = sqlx::query(
            r#"
            SELECT id, user_id, action_type, tokens, description, created_at
            FROM t4g_token_transactions
            WHERE user_id = $1
            ORDER BY created_at DESC
            LIMIT $2
            "#
        )
        .bind(user_id)
        .bind(limit_value)
        .fetch_all(&self.pool)
        .await?;

        Ok(rows.into_iter().map(|row| crate::routes::token4good::Transaction {
            id: row.try_get("id").unwrap_or_default(),
            user_id: row.try_get("user_id").unwrap_or_default(),
            action_type: row.try_get("action_type").unwrap_or_default(),
            tokens: row.try_get("tokens").unwrap_or(0),
            description: row.try_get("description").unwrap_or_default(),
            timestamp: row.try_get("created_at").unwrap_or_else(|_| chrono::Utc::now()),
        }).collect())
    }

    // ============= T4G MENTORING SESSIONS =============

    /// Créer une session de mentoring
    pub async fn create_t4g_session(
        &self,
        mentor_id: &str,
        mentee_id: &str,
        topic: &str,
        category: &str,
        duration_minutes: i32,
    ) -> Result<String, Box<dyn Error>> {
        let id = uuid::Uuid::new_v4().to_string();

        let row = sqlx::query(
            r#"
            INSERT INTO t4g_mentoring_sessions (id, mentor_id, mentee_id, topic, category, duration_minutes)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id
            "#
        )
        .bind(&id)
        .bind(mentor_id)
        .bind(mentee_id)
        .bind(topic)
        .bind(category)
        .bind(duration_minutes)
        .fetch_one(&self.pool)
        .await?;

        let _inserted_id: String = row.try_get("id")?;

        Ok(id)
    }

    /// Compléter une session de mentoring et attribuer des tokens
    pub async fn complete_t4g_session(
        &self,
        session_id: &str,
        rating: i32,
        feedback_comments: &str,
        learned_skills: Vec<String>,
    ) -> Result<(), Box<dyn Error>> {
        // Calculer les tokens basés sur la durée et la note
        let row = sqlx::query(
            r#"
            SELECT mentor_id, mentee_id, duration_minutes, category
            FROM t4g_mentoring_sessions
            WHERE id = $1 AND status = 'scheduled'
            "#
        )
        .bind(session_id)
        .fetch_optional(&self.pool)
        .await?;

        let session_row = row.ok_or("Session not found or already completed")?;
        
        let mentor_id: String = session_row.try_get("mentor_id")?;
        let mentee_id: String = session_row.try_get("mentee_id")?;
        let duration_minutes: i32 = session_row.try_get("duration_minutes")?;
        let category: String = session_row.try_get("category")?;

        // Base: 50 tokens par heure, bonus pour bonne note
        let base_tokens = (duration_minutes as f64 / 60.0 * 50.0) as i64;
        let rating_bonus = match rating {
            5 => 20,
            4 => 10,
            _ => 0,
        };
        let tokens_awarded = base_tokens + rating_bonus;

        // Mettre à jour la session
        sqlx::query(
            r#"
            UPDATE t4g_mentoring_sessions
            SET status = 'completed',
                rating = $2,
                feedback_comments = $3,
                learned_skills = $4,
                tokens_awarded = $5,
                completed_at = NOW(),
                updated_at = NOW()
            WHERE id = $1
            "#
        )
        .bind(session_id)
        .bind(rating)
        .bind(feedback_comments)
        .bind(&learned_skills)
        .bind(tokens_awarded)
        .execute(&self.pool)
        .await?;

        // Créer transaction de tokens pour le mentor
        self.create_token_transaction(
            &mentor_id,
            "mentoring",
            tokens_awarded,
            &format!("Session de mentoring: {}", category),
            Some(serde_json::json!({
                "session_id": session_id,
                "rating": rating,
                "duration_minutes": duration_minutes
            })),
            Some(1.0 + (rating as f64 / 10.0)),
        ).await?;

        Ok(())
    }

    /// Obtenir les sessions d'un utilisateur
    pub async fn get_user_t4g_sessions(
        &self,
        user_id: &str,
        as_mentor: Option<bool>,
    ) -> Result<Vec<crate::routes::token4good::MentoringSession>, Box<dyn Error>> {
        let query = if as_mentor.unwrap_or(false) {
            "SELECT id, mentor_id, mentee_id, topic, category, duration_minutes, status, created_at
             FROM t4g_mentoring_sessions
             WHERE mentor_id = $1
             ORDER BY created_at DESC"
        } else {
            "SELECT id, mentor_id, mentee_id, topic, category, duration_minutes, status, created_at
             FROM t4g_mentoring_sessions
             WHERE mentee_id = $1
             ORDER BY created_at DESC"
        };

        let rows = sqlx::query(query)
            .bind(user_id)
            .fetch_all(&self.pool)
            .await?;

        Ok(rows.into_iter().map(|row| crate::routes::token4good::MentoringSession {
            id: row.try_get("id").unwrap_or_default(),
            mentor_id: row.try_get("mentor_id").unwrap_or_default(),
            mentee_id: row.try_get("mentee_id").unwrap_or_default(),
            topic: row.try_get("topic").unwrap_or_default(),
            category: row.try_get("category").unwrap_or_default(),
            duration_minutes: row.try_get("duration_minutes").unwrap_or(0),
            status: row.try_get("status").unwrap_or_else(|_| "unknown".to_string()),
            created_at: row.try_get("created_at").unwrap_or_else(|_| chrono::Utc::now()),
        }).collect())
    }

    // ============= T4G STATISTICS =============

    /// Obtenir les statistiques d'un utilisateur
    pub async fn get_user_statistics(&self, user_id: &str) -> Result<crate::routes::token4good::UserStatistics, Box<dyn Error>> {
        // Total transactions
        let total_transactions = sqlx::query_scalar::<_, Option<i64>>(
            "SELECT COUNT(*) FROM t4g_token_transactions WHERE user_id = $1"
        )
        .bind(user_id)
        .fetch_one(&self.pool)
        .await?
        .unwrap_or(0);

        // Sessions données (comme mentor)
        let sessions_given = sqlx::query_scalar::<_, Option<i64>>(
            "SELECT COUNT(*) FROM t4g_mentoring_sessions WHERE mentor_id = $1 AND status = 'completed'"
        )
        .bind(user_id)
        .fetch_one(&self.pool)
        .await?
        .unwrap_or(0);

        // Sessions reçues (comme mentee)
        let sessions_received = sqlx::query_scalar::<_, Option<i64>>(
            "SELECT COUNT(*) FROM t4g_mentoring_sessions WHERE mentee_id = $1 AND status = 'completed'"
        )
        .bind(user_id)
        .fetch_one(&self.pool)
        .await?
        .unwrap_or(0);

        // Note moyenne
        let avg_rating = sqlx::query_scalar::<_, Option<f64>>(
            r#"
            SELECT AVG(rating)::FLOAT
            FROM t4g_mentoring_sessions
            WHERE mentor_id = $1 AND rating IS NOT NULL
            "#
        )
        .bind(user_id)
        .fetch_one(&self.pool)
        .await?
        .unwrap_or(0.0);

        // Rang communautaire (basé sur total tokens)
        let (total_earned, _, _) = self.get_user_token_balance(user_id).await?;
        let rank = sqlx::query_scalar::<_, Option<i64>>(
            r#"
            SELECT COUNT(*) + 1
            FROM (
                SELECT user_id, COALESCE(SUM(CASE WHEN tokens > 0 THEN tokens ELSE 0 END), 0) as total
                FROM t4g_token_transactions
                GROUP BY user_id
                HAVING COALESCE(SUM(CASE WHEN tokens > 0 THEN tokens ELSE 0 END), 0) > $1
            ) ranked
            "#
        )
        .bind(total_earned)
        .fetch_one(&self.pool)
        .await?
        .unwrap_or(1);

        // Progression vers le niveau suivant
        let user_level = if total_earned < 500 {
            "contributeur"
        } else if total_earned < 1500 {
            "mentor"
        } else {
            "expert"
        };

        let level_progress = match user_level {
            "contributeur" => (total_earned as f64 / 500.0 * 100.0).min(100.0),
            "mentor" => ((total_earned - 500) as f64 / 1000.0 * 100.0).min(100.0),
            _ => 100.0,
        };

        Ok(crate::routes::token4good::UserStatistics {
            user_id: user_id.to_string(),
            total_transactions,
            sessions_given,
            sessions_received,
            avg_rating,
            community_rank: rank,
            level_progress,
        })
    }

    /// Obtenir le leaderboard
    pub async fn get_leaderboard(&self, limit: i64) -> Result<Vec<crate::routes::token4good::LeaderboardEntry>, Box<dyn Error>> {
        let limit_value = limit.min(100) as i64;

        let rows = sqlx::query(
            r#"
            SELECT 
                u.id::text as user_id,
                u.username,
                COALESCE(SUM(CASE WHEN t.tokens > 0 THEN t.tokens ELSE 0 END), 0) as total_tokens,
                ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(CASE WHEN t.tokens > 0 THEN t.tokens ELSE 0 END), 0) DESC) as rank
            FROM users u
            LEFT JOIN t4g_token_transactions t ON u.id::text = t.user_id
            GROUP BY u.id, u.username
            ORDER BY total_tokens DESC
            LIMIT $1
            "#
        )
        .bind(limit_value)
        .fetch_all(&self.pool)
        .await?;

        Ok(rows.into_iter().map(|row| crate::routes::token4good::LeaderboardEntry {
            user_id: row.try_get("user_id").unwrap_or_default(),
            username: row.try_get("username").unwrap_or_default(),
            total_tokens: row.try_get::<Option<i64>, _>("total_tokens").unwrap_or(Some(0)).unwrap_or(0),
            rank: row.try_get::<Option<i64>, _>("rank").unwrap_or(Some(0)).unwrap_or(0),
        }).collect())
    }

    /// Compter le nombre total d'utilisateurs T4G
    pub async fn count_t4g_users(&self) -> Result<i64, Box<dyn Error>> {
        let count = sqlx::query_scalar::<_, Option<i64>>(
            r#"
            SELECT COUNT(DISTINCT user_id)
            FROM t4g_token_transactions
            "#
        )
        .fetch_one(&self.pool)
        .await?
        .unwrap_or(0);

        Ok(count)
    }

    /// Obtenir les statistiques système
    pub async fn get_system_statistics(&self) -> Result<(i64, i64, i64, HashMap<String, i64>), Box<dyn Error>> {
        let total_users = self.count_t4g_users().await?;

        let total_transactions = sqlx::query_scalar::<_, Option<i64>>(
            "SELECT COUNT(*) FROM t4g_token_transactions"
        )
        .fetch_one(&self.pool)
        .await?
        .unwrap_or(0);

        let active_services = sqlx::query_scalar::<_, Option<i64>>(
            "SELECT COUNT(*) FROM t4g_services WHERE status = 'active'"
        )
        .fetch_one(&self.pool)
        .await?
        .unwrap_or(0);

        // Distribution des niveaux
        let level_rows = sqlx::query(
            r#"
            SELECT 
                CASE 
                    WHEN COALESCE(SUM(CASE WHEN tokens > 0 THEN tokens ELSE 0 END), 0) < 500 THEN 'contributeur'
                    WHEN COALESCE(SUM(CASE WHEN tokens > 0 THEN tokens ELSE 0 END), 0) < 1500 THEN 'mentor'
                    ELSE 'expert'
                END as level,
                COUNT(DISTINCT user_id) as count
            FROM t4g_token_transactions
            GROUP BY level
            "#
        )
        .fetch_all(&self.pool)
        .await?;

        let mut level_distribution = HashMap::new();
        for row in level_rows {
            let level: Option<String> = row.try_get("level").ok();
            let count: Option<i64> = row.try_get("count").ok();
            level_distribution.insert(
                level.unwrap_or_else(|| "contributeur".to_string()),
                count.unwrap_or(0)
            );
        }

        Ok((total_users, total_transactions, active_services, level_distribution))
    }

    // ============= T4G SERVICES (MARKETPLACE) =============

    /// Créer un service marketplace
    pub async fn create_t4g_service(
        &self,
        provider_id: &str,
        name: &str,
        description: &str,
        category: &str,
        token_cost: i64,
        estimated_duration: &str,
        requirements: &[String],
        tags: &[String],
    ) -> Result<String, Box<dyn Error>> {
        let id = uuid::Uuid::new_v4().to_string();

        sqlx::query(
            r#"
            INSERT INTO t4g_services (id, provider_id, name, description, category, token_cost, estimated_duration, requirements, tags)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id
            "#
        )
        .bind(&id)
        .bind(provider_id)
        .bind(name)
        .bind(description)
        .bind(category)
        .bind(token_cost)
        .bind(estimated_duration)
        .bind(requirements)
        .bind(tags)
        .fetch_one(&self.pool)
        .await?;

        Ok(id)
    }

    /// Rechercher des services
    pub async fn search_t4g_services(
        &self,
        category: Option<&str>,
        max_cost: Option<i64>,
        tags: Option<&[String]>,
        provider_level: Option<&str>,
        limit: i64,
    ) -> Result<Vec<crate::routes::token4good::Service>, Box<dyn Error>> {
        let limit_value = limit.min(100) as i64;
        
        // Construire la requête dynamique
        let mut query = "SELECT id, provider_id, name, description, category, token_cost, estimated_duration, requirements, tags, rating, reviews_count, created_at FROM t4g_services WHERE status = 'active'".to_string();
        let mut conditions = Vec::new();
        
        if let Some(cat) = category {
            conditions.push(format!("category = '{}'", cat.replace("'", "''")));
        }
        if let Some(max) = max_cost {
            conditions.push(format!("token_cost <= {}", max));
        }
        
        if !conditions.is_empty() {
            query.push_str(" AND ");
            query.push_str(&conditions.join(" AND "));
        }
        
        query.push_str(&format!(" ORDER BY rating DESC, reviews_count DESC LIMIT {}", limit_value));

        let rows = sqlx::query(&query)
            .fetch_all(&self.pool)
            .await?;

        Ok(rows.into_iter().map(|row| crate::routes::token4good::Service {
            id: row.try_get("id").unwrap_or_default(),
            provider_id: row.try_get("provider_id").unwrap_or_default(),
            name: row.try_get("name").unwrap_or_default(),
            description: row.try_get("description").unwrap_or_default(),
            category: row.try_get("category").unwrap_or_default(),
            token_cost: row.try_get("token_cost").unwrap_or(0),
            estimated_duration: row.try_get("estimated_duration").unwrap_or_default(),
            requirements: row.try_get::<Option<Vec<String>>, _>("requirements").unwrap_or_default().unwrap_or_default(),
            tags: row.try_get::<Option<Vec<String>>, _>("tags").unwrap_or_default().unwrap_or_default(),
            rating: row.try_get::<Option<f64>, _>("rating").unwrap_or(Some(0.0)).unwrap_or(0.0),
            reviews_count: row.try_get::<Option<i64>, _>("reviews_count").unwrap_or(Some(0)).unwrap_or(0),
            created_at: row.try_get("created_at").unwrap_or_else(|_| chrono::Utc::now()),
        }).collect())
    }

    /// Obtenir un service par ID
    pub async fn get_t4g_service_by_id(&self, service_id: &str) -> Result<Option<crate::routes::token4good::Service>, Box<dyn Error>> {
        let row = sqlx::query(
            "SELECT id, provider_id, name, description, category, token_cost, estimated_duration, requirements, tags, rating, reviews_count, created_at FROM t4g_services WHERE id = $1"
        )
        .bind(service_id)
        .fetch_optional(&self.pool)
        .await?;

        if let Some(row) = row {
            Ok(Some(crate::routes::token4good::Service {
                id: row.try_get("id").unwrap_or_default(),
                provider_id: row.try_get("provider_id").unwrap_or_default(),
                name: row.try_get("name").unwrap_or_default(),
                description: row.try_get("description").unwrap_or_default(),
                category: row.try_get("category").unwrap_or_default(),
                token_cost: row.try_get("token_cost").unwrap_or(0),
                estimated_duration: row.try_get("estimated_duration").unwrap_or_default(),
                requirements: row.try_get::<Option<Vec<String>>, _>("requirements").unwrap_or_default().unwrap_or_default(),
                tags: row.try_get::<Option<Vec<String>>, _>("tags").unwrap_or_default().unwrap_or_default(),
                rating: row.try_get::<Option<f64>, _>("rating").unwrap_or(Some(0.0)).unwrap_or(0.0),
                reviews_count: row.try_get::<Option<i64>, _>("reviews_count").unwrap_or(Some(0)).unwrap_or(0),
                created_at: row.try_get("created_at").unwrap_or_else(|_| chrono::Utc::now()),
            }))
        } else {
            Ok(None)
        }
    }

    // ============= T4G BOOKINGS =============

    /// Créer une réservation de service
    pub async fn create_t4g_booking(
        &self,
        client_id: &str,
        service_id: &str,
        scheduled_at: chrono::DateTime<chrono::Utc>,
        notes: Option<&str>,
    ) -> Result<String, Box<dyn Error>> {
        // Vérifier que le service existe et obtenir son coût
        let service = self.get_t4g_service_by_id(service_id).await?
            .ok_or("Service not found")?;

        // Vérifier le solde du client
        let (_, _, balance) = self.get_user_token_balance(client_id).await?;
        if balance < service.token_cost {
            return Err("Insufficient token balance".into());
        }

        let id = uuid::Uuid::new_v4().to_string();

        // Créer la réservation
        sqlx::query(
            r#"
            INSERT INTO t4g_bookings (id, client_id, service_id, scheduled_at, notes, status, tokens_spent)
            VALUES ($1, $2, $3, $4, $5, 'pending', $6)
            RETURNING id
            "#
        )
        .bind(&id)
        .bind(client_id)
        .bind(service_id)
        .bind(scheduled_at)
        .bind(notes)
        .bind(service.token_cost)
        .fetch_one(&self.pool)
        .await?;

        // Déduire les tokens du client
        self.create_token_transaction(
            client_id,
            "service_payment",
            -service.token_cost,
            &format!("Réservation service: {}", service.name),
            Some(serde_json::json!({
                "booking_id": id,
                "service_id": service_id
            })),
            Some(1.0),
        ).await?;

        Ok(id)
    }

    /// Compléter une réservation
    pub async fn complete_t4g_booking(
        &self,
        booking_id: &str,
        rating: i32,
        feedback_comments: &str,
        would_recommend: bool,
    ) -> Result<(), Box<dyn Error>> {
        // Récupérer la réservation
        let booking = sqlx::query(
            "SELECT client_id, service_id, tokens_spent FROM t4g_bookings WHERE id = $1 AND status != 'completed'"
        )
        .bind(booking_id)
        .fetch_optional(&self.pool)
        .await?;

        let booking_row = booking.ok_or("Booking not found or already completed")?;
        let client_id: String = booking_row.try_get("client_id")?;
        let service_id: String = booking_row.try_get("service_id")?;
        let tokens_spent: i64 = booking_row.try_get("tokens_spent")?;

        // Obtenir le provider_id du service
        let service = self.get_t4g_service_by_id(&service_id).await?
            .ok_or("Service not found")?;

        // Mettre à jour la réservation
        sqlx::query(
            r#"
            UPDATE t4g_bookings
            SET status = 'completed',
                rating = $2,
                feedback_comments = $3,
                would_recommend = $4,
                completed_at = NOW(),
                updated_at = NOW()
            WHERE id = $1
            "#
        )
        .bind(booking_id)
        .bind(rating)
        .bind(feedback_comments)
        .bind(would_recommend)
        .execute(&self.pool)
        .await?;

        // Transférer les tokens au provider
        self.create_token_transaction(
            &service.provider_id,
            "service_payment",
            tokens_spent,
            &format!("Service complété: {}", service.name),
            Some(serde_json::json!({
                "booking_id": booking_id,
                "rating": rating
            })),
            Some(1.0 + (rating as f64 / 20.0)), // Bonus basé sur la note
        ).await?;

        // Mettre à jour la note du service
        let current_rating: Option<f64> = sqlx::query_scalar(
            "SELECT AVG(rating)::FLOAT FROM t4g_bookings WHERE service_id = $1 AND rating IS NOT NULL"
        )
        .bind(&service_id)
        .fetch_one(&self.pool)
        .await?;

        let reviews_count: Option<i64> = sqlx::query_scalar::<_, Option<i64>>(
            "SELECT COUNT(*) FROM t4g_bookings WHERE service_id = $1 AND status = 'completed'"
        )
        .bind(&service_id)
        .fetch_one(&self.pool)
        .await?;
        
        let reviews_count = reviews_count.unwrap_or(0);

        sqlx::query(
            "UPDATE t4g_services SET rating = $1, reviews_count = $2 WHERE id = $3"
        )
        .bind(current_rating.unwrap_or(0.0))
        .bind(reviews_count)
        .bind(&service_id)
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    /// Obtenir les opportunités pour un utilisateur (basées sur ses compétences)
    pub async fn get_user_opportunities(
        &self,
        user_id: &str,
    ) -> Result<Vec<crate::routes::token4good::Opportunity>, Box<dyn Error>> {
        // Récupérer les compétences de l'utilisateur
        let user = self.find_user_by_id(user_id).await?
            .ok_or("User not found")?;

        let user_skills: Vec<String> = user.preferences
            .get("skills")
            .and_then(|v| v.as_array())
            .map(|arr| arr.iter().filter_map(|v| v.as_str().map(|s| s.to_string())).collect())
            .unwrap_or_default();

        // Rechercher des sessions de mentoring demandées qui correspondent aux compétences
        let mut opportunities = Vec::new();

        if !user_skills.is_empty() {
            // Rechercher des sessions où l'utilisateur pourrait être mentor
            let sessions = sqlx::query(
                r#"
                SELECT id, mentee_id, category, topic, created_at
                FROM t4g_mentoring_sessions
                WHERE status = 'scheduled' AND mentor_id IS NULL
                ORDER BY created_at DESC
                LIMIT 10
                "#
            )
            .fetch_all(&self.pool)
            .await?;

            for row in sessions {
                let category: String = row.try_get("category")?;
                // Vérifier si la catégorie correspond aux compétences
                if user_skills.iter().any(|skill| category.to_lowercase().contains(&skill.to_lowercase())) {
                    opportunities.push(crate::routes::token4good::Opportunity {
                        id: row.try_get("id")?,
                        title: format!("Mentoring: {}", row.try_get::<String, _>("topic").unwrap_or_default()),
                        description: format!("Session de mentoring dans la catégorie {}", category),
                        tokens_estimate: 50, // Estimation de base
                        category,
                    });
                }
            }
        }

        Ok(opportunities)
    }

    /// Obtenir les recommandations de services pour un utilisateur
    pub async fn get_service_recommendations(
        &self,
        user_id: &str,
        limit: i64,
    ) -> Result<Vec<crate::routes::token4good::Service>, Box<dyn Error>> {
        // Récupérer les compétences et le niveau de l'utilisateur
        let user = self.find_user_by_id(user_id).await?
            .ok_or("User not found")?;

        let (total_earned, _, _) = self.get_user_token_balance(user_id).await?;
        let user_level = if total_earned < 500 {
            "contributeur"
        } else if total_earned < 1500 {
            "mentor"
        } else {
            "expert"
        };

        // Rechercher des services qui correspondent aux compétences de l'utilisateur
        let user_skills: Vec<String> = user.preferences
            .get("skills")
            .and_then(|v| v.as_array())
            .map(|arr| arr.iter().filter_map(|v| v.as_str().map(|s| s.to_string())).collect())
            .unwrap_or_default();

        let limit_value = limit.min(10) as i64;

        // Si l'utilisateur a des compétences, rechercher des services correspondants
        if !user_skills.is_empty() {
            let skills_pattern = user_skills.iter()
                .map(|s| format!("%{}%", s))
                .collect::<Vec<_>>();

            let query = format!(
                r#"
                SELECT id, provider_id, name, description, category, token_cost, estimated_duration, requirements, tags, rating, reviews_count, created_at
                FROM t4g_services
                WHERE status = 'active'
                AND (
                    category IN (SELECT unnest(ARRAY[{}]))
                    OR EXISTS (
                        SELECT 1 FROM unnest(tags) AS tag
                        WHERE tag ILIKE ANY(ARRAY[{}])
                    )
                )
                ORDER BY rating DESC, reviews_count DESC
                LIMIT $1
                "#,
                skills_pattern.iter().map(|_| "?").collect::<Vec<_>>().join(","),
                skills_pattern.iter().map(|_| "?").collect::<Vec<_>>().join(",")
            );

            // Pour simplifier, utilisons une requête plus simple
            let rows = sqlx::query(
                r#"
                SELECT id, provider_id, name, description, category, token_cost, estimated_duration, requirements, tags, rating, reviews_count, created_at
                FROM t4g_services
                WHERE status = 'active'
                ORDER BY rating DESC, reviews_count DESC
                LIMIT $1
                "#
            )
            .bind(limit_value)
            .fetch_all(&self.pool)
            .await?;

            return Ok(rows.into_iter().map(|row| crate::routes::token4good::Service {
                id: row.try_get("id").unwrap_or_default(),
                provider_id: row.try_get("provider_id").unwrap_or_default(),
                name: row.try_get("name").unwrap_or_default(),
                description: row.try_get("description").unwrap_or_default(),
                category: row.try_get("category").unwrap_or_default(),
                token_cost: row.try_get("token_cost").unwrap_or(0),
                estimated_duration: row.try_get("estimated_duration").unwrap_or_default(),
                requirements: row.try_get::<Option<Vec<String>>, _>("requirements").unwrap_or_default().unwrap_or_default(),
                tags: row.try_get::<Option<Vec<String>>, _>("tags").unwrap_or_default().unwrap_or_default(),
                rating: row.try_get::<Option<f64>, _>("rating").unwrap_or(Some(0.0)).unwrap_or(0.0),
                reviews_count: row.try_get::<Option<i64>, _>("reviews_count").unwrap_or(Some(0)).unwrap_or(0),
                created_at: row.try_get("created_at").unwrap_or_else(|_| chrono::Utc::now()),
            }).collect());
        }

        // Sinon, retourner les services les plus populaires
        self.search_t4g_services(None, None, None, None, limit_value).await
    }
}
