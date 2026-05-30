// Credit deduction / refund / transaction logging helpers
// Used by all AI generator edge functions
import { supabaseAdmin } from './supabaseAdmin.ts';

export async function getOrCreateCredit(email: string) {
  const { data: existing } = await supabaseAdmin
    .from('ck_user_credits')
    .select('*')
    .eq('user_email', email)
    .maybeSingle();

  if (existing) return existing;

  const { data: created } = await supabaseAdmin
    .from('ck_user_credits')
    .insert({ user_email: email, balance: 0, total_purchased: 0, total_used: 0 })
    .select()
    .single();
  return created;
}

export async function deductCredits(
  email: string,
  amount: number,
  feature: string,
  description: string,
  metadata: any = {}
): Promise<{ ok: boolean; newBalance: number; creditId?: string; error?: string }> {
  const credit = await getOrCreateCredit(email);
  const currentBalance = credit?.balance || 0;

  if (currentBalance < amount) {
    return { ok: false, newBalance: currentBalance, error: 'INSUFFICIENT_CREDITS' };
  }

  const newBalance = currentBalance - amount;
  const now = new Date().toISOString();

  await supabaseAdmin
    .from('ck_user_credits')
    .update({
      balance: newBalance,
      total_used: (credit.total_used || 0) + amount,
      last_used_at: now,
    })
    .eq('id', credit.id);

  await supabaseAdmin.from('ck_credit_transactions').insert({
    user_email: email,
    type: 'usage',
    amount: -amount,
    balance_after: newBalance,
    feature,
    description,
    metadata,
  });

  return { ok: true, newBalance, creditId: credit.id };
}

export async function refundCredits(
  email: string,
  amount: number,
  feature: string,
  description: string
): Promise<void> {
  const credit = await getOrCreateCredit(email);
  const newBalance = (credit?.balance || 0) + amount;

  await supabaseAdmin
    .from('ck_user_credits')
    .update({
      balance: newBalance,
      total_used: Math.max(0, (credit?.total_used || 0) - amount),
    })
    .eq('id', credit.id);

  await supabaseAdmin.from('ck_credit_transactions').insert({
    user_email: email,
    type: 'refund',
    amount,
    balance_after: newBalance,
    feature,
    description,
  });
}

export async function addCredits(
  email: string,
  amount: number,
  type: 'purchase' | 'bonus' | 'admin_adjustment',
  feature: string,
  description: string,
  referenceId: string = '',
  metadata: any = {}
): Promise<{ newBalance: number }> {
  const credit = await getOrCreateCredit(email);
  const newBalance = (credit?.balance || 0) + amount;
  const now = new Date().toISOString();

  await supabaseAdmin
    .from('ck_user_credits')
    .update({
      balance: newBalance,
      total_purchased: type === 'purchase'
        ? (credit?.total_purchased || 0) + amount
        : (credit?.total_purchased || 0),
      last_top_up_at: now,
    })
    .eq('id', credit.id);

  await supabaseAdmin.from('ck_credit_transactions').insert({
    user_email: email,
    type,
    amount,
    balance_after: newBalance,
    feature,
    description,
    reference_id: referenceId,
    metadata,
  });

  return { newBalance };
}