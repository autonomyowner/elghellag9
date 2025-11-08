import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy initialization of Supabase client to avoid build-time errors
let supabaseInstance: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rcckdqrnzcdzbofiguxx.supabase.co';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjY2tkcXJuemNkemJvZmlndXh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MTQxMDQsImV4cCI6MjA3ODE5MDEwNH0.0BodGWKcwy4lI39xWoNHbbWW4YiILKeWjHlu6Vc0lBc';

    supabaseInstance = createClient(supabaseUrl, supabaseKey);
  }
  
  return supabaseInstance;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    // Update user to remove admin privileges
    const { data: updatedUsers, error: updateError } = await supabase
      .from('profiles')
      .update({
        user_type: 'user',
        role: 'user',
        is_admin: false
      })
      .eq('id', userId)
      .select();

    if (updateError) {
      console.error('Error removing admin privileges:', updateError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to remove admin privileges' 
      }, { status: 500 });
    }

    if (!updatedUsers || updatedUsers.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 });
    }

    const updatedUser = updatedUsers[0];

    // Create admin notification
    await supabase
      .from('admin_notifications')
      .insert({
        title: 'Admin Removed',
        message: `Admin privileges removed from user ${updatedUser.full_name || userId}`,
        type: 'warning',
        created_at: new Date().toISOString()
      });

    return NextResponse.json({ 
      success: true, 
      message: `Admin privileges removed from user ${updatedUser.full_name || userId}`,
      user: updatedUser
    });

  } catch (error) {
    console.error('Error removing admin:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 