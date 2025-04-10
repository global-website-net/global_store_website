import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/auth.config";
import prisma from "../../../../lib/prisma";

export async function GET() {
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
    
    // Get only shop accounts
    const shops = await prisma.user.findMany({
      where: {
        isShop: true
      },
      orderBy: {
        name: 'asc'
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        balance: true,
        createdAt: true,
      },
    });

    return NextResponse.json(shops);
  } catch (error) {
    console.error("Error in GET /api/admin/shops:", error);
    return NextResponse.json(
      { 
        message: "حدث خطأ أثناء جلب بيانات المتاجر", 
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 