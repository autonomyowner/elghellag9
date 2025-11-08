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
    const { homepage_subtitle } = await request.json();

    // Update the website settings
    const { error } = await supabase
      .from('website_settings')
      .upsert([{
        homepage_subtitle,
        announcement_text: `🌟 منصة الغلة - ${homepage_subtitle}`,
        updated_at: new Date().toISOString()
      }], { onConflict: 'id' });

    if (error) {
      console.error('Error updating website settings:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in update-homepage-text API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 