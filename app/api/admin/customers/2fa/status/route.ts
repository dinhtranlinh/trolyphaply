import { NextRequest, NextResponse } from 'next/server';
import { getAdminCustomersGateStatus } from '@/lib/adminCustomersSecurity';

export async function GET(request: NextRequest) {
  try {
    const status = getAdminCustomersGateStatus(request);
    if (!status.ok) {
      return NextResponse.json(
        { success: false, error: status.reason },
        { status: status.status }
      );
    }

    return NextResponse.json({
      success: true,
      verified: status.twoFactorOk
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
