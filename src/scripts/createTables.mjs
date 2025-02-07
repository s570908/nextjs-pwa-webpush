import { config } from 'dotenv';
import { sql } from "@vercel/postgres";

// Load environment variables from .env file
config();

async function createTables() {
  try {
    // Create pwa_todo table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS pwa_todo (
        id SERIAL PRIMARY KEY,
        task TEXT NOT NULL,
        due TIMESTAMPTZ NOT NULL,
        done BOOLEAN NOT NULL DEFAULT FALSE
      );
    `;
    console.log("pwa_todo 테이블이 성공적으로 생성되었습니다.");

    // Alter pwa_todo table if it exists
    await sql`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pwa_todo' AND column_name='due' AND data_type='timestamp without time zone') THEN
          ALTER TABLE pwa_todo
          ALTER COLUMN due TYPE TIMESTAMPTZ;
        END IF;
      END $$;
    `;
    console.log("pwa_todo 테이블의 스키마가 성공적으로 변경되었습니다.");

    // Create pwa_subscription table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS pwa_subscription (
        id SERIAL PRIMARY KEY,
        endpoint TEXT NOT NULL,
        keys JSONB NOT NULL
      );
    `;
    console.log("pwa_subscription 테이블이 성공적으로 생성되었습니다.");
  } catch (err) {
    console.error("테이블 생성 중 오류가 발생했습니다:", err);
  }
}

createTables();