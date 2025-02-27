"use server";
import { PrismaClient } from '@prisma/client';
import { ToDo } from "@/app/pwa-todo/types";

const prisma = new PrismaClient();

export async function createToDo(task: string, due: string) {
  await prisma.pwa_todo.create({
    data: {
      task,
      due,
      done: false,
    },
  });
}

export async function getAllToDo() {
  const data = await prisma.pwa_todo.findMany({
    orderBy: {
      id: 'asc',
    },
  });
  return data;
}

export async function updateToDoStatus(id: number, done: boolean) {
  await prisma.pwa_todo.update({
    where: { id },
    data: { done },
  });
}

export async function getSubscriptions() {
  try {
    const subscriptions = await prisma.subscription.findMany();
    return subscriptions;
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    throw new Error('Failed to fetch subscriptions');
  }
}

interface Subscription {
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
}

export async function addSubscription(subscription: Subscription): Promise<Subscription> {
    try {
        const data = await prisma.subscription.upsert({
            where: { endpoint: subscription.endpoint },
            update: { keys: subscription.keys },
            create: {
                endpoint: subscription.endpoint,
                keys: subscription.keys,
            },
        });
        return data;
    } catch (error) {
        console.error('Error adding subscription:', error);
        throw new Error('Failed to add subscription');
    }
}

export async function removeSubscription(endpoint: string): Promise<void> {
    try {
        await prisma.subscription.delete({
            where: { endpoint },
        });
    } catch (error) {
        console.error('Error removing subscription:', error);
        throw new Error('Failed to remove subscription');
    }
}
