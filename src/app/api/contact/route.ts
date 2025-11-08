import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { emailService } from '@/lib/emailService';

// Server-side client that bypasses RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rcckdqrnzcdzbofiguxx.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjY2tkcXJuemNkemJvZmlndXh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MTQxMDQsImV4cCI6MjA3ODE5MDEwNH0.0BodGWKcwy4lI39xWoNHbbWW4YiILKeWjHlu6Vc0lBc';

// Create a server-side client that can bypass RLS
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, subject, message, message_type = 'general' } = await request.json();

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, error: 'يرجى ملء جميع الحقول المطلوبة' },
        { status: 400 }
      );
    }

    // Validate email
    if (!email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'يرجى إدخال بريد إلكتروني صحيح' },
        { status: 400 }
      );
    }

    // Insert contact message
    const { error: insertError } = await supabase
      .from('contact_messages')
      .insert({
        name,
        email,
        phone: phone || null,
        subject,
        message,
        message_type,
        status: 'unread',
        created_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('Error inserting contact message:', insertError);
      return NextResponse.json(
        { success: false, error: 'حدث خطأ أثناء إرسال الرسالة' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.' }
    );

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    console.log('Fetching contact messages with server-side client...');
    
    // First, let's check if we can access the table at all
    const { data: messages, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching contact messages:', error);
      return NextResponse.json(
        { success: false, error: 'حدث خطأ أثناء جلب البيانات' },
        { status: 500 }
      );
    }

    console.log('Contact messages fetched successfully:', messages?.length || 0, 'messages');
    return NextResponse.json({ success: true, data: messages });

  } catch (error) {
    console.error('Contact GET error:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const { status, admin_reply } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'معرف الرسالة مطلوب' },
        { status: 400 }
      );
    }

    // First, get the original message to send email
    const { data: originalMessage, error: fetchError } = await supabase
      .from('contact_messages')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching original message:', fetchError);
      return NextResponse.json(
        { success: false, error: 'حدث خطأ أثناء جلب الرسالة الأصلية' },
        { status: 500 }
      );
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (admin_reply) updateData.admin_reply = admin_reply;
    updateData.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('contact_messages')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Error updating contact message:', error);
      return NextResponse.json(
        { success: false, error: 'حدث خطأ أثناء تحديث الرسالة' },
        { status: 500 }
      );
    }

    // Send email if admin_reply is provided
    if (admin_reply && originalMessage) {
      try {
        const emailResult = await emailService.sendAdminReply(
          originalMessage.email,
          originalMessage.name || 'عزيزي المستخدم',
          originalMessage.subject || 'رسالة من الغلة',
          admin_reply
        );

        if (!emailResult.success) {
          console.warn('Email sending failed:', emailResult.error);
          // Don't fail the entire request if email fails
        } else {
          console.log('Admin reply email sent successfully');
        }
      } catch (emailError) {
        console.error('Email sending error:', emailError);
        // Don't fail the entire request if email fails
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'تم تحديث الرسالة بنجاح' + (admin_reply ? ' وتم إرسال الرد بالبريد الإلكتروني' : '')
    });

  } catch (error) {
    console.error('Contact PATCH error:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'معرف الرسالة مطلوب' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('contact_messages')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting contact message:', error);
      return NextResponse.json(
        { success: false, error: 'حدث خطأ أثناء حذف الرسالة' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'تم حذف الرسالة بنجاح' });

  } catch (error) {
    console.error('Contact DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
} 