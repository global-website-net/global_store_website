import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/auth.config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "غير مصرح لك بالوصول" },
        { status: 401 }
      );
    }

    // Check if the logged-in user is an admin
    const adminUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!adminUser?.isAdmin) {
      return NextResponse.json(
        { message: "غير مصرح لك بالوصول" },
        { status: 403 }
      );
    }

    const data = await request.json();
    const { userId, amount, operation, reason } = data;

    if (!userId || !amount || !operation || !reason) {
      return NextResponse.json(
        { message: "بيانات غير صحيحة" },
        { status: 400 }
      );
    }

    // Get the user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { message: "المستخدم غير موجود" },
        { status: 404 }
      );
    }

    // Calculate new balance
    const newBalance = operation === 'add' 
      ? user.balance + amount
      : user.balance - amount;

    // Update user balance and create balance history entry
    const updatedUser = await prisma.$transaction(async (tx) => {
      // First update the user's balance
      const updatedUserBalance = await tx.user.update({
        where: { id: userId },
        data: { balance: newBalance }
      });

      // Then create the balance history entry
      await tx.balanceHistory.create({
        data: {
          userId: userId,
          amount: amount,
          type: operation,
          reason: reason,
          updatedBy: session.user.email,
          isAdmin: true
        }
      });

      return updatedUserBalance;
    });

    return NextResponse.json({
      message: operation === 'add' ? 'تم إضافة الرصيد بنجاح' : 'تم خصم الرصيد بنجاح',
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating balance:", error);
    return NextResponse.json(
      { message: "حدث خطأ أثناء تحديث الرصيد" },
      { status: 500 }
    );
  }
} 