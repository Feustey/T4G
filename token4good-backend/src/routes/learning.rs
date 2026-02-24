use axum::{
    extract::{Query, State},
    http::StatusCode,
    routing::get,
    Json, Router,
};
use serde::Deserialize;
use sqlx::Row;

use crate::{
    models::learning::{LearningCategory, LearningCategoryRef, LearningTopicWithCategory},
    AppState,
};

pub fn learning_routes() -> Router<AppState> {
    Router::new()
        .route("/categories", get(get_categories))
        .route("/topics", get(get_topics))
}

#[derive(Debug, Deserialize)]
pub struct TopicsQuery {
    pub category: Option<String>,
    pub level: Option<String>,
}

/// GET /api/learning/categories — liste toutes les catégories (public, pas d'auth)
async fn get_categories(
    State(state): State<AppState>,
) -> Result<Json<Vec<LearningCategory>>, StatusCode> {
    let categories = sqlx::query_as::<_, LearningCategory>(
        "SELECT id, slug, name, color, icon_key, sort_order
         FROM learning_categories
         ORDER BY sort_order ASC, name ASC",
    )
    .fetch_all(state.db.pool())
    .await
    .map_err(|e| {
        tracing::error!("Error fetching learning categories: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    Ok(Json(categories))
}

/// GET /api/learning/topics — liste les thèmes avec filtres optionnels (public, pas d'auth)
/// Query params: ?category=<slug>&level=beginner|intermediate|advanced
async fn get_topics(
    State(state): State<AppState>,
    Query(params): Query<TopicsQuery>,
) -> Result<Json<Vec<LearningTopicWithCategory>>, StatusCode> {
    // Filtres dynamiques sans sqlx::query! (pas de DATABASE_URL au build)
    let mut sql = String::from(
        r#"
        SELECT
            t.id, t.slug, t.name, t.description, t.level, t.tags, t.icon_key, t.sort_order,
            c.id       AS category_id,
            c.slug     AS category_slug,
            c.name     AS category_name,
            c.color    AS category_color,
            c.icon_key AS category_icon_key
        FROM learning_topics t
        LEFT JOIN learning_categories c ON c.id = t.category_id
        WHERE t.is_active = true
        "#,
    );

    let mut conditions: Vec<String> = vec![];
    if params.category.is_some() {
        conditions.push(format!("c.slug = ${}", conditions.len() + 1));
    }
    if params.level.is_some() {
        conditions.push(format!("t.level = ${}", conditions.len() + 1));
    }
    for cond in &conditions {
        sql.push_str(&format!(" AND {}", cond));
    }
    sql.push_str(" ORDER BY t.sort_order ASC, t.name ASC");

    let mut query = sqlx::query(&sql);
    if let Some(ref cat) = params.category {
        query = query.bind(cat);
    }
    if let Some(ref lvl) = params.level {
        query = query.bind(lvl);
    }

    let rows = query
        .fetch_all(state.db.pool())
        .await
        .map_err(|e| {
            tracing::error!("Error fetching learning topics: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    let topics: Vec<LearningTopicWithCategory> = rows
        .into_iter()
        .map(|row| {
            let tags: Vec<String> = row.try_get("tags").unwrap_or_default();
            let category_id: Option<String> = row.try_get("category_id").ok();
            LearningTopicWithCategory {
                id: row.try_get("id").unwrap_or_default(),
                slug: row.try_get("slug").unwrap_or_default(),
                name: row.try_get("name").unwrap_or_default(),
                description: row.try_get("description").ok(),
                level: row.try_get("level").unwrap_or_default(),
                tags,
                icon_key: row.try_get("icon_key").ok(),
                sort_order: row.try_get("sort_order").unwrap_or(0),
                category: category_id.map(|id| LearningCategoryRef {
                    id,
                    slug: row.try_get("category_slug").unwrap_or_default(),
                    name: row.try_get("category_name").unwrap_or_default(),
                    color: row.try_get("category_color").ok(),
                    icon_key: row.try_get("category_icon_key").ok(),
                }),
            }
        })
        .collect();

    Ok(Json(topics))
}
