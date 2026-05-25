import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Tambah kredit ke akaun user.
 *
 * Mode 1 (dari webhook payment - guna service role): hantar userEmail dalam payload
 * Mode 2 (admin manual): admin sahaja boleh tambah kredit kepada user lain
 *
 * Payload:
 *   - userEmail: string (target user — admin atau webhook sahaja)
 *   - amount: number (positif)
 *   - type: 'purchase' | 'bonus' | 'admin_adjustment' | 'refund'
 *   - description: string
 *   - referenceId: string (e.g. payment ID)
 *   - metadata: object (optional)
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const caller = await base44.auth.me();

    if (!caller) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userEmail, amount, type, description, referenceId, metadata } = await req.json();

    if (!amount || amount <= 0) {
      return Response.json({ error: 'Invalid amount' }, { status: 400 });
    }
    if (!type) {
      return Response.json({ error: 'Type required' }, { status: 400 });
    }

    // Tentukan target user — default ke caller sendiri kalau tiada userEmail
    let targetEmail = userEmail || caller.email;

    // Kalau caller cuba tambah kredit kepada user lain, mestilah admin
    if (targetEmail !== caller.email && caller.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin only' }, { status: 403 });
    }

    // Cari atau cipta UserCredit record
    const existing = await base44.asServiceRole.entities.UserCredit.filter({ userEmail: targetEmail });

    let credit;
    const now = new Date().toISOString();

    if (existing.length === 0) {
      credit = await base44.asServiceRole.entities.UserCredit.create({
        userEmail: targetEmail,
        balance: amount,
        totalPurchased: type === 'purchase' ? amount : 0,
        totalUsed: 0,
        lastTopUpAt: now,
      });
    } else {
      credit = existing[0];
      const newBalance = (credit.balance || 0) + amount;
      const newTotalPurchased = type === 'purchase'
        ? (credit.totalPurchased || 0) + amount
        : (credit.totalPurchased || 0);

      await base44.asServiceRole.entities.UserCredit.update(credit.id, {
        balance: newBalance,
        totalPurchased: newTotalPurchased,
        lastTopUpAt: now,
      });
      credit.balance = newBalance;
    }

    // Log transaction
    await base44.asServiceRole.entities.CreditTransaction.create({
      userEmail: targetEmail,
      type,
      amount,
      balanceAfter: credit.balance,
      feature: type === 'purchase' ? 'top_up' : (type === 'bonus' ? 'bonus' : 'admin'),
      description: description || `Tambah ${amount} kredit (${type})`,
      referenceId: referenceId || '',
      metadata: metadata || {},
    });

    return Response.json({
      success: true,
      userEmail: targetEmail,
      newBalance: credit.balance,
      amountAdded: amount,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});