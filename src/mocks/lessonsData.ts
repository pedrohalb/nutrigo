import type { LessonData } from '../types/studyGuide';

// TODO: substituir por chamada API
export const lessonsData: LessonData[] = [
  {
    title: 'Lição 1 - O que é nutrição?',
    questionsCount: 5,
    progress: 100,
    questions: [
      {
        id: 1,
        text: 'O que caracteriza uma alimentação equi...',
        correct: true,
        fullQuestion: 'O que caracteriza uma alimentação equilibrada?',
        userAnswer: 'Incluir diferentes grupos alimentares em quantidades adequadas',
        explanation:
          'Uma alimentação equilibrada é aquela que oferece ao corpo todos os nutrientes necessários para funcionar bem. Isso significa variar os alimentos e incluir diferentes grupos alimentares — como frutas, verduras, legumes, proteínas, cereais e gorduras saudáveis — nas quantidades adequadas.',
      },
      {
        id: 2,
        text: 'Qual alimento é considerado uma opção ...',
        correct: true,
        fullQuestion: 'Qual alimento é considerado uma opção saudável?',
        userAnswer: 'Frutas e verduras frescas',
        explanation:
          'Frutas e verduras são fontes importantes de vitaminas, minerais e fibras.',
      },
      {
        id: 3,
        text: 'Qual é a principal função das fibras na ...',
        correct: true,
        fullQuestion: 'Qual é a principal função das fibras na alimentação?',
        userAnswer: 'Auxiliar no funcionamento do intestino',
        explanation:
          'As fibras ajudam no funcionamento do intestino, fortalecem o sistema imunológico e contribuem para a saúde em geral.',
      },
      {
        id: 4,
        text: 'Uma alimentação saudável deve incluir ...',
        correct: false,
        fullQuestion:
          'Uma alimentação saudável deve incluir o consumo regular de ____, pois fornece vitaminas, minerais e fibras essenciais para o bom funcionamento do organismo.',
        userAnswer: 'Doces',
        explanation:
          'Uma alimentação saudável deve priorizar alimentos naturais e nutritivos. As frutas são fontes importantes de vitaminas, minerais e fibras.',
      },
      {
        id: 5,
        text: 'Por que o consumo excessivo de açúcar ...',
        correct: true,
        fullQuestion: 'Por que o consumo excessivo de açúcar é prejudicial?',
        userAnswer: 'Pode causar diabetes e obesidade',
        explanation:
          'O consumo excessivo de açúcar está associado a diversas doenças crônicas.',
      },
    ],
  },
  {
    title: 'Lição 2 - Grupos alimentares',
    questionsCount: 6,
    progress: 100,
    questions: [
      {
        id: 1,
        text: 'O que caracteriza uma alimentação equi...',
        correct: true,
        fullQuestion: 'O que caracteriza uma alimentação equilibrada?',
        userAnswer: 'Incluir diferentes grupos alimentares em quantidades adequadas',
        explanation:
          'Uma alimentação equilibrada é aquela que oferece ao corpo todos os nutrientes necessários.',
      },
      {
        id: 2,
        text: 'Qual alimento é considerado uma opção ...',
        correct: true,
        fullQuestion: 'Qual alimento é considerado uma opção saudável?',
        userAnswer: 'Frutas e verduras',
        explanation:
          'Frutas e verduras são fontes importantes de vitaminas e minerais.',
      },
      {
        id: 3,
        text: 'Qual é a principal função das fibras na ...',
        correct: true,
        fullQuestion: 'Qual é a principal função das fibras na alimentação?',
        userAnswer: 'Auxiliar no funcionamento do intestino',
        explanation: 'As fibras são essenciais para o bom funcionamento digestivo.',
      },
      {
        id: 4,
        text: 'Uma alimentação saudável deve incluir ...',
        correct: false,
        fullQuestion:
          'Uma alimentação saudável deve incluir o consumo regular de ____.',
        userAnswer: 'Doces',
        explanation:
          'Uma alimentação saudável deve priorizar alimentos naturais e nutritivos.',
      },
      {
        id: 5,
        text: 'Por que o consumo excessivo de açúcar ...',
        correct: true,
        fullQuestion: 'Por que o consumo excessivo de açúcar é prejudicial?',
        userAnswer: 'Pode causar doenças crônicas',
        explanation: 'O açúcar em excesso prejudica a saúde de várias formas.',
      },
      {
        id: 6,
        text: 'Qual a importância das proteínas para ...',
        correct: true,
        fullQuestion: 'Qual a importância das proteínas para o organismo?',
        userAnswer: 'Construção e reparo de tecidos',
        explanation:
          'As proteínas são fundamentais para a construção e manutenção dos tecidos.',
      },
    ],
  },
  {
    title: 'Lição 3 - O que são macronutrientes ?',
    questionsCount: 6,
    progress: 0,
    questions: [],
  },
];
