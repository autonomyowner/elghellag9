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
    const { 
      full_name, 
      email, 
      phone, 
      specialization, 
      experience_years, 
      education, 
      certifications, 
      bio, 
      services_offered, 
      languages, 
      availability, 
      hourly_rate, 
      portfolio_url, 
      cv_file_url 
    } = await request.json();

    // Validate required fields
    if (!full_name || !email || !phone || !specialization || !experience_years || !bio) {
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

    // Validate experience years
    if (experience_years < 1 || experience_years > 50) {
      return NextResponse.json(
        { success: false, error: 'يرجى إدخال سنوات خبرة صحيحة' },
        { status: 400 }
      );
    }

    // Insert expert application
    const { error: insertError } = await supabase
      .from('expert_applications')
      .insert({
        full_name,
        email,
        phone,
        specialization,
        experience_years,
        education: education || null,
        certifications: certifications || null,
        bio,
        services_offered: services_offered || null,
        languages: languages || null,
        availability: availability || null,
        hourly_rate: hourly_rate || null,
        portfolio_url: portfolio_url || null,
        cv_file_url: cv_file_url || null,
        status: 'pending',
        created_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('Error inserting expert application:', insertError);
      return NextResponse.json(
        { success: false, error: 'حدث خطأ أثناء إرسال الطلب' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'تم إرسال طلبك بنجاح! سنراجع طلبك ونتواصل معك قريباً.' }
    );

  } catch (error) {
    console.error('Expert application error:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    console.log('Fetching expert applications with server-side client...');
    const { data: applications, error } = await supabase
      .from('expert_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching expert applications:', error);
      return NextResponse.json(
        { success: false, error: 'حدث خطأ أثناء جلب البيانات' },
        { status: 500 }
      );
    }

    console.log('Expert applications fetched successfully:', applications?.length || 0, 'applications');
    return NextResponse.json({ success: true, data: applications });

  } catch (error) {
    console.error('Expert application GET error:', error);
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
    const { status, admin_notes, admin_reply } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'معرف الطلب مطلوب' },
        { status: 400 }
      );
    }

    // First, get the original application to send email
    const { data: originalApplication, error: fetchError } = await supabase
      .from('expert_applications')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching original application:', fetchError);
      return NextResponse.json(
        { success: false, error: 'حدث خطأ أثناء جلب الطلب الأصلي' },
        { status: 500 }
      );
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (admin_notes) updateData.admin_notes = admin_notes;
    if (admin_reply) updateData.admin_reply = admin_reply;
    updateData.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('expert_applications')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Error updating expert application:', error);
      return NextResponse.json(
        { success: false, error: 'حدث خطأ أثناء تحديث الطلب' },
        { status: 500 }
      );
    }

    // Send email if status is approved or rejected
    if (status && (status === 'approved' || status === 'rejected') && originalApplication) {
      try {
        const emailResult = await emailService.sendExpertResponse(
          originalApplication.email,
          originalApplication.full_name,
          status,
          admin_notes
        );

        if (!emailResult.success) {
          console.warn('Email sending failed:', emailResult.error);
          // Don't fail the entire request if email fails
        } else {
          console.log('Expert application response email sent successfully');
        }
      } catch (emailError) {
        console.error('Email sending error:', emailError);
        // Don't fail the entire request if email fails
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'تم تحديث الطلب بنجاح' + (status && (status === 'approved' || status === 'rejected') ? ' وتم إرسال الإشعار بالبريد الإلكتروني' : '')
    });

  } catch (error) {
    console.error('Expert application PATCH error:', error);
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
        { success: false, error: 'معرف الطلب مطلوب' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('expert_applications')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting expert application:', error);
      return NextResponse.json(
        { success: false, error: 'حدث خطأ أثناء حذف الطلب' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'تم حذف الطلب بنجاح' });

  } catch (error) {
    console.error('Expert application DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
} 