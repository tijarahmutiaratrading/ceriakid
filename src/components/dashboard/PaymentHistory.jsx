import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Receipt, Download } from 'lucide-react';

export default function PaymentHistory({ userEmail }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayments();
  }, [userEmail]);

  const loadPayments = async () => {
    try {
      // Mock payment data—ideally fetch from Stripe or payment service
      setPayments([]);
    } catch (error) {
      console.error('Failed to load payments:', error);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading || payments.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl p-5 border-2 border-amber-200 shadow-lg mb-6"
    >
      <h3 className="font-black text-lg text-gray-800 flex items-center gap-2 mb-4">
        <Receipt className="w-5 h-5 text-game-orange" />
        Payment History
      </h3>
      
      <div className="space-y-3">
        {payments.map((payment, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-100"
          >
            <div>
              <p className="font-bold text-sm text-gray-800">{payment.plan}</p>
              <p className="text-xs text-gray-600">{new Date(payment.date).toLocaleDateString('ms-MY')}</p>
            </div>
            <div className="flex items-center gap-3">
              <p className="font-black text-sm text-game-purple">RM {payment.amount}</p>
              <button className="text-game-orange hover:text-orange-700">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}