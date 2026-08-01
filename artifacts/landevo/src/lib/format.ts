export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' })
    .format(amount)
    .replace('GHS', '₵');
};

export const formatDate = (d: string | Date | null | undefined) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GH', { month: 'short', day: 'numeric', year: 'numeric' });
};
