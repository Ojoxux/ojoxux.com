# Database Migrations

このディレクトリには、DBのマイグレーションファイルを置く。

## 現行DB

- D1: `migrations/d1/`

## Legacy

- Supabase: `migrations/0001_setup_supabase.sql`

Supabaseは訪問者カウンターの旧実装で使用していたDB。現在の訪問者カウンターはD1を使う。

## マイグレーションファイルの命名規則

```
NNNN_description.sql
```

- `NNNN`: 4桁の連番（0001, 0002, 0003...）
- `description`: マイグレーションの内容を示す簡潔な説明（スネークケース）

### e.g.

- `0001_setup_supabase.sql`
- `d1/0001_visitor_count.sql`

## ロールバック

マイグレーションをロールバックする必要がある時は、逆の操作を行う新しいマイグレーションを作成する。

例:

```sql
-- ============================================
-- Migration: 0002_rollback_feature_x
-- Description: 0001で追加した機能Xをロールバック
-- Date: YYYY-MM-DD
-- ============================================

DROP FUNCTION IF EXISTS feature_x_function();
DROP TABLE IF EXISTS feature_x_table;
```
