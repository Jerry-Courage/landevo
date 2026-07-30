export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' })
    .format(amount)
    .replace('NGN', '₦');
};

export const formatDate = (d: string | Date | null | undefined) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' });
};
