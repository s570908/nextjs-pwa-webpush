import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// .env 파일에서 환경 변수 로드
dotenv.config();

const prisma = new PrismaClient();

async function initDB() {
  try {
    // Prisma 모델을 사용하여 pwa_todo 테이블 생성
    await prisma.pwa_todo.createMany({
      data: [], // 초기 데이터 없음
      skipDuplicates: true, // 중복 레코드가 있으면 건너뜀
    });
    console.log("pwa_todo 테이블이 성공적으로 생성되었습니다.");

    // Prisma 모델을 사용하여 Subscription 테이블 생성
    await prisma.subscription.createMany({
      data: [], // 초기 데이터 없음
      skipDuplicates: true, // 중복 레코드가 있으면 건너뜀
    });
    console.log("Subscription 테이블이 성공적으로 생성되었습니다.");
  } catch (error) {
    console.error('데이터베이스 초기화 중 오류 발생:', error);
  } finally {
    // Prisma 클라이언트 연결 해제
    await prisma.$disconnect();
  }
}

// initDB 함수 실행
initDB();