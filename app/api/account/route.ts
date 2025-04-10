import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/auth.config";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "غير مصرح" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id
      },
      include: {
        transactions: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { message: "لم يتم العثور على المستخدم" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: user.id,
      balance: user.balance,
      transactions: user.transactions
    });
  } catch (error) {
    console.log("[ACCOUNT_GET_ERROR]", error);
    return NextResponse.json(
      { message: "حدث خطأ داخلي" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "غير مصرح" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { amount } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { message: "المبلغ غير صالح" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id
      }
    });

    if (!user) {
      return NextResponse.json(
        { message: "لم يتم العثور على المستخدم" },
        { status: 404 }
      );
    }

    // Create transaction and update balance
    const [transaction, updatedUser] = await prisma.$transaction([
      prisma.transaction.create({
        data: {
          amount,
          type: "DEPOSIT",
          userId: user.id
        }
      }),
      prisma.user.update({
        where: {
          id: user.id
        },
        data: {
          balance: {
            increment: amount
          }
        },
        include: {
          transactions: {
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      })
    ]);

    return NextResponse.json({
      id: updatedUser.id,
      balance: updatedUser.balance,
      transactions: updatedUser.transactions
    });
  } catch (error) {
    console.log("[ACCOUNT_POST_ERROR]", error);
    return NextResponse.json(
      { message: "حدث خطأ داخلي" },
      { status: 500 }
    );
  }
} 