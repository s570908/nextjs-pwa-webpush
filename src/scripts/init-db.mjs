import { sql } from "@vercel/postgres";
import dotenv from 'dotenv';

// 환경 변수 로드
dotenv.config();

async function addUniqueConstraint() {
  try {
    await sql`
      ALTER TABLE pwa_subscription ADD CONSTRAINT unique_endpoint UNIQUE (endpoint);
    `;
    console.log('Unique constraint added successfully.');
  } catch (error) {
    console.error('Error adding unique constraint:', error);
  }
}

addUniqueConstraint();