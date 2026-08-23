import { z } from "zod";

import {
  explorationInputSchema,
  explorationOutputSchema,
  ideaArtifactSchema,
  ideaBriefInputSchema,
  milestoneSchema,
  playgroundConstraints,
  type DirectionPreview,
  type ExplorationInput,
  type IdeaArtifact,
  type IdeaBriefInput,
} from "./schemas.ts";

export type ProviderId = "workers-ai" | "openrouter" | "groq" | "local";

export type ProviderCompletion = {
  content: string;
  model: string;
};

export type StructuredProviderRequest = {
  systemPrompt: string;
  prompt: string;
  schemaName: string;
  jsonSchema: Record<string, unknown>;
};

export type TextProvider = {
  id: Exclude<ProviderId, "local">;
  model: string;
  complete: (request: StructuredProviderRequest) => Promise<ProviderCompletion>;
};

export type GenerationAttempt = {
  provider: ProviderId;
  model: string;
  status: "success" | "failed";
  error?: string;
};

export type GenerationResult = {
  artifact: IdeaArtifact;
  provider: ProviderId;
  model: string;
  attempts: GenerationAttempt[];
};

export type GenerationOptions = {
  providers?: readonly TextProvider[];
  timeoutMs?: number;
};

export class ProviderFailure extends Error {
  readonly attempts: GenerationAttempt[];
  readonly capacityBusy: boolean;

  constructor(
    message: string,
    attempts: GenerationAttempt[] = [],
    capacityBusy = false,
  ) {
    super(message);
    this.name = "ProviderFailure";
    this.attempts = attempts;
    this.capacityBusy = capacityBusy;
  }
}

class InvalidStructuredOutput extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidStructuredOutput";
  }
}

const chatResponseSchema = z.object({
  model: z.string().optional(),
  choices: z.array(
    z.object({
      message: z.object({ content: z.unknown() }),
    }),
  ),
});

const namingRule = `Use a plain, descriptive sentence-case working title that explains the product, user, or job. Never invent a two-word Title Case compound from evocative words (for example, "Signal Garden" or "First Light"). Avoid startup-style wordmarks, fused words, arbitrary metaphors as names, and branding exercises. Prefer titles such as "Offline pantry count" or "Decision check after meetings".`;

const briefSystemPrompt = `You are the product architect inside ideator.dev. Turn a rough software or game idea into a crisp build brief for a small, capable team.

Return exactly one JSON object and no markdown. Keep the writing specific, grounded, and practical. Respect the user's constraints and non-goals. Favor a narrow, testable MVP over a feature pile. Do not invent a large organization, enterprise procurement, or vague AI magic. ${namingRule} The supplied JSON schema is the complete response contract.`;

const explorationSystemPrompt = `You are the creative strategy engine inside ideator.dev. Explore one existing product brief through three meaningfully different but credible directions.

Return exactly one JSON object and no markdown. Produce exactly one direction for each mode:
- safer: the smallest credible version with minimal product and delivery risk
- bolder: a sharper promise with a more opinionated experience and wedge
- stranger: an unexpected angle that remains useful, buildable, and relevant to the original problem

Honor every selected constraint. Keep each direction compact and concrete. The three directions must differ in product thesis, not just tone or naming. Do not turn stranger into a joke, bolder into a feature pile, or safer into a generic summary. ${namingRule} The supplied JSON schema is the complete response contract.`;

const forkExpansionSystemPrompt = `You are the product architect inside ideator.dev. Expand one selected exploration direction into a complete, build-ready brief for a small, capable team.

Return exactly one JSON object and no markdown. Treat the selected preview as binding: preserve its product name, headline, thesis, primary user, wedge, experience hook, risk, first test, and MVP intent. Preserve the original domain, ambition, platform, non-goals, and selected constraints. Make the architecture and milestones credible for the stated ambition. ${namingRule} The supplied JSON schema is the complete response contract.`;

