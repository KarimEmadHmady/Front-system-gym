// Utility functions for user modals

export const formatDateTime = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 => 12
  return `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
};

export const normalizeId = (v: unknown): string | null => {
  if (!v) return null;
  if (typeof v === 'string') return v.trim();
  if (typeof v === 'object') {
    const obj = v as any;
    if (typeof obj._id === 'string') return obj._id.trim();
    if (typeof obj.id === 'string') return obj.id.trim();
  }
  return null;
};
