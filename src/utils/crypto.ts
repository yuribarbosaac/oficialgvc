export const generateDocumentHash = async (content: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const generateRandomHash = async (): Promise<string> => {
  const randomData = Math.random().toString(36) + Date.now().toString();
  return generateDocumentHash(randomData);
};