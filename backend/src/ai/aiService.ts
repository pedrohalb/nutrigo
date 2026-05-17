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
  model: string
): Promise<T> {
  async function attempt(previousError?: string): Promise<T> {
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

    const response = await anthropic.messages.create({
      model,
      max_tokens: 4096,
      system: [
        {
          type: 'text',
          text: systemPrompt,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages,
    });

    const text = response.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('');

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in response');

    const parsed = JSON.parse(jsonMatch[0]);
    return schema.parse(parsed);
  }

  try {
    return await attempt();
  } catch (err) {
    return await attempt(String(err));
  }
}

export const aiService = {
  generateUnitSkeletons(profile: Profile): Promise<AIUnitSkeleton> {
    return callWithRetry(
      unitSkeletonSchema,
      buildSkeletonSystemPrompt(profile),
      buildSkeletonUserPrompt(),
      'claude-sonnet-4-6'
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
      'claude-sonnet-4-6'
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
      'claude-sonnet-4-6'
    );
  },

  generateUnitSummary(unitTitle: string, lessonTitles: string[]): Promise<AIUnitSummary> {
    return callWithRetry(
      unitSummarySchema,
      buildSummarySystemPrompt(),
      buildSummaryUserPrompt(unitTitle, lessonTitles),
      'claude-haiku-4-5-20251001'
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
