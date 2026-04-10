import { supabase } from '../lib/supabase';

// Configurações da MEGA API
const MEGA_API_URL = 'https://apinocode01.megaapi.com.br/rest/sendMessage/megacode-MklLzdcnE3X/text';
const MEGA_API_TOKEN = 'MklLzdcnE3X';

interface SendMessageResponse {
  status: number;
  message: string;
  messageId?: string;
}

/**
 * Envia mensagem WhatsApp via MEGA API e salva no Supabase
 * @param phoneNumber - Número do telefone (pode incluir ou não formatação)
 * @param message - Texto da mensagem a ser enviada
 * @returns Promise com a resposta da API
 */
export async function sendWhatsAppMessage(
  phoneNumber: string,
  message: string
): Promise<SendMessageResponse> {
  try {
    // Remove formatação do telefone (só números)
    const cleanPhone = phoneNumber.replace(/\D/g, '');

    // Formata número para MEGA API (55 + DDD + número @s.whatsapp.net)
    // Formato esperado: 5511999999999@s.whatsapp.net
    const formattedPhone = cleanPhone.includes('@')
      ? cleanPhone
      : `${cleanPhone}@s.whatsapp.net`;

    console.log('Enviando mensagem para:', formattedPhone);
    console.log('Mensagem:', message);

    // 1. Enviar via MEGA API
    const response = await fetch(MEGA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MEGA_API_TOKEN}`,
      },
      body: JSON.stringify({
        number: formattedPhone,
        text: message,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao enviar mensagem');
    }

    // 2. Salvar no Supabase (n8n_chat_histories)
    const { error: dbError } = await supabase
      .from('n8n_chat_histories')
      .insert({
        session_id: cleanPhone,
        message: {
          type: 'agent',
          content: message,
          additional_kwargs: {},
          response_metadata: {}
        },
        created_at: new Date().toISOString()
      });

    if (dbError) {
      console.error('Aviso: Mensagem enviada mas não salvou no histórico:', dbError);
      // Não lançar erro - a mensagem já foi enviada
    } else {
      console.log('✅ Mensagem salva no histórico do Supabase');
    }

    return {
      status: response.status,
      message: 'Mensagem enviada com sucesso',
      messageId: data.messageId,
    };
  } catch (error: any) {
    console.error('Erro ao enviar mensagem WhatsApp:', error);
    throw new Error(error.message || 'Falha ao enviar mensagem');
  }
}

/**
 * Formata número de telefone para exibição
 * @param phoneNumber - Número do telefone
 * @returns Número formatado para exibição
 */
export function formatPhoneForDisplay(phoneNumber: string): string {
  const clean = phoneNumber.replace(/\D/g, '');

  if (clean.length === 13) {
    // Formato: 55 11 99999 9999
    return `+${clean.slice(0, 2)} (${clean.slice(2, 4)}) ${clean.slice(4, 9)}-${clean.slice(9)}`;
  } else if (clean.length === 12) {
    // Formato: 55 11 9999 9999
    return `+${clean.slice(0, 2)} (${clean.slice(2, 4)}) ${clean.slice(4, 8)}-${clean.slice(8)}`;
  }

  return phoneNumber;
}
