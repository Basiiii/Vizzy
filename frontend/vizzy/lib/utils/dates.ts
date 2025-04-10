export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function onlyDayMonthYear(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
