'use client';

import React, { useState } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/supabase/supabaseClient';

const TestConnectionPage: React.FC = () => {
  const { user } = useSupabaseAuth();
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testBasicConnection = async () => {
    setLoading(true);
    setResults([]);
    
    addResult('Starting connection tests...');

    try {
      // Test 1: Basic Supabase connection
      addResult('Testing Supabase client initialization...');
      const startTime = Date.now();
      
      // Test 2: Simple query with timeout
      addResult('Testing simple database query...');
      const queryStart = Date.now();
      
      const result = await Promise.race([
        supabase.from('profiles').select('count').limit(1),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Query timeout after 10 seconds')), 10000)
        )
      ]) as any;
      
      const { data, error } = result;

      const queryTime = Date.now() - queryStart;
      addResult(`Query completed in ${queryTime}ms`);

      if (error) {
        addResult(`❌ Database error: ${error.message}`);
      } else {
        addResult(`✅ Database connection successful`);
      }

      // Test 3: Auth status
      addResult(`Auth status: ${user ? 'Logged in' : 'Not logged in'}`);
      if (user) {
        addResult(`User ID: ${user.id}`);
        addResult(`User email: ${user.email}`);
      }

      // Test 4: Network connectivity
      addResult('Testing network connectivity...');
      try {
        const networkStart = Date.now();
        const response = await fetch('https://httpbin.org/get', {
          method: 'GET',
          signal: AbortSignal.timeout(5000)
        });
        const networkTime = Date.now() - networkStart;
        addResult(`✅ Network connectivity: ${response.status} (${networkTime}ms)`);
      } catch (networkError) {
        addResult(`❌ Network error: ${networkError instanceof Error ? networkError.message : 'Unknown'}`);
      }

      // Test 5: Supabase URL reachability
      addResult('Testing Supabase URL reachability...');
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rcckdqrnzcdzbofiguxx.supabase.co';
        const urlStart = Date.now();
        const response = await fetch(supabaseUrl, {
          method: 'HEAD',
          signal: AbortSignal.timeout(5000)
        });
        const urlTime = Date.now() - urlStart;
        addResult(`✅ Supabase URL reachable: ${response.status} (${urlTime}ms)`);
      } catch (urlError) {
        addResult(`❌ Supabase URL error: ${urlError instanceof Error ? urlError.message : 'Unknown'}`);
      }

      const totalTime = Date.now() - startTime;
      addResult(`Total test time: ${totalTime}ms`);

    } catch (error) {
      addResult(`❌ Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
      addResult('Connection test completed');
    }
  };

  const testAuthFlow = async () => {
    setLoading(true);
    addResult('Testing authentication flow...');

    try {
      // Test sign in with timeout
      const startTime = Date.now();
      
      const authResult = await Promise.race([
        supabase.auth.signInWithPassword({
          email: 'test@example.com',
          password: 'wrongpassword'
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Auth timeout after 15 seconds')), 15000)
        )
      ]) as any;
      
      const { data, error } = authResult;

      const authTime = Date.now() - startTime;
      addResult(`Auth request completed in ${authTime}ms`);

      if (error) {
        addResult(`✅ Auth error (expected): ${error.message}`);
      } else {
        addResult(`❌ Unexpected auth success`);
      }

    } catch (error) {
      addResult(`❌ Auth test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Connection & Performance Test</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={testBasicConnection}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginRight: '10px'
          }}
        >
          {loading ? 'Testing...' : 'Test Connection'}
        </button>

        <button 
          onClick={testAuthFlow}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: loading ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginRight: '10px'
          }}
        >
          {loading ? 'Testing...' : 'Test Auth'}
        </button>

        <button 
          onClick={clearResults}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Clear Results
        </button>
      </div>

      <div style={{ 
        padding: '10px', 
        backgroundColor: '#f8f9fa', 
        border: '1px solid #dee2e6',
        borderRadius: '4px',
        maxHeight: '400px',
        overflowY: 'auto',
        fontFamily: 'monospace',
        fontSize: '12px'
      }}>
        {results.length === 0 ? (
          <div style={{ color: '#6c757d' }}>Click "Test Connection" to start...</div>
        ) : (
          results.map((result, index) => (
            <div key={index} style={{ marginBottom: '5px' }}>
              {result}
            </div>
          ))
        )}
      </div>

      {user && (
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#e9ecef' }}>
          <strong>Current User:</strong> {user.email}
        </div>
      )}

      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#fff3cd', border: '1px solid #ffeaa7' }}>
        <strong>Performance Tips:</strong>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>If queries take &gt;5 seconds, there&apos;s a network/connection issue</li>
          <li>If auth takes &gt;10 seconds, Supabase might be slow</li>
          <li>Check your internet connection and try again</li>
          <li>Consider using a different network if problems persist</li>
        </ul>
      </div>
    </div>
  );
};

export default TestConnectionPage; 