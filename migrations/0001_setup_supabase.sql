-- ============================================
-- Migration: 0001_setup_supabase
-- Description: Supabaseへの移行 - visitor_countテーブルとRLSの設定
-- Date: 2025-01-06
-- ============================================

-- 1. visitor_countテーブルの作成
CREATE TABLE IF NOT EXISTS visitor_count (
  id BIGSERIAL PRIMARY KEY,
  count BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 初期レコードの挿入
INSERT INTO visitor_count (id, count) 
VALUES (1, 0)
ON CONFLICT (id) DO NOTHING;

-- 3. Row Level Security (RLS)の有効化
ALTER TABLE visitor_count ENABLE ROW LEVEL SECURITY;

-- 4. 読み取り許可ポリシー（全員が読み取り可能）
CREATE POLICY "Allow public read access" 
ON visitor_count 
FOR SELECT 
TO public 
USING (true);

-- 5. カウンターをインクリメントするPostgreSQL関数
-- SECURITY DEFINERを使用してRLSをバイパス
CREATE OR REPLACE FUNCTION increment_visitor_count()
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count BIGINT;
BEGIN
  UPDATE visitor_count 
  SET 
    count = count + 1,
    updated_at = NOW()
  WHERE id = 1
  RETURNING count INTO new_count;
  
  RETURN new_count;
END;
$$;

-- 6. 関数の実行権限を付与
-- anon: 匿名ユーザー（Publishable Keyで接続）
-- authenticated: 認証済みユーザー
GRANT EXECUTE ON FUNCTION increment_visitor_count() TO anon, authenticated;

-- 7. 確認クエリ
SELECT * FROM visitor_count;

