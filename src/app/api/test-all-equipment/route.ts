import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rcckdqrnzcdzbofiguxx.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjY2tkcXJuemNkemJvZmlndXh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MTQxMDQsImV4cCI6MjA3ODE5MDEwNH0.0BodGWKcwy4lI39xWoNHbbWW4YiILKeWjHlu6Vc0lBc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request: NextRequest) {
  try {
    // Query all equipment (like the hook does)
    const { data, error } = await supabase
      .from('equipment')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ 
        error: error.message,
        details: error,
        code: error.code
      }, { status: 500 });
    }

    return NextResponse.json({ 
      count: data?.length || 0,
      equipment: data || []
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
} 