import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/auth.config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "يجب تسجيل الدخول للقيام بهذه العملية" },
        { status: 401 }
      );
    }

    const { amount } = await request.json();

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { message: "الرجاء إدخال مبلغ صحيح" },
        { status: 400 }
      );
    }

    // Get current user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        isShop: true,
        email: true,
      }
    });

    if (!user) {
      return NextResponse.json(
        { message: "لم يتم العثور على المستخدم" },
        { status: 404 }
      );
    }

    if (user.isShop) {
      return NextResponse.json(
        { message: "لا يمكن للمتاجر إضافة رصيد" },
        { status: 403 }
      );
    }

    // Update user balance and create balance history entry
    const updatedUser = await prisma.$transaction([
      prisma.user.update({
        where: { email: session.user.email },
        data: { balance: { increment: amount } },
      }),
      prisma.balanceHistory.create({
        data: {
          userId: user.id,
          amount: amount,
          type: 'add',
          isAdmin: false,
          updatedBy: user.id,
        },
      }),
    ]);

    return NextResponse.json({
      message: "تم إضافة الرصيد بنجاح",
      balance: updatedUser[0].balance,
    });
  } catch (error) {
    console.error("Error adding balance:", error);
    return NextResponse.json(
      { message: "حدث خطأ أثناء إضافة الرصيد" },
      { status: 500 }
    );
  }
} 