function envValue(name: string) {
  return typeof process === "undefined" ? undefined : process.env[name];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function contentToText(content: unknown) {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") {
          return part;
        }

        if (isRecord(part) && typeof part.text === "string") {
          return part.text;
        }

        return "";
      })
      .join("");
  }

  return "";
}

function stripJsonFence(value: string) {
  const trimmed = value.trim();

  if (trimmed.startsWith("```") && trimmed.endsWith("```")) {
    return trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  }

  return trimmed;
}

function parseStructured<T>(content: string, schema: z.ZodType<T>) {
  let parsedJson: unknown;

  try {
    parsedJson = JSON.parse(stripJsonFence(content)) as unknown;
  } catch {
    throw new InvalidStructuredOutput("The provider returned invalid JSON.");
  }

  const result = schema.safeParse(parsedJson);

  if (!result.success) {
    throw new InvalidStructuredOutput("The provider returned JSON that does not match the requested schema.");
  }

  return result.data;
}

function jsonSchemaFor<T>(schema: z.ZodType<T>) {
  const jsonSchema = { ...z.toJSONSchema(schema, { target: "draft-7" }) } as Record<string, unknown>;
  delete jsonSchema.$schema;
  return jsonSchema;
}

function responseIndicatesCapacity(status: number, detail: string) {
  return status === 429 || /quota|rate.?limit|capacity|resource.?exhausted/i.test(detail);
}

async function completeJson(
  providerId: Exclude<ProviderId, "local">,
  endpoint: string,
  apiKey: string,
  model: string,
  request: StructuredProviderRequest,
  timeoutMs: number,
  headers: Record<string, string> = {},
): Promise<ProviderCompletion> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const strictGroq = providerId === "groq" && /^openai\/gpt-oss-(?:20b|120b)$/.test(model);
  const providerSystemPrompt = strictGroq
    ? request.systemPrompt
    : `${request.systemPrompt}\n\nMatch this JSON schema exactly:\n${JSON.stringify(request.jsonSchema)}`;
  const body: Record<string, unknown> = {
    model,
    messages: [
      { role: "system", content: providerSystemPrompt },
      { role: "user", content: request.prompt },
    ],
    temperature: 0.35,
    response_format: strictGroq
      ? {
          type: "json_schema",
          json_schema: {
            name: request.schemaName,
            strict: true,
            schema: request.jsonSchema,
          },
        }
      : { type: "json_object" },
  };

  if (providerId === "groq" && /^openai\/gpt-oss-/.test(model)) {
    body.reasoning_effort = "low";
    body.include_reasoning = false;
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      const detail = (await response.text()).slice(0, 240);
      throw new ProviderFailure(
        `Provider returned ${response.status}${detail ? `: ${detail}` : ""}`,
        [],
        responseIndicatesCapacity(response.status, detail),
      );
    }

    const payload = (await response.json()) as unknown;
    const parsed = chatResponseSchema.safeParse(payload);
    const firstChoice = parsed.success ? parsed.data.choices[0] : undefined;
    const content = firstChoice ? contentToText(firstChoice.message.content) : "";

    if (!parsed.success || !content) {
      throw new ProviderFailure("Provider returned an empty or unsupported response.");
    }

    return {
      content,
      model: parsed.data.model ?? model,
    };
  } catch (error) {
    if (error instanceof ProviderFailure) {
      throw error;
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw new ProviderFailure(`Provider timed out after ${timeoutMs}ms.`);
    }

    throw new ProviderFailure(error instanceof Error ? error.message : "Provider request failed.");
  } finally {
    clearTimeout(timeout);
  }
}

function httpProvider(
  id: Exclude<ProviderId, "local">,
  endpoint: string,
  apiKey: string,
  model: string,
  timeoutMs: number,
  headers?: Record<string, string>,
): TextProvider {
  return {
    id,
    model,
    complete: (request) => completeJson(id, endpoint, apiKey, model, request, timeoutMs, headers),
  };
}

