import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// .env 파일에서 환경 변수 로드
dotenv.config();

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/mydatabase',
    },
  },
});

async function createTables() {
  try {
    // Prisma 모델을 사용하여 pwa_todo 테이블 생성
    await prisma.pwa_todo.create({
      data: {}, // 초기 데이터 없음
    });
    console.log("pwa_todo 테이블이 성공적으로 생성되었습니다.");

    // Prisma 모델을 사용하여 Subscription 테이블 생성
    await prisma.subscription.create({
      data: {}, // 초기 데이터 없음
    });
    console.log("Subscription 테이블이 성공적으로 생성되었습니다.");

    // Prisma 모델을 사용하여 user 테이블 생성
    await prisma.user.create({
      data: {}, // 초기 데이터 없음
    });
    console.log("user 테이블이 성공적으로 생성되었습니다.");

    // Prisma 모델을 사용하여 notification 테이블 생성
    await prisma.notification.create({
      data: {}, // 초기 데이터 없음
    });
    console.log("notification 테이블이 성공적으로 생성되었습니다.");
  } catch (err) {
    console.error("테이블 생성 중 오류가 발생했습니다:", err);
  } finally {
    // Prisma 클라이언트 연결 해제
    await prisma.$disconnect();
  }
}

// createTables 함수 실행
createTables();