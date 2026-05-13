import { useRef, useState } from 'react';

export default function useMiniFeedback() {
  const [feedback, setFeedback] = useState(null);
  const timerRef = useRef(null);

  const showFeedback = (type, message = '') => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setFeedback({ type, message: message || (type === 'correct' ? 'Jawapan tepat' : 'Jawapan belum tepat') });
    timerRef.current = setTimeout(() => setFeedback(null), 900);
  };

  return { feedback, showFeedback };
}