import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Lazy initialization of Supabase client to avoid build-time errors
let supabaseInstance: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rcckdqrnzcdzbofiguxx.supabase.co';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseServiceKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for admin operations');
    }

    supabaseInstance = createClient(supabaseUrl, supabaseServiceKey);
  }
  
  return supabaseInstance;
}

export async function POST(request: NextRequest) {
  try {
    // Initialize Supabase client lazily
    const supabase = getSupabaseClient();
    
    console.log('Admin add request received');
    
    const { email } = await request.json();
    console.log('Email received:', email);

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    // Create new admin user profile
    const adminName = `Admin ${email.split('@')[0]}`;

    console.log('Admin name:', adminName);

    // First check if user already exists in auth
    console.log('Checking if user exists in auth...');
    const { data: existingAuthUser, error: authCheckError } = await supabase.auth.admin.listUsers();

    if (authCheckError) {
      console.error('Error checking auth users:', authCheckError);
      return NextResponse.json({ 
        success: false, 
        error: `Failed to check auth users: ${authCheckError.message}`,
        details: authCheckError
      }, { status: 500 });
    }

    // Find user by email
    const authUser = existingAuthUser.users.find((user: any) => user.email === email);
    let userId;

    if (authUser) {
      console.log('User already exists in auth, using existing ID:', authUser.id);
      userId = authUser.id;
    } else {
      console.log('Creating new user in auth.users...');
      const { data: newAuthUser, error: authError } = await supabase.auth.admin.createUser({
        email: email,
        password: crypto.randomBytes(16).toString('hex'), // Random password
        email_confirm: true,
        user_metadata: {
          full_name: adminName,
          user_type: 'admin'
        }
      });

      if (authError) {
        console.error('Error creating auth user:', authError);
        return NextResponse.json({ 
          success: false, 
          error: `Failed to create auth user: ${authError.message}`,
          details: authError
        }, { status: 500 });
      }

      console.log('Auth user created successfully:', newAuthUser.user.id);
      userId = newAuthUser.user.id;
    }

    // Check if profile already exists
    console.log('Checking if profile exists...');
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (existingProfile) {
      console.log('Profile already exists, updating to admin...');
      const { data: updatedUser, error: updateError } = await supabase
        .from('profiles')
        .update({
          user_type: 'admin',
          role: 'admin',
          is_admin: true,
          is_verified: true,
          full_name: adminName
        })
        .eq('id', userId)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating profile:', updateError);
        return NextResponse.json({ 
          success: false, 
          error: `Failed to update profile: ${updateError.message}`,
          details: updateError
        }, { status: 500 });
      }

      console.log('Profile updated to admin successfully:', updatedUser);
      return NextResponse.json({ 
        success: true, 
        message: `Admin privileges updated for ${email}`,
        user: updatedUser
      });
    }

    // Create new profile in profiles table
    console.log('Creating new profile in profiles table...');
    const { data: newUser, error: createError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        full_name: adminName,
        phone: null,
        location: null,
        avatar_url: null,
        user_type: 'admin',
        is_verified: true,
        bio: null,
        website: null,
        social_links: {},
        role: 'admin',
        is_admin: true
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating admin profile:', createError);
      return NextResponse.json({ 
        success: false, 
        error: `Failed to create admin profile: ${createError.message}`,
        details: createError
      }, { status: 500 });
    }

    console.log('Admin user created successfully:', newUser);

    return NextResponse.json({ 
      success: true, 
      message: `Admin privileges added to ${email}`,
      user: newUser
    });

  } catch (error) {
    console.error('Error adding admin:', error);
    return NextResponse.json({ 
      success: false, 
      error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
} 