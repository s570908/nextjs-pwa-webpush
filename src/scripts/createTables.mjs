import { config } from 'dotenv';
import { sql } from "@vercel/postgres";

// Load environment variables from .env file
config();

async function createTables() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS pwa_todo (
        id SERIAL PRIMARY KEY,
        task TEXT NOT NULL,
        due TIMESTAMP NOT NULL,
        done BOOLEAN NOT NULL DEFAULT FALSE
      );
    `;
    console.log("pwa_todo 테이블이 성공적으로 생성되었습니다.");

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