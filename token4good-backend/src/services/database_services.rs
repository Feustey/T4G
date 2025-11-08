use sqlx::PgPool;
use std::error::Error;

use crate::models::service::{
    CreateCategoryRequest, CreateServiceRequest, Service, ServiceCategory, UpdateCategoryRequest,
    UpdateServiceRequest,
};
use crate::models::transaction::{BlockchainTransaction, CreateTransactionRequest};

pub struct ServiceDatabaseOps {
    pool: PgPool,
}

impl ServiceDatabaseOps {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    // ========== SERVICE CATEGORIES ==========

    pub async fn get_all_categories(&self) -> Result<Vec<ServiceCategory>, Box<dyn Error>> {
        let categories =
            sqlx::query_as::<_, ServiceCategory>("SELECT * FROM service_categories ORDER BY name")
                .fetch_all(&self.pool)
                .await?;

        Ok(categories)
    }

    pub async fn get_category_by_id(
        &self,
        id: &str,
    ) -> Result<Option<ServiceCategory>, Box<dyn Error>> {
        let category =
            sqlx::query_as::<_, ServiceCategory>("SELECT * FROM service_categories WHERE id = $1")
                .bind(id)
                .fetch_optional(&self.pool)
                .await?;

        Ok(category)
    }

    pub async fn get_category_by_name(
        &self,
        name: &str,
    ) -> Result<Option<ServiceCategory>, Box<dyn Error>> {
        let category = sqlx::query_as::<_, ServiceCategory>(
            "SELECT * FROM service_categories WHERE name = $1",
        )
        .bind(name)
        .fetch_optional(&self.pool)
        .await?;

        Ok(category)
    }

    pub async fn get_categories_by_audience(
        &self,
        audience: &str,
    ) -> Result<Vec<ServiceCategory>, Box<dyn Error>> {
        let categories = sqlx::query_as::<_, ServiceCategory>(
            "SELECT * FROM service_categories WHERE audience = $1 ORDER BY name",
        )
        .bind(audience)
        .fetch_all(&self.pool)
        .await?;

        Ok(categories)
    }

