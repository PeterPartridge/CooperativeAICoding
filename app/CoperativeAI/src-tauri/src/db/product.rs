//! The `Product` model — see
//! application/ai-only/CoperativeAIdb/Product-model.md.

use crate::db::{now_millis, solution_management::last_insert_id, DbError, Result};
use turso::Connection;

#[derive(Debug, Clone, PartialEq)]
pub struct Product {
    pub id: i64,
    pub name: String,
    pub answers: String,
    /// Whose it is: [`DEVELOPER`] while it is a developer's own project, and
    /// [`PRODUCT`] once it is Product's. Handing over goes one way only.
    pub stage: String,
    pub created_at: i64,
    pub updated_at: i64,
}

/// A developer's own project, started in Develop. Hidden from the Product tab
/// until it is handed over.
pub const DEVELOPER: &str = "developer";
/// Product's — every Product made in the Product tab, and every developer
/// project once handed over.
pub const PRODUCT: &str = "product";

const SELECT: &str = "SELECT id, name, answers, createdAt, updatedAt, stage FROM products";

pub async fn create_table(conn: &Connection) -> Result<()> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            answers TEXT NOT NULL DEFAULT '{}',
            createdAt INTEGER NOT NULL,
            updatedAt INTEGER NOT NULL,
            stage TEXT NOT NULL DEFAULT 'product'
        )",
        (),
    )
    .await?;
    // Added, never recreated around: a Product's answers are person-written.
    // The default keeps every existing row Product's, so nothing leaves the
    // Product tab when this runs.
    let columns = crate::db::table_columns(conn, "products").await?;
    if !columns.iter().any(|c| c == "stage") {
        conn.execute(
            "ALTER TABLE products ADD COLUMN stage TEXT NOT NULL DEFAULT 'product'",
            (),
        )
        .await?;
    }
    Ok(())
}

pub async fn create(conn: &Connection, name: &str, answers_json: &str) -> Result<i64> {
    insert(conn, name, answers_json, PRODUCT).await
}

/// A developer's own project: a Product at the developer stage, named and
/// nothing more. The brief's questions are Product's to answer once it is
/// handed over.
pub async fn create_developer_project(conn: &Connection, name: &str) -> Result<i64> {
    insert(conn, name, "{}", DEVELOPER).await
}

/// Hands a developer project to Product. **One way**: anything not at the
/// developer stage is refused, so a Product can never be "handed over" twice
/// or taken back by this route. Only the stage changes — it is the same row,
/// so its Solutions, work items and sprints come with it.
pub async fn hand_to_product(conn: &Connection, id: i64) -> Result<()> {
    let Some(project) = find_by_id(conn, id).await? else {
        return Err(DbError::Validation(format!("no Product with id {id}")));
    };
    if project.stage != DEVELOPER {
        return Err(DbError::Validation(format!(
            "'{}' is already Product's — handing over goes one way",
            project.name
        )));
    }
    conn.execute(
        "UPDATE products SET stage = ?1, updatedAt = ?2 WHERE id = ?3",
        (PRODUCT, now_millis(), id),
    )
    .await?;
    Ok(())
}

async fn insert(conn: &Connection, name: &str, answers_json: &str, stage: &str) -> Result<i64> {
    if name.trim().is_empty() {
        return Err(DbError::Validation("a Product needs a name".into()));
    }
    serde_json::from_str::<serde_json::Value>(answers_json)
        .map_err(|e| DbError::Validation(format!("answers are not valid JSON: {e}")))?;
    let now = now_millis();
    conn.execute(
        "INSERT INTO products (name, answers, createdAt, updatedAt, stage) VALUES (?1, ?2, ?3, ?4, ?5)",
        (name, answers_json, now, now, stage),
    )
    .await?;
    last_insert_id(conn).await
}

/// Replaces a Product's answers.
///
/// The creation card asks only what is needed to start; the rest of the brief —
/// commercial model, roadmap, constraints, risks — is written in Strategy
/// afterwards, which is where thinking about a Product belongs. Both write to
/// this one JSON document, so the scaffolded `Project_brief.md` keeps rendering
/// from a single source.
pub async fn update_answers(conn: &Connection, id: i64, answers_json: &str) -> Result<()> {
    serde_json::from_str::<serde_json::Value>(answers_json)
        .map_err(|e| DbError::Validation(format!("answers are not valid JSON: {e}")))?;
    if find_by_id(conn, id).await?.is_none() {
        return Err(DbError::Validation(format!("no Product with id {id}")));
    }
    conn.execute(
        "UPDATE products SET answers = ?1, updatedAt = ?2 WHERE id = ?3",
        (answers_json, now_millis(), id),
    )
    .await?;
    Ok(())
}

