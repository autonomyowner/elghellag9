import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: false,
    error: 'الخدمة قيد الصيانة - Service under maintenance'
  }, { status: 503 });
}
