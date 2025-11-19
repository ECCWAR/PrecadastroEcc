export const formatPhoneNumber = (value: string) => {
  // Remove all non-digit characters
  const numbers = value.replace(/\D/g, '');
  
  // Limit to 11 digits (Brazilian cell phone format with DDD)
  const truncated = numbers.substring(0, 11);

  if (truncated.length <= 2) {
    return `(${truncated}`;
  }
  if (truncated.length <= 7) {
    return `(${truncated.substring(0, 2)}) ${truncated.substring(2)}`;
  }
  return `(${truncated.substring(0, 2)}) ${truncated.substring(2, 7)}-${truncated.substring(7)}`;
};

export const validatePhoneNumber = (phone: string): boolean => {
  const regex = /^\(\d{2}\) \d{5}-\d{4}$/;
  return regex.test(phone);
};