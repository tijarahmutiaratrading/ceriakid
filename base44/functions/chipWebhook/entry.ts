import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Tier config — MESTI SYNC dengan lib/affiliateTiers.js (no local imports allowed)
const TIER_CONFIG = [
  { key: 'bronze',   min: 0,   max: 9,        subRate: 20, credRate: 15 },
  { key: 'silver',   min: 10,  max: 29,       subRate: 23, credRate: 17 },
  { key: 'gold',     min: 30,  max: 99,       subRate: 26, credRate: 19 },
  { key: 'platinum', min: 100, max: Infinity, subRate: 30, credRate: 22 },
];

function calculateTier(totalReferrals) {
  return TIER_CONFIG.find(t => totalReferrals >= t.min && totalReferrals <= t.max) || TIER_CONFIG[0];
}

// Helper untuk track komisen affiliate. Reference format akhir: "...__ref_CODE"
async function trackAffiliateCommission(base44, {
  referralCode, referredEmail, purchaseType, purchaseDetail, purchaseAmountMYR, chipPurchaseId,
}) {
  try {
    if (!referralCode) return;

    // Idempotency — sudah ada entry untuk purchaseId ini?
    const existingRef = await base44.asServiceRole.entities.AffiliateReferral.filter({ chipPurchaseId });
    if (existingRef.length > 0) {
      console.log(`Affiliate commission already tracked for ${chipPurchaseId}`);
      return;
    }

    const aff = await base44.asServiceRole.entities.Affiliate.filter({ referralCode });
    if (aff.length === 0 || aff[0].status !== 'active') {
      console.log(`Affiliate not found / inactive for code ${referralCode}`);
      return;
    }
    const affiliate = aff[0];

    // Tak boleh refer diri sendiri
    if (affiliate.userEmail === referredEmail) {
      console.log(`Self-referral blocked for ${referredEmail}`);
      return;
    }

    // Guna rate yang tersimpan pada affiliate (admin boleh override secara manual)
    const rate = purchaseType === 'subscription'
      ? (affiliate.commissionRateSubscription || 20)
      : (affiliate.commissionRateCredit || 15);
    const commissionMYR = Math.round((purchaseAmountMYR * rate / 100) * 100) / 100;

    await base44.asServiceRole.entities.AffiliateReferral.create({
      affiliateEmail: affiliate.userEmail,
      referralCode,
      referredEmail,
      purchaseType,
      purchaseDetail,
      purchaseAmountMYR,
      commissionRate: rate,
      commissionMYR,
      status: 'approved',
      chipPurchaseId,
    });

    // ─── AUTO-UPGRADE TIER ───
    // Kira tier baru berdasarkan totalReferrals + 1
    const newTotalReferrals = (affiliate.totalReferrals || 0) + 1;
    const newTier = calculateTier(newTotalReferrals);
    const currentTier = affiliate.tier || 'bronze';

    const updateData = {
      totalReferrals: newTotalReferrals,
      totalEarned: (affiliate.totalEarned || 0) + commissionMYR,
      pendingBalance: (affiliate.pendingBalance || 0) + commissionMYR,
    };

    // Hanya update tier & rate kalau tier berubah (naik level)
    // Tak tukar rate kalau admin dah override (e.g., rate lebih tinggi dari tier default)
    if (newTier.key !== currentTier) {
      updateData.tier = newTier.key;
      // Update rate hanya kalau current rate sama dengan tier lama (tiada manual override)
      const oldTier = TIER_CONFIG.find(t => t.key === currentTier) || TIER_CONFIG[0];
      if ((affiliate.commissionRateSubscription || 20) === oldTier.subRate) {
        updateData.commissionRateSubscription = newTier.subRate;
      }
      if ((affiliate.commissionRateCredit || 15) === oldTier.credRate) {
        updateData.commissionRateCredit = newTier.credRate;
      }
      console.log(`🎉 Tier upgrade: ${affiliate.userEmail} ${currentTier} → ${newTier.key} (${newTotalReferrals} referrals)`);
    }

    await base44.asServiceRole.entities.Affiliate.update(affiliate.id, updateData);

    console.log(`Affiliate commission tracked: ${affiliate.userEmail} +RM${commissionMYR} from ${referredEmail}`);
  } catch (err) {
    console.error('trackAffiliateCommission error:', err);
  }
}

