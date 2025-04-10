'use strict';

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/auth.config";
import prisma from "../../../../lib/prisma";
import type { Prisma, PrismaClient } from "@prisma/client";

// Enable strict type checking
type TransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const adminUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!adminUser?.isAdmin) {
      return NextResponse.json({ message: "Unauthorized - Admin access required" }, { status: 403 });
    }

    const { userId, amount, type, description } = await request.json();

    if (!userId || !amount || !type) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // Start a transaction to ensure data consistency
    const result = await prisma.$transaction<{
      user: Prisma.UserGetPayload<{ include: { transactions: true } }>;
      transaction: Prisma.TransactionGetPayload<{}>;
    }>(async (tx: TransactionClient) => {
      // Get the user's current balance
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { balance: true }
      });

      if (!user) {
        throw new Error("User not found");
      }

      // Calculate new balance
      const newBalance = type === "DEPOSIT" 
        ? user.balance + amount 
        : user.balance - amount;

      if (newBalance < 0) {
        throw new Error("Insufficient funds");
      }

      // Update user balance
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { balance: newBalance },
        include: {
          transactions: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      });

      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          amount,
          type,
          description: description || (type === "DEPOSIT" ? "Admin deposit" : "Admin withdrawal"),
          userId
        }
      });

      return { user: updatedUser, transaction };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error processing admin transaction:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to process transaction" },
      { status: 500 }
    );
  }
} 