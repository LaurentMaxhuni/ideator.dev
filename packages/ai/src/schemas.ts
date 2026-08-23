import { z } from "zod";

export const ideaDomains = ["software", "saas", "developer-tool", "mobile-app", "game"] as const;
export const ambitionLevels = ["weekend", "small-product", "serious-build", "studio-scale"] as const;

export const playgroundConstraintIds = [
  "weekend-build",
  "one-core-action",
  "offline-first",
  "no-onboarding",
  "value-in-60-seconds",
  "solo-user-first",
  "no-integrations",
  "make-it-playful",
] as const;

export const playgroundConstraints = [
  {
    id: "weekend-build",
    label: "Weekend build",
    description: "Keep the first credible version small enough to ship in two focused days.",
  },
  {
    id: "one-core-action",
    label: "One core action",
    description: "Organize the whole product around one repeatable action that earns its place.",
  },
  {
    id: "offline-first",
    label: "Offline-first",
    description: "Deliver the essential value without requiring a live connection.",
  },
  {
    id: "no-onboarding",
    label: "No onboarding",
    description: "Let the interface teach itself through an immediately useful first move.",
  },
  {
    id: "value-in-60-seconds",
    label: "Value in 60 seconds",
    description: "Make the useful outcome visible within the first minute.",
  },
  {
    id: "solo-user-first",
    label: "Solo-user first",
    description: "Design for one person before adding teams, sharing, or permissions.",
  },
  {
    id: "no-integrations",
    label: "No integrations",
    description: "Make the core loop stand on its own without third-party dependencies.",
  },
  {
    id: "make-it-playful",
    label: "Make it playful",
    description: "Use curiosity, feedback, and surprise to make the useful action enjoyable.",
  },
] as const satisfies ReadonlyArray<{
  id: (typeof playgroundConstraintIds)[number];
  label: string;
  description: string;
}>;

export const playgroundConstraintIdSchema = z.enum(playgroundConstraintIds);
export const forkModes = ["safer", "bolder", "stranger"] as const;
export const forkModeSchema = z.enum(forkModes);

export const explorationInputSchema = z
  .object({
    constraintIds: z.array(playgroundConstraintIdSchema).max(2),
    customConstraint: z.string().trim().max(240).default(""),
  })
  .strict()
  .superRefine((input, context) => {
    if (new Set(input.constraintIds).size !== input.constraintIds.length) {
      context.addIssue({
        code: "custom",
        path: ["constraintIds"],
        message: "Choose each constraint at most once.",
      });
    }
  });

export const directionPreviewSchema = z
  .object({
    mode: forkModeSchema,
    projectName: z.string().min(3).max(120),
    headline: z.string().min(8).max(180),
    thesis: z.string().min(20).max(700),
    primaryUser: z.string().min(3).max(180),
    wedge: z.string().min(12).max(360),
    mvpMoves: z.array(z.string().min(3).max(220)).min(3).max(5),
    experienceHook: z.string().min(12).max(360),
    biggestRisk: z.string().min(12).max(360),
    firstTest: z.string().min(12).max(360),
  })
  .strict();

export const explorationOutputSchema = z
  .object({
    directions: z.array(directionPreviewSchema).length(3),
  })
  .strict()
  .superRefine((output, context) => {
    for (const mode of forkModes) {
      if (output.directions.filter((direction) => direction.mode === mode).length !== 1) {
        context.addIssue({
          code: "custom",
          path: ["directions"],
          message: `Return exactly one ${mode} direction.`,
        });
      }
    }
  });

export const forkRequestSchema = z.object({ mode: forkModeSchema }).strict();

export const ideaBriefInputSchema = z.object({
  initialIdea: z.string().trim().min(12).max(2_000),
  domain: z.enum(ideaDomains),
  intendedUsers: z.string().trim().min(5).max(800),
  ambition: z.enum(ambitionLevels),
  platform: z.string().trim().max(300).default(""),
  constraints: z.string().trim().max(1_000).default(""),
  nonGoals: z.string().trim().max(1_000).default(""),
});

export const northStarSchema = z.object({
  headline: z.string().min(3).max(180),
  summary: z.string().min(20).max(800),
});

export const audienceSchema = z.object({
  primaryUser: z.string().min(3).max(180),
  situation: z.string().min(12).max(500),
  promise: z.string().min(12).max(500),
});

export const mvpScopeSchema = z.object({
  include: z.array(z.string().min(3).max(220)).min(3).max(8),
  exclude: z.array(z.string().min(3).max(220)).min(2).max(8),
});

export const experienceSchema = z.object({
  direction: z.string().min(20).max(600),
  principles: z.array(z.string().min(3).max(180)).min(3).max(6),
  firstRun: z.array(z.string().min(3).max(220)).min(3).max(6),
});

export const technicalBlueprintSchema = z.object({
  shape: z.string().min(20).max(700),
  stack: z.array(z.string().min(3).max(160)).min(3).max(8),
  dataModel: z.array(z.string().min(3).max(220)).min(2).max(6),
  risks: z.array(z.string().min(3).max(220)).min(2).max(6),
});

export const milestoneSchema = z.object({
  id: z.string().min(2).max(32),
  name: z.string().min(3).max(120),
  outcome: z.string().min(12).max(300),
  shipWindow: z.string().min(3).max(80),
  steps: z.array(z.string().min(3).max(220)).min(2).max(5),
});

export const nextStepSchema = z.object({
  title: z.string().min(3).max(140),
  action: z.string().min(12).max(500),
  doneWhen: z.string().min(12).max(280),
});

export const ideaArtifactSchema = z.object({
  projectName: z.string().min(3).max(120),
  northStar: northStarSchema,
  whoItsFor: audienceSchema,
  whyItMatters: z.string().min(20).max(900),
  mvpScope: mvpScopeSchema,
  experience: experienceSchema,
  technicalBlueprint: technicalBlueprintSchema,
  milestones: z.array(milestoneSchema).min(3).max(6),
  immediateNextStep: nextStepSchema,
});

export const artifactSectionNames = [
  "northStar",
  "whoItsFor",
  "whyItMatters",
  "mvpScope",
  "experience",
  "technicalBlueprint",
  "milestones",
  "immediateNextStep",
] as const;

export const artifactSectionSchemas = {
  northStar: northStarSchema,
  whoItsFor: audienceSchema,
  whyItMatters: z.string().min(20).max(900),
  mvpScope: mvpScopeSchema,
  experience: experienceSchema,
  technicalBlueprint: technicalBlueprintSchema,
  milestones: z.array(milestoneSchema).min(3).max(6),
  immediateNextStep: nextStepSchema,
} as const;

export type IdeaBriefInput = z.infer<typeof ideaBriefInputSchema>;
export type IdeaArtifact = z.infer<typeof ideaArtifactSchema>;
export type ArtifactSectionName = (typeof artifactSectionNames)[number];
export type PlaygroundConstraintId = z.infer<typeof playgroundConstraintIdSchema>;
export type ExplorationInput = z.infer<typeof explorationInputSchema>;
export type ForkMode = z.infer<typeof forkModeSchema>;
export type DirectionPreview = z.infer<typeof directionPreviewSchema>;
export type ExplorationOutput = z.infer<typeof explorationOutputSchema>;