    pub async fn create_category(
        &self,
        req: CreateCategoryRequest,
    ) -> Result<ServiceCategory, Box<dyn Error>> {
        let category = sqlx::query_as::<_, ServiceCategory>(
            r#"
            INSERT INTO service_categories (
                name, kind, description, href, default_price, default_unit,
                icon, disabled, service_provider_type, audience
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
            "#,
        )
        .bind(&req.name)
        .bind(&req.kind)
        .bind(&req.description)
        .bind(&req.href)
        .bind(req.default_price.unwrap_or(0))
        .bind(req.default_unit.unwrap_or_else(|| "hour".to_string()))
        .bind(&req.icon)
        .bind(req.disabled.unwrap_or(false))
        .bind(
            req.service_provider_type
                .unwrap_or_else(|| "SERVICE_PROVIDER".to_string()),
        )
        .bind(req.audience.unwrap_or_else(|| "ALUMNI".to_string()))
        .fetch_one(&self.pool)
        .await?;

        Ok(category)
    }

    pub async fn update_category(
        &self,
        id: &str,
        req: UpdateCategoryRequest,
    ) -> Result<Option<ServiceCategory>, Box<dyn Error>> {
        let mut query_parts = Vec::new();
        let mut param_count = 1;

        if req.name.is_some() {
            query_parts.push(format!("name = ${}", param_count));
            param_count += 1;
        }
        if req.kind.is_some() {
            query_parts.push(format!("kind = ${}", param_count));
            param_count += 1;
        }
        if req.description.is_some() {
            query_parts.push(format!("description = ${}", param_count));
            param_count += 1;
        }
        if req.default_price.is_some() {
            query_parts.push(format!("default_price = ${}", param_count));
            param_count += 1;
        }

        if query_parts.is_empty() {
            return self.get_category_by_id(id).await;
        }

        let query = format!(
            "UPDATE service_categories SET {} WHERE id = ${} RETURNING *",
            query_parts.join(", "),
            param_count
        );

        let mut q = sqlx::query_as::<_, ServiceCategory>(&query);

        if let Some(name) = req.name {
            q = q.bind(name);
        }
        if let Some(kind) = req.kind {
            q = q.bind(kind);
        }
        if let Some(description) = req.description {
            q = q.bind(description);
        }
        if let Some(price) = req.default_price {
            q = q.bind(price);
        }
        q = q.bind(id);

        let category = q.fetch_optional(&self.pool).await?;
        Ok(category)
    }

    pub async fn delete_category(&self, id: &str) -> Result<bool, Box<dyn Error>> {
        let result = sqlx::query("DELETE FROM service_categories WHERE id = $1")
            .bind(id)
            .execute(&self.pool)
            .await?;

        Ok(result.rows_affected() > 0)
    }

    // ========== SERVICES ==========

    pub async fn get_all_services(&self) -> Result<Vec<Service>, Box<dyn Error>> {
        let services =
            sqlx::query_as::<_, Service>("SELECT * FROM services ORDER BY created_at DESC")
                .fetch_all(&self.pool)
                .await?;

        Ok(services)
    }

    pub async fn get_service_by_id(&self, id: &str) -> Result<Option<Service>, Box<dyn Error>> {
        let service = sqlx::query_as::<_, Service>("SELECT * FROM services WHERE id = $1")
            .bind(id)
            .fetch_optional(&self.pool)
            .await?;

        Ok(service)
    }

    pub async fn get_services_by_category(
        &self,
        category_id: &str,
    ) -> Result<Vec<Service>, Box<dyn Error>> {
        let services = sqlx::query_as::<_, Service>(
            "SELECT * FROM services WHERE category_id = $1 ORDER BY created_at DESC",
        )
        .bind(category_id)
        .fetch_all(&self.pool)
        .await?;

        Ok(services)
    }

    pub async fn get_services_by_provider(
        &self,
        provider_id: &str,
    ) -> Result<Vec<Service>, Box<dyn Error>> {
        let services = sqlx::query_as::<_, Service>(
            "SELECT * FROM services WHERE service_provider_id = $1 ORDER BY created_at DESC",
        )
        .bind(provider_id)
        .fetch_all(&self.pool)
        .await?;

        Ok(services)
    }

    pub async fn get_services_by_audience(
        &self,
        audience: &str,
    ) -> Result<Vec<Service>, Box<dyn Error>> {
        let services = sqlx::query_as::<_, Service>(
            "SELECT * FROM services WHERE audience = $1 AND blockchain_id IS NOT NULL ORDER BY created_at DESC"
        )
        .bind(audience)
        .fetch_all(&self.pool)
        .await?;

        Ok(services)
    }

    pub async fn get_service_by_blockchain_id(
        &self,
        blockchain_id: i32,
    ) -> Result<Option<Service>, Box<dyn Error>> {
        let service =
            sqlx::query_as::<_, Service>("SELECT * FROM services WHERE blockchain_id = $1")
                .bind(blockchain_id)
                .fetch_optional(&self.pool)
                .await?;

        Ok(service)
    }

    pub async fn create_service(
        &self,
        req: CreateServiceRequest,
    ) -> Result<Service, Box<dyn Error>> {
        let service = sqlx::query_as::<_, Service>(
            r#"
            INSERT INTO services (
                name, unit, description, summary, avatar, price,
                audience, category_id, service_provider_id, annotations
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
            "#,
        )
        .bind(&req.name)
        .bind(req.unit.unwrap_or_else(|| "hour".to_string()))
        .bind(&req.description)
        .bind(&req.summary)
        .bind(&req.avatar)
        .bind(req.price)
        .bind(&req.audience)
        .bind(&req.category_id)
        .bind(&req.service_provider_id)
        .bind(req.annotations.unwrap_or_default())
        .fetch_one(&self.pool)
        .await?;

        Ok(service)
    }

    pub async fn update_service(
        &self,
        id: &str,
        req: UpdateServiceRequest,
    ) -> Result<Option<Service>, Box<dyn Error>> {
        let mut updates = Vec::new();
        let mut param_idx = 1;

        if req.name.is_some() {
            updates.push(format!("name = ${}", param_idx));
            param_idx += 1;
        }
        if req.description.is_some() {
            updates.push(format!("description = ${}", param_idx));
            param_idx += 1;
        }
        if req.price.is_some() {
            updates.push(format!("price = ${}", param_idx));
            param_idx += 1;
        }
        if req.blockchain_id.is_some() {
            updates.push(format!("blockchain_id = ${}", param_idx));
            param_idx += 1;
        }
        if req.tx_hash.is_some() {
            updates.push(format!("tx_hash = ${}", param_idx));
            param_idx += 1;
        }
        if req.total_supply.is_some() {
            updates.push(format!("total_supply = ${}", param_idx));
            param_idx += 1;
        }

        if updates.is_empty() {
            return self.get_service_by_id(id).await;
        }

        let query = format!(
            "UPDATE services SET {} WHERE id = ${} RETURNING *",
            updates.join(", "),
            param_idx
        );

        let mut q = sqlx::query_as::<_, Service>(&query);

        if let Some(name) = req.name {
            q = q.bind(name);
        }
        if let Some(description) = req.description {
            q = q.bind(description);
        }
        if let Some(price) = req.price {
            q = q.bind(price);
        }
        if let Some(blockchain_id) = req.blockchain_id {
            q = q.bind(blockchain_id);
        }
        if let Some(tx_hash) = req.tx_hash {
            q = q.bind(tx_hash);
        }
        if let Some(total_supply) = req.total_supply {
            q = q.bind(total_supply);
        }
        q = q.bind(id);

        let service = q.fetch_optional(&self.pool).await?;
        Ok(service)
    }

    pub async fn delete_service(&self, id: &str) -> Result<bool, Box<dyn Error>> {
        let result = sqlx::query("DELETE FROM services WHERE id = $1")
            .bind(id)
            .execute(&self.pool)
            .await?;

        Ok(result.rows_affected() > 0)
    }

    // ========== BLOCKCHAIN TRANSACTIONS ==========

    pub async fn get_transactions_by_address(
        &self,
        address: &str,
    ) -> Result<Vec<BlockchainTransaction>, Box<dyn Error>> {
        let transactions = sqlx::query_as::<_, BlockchainTransaction>(
            r#"
            SELECT * FROM blockchain_transactions
            WHERE from_address = $1 OR to_address = $1
               OR transfer_from = $1 OR transfer_to = $1
               OR service_buyer = $1 OR service_provider = $1
            ORDER BY ts DESC
            "#,
        )
        .bind(address)
        .fetch_all(&self.pool)
        .await?;

        Ok(transactions)
    }

    pub async fn get_transaction_by_hash(
        &self,
        hash: &str,
    ) -> Result<Option<BlockchainTransaction>, Box<dyn Error>> {
        let transaction = sqlx::query_as::<_, BlockchainTransaction>(
            "SELECT * FROM blockchain_transactions WHERE hash = $1",
        )
        .bind(hash)
        .fetch_optional(&self.pool)
        .await?;

        Ok(transaction)
    }

    pub async fn create_or_update_transaction(
        &self,
        req: CreateTransactionRequest,
    ) -> Result<BlockchainTransaction, Box<dyn Error>> {
        let transaction = sqlx::query_as::<_, BlockchainTransaction>(
            r#"
            INSERT INTO blockchain_transactions (
                hash, block, ts, from_address, to_address, method, event,
                target_id, transfer_from, transfer_to, transfer_amount,
                deal_id, service_id, service_buyer, service_provider
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            ON CONFLICT (hash) DO UPDATE SET
                block = EXCLUDED.block,
                ts = EXCLUDED.ts,
                from_address = EXCLUDED.from_address,
                to_address = EXCLUDED.to_address,
                method = EXCLUDED.method,
                event = EXCLUDED.event,
                target_id = EXCLUDED.target_id,
                transfer_from = EXCLUDED.transfer_from,
                transfer_to = EXCLUDED.transfer_to,
                transfer_amount = EXCLUDED.transfer_amount,
                deal_id = EXCLUDED.deal_id,
                service_id = EXCLUDED.service_id,
                service_buyer = EXCLUDED.service_buyer,
                service_provider = EXCLUDED.service_provider
            RETURNING *
            "#,
        )
        .bind(&req.hash)
        .bind(&req.block)
        .bind(&req.ts)
        .bind(&req.from_address)
        .bind(&req.to_address)
        .bind(&req.method)
        .bind(&req.event)
        .bind(&req.target_id)
        .bind(&req.transfer_from)
        .bind(&req.transfer_to)
        .bind(&req.transfer_amount)
        .bind(&req.deal_id)
        .bind(&req.service_id)
        .bind(&req.service_buyer)
        .bind(&req.service_provider)
        .fetch_one(&self.pool)
        .await?;

        Ok(transaction)
    }

    pub async fn get_last_block(&self) -> Result<Option<i32>, Box<dyn Error>> {
        let result = sqlx::query_scalar::<_, Option<i32>>(
            "SELECT MAX(block) FROM blockchain_transactions WHERE block IS NOT NULL",
        )
        .fetch_one(&self.pool)
        .await?;

        Ok(result)
    }

    pub async fn get_total_supply(&self) -> Result<i64, Box<dyn Error>> {
        let result = sqlx::query_scalar::<_, Option<i64>>(
            r#"
            SELECT COALESCE(SUM(transfer_amount), 0)
            FROM blockchain_transactions
            WHERE transfer_from = '0x0000000000000000000000000000000000000000'
            "#,
        )
        .fetch_one(&self.pool)
        .await?;

        Ok(result.unwrap_or(0))
    }
}
