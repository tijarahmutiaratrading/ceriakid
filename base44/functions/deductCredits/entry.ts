import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Internal utility function untuk tolak kredit user.
 * Dipanggil oleh fungsi AI (askAIAssistant, generateAIStory, generateAIBBM).
 *
 * Payload:
 *   - amount: number (positif, kredit yang nak ditolak)
 *   - feature: string (ai_assistant | story_generator | bbm_generator)
 *   - description: string (untuk audit log)
 *   - metadata: object (optional, e.g. { model: 'gpt-5-mini', tokens: 1234 })
 *
 * Response:
 *   - success: true, newBalance: number
 *   - success: false, error: 'INSUFFICIENT_CREDITS', balance: number, required: number
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, feature, description, metadata } = await req.json();

    if (!amount || amount <= 0) {
      return Response.json({ error: 'Invalid amount' }, { status: 400 });
    }
    if (!feature) {
      return Response.json({ error: 'Feature required' }, { status: 400 });
    }

    // Cari record UserCredit
    const existing = await base44.asServiceRole.entities.UserCredit.filter({ userEmail: user.email });

    let credit;
    if (existing.length === 0) {
      // User belum ada kredit langsung
      return Response.json({
        success: false,
        error: 'INSUFFICIENT_CREDITS',
        balance: 0,
        required: amount,
      }, { status: 402 });
    }
    credit = existing[0];

    const currentBalance = credit.balance || 0;
    if (currentBalance < amount) {
      return Response.json({
        success: false,
        error: 'INSUFFICIENT_CREDITS',
        balance: currentBalance,
        required: amount,
      }, { status: 402 });
    }

    const newBalance = currentBalance - amount;
    const now = new Date().toISOString();

    // Update baki
    await base44.asServiceRole.entities.UserCredit.update(credit.id, {
      balance: newBalance,
      totalUsed: (credit.totalUsed || 0) + amount,
      lastUsedAt: now,
    });

    // Log transaction
    await base44.asServiceRole.entities.CreditTransaction.create({
      userEmail: user.email,
      type: 'usage',
      amount: -amount,
      balanceAfter: newBalance,
      feature,
      description: description || `Penggunaan ${feature}`,
      metadata: metadata || {},
    });

    return Response.json({
      success: true,
      newBalance,
      amountDeducted: amount,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});