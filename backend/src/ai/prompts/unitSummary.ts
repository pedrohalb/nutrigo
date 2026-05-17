export function buildSummarySystemPrompt() {
  return `Você é um assistente educacional de nutrição. Gere resumos curtos e motivadores de unidades de aprendizado concluídas. A resposta deve ser APENAS JSON válido.`;
}

export function buildSummaryUserPrompt(unitTitle: string, lessonTitles: string[]) {
  return `O usuário concluiu a unidade "${unitTitle}" com as seguintes lições: ${lessonTitles.join(', ')}.

Gere um resumo motivador em 2-3 frases destacando o que foi aprendido.

Responda APENAS com JSON no formato:
{
  "summary": "texto do resumo"
}`;
}
