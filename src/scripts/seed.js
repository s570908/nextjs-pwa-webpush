import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import {
  invoices,
  customers,
  revenue,
  users,
} from '../app/lib/placeholder-data.js';

// .env 파일에서 환경 변수 로드
dotenv.config();

const prisma = new PrismaClient();

async function seedUsers() {
  try {
    // Create the "users" table if it doesn't exist
    await prisma.user.create({
      data: users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        password: bcrypt.hashSync(user.password, 10),
      })),
    });

    console.log(`Seeded ${users.length} users`);
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
}

async function seedInvoices() {
  try {
    // Create the "invoices" table if it doesn't exist
    await prisma.invoice.create({
      data: invoices.map(invoice => ({
        customer_id: invoice.customer_id,
        amount: invoice.amount,
        status: invoice.status,
        date: invoice.date,
      })),
    });

    console.log(`Seeded ${invoices.length} invoices`);
  } catch (error) {
    console.error('Error seeding invoices:', error);
    throw error;
  }
}

async function seedCustomers() {
  try {
    // Create the "customers" table if it doesn't exist
    await prisma.customer.create({
      data: customers.map(customer => ({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        image_url: customer.image_url,
      })),
    });

    console.log(`Seeded ${customers.length} customers`);
  } catch (error) {
    console.error('Error seeding customers:', error);
    throw error;
  }
}

async function seedRevenue() {
  try {
    // Create the "revenue" table if it doesn't exist
    await prisma.revenue.create({
      data: revenue.map(rev => ({
        month: rev.month,
        revenue: rev.revenue,
      })),
    });

    console.log(`Seeded ${revenue.length} revenue`);
  } catch (error) {
    console.error('Error seeding revenue:', error);
    throw error;
  }
}

async function main() {
  try {
    await seedUsers();
    await seedCustomers();
    await seedInvoices();
    await seedRevenue();
  } catch (err) {
    console.error('An error occurred while attempting to seed the database:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
