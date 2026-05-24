import Anthropic from '@anthropic-ai/sdk';
import { ZodSchema } from 'zod';
import { GoalKind } from '@prisma/client';
import { anthropic } from './client';
import { unitSkeletonSchema, type AIUnitSkeleton } from './schemas/unitSkeleton.schema';
import { unitWithLessonOneSchema, type AIUnitWithLessonOne } from './schemas/unitWithLessonOne.schema';
import { lessonGenerationSchema, type AILessonGeneration } from './schemas/lesson.schema';
import { unitSummarySchema, type AIUnitSummary } from './schemas/unitSummary.schema';
import {
  buildSkeletonSystemPrompt,
  buildSkeletonUserPrompt,
  buildFullUnitSystemPrompt,
  buildFullUnitUserPrompt,
  buildLessonUserPrompt,
} from './prompts/lessonGenerator';
import { buildSummarySystemPrompt, buildSummaryUserPrompt } from './prompts/unitSummary';
import { buildChatSystemPrompt } from './prompts/chat';

type Profile = { name: string; objectives: string[]; topics: string[]; goal: GoalKind };

async function callWithRetry<T>(
  schema: ZodSchema<T>,
  systemPrompt: string,
  userPrompt: string,
  model: string,
  label = 'AI',
  maxTokens = 4096
): Promise<T> {
  async function attempt(previousError?: string): Promise<T> {
    if (previousError) {
      console.warn(`[${label}] Tentando novamente após erro de validação:`, previousError.slice(0, 200));
    }

    const messages: Anthropic.MessageParam[] = previousError
      ? [
          { role: 'user', content: userPrompt },
          { role: 'assistant', content: previousError },
          {
            role: 'user',
            content: `O JSON acima é inválido. Corrija e responda APENAS com JSON válido no formato solicitado. Erro: ${previousError}`,
          },
        ]
      : [{ role: 'user', content: userPrompt }];

    const t0 = Date.now();
    console.log(`[${label}] Chamando ${model} — prompt ${userPrompt.length} chars`);

    const response = await anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      system: [
        {
          type: 'text',
          text: systemPrompt,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages,
    });
    console.log(`[${label}] Resposta recebida em ${Date.now() - t0}ms — stop_reason=${response.stop_reason} tokens_in=${response.usage.input_tokens} tokens_out=${response.usage.output_tokens}`);

    const text = response.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('');

    console.log(`[${label}] Texto bruto (primeiros 300 chars): ${text.slice(0, 300)}`);

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error(`[${label}] Nenhum JSON encontrado na resposta`);
      throw new Error('No JSON found in response');
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.error(`[${label}] JSON inválido:`, e);
      throw e;
    }

    const result = schema.parse(parsed);
    console.log(`[${label}] Schema validado com sucesso`);
    return result;
  }

  try {
    return await attempt();
  } catch (err) {
    console.warn(`[${label}] Primeira tentativa falhou, retentando...`);
    return await attempt(String(err));
  }
}

export const aiService = {
  generateUnitSkeletons(profile: Profile): Promise<AIUnitSkeleton> {
    return callWithRetry(
      unitSkeletonSchema,
      buildSkeletonSystemPrompt(profile),
      buildSkeletonUserPrompt(),
      'claude-sonnet-4-6',
      'generateUnitSkeletons'
    );
  },

  generateFullUnit(
    profile: Profile,
    unitTitle: string,
    section: number,
    unitNumber: number
  ): Promise<AIUnitWithLessonOne> {
    return callWithRetry(
      unitWithLessonOneSchema,
      buildFullUnitSystemPrompt(profile),
      buildFullUnitUserPrompt(unitTitle, section, unitNumber),
      'claude-sonnet-4-6',
      `generateFullUnit(${unitTitle})`,
      8192
    );
  },

  generateLesson(
    profile: Profile,
    unitTitle: string,
    previousLessonsTitles: string[],
    orderIndex: number
  ): Promise<AILessonGeneration> {
    return callWithRetry(
      lessonGenerationSchema,
      buildFullUnitSystemPrompt(profile),
      buildLessonUserPrompt(unitTitle, previousLessonsTitles, orderIndex),
      'claude-sonnet-4-6',
      `generateLesson(${unitTitle}[${orderIndex}])`,
      8192
    );
  },

  generateUnitSummary(unitTitle: string, lessonTitles: string[]): Promise<AIUnitSummary> {
    return callWithRetry(
      unitSummarySchema,
      buildSummarySystemPrompt(),
      buildSummaryUserPrompt(unitTitle, lessonTitles),
      'claude-haiku-4-5-20251001',
      `generateUnitSummary(${unitTitle})`
    );
  },

  async chat(
    unitTitle: string,
    studyMaterial: unknown,
    history: Array<{ role: 'user' | 'assistant'; content: string }>,
    userMessage: string
  ): Promise<string> {
    const last6 = history.slice(-6);

    const messages: Anthropic.MessageParam[] = [
      ...last6.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      { role: 'user', content: userMessage },
    ];

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: [
        {
          type: 'text',
          text: buildChatSystemPrompt(unitTitle, studyMaterial),
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages,
    });

    return response.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('');
  },
};
