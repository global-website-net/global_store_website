import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/auth.config";
import prisma from "../../../../../lib/prisma";
import { PrismaClient } from "@prisma/client";

// Add type for transaction parameter
type TransactionClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Check if the logged-in user is an admin
    const adminUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!adminUser?.isAdmin) {
      return NextResponse.json({ message: "Unauthorized - Admin access required" }, { status: 403 });
    }

    const { userId, amount, type, reason } = await request.json();

    // Get the user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Update user balance and create balance history entry
    const updatedUser = await prisma.$transaction(async (tx: TransactionClient) => {
      // First update the user's balance
      const updatedUserBalance = await tx.user.update({
        where: { id: userId },
        data: {
          balance: type === 'add' ? user.balance + amount : user.balance - amount,
        },
      });

      // Then create a balance history entry
      await tx.balanceHistory.create({
        data: {
          userId,
          amount,
          type,
          reason,
          updatedBy: session.user.email || 'unknown',
          isAdmin: true,
        },
      });

      return updatedUserBalance;
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error in POST /api/admin/users/balance:", error);
    return NextResponse.json(
      { 
        message: "حدث خطأ أثناء تحديث الرصيد", 
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 