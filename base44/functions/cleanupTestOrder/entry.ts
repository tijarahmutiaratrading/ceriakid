import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const testEmail = 'test-payment-1780873986103@ceriaкid.test';

    console.log(`Cleaning up test order for: ${testEmail}`);

    // Delete subscription
    const subs = await base44.asServiceRole.entities.UserSubscription.filter({
      email: testEmail,
    });
    if (subs.length > 0) {
      await base44.asServiceRole.entities.UserSubscription.delete(subs[0].id);
      console.log(`✓ Deleted subscription: ${subs[0].id}`);
    }

    // Delete credit record
    const credits = await base44.asServiceRole.entities.UserCredit.filter({
      userEmail: testEmail,
    });
    if (credits.length > 0) {
      await base44.asServiceRole.entities.UserCredit.delete(credits[0].id);
      console.log(`✓ Deleted credit record: ${credits[0].id}`);
    }

    // Delete transactions
    const transactions = await base44.asServiceRole.entities.CreditTransaction.filter({
      userEmail: testEmail,
    });
    for (const txn of transactions) {
      await base44.asServiceRole.entities.CreditTransaction.delete(txn.id);
      console.log(`✓ Deleted transaction: ${txn.id}`);
    }

    return Response.json({
      success: true,
      cleaned: {
        subscriptions: subs.length,
        credits: credits.length,
        transactions: transactions.length,
      },
      message: 'Test order cleaned up successfully',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});