const isValidCPFFormat = (cpf: string): boolean => {
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length !== 11) return false;
  
  if (/^(\d)\1+$/.test(cleaned)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i);
  }
  let digit1 = 11 - (sum % 11);
  if (digit1 > 9) digit1 = 0;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i)) * (11 - i);
  }
  let digit2 = 11 - (sum % 11);
  if (digit2 > 9) digit2 = 0;
  
  return digit1 === parseInt(cleaned.charAt(9)) && digit2 === parseInt(cleaned.charAt(10));
};

export interface CPFValidationResult {
  valid: boolean;
  status?: string;
  message?: string;
}

export const validateCPFReceita = async (cpf: string): Promise<CPFValidationResult> => {
  const cleaned = cpf.replace(/\D/g, '');
  
  if (!isValidCPFFormat(cleaned)) {
    return { valid: false, status: 'INVALIDO', message: 'CPF com formato inválido' };
  }
  
  try {
    const response = await fetch(`https://brasilapi.com.br/api/cpf/v1/${cleaned}`, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      return { valid: false, status: 'NAO_ENCONTRADO', message: 'CPF não encontrado na Receita Federal' };
    }
    
    const data = await response.json();
    return {
      valid: data.situacao_cadastral === 'Regular',
      status: data.situacao_cadastral,
      message: data.situacao_cadastral === 'Regular' ? 'CPF válido e ativo' : `Situação: ${data.situacao_cadastral}`
    };
  } catch (error) {
    console.error('Erro na validação do CPF:', error);
    return { valid: true, status: 'VERIFICACAO_INDISPONIVEL', message: 'Validação indisponível - usando fallback local' };
  }
};