pub async fn list_all(conn: &Connection) -> Result<Vec<Product>> {
    let mut rows = conn
        .query(&format!("{SELECT} ORDER BY id"), ())
        .await?;
    let mut products = Vec::new();
    while let Some(row) = rows.next().await? {
        products.push(row_to_product(row)?);
    }
    Ok(products)
}

pub async fn find_by_id(conn: &Connection, id: i64) -> Result<Option<Product>> {
    let mut rows = conn
        .query(&format!("{SELECT} WHERE id = ?1"), (id,))
        .await?;
    match rows.next().await? {
        Some(row) => Ok(Some(row_to_product(row)?)),
        None => Ok(None),
    }
}

/// Deletes a Product and everything that belongs to it: its work items
/// (each cascading to policy + feature design), sprints, and solutions.
pub async fn delete(conn: &Connection, id: i64) -> Result<()> {
    let items = crate::db::work_item::list_by_product(conn, id).await?;
    for item in items {
        crate::db::work_item::delete(conn, item.id).await?;
    }
    conn.execute("DELETE FROM sprints WHERE productId = ?1", (id,))
        .await?;
    conn.execute("DELETE FROM solutions WHERE productId = ?1", (id,))
        .await?;
    conn.execute("DELETE FROM products WHERE id = ?1", (id,))
        .await?;
    Ok(())
}

fn row_to_product(row: turso::Row) -> Result<Product> {
    Ok(Product {
        id: row.get(0)?,
        name: row.get(1)?,
        answers: row.get(2)?,
        created_at: row.get(3)?,
        updated_at: row.get(4)?,
        stage: row.get(5)?,
    })
}

#[cfg(test)]
pub(crate) mod tests {
    use super::*;
    use crate::db::{connect, create_all_tables};

    pub(crate) async fn db_with_product() -> (Connection, i64) {
        let conn = connect(":memory:").await.expect("open in-memory db");
        create_all_tables(&conn).await.expect("create tables");
        let id = create(&conn, "My Product", "{\"purpose\":\"demo\"}")
            .await
            .expect("create product");
        (conn, id)
    }

    /// The app is a desktop app: closing it and opening it again must find the
    /// Products still there. Everything else is tested against `:memory:`,
    /// which cannot fail this way — so nothing until now has proved that a
    /// write reaches the file at all.
    #[tokio::test]
    async fn a_product_survives_closing_and_reopening_the_app() {
        let dir = std::env::temp_dir().join(format!(
            "coperativeai-restart-{}-{:?}",
            std::process::id(),
            std::thread::current().id()
        ));
        std::fs::create_dir_all(&dir).expect("temp dir");
        let path = dir.join("CoperativeAIdb.db");
        let path_str = path.to_str().expect("utf-8 path").to_string();

        // First run: start up, create a Product, then close.
        {
            let conn = connect(&path_str).await.expect("open");
            create_all_tables(&conn).await.expect("tables");
            create(&conn, "Shop App", "{}").await.expect("create product");
            assert_eq!(list_all(&conn).await.expect("list").len(), 1);
        }

        // Second run: the same startup path, against the same file.
        {
            let conn = connect(&path_str).await.expect("reopen");
            create_all_tables(&conn).await.expect("tables again");
            let products = list_all(&conn).await.expect("list");
            assert_eq!(
                products.len(),
                1,
                "the Product was created and then lost when the app restarted"
            );
            assert_eq!(products[0].name, "Shop App");
        }

        let _ = std::fs::remove_dir_all(&dir);
    }

    #[tokio::test]
    async fn created_product_is_listed() {
        let (conn, id) = db_with_product().await;
        let products = list_all(&conn).await.expect("list");
        assert_eq!(products.len(), 1);
        assert_eq!(products[0].id, id);
        assert_eq!(products[0].name, "My Product");
    }

    /// The creation card asks a little; Strategy fills in the rest later.
    #[tokio::test]
    async fn answers_can_be_completed_after_creation() {
        let (conn, id) = db_with_product().await;
        let full = r#"{"purpose":"demo","commercialModel":"subscription","risks":"none yet"}"#;
        update_answers(&conn, id, full).await.expect("update");

        let stored = find_by_id(&conn, id).await.expect("q").expect("exists");
        assert!(stored.answers.contains("subscription"));
        assert!(stored.answers.contains("none yet"));
    }

    #[tokio::test]
    async fn answers_must_be_json_and_the_product_must_exist() {
        let (conn, id) = db_with_product().await;
        assert!(update_answers(&conn, id, "{not json").await.is_err());
        assert!(update_answers(&conn, 999, "{}").await.is_err());
    }

