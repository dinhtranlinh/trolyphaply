import { NextRequest, NextResponse } from 'next/server';
import {
  attachAdminCustomersGateCookie,
  getAdminCustomersGateStatus,
  verifyAdminCustomersPin,
  verifyAdminCustomersTotp
} from '@/lib/adminCustomersSecurity';

export async function POST(request: NextRequest) {
  try {
    const status = getAdminCustomersGateStatus(request);
    if (!status.ok) {
      return NextResponse.json(
        { success: false, error: status.reason },
        { status: status.status }
      );
    }

    const body = await request.json();
    const pin = (body?.pin || '').toString().trim();
    const code = (body?.code || '').toString().trim();

    if (!pin || !code) {
      return NextResponse.json(
        { success: false, error: 'PIN and code are required.' },
        { status: 400 }
      );
    }

    const pinOk = verifyAdminCustomersPin(pin);
    const totpOk = verifyAdminCustomersTotp(code);

    if (!pinOk || !totpOk) {
      return NextResponse.json(
        { success: false, error: 'Invalid PIN or code.' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ success: true });
    attachAdminCustomersGateCookie(response, status.ip);
    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
