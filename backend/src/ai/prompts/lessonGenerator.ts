import { GoalKind } from '@prisma/client';

const QUESTION_SCHEMA_DOC = `
Cada questão deve ser um dos três tipos abaixo:

1. multiple-choice:
{
  "type": "multiple-choice",
  "question": "texto da pergunta",
  "options": ["opção A", "opção B", "opção C", "opção D"],
  "correctIndex": 0,
  "explanation": "explicação curta do porquê a resposta está correta"
}

2. image-choice (use emojis representativos):
{
  "type": "image-choice",
  "question": "texto da pergunta",
  "options": [{"label": "Frango", "emoji": "🍗"}, {"label": "Brócolis", "emoji": "🥦"}],
  "correctIndex": 1,
  "explanation": "explicação curta"
}

3. fill-blank (complete a frase):
{
  "type": "fill-blank",
  "question": "A principal fonte de energia do corpo são os ___.",
  "chips": ["carboidratos", "proteínas", "gorduras", "vitaminas"],
  "correctChip": "carboidratos",
  "explanation": "explicação curta"
}`;

export function buildSkeletonSystemPrompt(profile: {
  name: string;
  objectives: string[];
  topics: string[];
  goal: GoalKind;
}) {
  return `Você é um especialista em educação nutricional gerando uma trilha de aprendizado personalizada estilo Duolingo.

Perfil do usuário:
- Nome: ${profile.name}
- Objetivos: ${profile.objectives.join(', ')}
- Tópicos de interesse: ${profile.topics.join(', ')}
- Meta diária: ${profile.goal}

Gere um plano educativo coerente e progressivo. A resposta deve ser APENAS JSON válido, sem texto adicional.`;
}

export function buildSkeletonUserPrompt() {
  return `Gere entre 6 e 8 unidades de aprendizado cobrindo os tópicos do perfil, organizadas em seções progressivas.

Responda APENAS com JSON no formato:
{
  "units": [
    { "section": 1, "unitNumber": 1, "title": "título da unidade" },
    ...
  ]
}`;
}

export function buildFullUnitSystemPrompt(profile: {
  name: string;
  objectives: string[];
  topics: string[];
  goal: GoalKind;
}) {
  return `Você é um especialista em educação nutricional gerando conteúdo educativo personalizado estilo Duolingo.

Perfil do usuário:
- Nome: ${profile.name}
- Objetivos: ${profile.objectives.join(', ')}
- Tópicos de interesse: ${profile.topics.join(', ')}
- Meta diária: ${profile.goal}

${QUESTION_SCHEMA_DOC}

A resposta deve ser APENAS JSON válido, sem texto adicional.`;
}

export function buildFullUnitUserPrompt(unitTitle: string, section: number, unitNumber: number) {
  return `Gere o conteúdo completo para a unidade "${unitTitle}" (Seção ${section}, Unidade ${unitNumber}).

Inclua:
- material de estudo com 3-5 seções explicativas
- entre 3 e 5 lições, cada uma com 4-6 questões variadas (use os 3 tipos)
- as lições devem ter orderIndex começando em 0

Responda APENAS com JSON no formato:
{
  "studyMaterial": {
    "sections": [
      { "title": "título da seção", "content": "conteúdo explicativo detalhado" }
    ]
  },
  "lessons": [
    {
      "orderIndex": 0,
      "title": "título da lição",
      "questions": [ ...questões no formato acima... ]
    }
  ]
}`;
}

export function buildLessonUserPrompt(
  unitTitle: string,
  previousLessonsTitles: string[],
  orderIndex: number
) {
  return `Gere a lição ${orderIndex + 1} para a unidade "${unitTitle}".
Lições já existentes nesta unidade: ${previousLessonsTitles.join(', ')}.
Esta lição deve avançar o conteúdo sem repetir o que já foi coberto.

Responda APENAS com JSON no formato:
{
  "title": "título da lição",
  "questions": [ ...entre 4 e 6 questões no formato definido... ]
}`;
}
