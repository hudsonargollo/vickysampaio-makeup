import { GoogleGenAI } from "@google/genai";
import { MOCK_PROVIDER } from "../constants";

let ai: GoogleGenAI | null = null;

const getAI = () => {
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }
  return ai;
};

export const generateChatResponse = async (
  userMessage: string,
  history: { role: string; parts: { text: string }[] }[]
): Promise<string> => {
  const client = getAI();
  if (!process.env.API_KEY) {
    return "Desculpe, estou offline no momento (Falta API Key).";
  }

  const serviceList = MOCK_PROVIDER.services
    .map(s => `- ${s.name} (${s.duration} min, R$ ${s.price}): ${s.description}`)
    .join('\n');

  const policies = MOCK_PROVIDER.policies?.join('\n- ') || "Regras padrão aplicadas.";

  const loyaltyInfo = MOCK_PROVIDER.loyaltyProgram?.enabled
    ? `PROGRAMA DE FIDELIDADE: A cada ${MOCK_PROVIDER.loyaltyProgram.threshold} visitas, a cliente ganha ${MOCK_PROVIDER.loyaltyProgram.rewardDescription}.`
    : "Sem programa de fidelidade ativo no momento.";

  const systemInstruction = `Você é a assistente virtual da ${MOCK_PROVIDER.name}.
Seu objetivo é ajudar clientes a escolher serviços, entender as políticas e tirar dúvidas sobre maquiagem e agendamentos.
Seja elegante, acolhedora e profissional. Use linguagem feminina e sofisticada.

Informações do Negócio:
- Nome: ${MOCK_PROVIDER.name}
- Maquiadora: ${MOCK_PROVIDER.professionals[0].name} (${MOCK_PROVIDER.professionals[0].role})
- Localização: ${MOCK_PROVIDER.location}
- Avaliação: ${MOCK_PROVIDER.rating}/5 (${MOCK_PROVIDER.reviewCount} avaliações)

Serviços Disponíveis:
${serviceList}

Políticas:
- ${policies}

${loyaltyInfo}

Responda sempre em português brasileiro. Seja concisa e útil. Não invente informações que não estão listadas acima.`;

  try {
    const model = client.models;
    const response = await model.generateContent({
      model: 'gemini-2.0-flash',
      contents: [
        ...history,
        { role: 'user', parts: [{ text: userMessage }] }
      ],
      config: {
        systemInstruction,
        maxOutputTokens: 300,
      }
    });

    return response.text ?? "Desculpe, não consegui processar sua mensagem.";
  } catch (error) {
    console.error("Gemini error:", error);
    return "Desculpe, ocorreu um erro. Tente novamente em instantes.";
  }
};
