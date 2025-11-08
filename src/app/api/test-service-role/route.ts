import { NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy initialization of Supabase client to avoid build-time errors
let supabaseInstance: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rcckdqrnzcdzbofiguxx.supabase.co';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseServiceKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is required');
    }

    supabaseInstance = createClient(supabaseUrl, supabaseServiceKey);
  }
  
  return supabaseInstance;
}

export async function GET() {
  try {
    const supabase = getSupabaseClient();
    console.log('Testing service role connection...');
    
    // Test basic connection with service role
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Service role error:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Service role connection successful',
      data: data
    });

  } catch (error) {
    console.error('Error testing service role:', error);
    return NextResponse.json({ 
      success: false, 
      error: `Service role test failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    });
  }
} 