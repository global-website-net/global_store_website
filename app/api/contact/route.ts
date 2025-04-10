import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from 'resend';

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY);

// The email address where contact form submissions will be sent
const CONTACT_EMAIL = 'info@example.com'; // Replace with your actual email

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json();

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "جميع الحقول مطلوبة" },
        { status: 400 }
      );
    }

    // Save to database
    await prisma.contactMessage.create({
      data: {
        name,
        email,
        message,
      },
    });

    // Send email notification
    await resend.emails.send({
      from: 'Contact Form <onboarding@resend.dev>',
      to: CONTACT_EMAIL,
      subject: `رسالة جديدة من ${name}`,
      text: `
        اسم المرسل: ${name}
        البريد الإلكتروني: ${email}
        
        الرسالة:
        ${message}
      `,
    });

    return NextResponse.json(
      { message: "تم إرسال رسالتك بنجاح" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in contact form submission:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء إرسال الرسالة" },
      { status: 500 }
    );
  }
} 