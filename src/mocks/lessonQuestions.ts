import type { Question } from '../types/quiz';

// TODO: substituir por chamada API
export const lessonQuestions: Question[] = [
  {
    type: 'multiple-choice',
    question: 'O que caracteriza uma alimentação equilibrada?',
    options: [
      'Consumir apenas alimentos de origem animal',
      'Comer grandes quantidades de um único alimento',
      'Incluir diferentes grupos alimentares em quantidades adequadas',
      'Evitar totalmente carboidratos e gorduras',
    ],
    correctIndex: 2,
    explanation:
      'Uma alimentação equilibrada combina todos os grupos alimentares nas quantidades certas — carboidratos, proteínas, gorduras boas, vitaminas e minerais.',
  },
  {
    type: 'image-choice',
    question:
      'Qual alimento é considerado uma opção saudável para o consumo diário, por ser rico em nutrientes importantes para o organismo?',
    options: [
      { label: 'Coca-Cola', emoji: '🥤' },
      { label: 'Bala', emoji: '🍬' },
      { label: 'Salgadinho', emoji: '🍿' },
      { label: 'Maçã', emoji: '🍎' },
    ],
    correctIndex: 3,
    explanation:
      'A maçã é rica em fibras, vitamina C e antioxidantes. Contribui para a saúde intestinal, imunidade e prevenção de doenças crônicas.',
  },
  {
    type: 'fill-blank',
    question:
      'Uma alimentação saudável deve incluir o consumo regular de ____, pois fornece vitaminas, minerais e fibras essenciais para o bom funcionamento do organismo.',
    chips: ['Frituras', 'Frutas', 'Doces', 'Refrigerantes', 'Salgadinhos', 'Balas'],
    correctChip: 'Frutas',
    explanation:
      'Frutas fornecem vitaminas, minerais e fibras que o organismo não produz sozinho. A OMS recomenda pelo menos 400g de frutas e vegetais por dia.',
  },
];
