import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/auth.config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    console.log("Session:", session); // Debug log

    if (!session?.user?.email) {
      console.log("No session or email"); // Debug log
      return NextResponse.json(
        { message: "غير مصرح لك بالوصول" },
        { status: 401 }
      );
    }

    console.log("Fetching user with email:", session.user.email); // Debug log

    // Get user details including balance history
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        balance: true,
        isAdmin: true,
        isShop: true,
      },
    });

    console.log("Found user:", user); // Debug log

    if (!user) {
      console.log("User not found"); // Debug log
      return NextResponse.json(
        { message: "المستخدم غير موجود" },
        { status: 404 }
      );
    }

    // Get balance history for the user
    const balanceHistory = await prisma.balanceHistory.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        amount: true,
        type: true,
        createdAt: true,
        updatedBy: true,
        isAdmin: true,
      },
    });

    // Calculate balance after each operation
    let runningBalance = user.balance;
    const balanceHistoryWithRunningBalance = balanceHistory.map(record => {
      // Since records are in descending order, we need to reverse the operation
      if (record.type === 'add') {
        runningBalance -= record.amount;
      } else {
        runningBalance += record.amount;
      }
      return {
        ...record,
        balanceAfter: runningBalance + (record.type === 'add' ? record.amount : -record.amount)
      };
    });

    console.log("Balance history count:", balanceHistoryWithRunningBalance.length); // Debug log

    return NextResponse.json({
      user,
      balanceHistory: balanceHistoryWithRunningBalance,
    });
  } catch (error) {
    // Detailed error logging
    console.error("Error in /api/user/details:", error);
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    return NextResponse.json(
      { 
        message: "حدث خطأ أثناء جلب بيانات المستخدم",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 