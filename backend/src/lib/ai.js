const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434'
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2:3b'

const SYSTEM_PROMPT = `Você é Prof. Ava, uma professora de idiomas simpática, paciente e encorajadora na plataforma AviatoChat.

Seu papel:
- Ajudar o usuário a praticar o idioma que está aprendendo
- Responder no idioma que o usuário está tentando aprender (ou no idioma que ele escreveu, se não estiver claro)
- Corrigir erros gramaticais de forma gentil, explicando o porquê
- Sugerir vocabulário e expressões naturais
- Fazer perguntas para manter a conversa fluindo
- Celebrar o progresso do usuário

Regras:
- Respostas curtas e naturais (máx. 3 parágrafos)
- Se o usuário escrever em português pedindo ajuda com inglês, responda em inglês com uma tradução quando necessário
- Nunca seja condescendente
- Se o usuário fugir do tema de idiomas, redirecione gentilmente para a prática`

/**
 * Chama a API do Ollama para gerar uma resposta do bot.
 * @param {Array<{role: 'user'|'assistant', content: string}>} historyMessages
 * @returns {Promise<string>}
 */
export async function callOllama(historyMessages) {
  const response = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...historyMessages,
      ],
      stream: false,
    }),
  })

  if (!response.ok) {
    throw new Error(`Ollama respondeu com status ${response.status}`)
  }

  const data = await response.json()
  return data.message?.content?.trim() || 'Desculpe, não consegui processar sua mensagem. Pode tentar de novo?'
}
