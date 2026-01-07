# Database Migrations

このディレクトリには、SupabaseDBのマイグレーションファイルを置く。

## マイグレーションファイルの命名規則

```
NNNN_description.sql
```

- `NNNN`: 4桁の連番（0001, 0002, 0003...）
- `description`: マイグレーションの内容を示す簡潔な説明（スネークケース）

### e.g.

- `0001_setup_supabase.sql`

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
