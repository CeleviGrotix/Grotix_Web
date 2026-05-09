export const DATE_FORMATS = {
  SHORT: 'DD/MM/YYYY',
  LONG: 'DD/MM/YYYY HH:mm',
};

// Función de utilidad compartida
export const formatDate = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString('es-PE', { 
    day: '2-digit', month: '2-digit', year: 'numeric' 
  });
};