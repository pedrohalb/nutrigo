export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Nutrigo API',
    version: '1.0.0',
    description:
      'API do Nutrigo — app gamificado de nutrição. Cobre autenticação, perfil, trilha de unidades/lições geradas por IA, guia de estudos, chat com IA e desafios.',
  },
  servers: [
    { url: 'http://localhost:3000', description: 'Local dev' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          error: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'NOT_FOUND' },
              message: { type: 'string' },
            },
          },
        },
      },
      AuthTokens: {
        type: 'object',
        properties: {
          accessToken: { type: 'string' },
          refreshToken: { type: 'string' },
          user: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              email: { type: 'string', format: 'email' },
            },
          },
        },
      },
      Profile: {
        type: 'object',
        properties: {
          userId: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          objectives: { type: 'array', items: { type: 'string' } },
          topics: { type: 'array', items: { type: 'string' } },
          goal: { type: 'string', enum: ['casual', 'regular', 'serio', 'intenso'] },
          level: { type: 'integer' },
          xp: { type: 'integer' },
          streakDays: { type: 'integer' },
        },
      },
      MeResponse: {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              email: { type: 'string', format: 'email' },
            },
          },
          profile: { $ref: '#/components/schemas/Profile' },
          stats: {
            type: 'object',
            properties: {
              level: { type: 'integer' },
              xp: { type: 'integer' },
              xp_for_next_level: { type: 'integer' },
              streak_days: { type: 'integer' },
            },
          },
          currentUnitId: { type: 'string', nullable: true },
        },
      },
      LessonNode: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          lessonId: { type: 'string' },
          type: {
            type: 'string',
            enum: ['star', 'flame', 'zap', 'target', 'medal', 'brain', 'heart', 'leaf', 'sun', 'shield', 'chest'],
          },
          status: { type: 'string', enum: ['completed', 'current', 'locked'] },
          offsetX: { type: 'number' },
          label: { type: 'string', nullable: true },
        },
      },
      Mascot: {
        type: 'object',
        properties: {
          nodeIdx: { type: 'integer' },
          side: { type: 'string', enum: ['left', 'right'] },
          image: { type: 'string', enum: ['cheer', 'reading', 'thumbsup', 'love'] },
        },
      },
      Unit: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          section: { type: 'integer' },
          unit: { type: 'integer' },
          title: { type: 'string' },
          status: { type: 'string', enum: ['skeleton', 'generating', 'generated', 'completed'] },
          nodes: { type: 'array', items: { $ref: '#/components/schemas/LessonNode' } },
          mascots: { type: 'array', items: { $ref: '#/components/schemas/Mascot' } },
        },
      },
      Question: {
        type: 'object',
        description: 'Polymorphic — discriminated by "type". One of multiple-choice, image-choice, fill-blank.',
        properties: {
          id: { type: 'string' },
          type: { type: 'string', enum: ['multiple-choice', 'image-choice', 'fill-blank'] },
          question: { type: 'string' },
          explanation: { type: 'string' },
          options: { type: 'array' },
          correctIndex: { type: 'integer' },
          chips: { type: 'array', items: { type: 'string' } },
          correctChip: { type: 'string' },
        },
      },
      UserAnswer: {
        oneOf: [
          { type: 'object', properties: { selectedIndex: { type: 'integer' } }, required: ['selectedIndex'] },
          { type: 'object', properties: { selectedChip: { type: 'string' } }, required: ['selectedChip'] },
        ],
      },
      SubmitLessonResult: {
        type: 'object',
        properties: {
          results: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                questionId: { type: 'string' },
                isCorrect: { type: 'boolean' },
                explanation: { type: 'string' },
              },
            },
          },
          xpEarned: { type: 'integer' },
          levelUp: { type: 'boolean' },
          streakDays: { type: 'integer' },
          unitCompleted: { type: 'boolean' },
        },
      },
      Challenge: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          kind: { type: 'string', enum: ['daily', 'weekly'] },
          emoji: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          exp: { type: 'integer' },
          progress: { type: 'integer' },
          target: { type: 'integer' },
          completed: { type: 'boolean' },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/health': {
      get: {
        summary: 'Health check',
        tags: ['Misc'],
        security: [],
        responses: {
          '200': {
            description: 'OK',
            content: { 'application/json': { schema: { type: 'object', properties: { ok: { type: 'boolean' } } } } },
          },
        },
      },
    },
    '/api/auth/signup': {
      post: {
        summary: 'Cria conta de usuário',
        tags: ['Auth'],
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Conta criada', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthTokens' } } } },
          '400': { description: 'Validação', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          '409': { description: 'Email já existe' },
        },
      },
    },
    '/api/auth/login': {
      post: {
        summary: 'Autentica usuário e retorna tokens JWT',
        tags: ['Auth'],
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthTokens' } } } },
          '401': { description: 'Credenciais inválidas' },
        },
      },
    },
    '/api/auth/forgot-password': {
      post: {
        summary: 'Inicia fluxo de redefinição de senha',
        tags: ['Auth'],
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object', required: ['email'], properties: { email: { type: 'string', format: 'email' } } },
            },
          },
        },
        responses: { '200': { description: 'Email de recuperação enviado (se conta existe)' } },
      },
    },
    '/api/auth/reset-password': {
      post: {
        summary: 'Conclui redefinição de senha com token',
        tags: ['Auth'],
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['token', 'password'],
                properties: {
                  token: { type: 'string' },
                  password: { type: 'string', minLength: 8 },
                },
              },
            },
          },
        },
        responses: { '200': { description: 'Senha atualizada' }, '400': { description: 'Token inválido/expirado' } },
      },
    },
    '/api/auth/logout': {
      post: {
        summary: 'Encerra sessão (invalida refresh token)',
        tags: ['Auth'],
        responses: { '200': { description: 'Sessão encerrada' } },
      },
    },
    '/api/me/onboarding': {
      post: {
        summary: 'Cria profile + dispara geração da primeira unidade',
        tags: ['Profile'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'objectives', 'topics', 'goal'],
                properties: {
                  name: { type: 'string' },
                  objectives: { type: 'array', items: { type: 'string' }, minItems: 1 },
                  topics: { type: 'array', items: { type: 'string' }, minItems: 3 },
                  goal: { type: 'string', enum: ['casual', 'regular', 'serio', 'intenso'] },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Profile criado + units skeleton',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    profile: { $ref: '#/components/schemas/Profile' },
                    units: { type: 'array', items: { $ref: '#/components/schemas/Unit' } },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/me': {
      get: {
        summary: 'Dados do usuário autenticado (profile + stats)',
        tags: ['Profile'],
        responses: {
          '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/MeResponse' } } } },
          '401': { description: 'Não autenticado' },
        },
      },
      put: {
        summary: 'Atualiza campos do profile (atualmente: nome)',
        tags: ['Profile'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object', properties: { name: { type: 'string', minLength: 1 } } },
            },
          },
        },
        responses: {
          '200': {
            description: 'Profile atualizado',
            content: { 'application/json': { schema: { type: 'object', properties: { profile: { $ref: '#/components/schemas/Profile' } } } } },
          },
        },
      },
    },
    '/api/units': {
      get: {
        summary: 'Lista seções e unidades do usuário (com layout dos nós)',
        tags: ['Units'],
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    sections: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          section: { type: 'integer' },
                          units: { type: 'array', items: { $ref: '#/components/schemas/Unit' } },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/units/{id}': {
      get: {
        summary: 'Detalhe da unidade + lições',
        tags: ['Units'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/Unit' } } } },
          '404': { description: 'Unidade não encontrada' },
        },
      },
    },
    '/api/units/{id}/study-material': {
      get: {
        summary: 'Material de estudo da unidade (gerado pela IA)',
        tags: ['StudyGuide'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '200': { description: 'OK' } },
      },
    },
    '/api/units/{id}/review': {
      get: {
        summary: 'Revisão (questões respondidas) por lição',
        tags: ['StudyGuide'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '200': { description: 'OK' } },
      },
    },
    '/api/units/{id}/chat/messages': {
      get: {
        summary: 'Histórico do chat com IA da unidade',
        tags: ['Chat'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '200': { description: 'OK' } },
      },
      post: {
        summary: 'Envia mensagem ao chat e recebe resposta da IA',
        tags: ['Chat'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object', required: ['message'], properties: { message: { type: 'string' } } },
            },
          },
        },
        responses: { '200': { description: 'Resposta da IA' } },
      },
    },
    '/api/lessons/{id}': {
      get: {
        summary: 'Lição com questões',
        tags: ['Lessons'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    title: { type: 'string' },
                    questions: { type: 'array', items: { $ref: '#/components/schemas/Question' } },
                  },
                },
              },
            },
          },
          '403': { description: 'Lição não pertence ao usuário' },
          '404': { description: 'Lição não encontrada' },
        },
      },
    },
    '/api/lessons/{id}/submit': {
      post: {
        summary: 'Submete respostas da lição, atualiza streak/XP/nível e desbloqueia próxima',
        tags: ['Lessons'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['answers'],
                properties: {
                  answers: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        questionId: { type: 'string' },
                        userAnswer: { $ref: '#/components/schemas/UserAnswer' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/SubmitLessonResult' } } } },
        },
      },
    },
    '/api/challenges': {
      get: {
        summary: 'Lista desafios diários e semanais do usuário',
        tags: ['Challenges'],
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    daily: { type: 'array', items: { $ref: '#/components/schemas/Challenge' } },
                    weekly: { type: 'array', items: { $ref: '#/components/schemas/Challenge' } },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
} as const;
