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

    console.log("Starting to fetch users...");
    
    // Get only regular users (not admins and not shops)
    console.log("Querying users table...");
    const users = await prisma.user.findMany({
      where: {
        isAdmin: false,
        isShop: false
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`Found ${users.length} regular users`);
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error in GET /api/admin/users:", error);
    return NextResponse.json(
      { 
        message: "حدث خطأ أثناء جلب بيانات المستخدمين", 
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 