// Extract referral code dari reference string. Format: "...__ref_CODE"
function extractReferralCode(reference) {
  if (!reference) return '';
  const match = reference.match(/__ref_([A-Z0-9]+)$/);
  return match ? match[1] : '';
}

// Chip payment webhook — aktivkan subscription bila payment berjaya
Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const bodyText = await req.text();

    // ─── Verify Chip webhook signature (HMAC SHA256) ───
    // Chip sends X-Signature header. We compute HMAC of raw body using CHIP_WEBHOOK_SECRET
    // and compare. Reject if mismatch — prevents fake webhook attacks.
    const webhookSecret = Deno.env.get('CHIP_WEBHOOK_SECRET');
    const signatureHeader = req.headers.get('X-Signature') || req.headers.get('x-signature');
    if (webhookSecret && signatureHeader) {
      try {
        const encoder = new TextEncoder();
        const key = await crypto.subtle.importKey(
          'raw',
          encoder.encode(webhookSecret),
          { name: 'HMAC', hash: 'SHA-256' },
          false,
          ['sign']
        );
        const sigBytes = await crypto.subtle.sign('HMAC', key, encoder.encode(bodyText));
        const computedHex = Array.from(new Uint8Array(sigBytes)).map(b => b.toString(16).padStart(2, '0')).join('');
        const provided = signatureHeader.replace(/^sha256=/, '').toLowerCase().trim();
        if (computedHex !== provided) {
          console.error('Webhook signature mismatch');
          return Response.json({ error: 'Invalid signature' }, { status: 401 });
        }
      } catch (sigErr) {
        console.error('Signature verification failed:', sigErr);
        return Response.json({ error: 'Signature verification failed' }, { status: 401 });
      }
    } else if (webhookSecret && !signatureHeader) {
      console.error('Missing webhook signature header');
      return Response.json({ error: 'Missing signature' }, { status: 401 });
    }
    // ─── End signature verification ───

    const body = JSON.parse(bodyText);

    console.log('Chip webhook received:', JSON.stringify(body));

    // Chip always sends id, status, reference on every event
    if (!body.id || body.status === undefined) {
      console.error('Invalid webhook payload — missing id or status');
      return Response.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const secretKey = Deno.env.get('CHIP_SECRET_KEY');
    if (!secretKey) {
      return Response.json({ error: 'Payment gateway not configured' }, { status: 500 });
    }

    // Chip sends payment status in the payload
    const status = body.status;
    const purchaseId = body.id;
    const reference = body.reference; // format: "email__tier__timestamp"

    // Verify purchase directly with Chip before activating subscription
    const verifyResponse = await fetch(`https://gate.chip-in.asia/api/v1/purchases/${purchaseId}/`, {
      headers: { 'Authorization': `Bearer ${secretKey}` }
    });

    if (!verifyResponse.ok) {
      console.error('Unable to verify Chip purchase:', purchaseId);
      return Response.json({ error: 'Unable to verify purchase' }, { status: 400 });
    }

    const verifiedPurchase = await verifyResponse.json();
    const verifiedStatus = verifiedPurchase.status;
    const verifiedReference = verifiedPurchase.reference;

    // Only process successful payments confirmed by Chip API
    if (status !== 'paid' || verifiedStatus !== 'paid') {
      console.log('Payment not paid, webhook status:', status, 'verified status:', verifiedStatus);
      return Response.json({ received: true });
    }

    if (verifiedReference && verifiedReference !== reference) {
      console.error('Reference mismatch:', reference, verifiedReference);
      return Response.json({ error: 'Reference mismatch' }, { status: 400 });
    }

    if (!reference) {
      console.error('No reference found in webhook payload');
      return Response.json({ error: 'Missing reference' }, { status: 400 });
    }

    // ─── CREDIT PURCHASE: reference = "credit__email__packageId__totalCredits__timestamp" ───
    if (reference.startsWith('credit__')) {
      const creditParts = reference.split('__');
      if (creditParts.length < 5) {
        console.error('Invalid credit reference format:', reference);
        return Response.json({ error: 'Invalid credit reference' }, { status: 400 });
      }
      const creditUserEmail = creditParts[1];
      const packageId = creditParts[2];
      const totalCredits = parseInt(creditParts[3], 10);

      if (!creditUserEmail || !totalCredits || totalCredits <= 0) {
        console.error('Invalid credit data:', { creditUserEmail, totalCredits });
        return Response.json({ error: 'Invalid credit data' }, { status: 400 });
      }

      // Idempotency check — kalau dah ada transaction dengan referenceId yang sama, skip
      const existingTx = await base44.asServiceRole.entities.CreditTransaction.filter({
        referenceId: purchaseId,
      });
      if (existingTx.length > 0) {
        console.log(`Credit purchase already processed: ${purchaseId}`);
        return Response.json({ received: true, alreadyProcessed: true });
      }

      // Tambah kredit terus (inline — tak panggil fungsi addCredits sebab webhook unauthenticated)
      const existingCredit = await base44.asServiceRole.entities.UserCredit.filter({ userEmail: creditUserEmail });
      const nowIso = new Date().toISOString();
      let newBalance;
      if (existingCredit.length === 0) {
        const created = await base44.asServiceRole.entities.UserCredit.create({
          userEmail: creditUserEmail,
          balance: totalCredits,
          totalPurchased: totalCredits,
          totalUsed: 0,
          lastTopUpAt: nowIso,
        });
        newBalance = created.balance;
      } else {
        const c = existingCredit[0];
        newBalance = (c.balance || 0) + totalCredits;
        await base44.asServiceRole.entities.UserCredit.update(c.id, {
          balance: newBalance,
          totalPurchased: (c.totalPurchased || 0) + totalCredits,
          lastTopUpAt: nowIso,
        });
      }

      await base44.asServiceRole.entities.CreditTransaction.create({
        userEmail: creditUserEmail,
        type: 'purchase',
        amount: totalCredits,
        balanceAfter: newBalance,
        feature: 'top_up',
        description: `Pembelian pakej ${packageId} — ${totalCredits} kredit`,
        referenceId: purchaseId,
        metadata: { packageId, chipPurchaseId: purchaseId },
      });

      console.log(`Credit purchase activated: ${creditUserEmail} +${totalCredits} (pkg=${packageId})`);

      // ─── AFFILIATE COMMISSION (credit purchase) ───
      const creditRefCode = extractReferralCode(reference);
      if (creditRefCode) {
        const priceMYR = (verifiedPurchase.purchase?.total || 0) / 100;
        await trackAffiliateCommission(base44, {
          referralCode: creditRefCode,
          referredEmail: creditUserEmail,
          purchaseType: 'credit',
          purchaseDetail: packageId,
          purchaseAmountMYR: priceMYR,
          chipPurchaseId: purchaseId,
        });
      }

      return Response.json({ received: true, creditActivated: true, credits: totalCredits });
    }
    // ─── END CREDIT PURCHASE ───

    // Parse reference: "userEmail__tier__timestamp"
    const parts = reference.split('__');
    if (parts.length < 3) {
      console.error('Invalid reference format (expected email__tier__timestamp):', reference);
      return Response.json({ error: 'Invalid reference' }, { status: 400 });
    }

    const userEmail = parts[0];
    const tier = parts[1];
    const timestamp = parts[2];

    const validTiers = ['asas', 'standard', 'keluarga'];
    if (!validTiers.includes(tier)) {
      console.error('Invalid tier in reference:', tier);
      return Response.json({ error: 'Invalid tier' }, { status: 400 });
    }

    // Security: verify purchaseId matches what we stored for this user
    // This prevents reference spoofing — the purchase ID from Chip must match
    const verifyExisting = await base44.asServiceRole.entities.UserSubscription.filter({ email: userEmail });
    if (verifyExisting.length > 0) {
      const storedPurchaseId = verifyExisting[0].stripeCustomerId; // we store Chip purchase ID here
      if (storedPurchaseId && storedPurchaseId !== purchaseId) {
        console.error(`Purchase ID mismatch for ${userEmail}: stored=${storedPurchaseId}, received=${purchaseId}`);
        return Response.json({ error: 'Purchase ID mismatch' }, { status: 400 });
      }
    }

    // Calculate expiry — 1 year from now
    const now = new Date();
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    // Find existing subscription (use already fetched)
    const existing = verifyExisting;

    const subData = {
      email: userEmail,
      tier: tier,
      status: 'active',
      stripeCustomerId: purchaseId, // storing Chip purchase ID
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: expiryDate.toISOString(),
    };

    if (existing.length > 0) {
      await base44.asServiceRole.entities.UserSubscription.update(existing[0].id, subData);
    } else {
      await base44.asServiceRole.entities.UserSubscription.create(subData);
    }

    console.log(`Subscription activated: ${userEmail} → ${tier} until ${expiryDate.toISOString()}`);

    // ─── BONUS WELCOME CREDITS ikut tier ───
    // Asas: 5 | Standard: 20 | Keluarga: 50
    const WELCOME_CREDITS = { asas: 5, standard: 20, keluarga: 50 };
    const bonusAmount = WELCOME_CREDITS[tier] || 0;

    if (bonusAmount > 0) {
      // Idempotency — guna purchaseId sebagai referenceId, prefix "welcome__" supaya
      // tak conflict dengan credit purchase. Skip kalau dah ada transaction sama.
      const welcomeRefId = `welcome__${purchaseId}`;
      const existingBonus = await base44.asServiceRole.entities.CreditTransaction.filter({
        referenceId: welcomeRefId,
      });

      if (existingBonus.length === 0) {
        const existingCredit = await base44.asServiceRole.entities.UserCredit.filter({ userEmail });
        const nowIso = new Date().toISOString();
        let bonusNewBalance;
        if (existingCredit.length === 0) {
          const created = await base44.asServiceRole.entities.UserCredit.create({
            userEmail,
            balance: bonusAmount,
            totalPurchased: 0,
            totalUsed: 0,
            lastTopUpAt: nowIso,
          });
          bonusNewBalance = created.balance;
        } else {
          const c = existingCredit[0];
          bonusNewBalance = (c.balance || 0) + bonusAmount;
          await base44.asServiceRole.entities.UserCredit.update(c.id, {
            balance: bonusNewBalance,
            lastTopUpAt: nowIso,
          });
        }

        await base44.asServiceRole.entities.CreditTransaction.create({
          userEmail,
          type: 'bonus',
          amount: bonusAmount,
          balanceAfter: bonusNewBalance,
          feature: 'bonus',
          description: `🎁 Bonus selamat datang — pelan ${tier} (${bonusAmount} kredit AI percuma)`,
          referenceId: welcomeRefId,
          metadata: { tier, chipPurchaseId: purchaseId, source: 'subscription_welcome_bonus' },
        });

        console.log(`Welcome bonus awarded: ${userEmail} +${bonusAmount} kredit (tier=${tier})`);
      } else {
        console.log(`Welcome bonus already awarded for ${purchaseId}, skipping`);
      }
    }
    // ─── END BONUS CREDITS ───

    // ─── AFFILIATE COMMISSION (subscription) ───
    const subRefCode = extractReferralCode(reference);
    if (subRefCode) {
      const subPricing = { asas: 49, standard: 99, keluarga: 199 };
      const priceMYR = subPricing[tier] || 0;
      await trackAffiliateCommission(base44, {
        referralCode: subRefCode,
        referredEmail: userEmail,
        purchaseType: 'subscription',
        purchaseDetail: tier,
        purchaseAmountMYR: priceMYR,
        chipPurchaseId: purchaseId,
      });
    }

    return Response.json({ received: true, activated: true, welcomeCredits: bonusAmount });

  } catch (error) {
    console.error('Chip webhook error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});