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
    const { email, full_name } = await request.json();

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'البريد الإلكتروني مطلوب' },
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

    // Check if already subscribed
    const { data: existingSubscription } = await supabase
      .from('newsletter_subscriptions')
      .select('*')
      .eq('email', email)
      .single();

    if (existingSubscription) {
      return NextResponse.json(
        { success: false, error: 'أنت مشترك بالفعل في النشرة البريدية' },
        { status: 400 }
      );
    }

    // Insert newsletter subscription
    const { error: insertError } = await supabase
      .from('newsletter_subscriptions')
      .insert({
        email,
        full_name: full_name || null,
        status: 'active',
        subscribed_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('Error inserting newsletter subscription:', insertError);
      return NextResponse.json(
        { success: false, error: 'حدث خطأ أثناء الاشتراك في النشرة البريدية' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'تم الاشتراك في النشرة البريدية بنجاح!' }
    );

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    console.log('Fetching newsletter subscriptions...');
    const { data: subscriptions, error } = await supabase
      .from('newsletter_subscriptions')
      .select('*')
      .order('subscribed_at', { ascending: false });

    if (error) {
      console.error('Error fetching newsletter subscriptions:', error);
      return NextResponse.json(
        { success: false, error: 'حدث خطأ أثناء جلب البيانات' },
        { status: 500 }
      );
    }

    console.log('Newsletter subscriptions fetched successfully:', subscriptions?.length || 0, 'subscriptions');
    return NextResponse.json({ success: true, data: subscriptions });

  } catch (error) {
    console.error('Newsletter GET error:', error);
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
    const { status, subject, content } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'معرف الاشتراك مطلوب' },
        { status: 400 }
      );
    }

    // If sending newsletter
    if (subject && content) {
      // Get all active subscribers
      const { data: subscribers, error: fetchError } = await supabase
        .from('newsletter_subscriptions')
        .select('email')
        .eq('status', 'active');

      if (fetchError) {
        console.error('Error fetching subscribers:', fetchError);
        return NextResponse.json(
          { success: false, error: 'حدث خطأ أثناء جلب المشتركين' },
          { status: 500 }
        );
      }

      if (!subscribers || subscribers.length === 0) {
        return NextResponse.json(
          { success: false, error: 'لا يوجد مشتركين نشطين' },
          { status: 400 }
        );
      }

      // Send newsletter to all subscribers
      const subscriberEmails = subscribers.map(sub => sub.email);
      const emailResult = await emailService.sendNewsletter(subscriberEmails, subject, content);

      if (!emailResult.success) {
        console.error('Newsletter sending failed:', emailResult.error);
        return NextResponse.json(
          { success: false, error: 'حدث خطأ أثناء إرسال النشرة البريدية' },
          { status: 500 }
        );
      }

      return NextResponse.json({ 
        success: true, 
        message: `تم إرسال النشرة البريدية بنجاح إلى ${emailResult.sentCount} مشترك`
      });
    }

    // Update subscription status
    const updateData: any = {};
    if (status) updateData.status = status;
    updateData.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('newsletter_subscriptions')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Error updating newsletter subscription:', error);
      return NextResponse.json(
        { success: false, error: 'حدث خطأ أثناء تحديث الاشتراك' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'تم تحديث الاشتراك بنجاح' });

  } catch (error) {
    console.error('Newsletter PATCH error:', error);
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
        { success: false, error: 'معرف الاشتراك مطلوب' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('newsletter_subscriptions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting newsletter subscription:', error);
      return NextResponse.json(
        { success: false, error: 'حدث خطأ أثناء حذف الاشتراك' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'تم حذف الاشتراك بنجاح' });

  } catch (error) {
    console.error('Newsletter DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
} 