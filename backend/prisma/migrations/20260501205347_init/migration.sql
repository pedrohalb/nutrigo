-- CreateEnum
CREATE TYPE "GoalKind" AS ENUM ('casual', 'regular', 'serio', 'intenso');

-- CreateEnum
CREATE TYPE "UnitStatus" AS ENUM ('skeleton', 'generating', 'generated', 'completed');

-- CreateEnum
CREATE TYPE "LessonStatus" AS ENUM ('skeleton', 'generating', 'generated', 'completed');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('multiple-choice', 'image-choice', 'fill-blank');

-- CreateEnum
CREATE TYPE "ChatRole" AS ENUM ('user', 'assistant');

-- CreateEnum
CREATE TYPE "ChallengeKind" AS ENUM ('daily', 'weekly');

-- CreateEnum
CREATE TYPE "ChallengeRule" AS ENUM ('complete_lessons_today', 'complete_lessons_week', 'complete_lessons_perfect_today', 'streak_days', 'complete_unit', 'enter_study_guide', 'complete_first_lesson');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "user_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "objectives" TEXT[],
    "topics" TEXT[],
    "goal" "GoalKind" NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "streak_days" INTEGER NOT NULL DEFAULT 0,
    "last_active_date" DATE,
    "last_study_guide_visit" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "units" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "section" INTEGER NOT NULL,
    "unit_number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "status" "UnitStatus" NOT NULL DEFAULT 'skeleton',
    "study_material" JSONB,
    "summary" TEXT,
    "generated_at" TIMESTAMPTZ,
    "completed_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lessons" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "unit_id" UUID NOT NULL,
    "order_index" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "status" "LessonStatus" NOT NULL DEFAULT 'skeleton',
    "generated_at" TIMESTAMPTZ,
    "completed_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "lesson_id" UUID NOT NULL,
    "order_index" INTEGER NOT NULL,
    "type" "QuestionType" NOT NULL,
    "payload" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attempts" (
    "user_id" UUID NOT NULL,
    "question_id" UUID NOT NULL,
    "lesson_id" UUID NOT NULL,
    "user_answer" JSONB NOT NULL,
    "is_correct" BOOLEAN NOT NULL,
    "answered_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attempts_pkey" PRIMARY KEY ("user_id","question_id")
);

-- CreateTable
CREATE TABLE "chat_threads" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "unit_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_threads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "thread_id" UUID NOT NULL,
    "role" "ChatRole" NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "challenge_templates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "kind" "ChallengeKind" NOT NULL,
    "emoji" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "exp" INTEGER NOT NULL,
    "rule" "ChallengeRule" NOT NULL,
    "rule_params" JSONB NOT NULL DEFAULT '{}',
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "challenge_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_challenge_progress" (
    "user_id" UUID NOT NULL,
    "template_id" UUID NOT NULL,
    "period_start" DATE NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "total" INTEGER NOT NULL,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" TIMESTAMPTZ,

    CONSTRAINT "user_challenge_progress_pkey" PRIMARY KEY ("user_id","template_id","period_start")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "units_user_id_idx" ON "units"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "units_user_id_section_unit_number_key" ON "units"("user_id", "section", "unit_number");

-- CreateIndex
CREATE INDEX "lessons_unit_id_idx" ON "lessons"("unit_id");

-- CreateIndex
CREATE UNIQUE INDEX "lessons_unit_id_order_index_key" ON "lessons"("unit_id", "order_index");

-- CreateIndex
CREATE INDEX "questions_lesson_id_idx" ON "questions"("lesson_id");

-- CreateIndex
CREATE UNIQUE INDEX "questions_lesson_id_order_index_key" ON "questions"("lesson_id", "order_index");

-- CreateIndex
CREATE INDEX "attempts_lesson_id_idx" ON "attempts"("lesson_id");

-- CreateIndex
CREATE UNIQUE INDEX "chat_threads_user_id_unit_id_key" ON "chat_threads"("user_id", "unit_id");

-- CreateIndex
CREATE INDEX "chat_messages_thread_id_created_at_idx" ON "chat_messages"("thread_id", "created_at");

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "units" ADD CONSTRAINT "units_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_threads" ADD CONSTRAINT "chat_threads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_threads" ADD CONSTRAINT "chat_threads_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "chat_threads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_challenge_progress" ADD CONSTRAINT "user_challenge_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_challenge_progress" ADD CONSTRAINT "user_challenge_progress_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "challenge_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
