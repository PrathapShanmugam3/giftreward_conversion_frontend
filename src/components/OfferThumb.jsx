// Offer image, or a gradient initial when the offer has no image URL.
export default function OfferThumb({ offer, size = 'md' }) {
  const s = size === 'lg' ? 'h-14 w-14 rounded-2xl text-lg' : 'h-10 w-10 rounded-xl text-sm';
  if (offer.image) {
    return <img src={offer.image} alt="" className={`${s} shrink-0 bg-slate-100 object-cover ring-1 ring-line`} onError={(e) => (e.currentTarget.style.visibility = 'hidden')} />;
  }
  return (
    <span className={`${s} flex shrink-0 items-center justify-center bg-gradient-to-br from-brand-500 to-accent-600 font-extrabold text-white`}>
      {offer.name?.[0]?.toUpperCase() || '?'}
    </span>
  );
}
