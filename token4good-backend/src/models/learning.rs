use serde::{Deserialize, Serialize};

/// Catégorie de thèmes d'apprentissage (ex: Lightning Network, DazBox...)
#[derive(Debug, Serialize, Deserialize, Clone, sqlx::FromRow)]
pub struct LearningCategory {
    pub id: String,
    pub slug: String,
    pub name: String,
    pub color: Option<String>,
    pub icon_key: Option<String>,
    pub sort_order: i32,
}

/// Thème d'apprentissage appartenant à une catégorie
#[derive(Debug, Serialize, Deserialize, Clone, sqlx::FromRow)]
pub struct LearningTopic {
    pub id: String,
    pub slug: String,
    pub name: String,
    pub description: Option<String>,
    pub category_id: Option<String>,
    pub level: String,
    pub tags: Vec<String>,
    pub icon_key: Option<String>,
    pub is_active: bool,
    pub sort_order: i32,
}

/// Thème enrichi avec les informations de sa catégorie (pour les réponses API)
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct LearningTopicWithCategory {
    pub id: String,
    pub slug: String,
    pub name: String,
    pub description: Option<String>,
    pub level: String,
    pub tags: Vec<String>,
    pub icon_key: Option<String>,
    pub sort_order: i32,
    pub category: Option<LearningCategoryRef>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct LearningCategoryRef {
    pub id: String,
    pub slug: String,
    pub name: String,
    pub color: Option<String>,
    pub icon_key: Option<String>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_learning_category_serialize() {
        let cat = LearningCategory {
            id: "cat_1".to_string(),
            slug: "lightning_network".to_string(),
            name: "Lightning Network".to_string(),
            color: Some("#f59e0b".to_string()),
            icon_key: Some("lightning".to_string()),
            sort_order: 1,
        };
        let json = serde_json::to_string(&cat).unwrap();
        assert!(json.contains("lightning_network"));
        assert!(json.contains("Lightning Network"));
    }

    #[test]
    fn test_learning_topic_serialize() {
        let topic = LearningTopic {
            id: "topic_1".to_string(),
            slug: "lightning-basics".to_string(),
            name: "Comprendre les canaux Lightning".to_string(),
            description: Some("Introduction aux canaux".to_string()),
            category_id: Some("cat_1".to_string()),
            level: "beginner".to_string(),
            tags: vec!["lightning".to_string(), "basics".to_string()],
            icon_key: None,
            is_active: true,
            sort_order: 1,
        };
        let json = serde_json::to_string(&topic).unwrap();
        assert!(json.contains("lightning-basics"));
        assert!(json.contains("beginner"));
    }
}
