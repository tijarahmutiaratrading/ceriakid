import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Cari record UserCredit untuk user ini
    const existing = await base44.asServiceRole.entities.UserCredit.filter({ userEmail: user.email });

    let credit;
    if (existing.length === 0) {
      // Cipta record baru dengan 0 kredit
      credit = await base44.asServiceRole.entities.UserCredit.create({
        userEmail: user.email,
        balance: 0,
        totalPurchased: 0,
        totalUsed: 0,
      });
    } else {
      credit = existing[0];
    }

    // Get last 10 transactions untuk display
    const transactions = await base44.asServiceRole.entities.CreditTransaction.filter(
      { userEmail: user.email },
      '-created_date',
      10
    );

    return Response.json({
      balance: credit.balance || 0,
      totalPurchased: credit.totalPurchased || 0,
      totalUsed: credit.totalUsed || 0,
      lastTopUpAt: credit.lastTopUpAt,
      lastUsedAt: credit.lastUsedAt,
      recentTransactions: transactions,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});