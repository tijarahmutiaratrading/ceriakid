// Temporary admin function — verify CHIP purchase status by purchase ID
// Direct API call to CHIP to confirm payment status.
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin only' }, { status: 403 });
    }

    const { purchaseId } = await req.json();
    if (!purchaseId) {
      return Response.json({ error: 'purchaseId required' }, { status: 400 });
    }

    const CHIP_SECRET_KEY = Deno.env.get('CHIP_SECRET_KEY');
    const CHIP_BRAND_ID = Deno.env.get('CHIP_BRAND_ID');

    if (!CHIP_SECRET_KEY || !CHIP_BRAND_ID) {
      return Response.json({ error: 'CHIP not configured' }, { status: 500 });
    }

    // Call CHIP Purchases API
    const chipResponse = await fetch(`https://gate.chip-in.asia/api/v1/purchases/${purchaseId}/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CHIP_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await chipResponse.json();

    if (!chipResponse.ok) {
      return Response.json({
        error: 'CHIP API error',
        status: chipResponse.status,
        details: data,
      }, { status: chipResponse.status });
    }

    // Extract critical fields for easy reading
    return Response.json({
      success: true,
      purchaseId: data.id,
      status: data.status, // 'paid', 'created', 'expired', 'cancelled', etc.
      paymentMethod: data.payment?.payment_type || null,
      amountMYR: data.purchase?.total ? (data.purchase.total / 100) : null,
      currency: data.purchase?.currency,
      clientEmail: data.client?.email,
      clientName: data.client?.full_name,
      createdOn: data.created_on ? new Date(data.created_on * 1000).toISOString() : null,
      paidOn: data.paid_on ? new Date(data.paid_on * 1000).toISOString() : null,
      expiresOn: data.payment?.expires_on ? new Date(data.payment.expires_on * 1000).toISOString() : null,
      isTest: data.is_test,
      reference: data.reference,
      fullResponse: data,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});