import React from 'react';

// Papar gambar AI jika ada untuk emoji ni, jika tidak fallback ke emoji.
// `text` boleh ada emoji + perkataan (cth: "🥁 Dum") — kita hanya tukar bahagian
// emoji jadi gambar bila ia emoji tunggal sahaja. Untuk teks bercampur, kekal text.
export default function EmojiOrImage({ value, map = {}, className = '', imgClassName = '' }) {
  const str = String(value ?? '');
  const url = map[str.trim()];

  if (url) {
    return (
      <img
        src={url}
        alt=""
        loading="lazy"
        decoding="async"
        className={imgClassName || 'w-full h-full object-contain'}
      />
    );
  }

  return <span className={className}>{value}</span>;
}