export function createDefaultProviders(options: { timeoutMs?: number } = {}): TextProvider[] {
  const timeoutMs = options.timeoutMs ?? 25_000;
  const providers: TextProvider[] = [];
  const accountId = envValue("CLOUDFLARE_ACCOUNT_ID");
  const cloudflareToken = envValue("CLOUDFLARE_API_TOKEN");
  const openRouterKey = envValue("OPENROUTER_API_KEY");
  const groqKey = envValue("GROQ_API_KEY");

  if (groqKey) {
    providers.push(
      httpProvider(
        "groq",
        "https://api.groq.com/openai/v1/chat/completions",
        groqKey,
        envValue("GROQ_MODEL") ?? "openai/gpt-oss-120b",
        timeoutMs,
      ),
    );
  }

  if (accountId && cloudflareToken) {
    providers.push(
      httpProvider(
        "workers-ai",
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/v1/chat/completions`,
        cloudflareToken,
        envValue("WORKERS_AI_MODEL") ?? "@cf/meta/llama-3.1-8b-instruct",
        timeoutMs,
      ),
    );
  }

  if (openRouterKey) {
    providers.push(
      httpProvider(
        "openrouter",
        "https://openrouter.ai/api/v1/chat/completions",
        openRouterKey,
        envValue("OPENROUTER_MODEL") ?? "openrouter/free",
        timeoutMs,
        {
          "HTTP-Referer": envValue("NEXT_PUBLIC_APP_URL") ?? "https://ideator.dev",
          "X-Title": "ideator.dev",
        },
      ),
    );
  }

  return providers;
}

function buildBriefPrompt(input: IdeaBriefInput) {
  return `Create a build-ready idea brief from these notes.

Initial idea or problem: ${input.initialIdea}
Domain: ${input.domain}
Intended users: ${input.intendedUsers}
Ambition: ${input.ambition}
Preferred platform or technology: ${input.platform || "No preference yet"}
Constraints: ${input.constraints || "None stated"}
Non-goals: ${input.nonGoals || "None stated"}`;
}

function selectedConstraintText(input: ExplorationInput) {
  const labels: string[] = input.constraintIds.map(
    (id) => playgroundConstraints.find((constraint) => constraint.id === id)?.label ?? id,
  );

  if (input.customConstraint) {
    labels.push(input.customConstraint);
  }

  return labels.length > 0 ? labels.join("; ") : "No additional constraints";
}

function limitText(value: string, maxLength: number) {
  const trimmed = value.trim();

  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return `${trimmed.slice(0, maxLength - 1).trimEnd()}…`;
}

function sentenceCaseTitle(value: string) {
  const trimmed = value.trim().replace(/\s+/g, " ");

  if (!trimmed) {
    return "Working product concept";
  }

  const lower = trimmed.toLocaleLowerCase();
  return `${lower.charAt(0).toLocaleUpperCase()}${lower.slice(1)}`;
}

function workingTitleFromInput(input: IdeaBriefInput) {
  const firstThought = input.initialIdea
    .split(/[.!?\r\n]/, 1)[0]
    ?.replace(/^(?:build|create|make|design)\s+(?:an?\s+|the\s+)?/i, "")
    .replace(/[^\p{L}\p{N}\s'-]/gu, "")
    .trim();
  const fallback = input.domain === "game" ? "Focused game experiment" : "Focused product experiment";

  return limitText(sentenceCaseTitle(firstThought || fallback), 72);
}

function localConstraintPressure(input: ExplorationInput) {
  const selected = selectedConstraintText(input);

  return selected === "No additional constraints"
    ? "Keep the original brief's constraints and non-goals intact"
    : `Honor these constraints: ${selected}`;
}

function buildFallbackExploration(
  artifact: IdeaArtifact,
  input: ExplorationInput,
) {
  const constraintPressure = localConstraintPressure(input);
  const currentRisk = artifact.technicalBlueprint.risks[0];
  const firstTest = artifact.immediateNextStep.action;

  return explorationOutputSchema.parse({
    directions: [
      {
        mode: "safer",
        projectName: limitText(`Smallest version of ${sentenceCaseTitle(artifact.projectName)}`, 120),
        headline: limitText(`Ship the smallest reliable version of ${artifact.northStar.headline}`, 180),
        thesis: limitText(
          `${constraintPressure}. Reduce the current idea to one dependable path that proves the original promise: ${artifact.northStar.summary}`,
          700,
        ),
        primaryUser: artifact.whoItsFor.primaryUser,
        wedge: limitText(
          `Lead with one useful outcome and nothing else: ${artifact.mvpScope.include[0]}`,
          360,
        ),
        mvpMoves: artifact.mvpScope.include.slice(0, 3),
        experienceHook: limitText(
          `Remove every step before the first useful result. ${artifact.experience.direction}`,
          360,
        ),
        biggestRisk: limitText(
          `The narrow slice may not prove enough demand. Existing risk: ${currentRisk}`,
          360,
        ),
        firstTest: limitText(`Test only the shortest end-to-end path. ${firstTest}`, 360),
      },
      {
        mode: "bolder",
        projectName: limitText(`Opinionated workflow for ${sentenceCaseTitle(artifact.projectName)}`, 120),
        headline: limitText(`Make ${artifact.northStar.headline} an opinionated default`, 180),
        thesis: limitText(
          `${constraintPressure}. Turn the strongest part of the existing promise into a decisive workflow that tells users what matters next instead of presenting a neutral toolkit.`,
          700,
        ),
        primaryUser: artifact.whoItsFor.primaryUser,
        wedge: limitText(
          `Own the decision implied by the original brief: ${artifact.whyItMatters}`,
          360,
        ),
        mvpMoves: [
          "Turn the strongest promise into the default first screen",
          "Make one opinionated result the center of the workflow",
          "Show the consequence of the user's choice immediately",
        ],
        experienceHook: limitText(
          `Give the interface a strong point of view while preserving this direction: ${artifact.experience.direction}`,
          360,
        ),
        biggestRisk: limitText(
          `The opinionated default may exclude users who need more control. Existing risk: ${currentRisk}`,
          360,
        ),
        firstTest: limitText(
          `Compare the decisive workflow with the current one and watch whether users reach the promised outcome faster. ${firstTest}`,
          360,
        ),
      },
      {
        mode: "stranger",
        projectName: limitText(`Field-guide experiment for ${sentenceCaseTitle(artifact.projectName)}`, 120),
        headline: limitText(`Turn ${artifact.northStar.headline} into something users can explore`, 180),
        thesis: limitText(
          `${constraintPressure}. Reframe the original workflow as a navigable field guide: practical results stay precise, but users reach them through discovery, visible signals, and a memorable metaphor.`,
          700,
        ),
        primaryUser: artifact.whoItsFor.primaryUser,
        wedge: limitText(
          `Make the hidden structure of the problem tangible without losing the original value: ${artifact.whyItMatters}`,
          360,
        ),
        mvpMoves: [
          "Translate the core workflow into one memorable visual metaphor",
          "Let users discover the product by manipulating that metaphor",
          "Keep a plain-language path back to the practical result",
        ],
        experienceHook: limitText(
          `Use curiosity and visible feedback to reveal the same underlying workflow. ${artifact.experience.direction}`,
          360,
        ),
        biggestRisk: limitText(
          `The metaphor may distract from the useful result instead of clarifying it. Existing risk: ${currentRisk}`,
          360,
        ),
        firstTest: limitText(
          `Show the metaphor without instructions and ask users to predict the practical result before they interact. ${firstTest}`,
          360,
        ),
      },
    ],
  });
}

function buildFallbackForkArtifact(
  artifact: IdeaArtifact,
  preview: DirectionPreview,
) {
  const risks = [preview.biggestRisk, ...artifact.technicalBlueprint.risks].slice(0, 6);

  return ideaArtifactSchema.parse({
    ...artifact,
    projectName: preview.projectName,
    northStar: {
      headline: preview.headline,
      summary: preview.thesis,
    },
    whoItsFor: {
      ...artifact.whoItsFor,
      primaryUser: preview.primaryUser,
    },
    whyItMatters: limitText(`The selected direction leads with this wedge: ${preview.wedge}`, 900),
    mvpScope: {
      ...artifact.mvpScope,
      include: preview.mvpMoves,
    },
    experience: {
      ...artifact.experience,
      direction: limitText(`The experience centers on this hook: ${preview.experienceHook}`, 600),
    },
    technicalBlueprint: {
      ...artifact.technicalBlueprint,
      risks,
    },
    immediateNextStep: {
      title: limitText(`Test ${preview.projectName}`, 140),
      action: preview.firstTest,
      doneWhen: artifact.immediateNextStep.doneWhen,
    },
  });
}

function buildFallbackArtifact(input: IdeaBriefInput): IdeaArtifact {
  const name = workingTitleFromInput(input);
  const platform = input.platform || "a responsive web app";

  return {
    projectName: name,
    northStar: {
      headline: `A focused ${input.domain} product that makes the next decision obvious.`,
      summary: `Turn the rough idea of “${input.initialIdea}” into a small, testable ${platform} for ${input.intendedUsers}.`,
    },
    whoItsFor: {
      primaryUser: input.intendedUsers,
      situation: "They have a promising direction but lose momentum when the work becomes ambiguous.",
      promise: "A clear first slice, a realistic build path, and a reason to keep going.",
    },
    whyItMatters: "Ideas usually stall at the gap between a compelling feeling and a concrete next action. This product makes that gap visible, then gives the builder a small surface to cross.",
    mvpScope: {
      include: [
        "A short guided brief that captures the problem and the intended user",
        "A generated north star with an explicit MVP boundary",
        "A technical direction that names the riskiest assumption",
        "A milestone path ending in a small validation loop",
      ],
      exclude: [
        "Team permissions, public sharing, and billing",
        "A full backlog or production deployment pipeline",
        "Personalization before the core brief is useful",
      ],
    },
    experience: {
      direction: "Make the workspace feel like a calm instrument panel: decisive labels, generous reading space, and small moments of amber feedback when an idea becomes concrete.",
      principles: [
        "Make scope visible before adding detail",
        "Use plain language before technical jargon",
        "Keep every section editable",
        "End each session with one executable move",
      ],
      firstRun: [
        "Describe the rough idea in your own words",
        "Choose the domain, users, ambition, and constraints",
        "Review the generated brief and cut what does not belong",
        "Start the immediate next step while the context is fresh",
      ],
    },
    technicalBlueprint: {
      shape: "A server-rendered workspace with a small protected API, Postgres persistence, and one structured generation request per brief.",
      stack: ["Next.js App Router", "Neon Postgres", "Drizzle ORM", "Neon Auth", "Provider-neutral fetch adapters"],
      dataModel: ["Private project owned by an auth user", "One brief per project", "Editable artifact sections", "Generation run with provider metadata"],
      risks: [
        "The model may produce attractive but broad scope; validate every section and show the exclusions.",
        "Free provider availability can vary; keep the local draft fallback and record the attempted providers.",
        "The first technical direction can be premature; label it as a starting hypothesis, not a commitment.",
      ],
    },
    milestones: [
      { id: "m1", name: "Prove the core loop", outcome: "A user can complete the brief and reach a useful result in one sitting.", shipWindow: "2–3 days", steps: ["Build the brief form", "Persist a project shell", "Validate the generated artifact"] },
      { id: "m2", name: "Test the riskiest assumption", outcome: "One real user interaction confirms the product is solving the stated problem.", shipWindow: "1 week", steps: ["Pick one narrow workflow", "Instrument the first-run path", "Review the signal with three users"] },
      { id: "m3", name: "Make it repeatable", outcome: "The first version can be used repeatedly without manual rescue.", shipWindow: "1–2 weeks", steps: ["Polish persistence and editing", "Add failure recovery", "Document the next build slice"] },
    ],
    immediateNextStep: {
      title: "Write the smallest believable test",
      action: `Describe one user completing the first useful action for “${input.initialIdea}” in five minutes or less. Keep the test to one screen and one outcome.`,
      doneWhen: "A friend can read the scenario and tell you exactly what to click, what to produce, and what would count as useful.",
    },
  };
}

async function requestStructured<T>(
  schema: z.ZodType<T>,
  request: Omit<StructuredProviderRequest, "jsonSchema">,
  options: GenerationOptions,
): Promise<{ data: T; provider: TextProvider; model: string; attempts: GenerationAttempt[] }> {
  const providers = options.providers ?? createDefaultProviders({ timeoutMs: options.timeoutMs });
  const attempts: GenerationAttempt[] = [];
  let capacityBusy = false;

  if (providers.length === 0) {
    throw new ProviderFailure("No AI generation provider is configured.");
  }

  for (const provider of providers) {
    let retryPrompt = request.prompt;

    for (let attempt = 0; attempt < 2; attempt += 1) {
      let completion: ProviderCompletion;

      try {
        completion = await provider.complete({
          ...request,
          prompt: retryPrompt,
          jsonSchema: jsonSchemaFor(schema),
        });
      } catch (error) {
        capacityBusy ||= error instanceof ProviderFailure && error.capacityBusy;
        attempts.push({
          provider: provider.id,
          model: provider.model,
          status: "failed",
          error: error instanceof Error ? error.message : "Provider request failed.",
        });
        break;
      }

      try {
        const data = parseStructured(completion.content, schema);
        attempts.push({ provider: provider.id, model: completion.model, status: "success" });
        return { data, provider, model: completion.model, attempts };
      } catch (error) {
        attempts.push({
          provider: provider.id,
          model: completion.model,
          status: "failed",
          error: error instanceof Error ? error.message : "Invalid structured output.",
        });

        if (attempt === 0) {
          retryPrompt = `${request.prompt}\n\nYour previous response was invalid. Return only a JSON object that exactly matches the supplied schema. Do not include markdown fences or commentary.`;
        }
      }
    }
  }

  throw new ProviderFailure("All configured generation providers failed.", attempts, capacityBusy);
}

export function getGenerationAttempts(error: unknown) {
  return error instanceof ProviderFailure ? error.attempts : [];
}

export function isProviderCapacityError(error: unknown) {
  return error instanceof ProviderFailure && error.capacityBusy;
}

export async function generateIdeaBrief(
  input: IdeaBriefInput,
  options: GenerationOptions = {},
): Promise<GenerationResult> {
  const parsedInput = ideaBriefInputSchema.parse(input);
  const providers = options.providers ?? createDefaultProviders({ timeoutMs: options.timeoutMs });

  if (providers.length === 0) {
    return {
      artifact: buildFallbackArtifact(parsedInput),
      provider: "local",
      model: "local-draft",
      attempts: [{ provider: "local", model: "local-draft", status: "success" }],
    };
  }

  try {
    const result = await requestStructured(
      ideaArtifactSchema,
      {
        systemPrompt: briefSystemPrompt,
        prompt: buildBriefPrompt(parsedInput),
        schemaName: "idea_brief",
      },
      { ...options, providers },
    );
    return {
      artifact: result.data,
      provider: result.provider.id,
      model: result.model,
      attempts: result.attempts,
    };
  } catch (error) {
    const providerAttempts = getGenerationAttempts(error);

    return {
      artifact: buildFallbackArtifact(parsedInput),
      provider: "local",
      model: "local-fallback",
      attempts: [
        ...(providerAttempts.length > 0
          ? providerAttempts
          : providers.map((provider) => ({
              provider: provider.id,
              model: provider.model,
              status: "failed" as const,
              error: "Provider exhausted; local draft used.",
            }))),
        { provider: "local", model: "local-fallback", status: "success" as const },
      ],
    };
  }
}

export async function generateExploration(
  source: { brief: IdeaBriefInput; artifact: IdeaArtifact; input: ExplorationInput },
  options: GenerationOptions = {},
) {
  const input = explorationInputSchema.parse(source.input);
  const providers = options.providers ?? createDefaultProviders({ timeoutMs: options.timeoutMs });

  if (providers.length === 0) {
    return {
      exploration: buildFallbackExploration(source.artifact, input),
      provider: "local" as const,
      model: "local-draft",
      attempts: [{ provider: "local" as const, model: "local-draft", status: "success" as const }],
    };
  }

  const result = await requestStructured(
    explorationOutputSchema,
    {
      systemPrompt: explorationSystemPrompt,
      schemaName: "idea_exploration",
      prompt: `Explore this existing product brief.

Selected creative constraints: ${selectedConstraintText(input)}

Original brief:
${JSON.stringify(source.brief)}

Original generated artifact:
${JSON.stringify(source.artifact)}`,
    },
    { ...options, providers },
  );

  return {
    exploration: result.data,
    provider: result.provider.id,
    model: result.model,
    attempts: result.attempts,
  };
}

export async function expandExplorationDirection(
  source: {
    brief: IdeaBriefInput;
    artifact: IdeaArtifact;
    input: ExplorationInput;
    preview: DirectionPreview;
  },
  options: GenerationOptions = {},
) {
  const input = explorationInputSchema.parse(source.input);
  const providers = options.providers ?? createDefaultProviders({ timeoutMs: options.timeoutMs });

  if (providers.length === 0) {
    return {
      artifact: buildFallbackForkArtifact(source.artifact, source.preview),
      provider: "local" as const,
      model: "local-draft",
      attempts: [{ provider: "local" as const, model: "local-draft", status: "success" as const }],
    };
  }

  const result = await requestStructured(
    ideaArtifactSchema,
    {
      systemPrompt: forkExpansionSystemPrompt,
      schemaName: "fork_expansion",
      prompt: `Expand the selected direction into a complete product artifact.

Selected direction:
${JSON.stringify(source.preview)}

Selected creative constraints: ${selectedConstraintText(input)}

Original brief:
${JSON.stringify(source.brief)}

Original artifact:
${JSON.stringify(source.artifact)}`,
    },
    { ...options, providers },
  );

  return {
    artifact: ideaArtifactSchema.parse({
      ...result.data,
      projectName: source.preview.projectName,
      northStar: {
        headline: source.preview.headline,
        summary: source.preview.thesis,
      },
      whoItsFor: {
        ...result.data.whoItsFor,
        primaryUser: source.preview.primaryUser,
      },
    }),
    provider: result.provider.id,
    model: result.model,
    attempts: result.attempts,
  };
}

export async function refineArtifact(
  artifact: IdeaArtifact,
  instruction: string,
  options: GenerationOptions = {},
) {
  const result = await requestStructured(
    ideaArtifactSchema,
    {
      systemPrompt: briefSystemPrompt,
      schemaName: "refined_idea_brief",
      prompt: `Refine this existing artifact according to the instruction below. Preserve useful specificity and keep the same JSON shape.\n\nInstruction: ${instruction}\n\nExisting artifact:\n${JSON.stringify(artifact)}`,
    },
    options,
  );

  return { artifact: result.data, provider: result.provider.id, model: result.model, attempts: result.attempts };
}

export async function expandMilestone(
  milestone: IdeaArtifact["milestones"][number],
  instruction: string,
  options: GenerationOptions = {},
) {
  const result = await requestStructured(
    milestoneSchema,
    {
      systemPrompt: briefSystemPrompt,
      schemaName: "expanded_milestone",
      prompt: `Expand this milestone into a more actionable version. Keep the id stable and return only the milestone JSON object.\n\nInstruction: ${instruction}\n\nMilestone:\n${JSON.stringify(milestone)}`,
    },
    options,
  );

  return { milestone: result.data, provider: result.provider.id, model: result.model, attempts: result.attempts };
}
