
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'not configured',
      message: 'Gestão O.S - Sistema operacional'
    });
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Health check failed',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    );
  }
}
