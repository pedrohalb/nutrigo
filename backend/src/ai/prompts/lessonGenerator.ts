import { GoalKind } from '@prisma/client';

const MISSION = `MISSÃO DO APP:
O Nutrigo existe para que o usuário, ao final da trilha, consiga MONTAR SUA PRÓPRIA DIETA
e MELHORAR SEUS HÁBITOS ALIMENTARES sem depender de nutricionista ou aplicativos pagos.
Cada lição deve avançar essa autonomia: ensinar a LER rótulos, ESTIMAR porções, COMBINAR
alimentos por nutriente, ADAPTAR refeições ao orçamento/rotina e RECONHECER ultraprocessados.
Privilegie conhecimento ACIONÁVEL no dia-a-dia em vez de curiosidades acadêmicas.`;

const QUESTION_GUIDELINES = `REGRAS PARA AS QUESTÕES:
- Crie questões aplicadas, com cenários reais (almoço fora, lanche no trabalho, treino, jejum etc.)
  em vez de definições enciclopédicas.
- VARIAÇÃO DA RESPOSTA CORRETA: distribua \`correctIndex\` e \`correctChip\` aleatoriamente entre
  as posições. A alternativa correta deve aparecer RARAMENTE na primeira posição (índice 0).
  Tente manter no máximo ~20% das questões com correctIndex = 0; prefira índices 1, 2 ou 3.
- Em image-choice: o emoji DEVE representar visualmente o alimento/conceito do label de forma
  inequívoca. Se não houver emoji adequado (ex.: "feijão preto", "fibras"), use multiple-choice
  ou fill-blank em vez de forçar um emoji genérico. Nunca use 🍽️/🥄/❓ como ícone do alimento.
- explanation deve ser uma justificativa curta e prática (1-2 frases) que reforce a regra
  aplicável fora da prova.

Tipos de questão (responda como JSON, sem comentários):

1. multiple-choice:
{
  "type": "multiple-choice",
  "question": "texto da pergunta",
  "options": ["opção A", "opção B", "opção C", "opção D"],
  "correctIndex": 2,
  "explanation": "explicação curta do porquê a resposta está correta"
}

2. image-choice (emojis que representam SEM ambiguidade o alimento):
{
  "type": "image-choice",
  "question": "Qual destes é fonte primária de proteína magra?",
  "options": [
    {"label": "Pão branco", "emoji": "🍞"},
    {"label": "Frango grelhado", "emoji": "🍗"},
    {"label": "Refrigerante", "emoji": "🥤"},
    {"label": "Sorvete", "emoji": "🍨"}
  ],
  "correctIndex": 1,
  "explanation": "Frango grelhado tem ~25g de proteína a cada 100g e baixa gordura."
}

3. fill-blank (complete a frase):
{
  "type": "fill-blank",
  "question": "A principal fonte de energia do corpo são os ___.",
  "chips": ["proteínas", "carboidratos", "gorduras", "vitaminas"],
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

${MISSION}

Perfil do usuário:
- Nome: ${profile.name}
- Objetivos: ${profile.objectives.join(', ')}
- Tópicos de interesse: ${profile.topics.join(', ')}
- Meta diária: ${profile.goal}

Estruture o plano para que, ao final da última unidade, o usuário consiga MONTAR UMA DIETA
SOZINHO alinhada aos objetivos dele. Vá da base (macronutrientes, leitura de rótulos, porções)
para aplicação (planejamento semanal, substituições, adaptação a contextos).
A resposta deve ser APENAS JSON válido, sem texto adicional.`;
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

${MISSION}

Perfil do usuário:
- Nome: ${profile.name}
- Objetivos: ${profile.objectives.join(', ')}
- Tópicos de interesse: ${profile.topics.join(', ')}
- Meta diária: ${profile.goal}

${QUESTION_GUIDELINES}

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