    #[tokio::test]
    async fn name_is_required_and_unique() {
        let (conn, _id) = db_with_product().await;
        assert!(create(&conn, "  ", "{}").await.is_err());
        assert!(create(&conn, "My Product", "{}").await.is_err());
    }

    #[tokio::test]
    async fn answers_must_be_valid_json() {
        let (conn, _id) = db_with_product().await;
        assert!(create(&conn, "Other", "{not json").await.is_err());
    }

    /// A developer's own project starts at the developer stage; a Product made
    /// in the Product tab starts at the product stage, as every Product did
    /// before stages existed.
    #[tokio::test]
    async fn a_developer_project_starts_at_the_developer_stage() {
        let (conn, product_id) = db_with_product().await;
        let id = create_developer_project(&conn, "Side Tool").await.expect("create");

        let project = find_by_id(&conn, id).await.expect("q").expect("exists");
        assert_eq!(project.stage, DEVELOPER);
        assert_eq!(project.answers, "{}");
        let product = find_by_id(&conn, product_id).await.expect("q").expect("exists");
        assert_eq!(product.stage, PRODUCT);
    }

    #[tokio::test]
    async fn a_developer_project_needs_a_unique_name_like_any_product() {
        let (conn, _id) = db_with_product().await;
        assert!(create_developer_project(&conn, "  ").await.is_err());
        assert!(create_developer_project(&conn, "My Product").await.is_err());
    }

    /// Handing over changes who it belongs to and nothing else: the same row,
    /// so its Solutions and work come with it.
    #[tokio::test]
    async fn handing_a_developer_project_to_product_keeps_everything_attached() {
        let (conn, _id) = db_with_product().await;
        let id = create_developer_project(&conn, "Side Tool").await.expect("create");
        crate::db::solution::create(&conn, "API", id, "api", "{}")
            .await
            .expect("create solution");

        hand_to_product(&conn, id).await.expect("hand over");

        let project = find_by_id(&conn, id).await.expect("q").expect("exists");
        assert_eq!(project.stage, PRODUCT);
        assert_eq!(project.name, "Side Tool");
        assert_eq!(
            crate::db::solution::list_by_product(&conn, id).await.expect("solutions").len(),
            1
        );
    }

    /// One-way: a Product cannot be "handed over" again, and an id that is not
    /// there is an error rather than a silent no-op.
    #[tokio::test]
    async fn handing_over_is_one_way_and_needs_a_real_project() {
        let (conn, product_id) = db_with_product().await;
        assert!(hand_to_product(&conn, product_id).await.is_err());
        assert!(hand_to_product(&conn, 999).await.is_err());

        let id = create_developer_project(&conn, "Side Tool").await.expect("create");
        hand_to_product(&conn, id).await.expect("first hand-over");
        assert!(hand_to_product(&conn, id).await.is_err(), "a second hand-over is refused");
    }

    /// A table from before stages gains the column, and every Product already
    /// in it stays Product's — nothing vanishes from the Product tab.
    #[tokio::test]
    async fn an_existing_products_table_gains_the_stage_and_keeps_its_rows_as_product() {
        let conn = connect(":memory:").await.expect("open in-memory db");
        conn.execute(
            "CREATE TABLE products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                answers TEXT NOT NULL DEFAULT '{}',
                createdAt INTEGER NOT NULL,
                updatedAt INTEGER NOT NULL
            )",
            (),
        )
        .await
        .expect("old table");
        conn.execute(
            "INSERT INTO products (name, answers, createdAt, updatedAt) VALUES ('Old', '{}', 1, 1)",
            (),
        )
        .await
        .expect("old row");

        create_table(&conn).await.expect("migrate");

        let products = list_all(&conn).await.expect("list");
        assert_eq!(products.len(), 1, "the existing Product is kept");
        assert_eq!(products[0].stage, PRODUCT);
    }

    #[tokio::test]
    async fn delete_removes_the_product_and_its_belongings() {
        let (conn, id) = db_with_product().await;
        let item = crate::db::work_item::create(&conn, "Epic", "epic", id, None, None)
            .await
            .expect("create item");
        crate::db::sprint::create(&conn, id, "Sprint 1", None, None)
            .await
            .expect("create sprint");
        crate::db::solution::create(&conn, "API", id, "api", "{}")
            .await
            .expect("create solution");

        delete(&conn, id).await.expect("delete product");

        assert!(find_by_id(&conn, id).await.expect("find").is_none());
        assert!(crate::db::work_item::find_by_id(&conn, item)
            .await
            .expect("find item")
            .is_none());
        assert!(crate::db::sprint::list_by_product(&conn, id)
            .await
            .expect("sprints")
            .is_empty());
        assert!(crate::db::solution::list_by_product(&conn, id)
            .await
            .expect("solutions")
            .is_empty());
    }
}
