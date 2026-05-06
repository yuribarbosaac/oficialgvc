export const getLegalTimestamp = (): {
  iso: string;
  brasilia: string;
  timestamp: number;
  timezone: string;
  offset: string;
} => {
  const now = new Date();
  return {
    iso: now.toISOString(),
    brasilia: now.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
    timestamp: now.getTime(),
    timezone: 'America/Sao_Paulo',
    offset: '-03:00'
  };
};

export const formatDateTime = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
};