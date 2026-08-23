import assert from "node:assert/strict";
import test from "node:test";

import {
  expandExplorationDirection,
  generateExploration,
  generateIdeaBrief,
} from "./providers.ts";
import {
  explorationOutputSchema,
  ideaArtifactSchema,
  type IdeaBriefInput,
} from "./schemas.ts";

const brief = {
  initialIdea: "A workspace that turns meeting notes into decisions and owners.",
  domain: "software",
  intendedUsers: "Small product teams",
  ambition: "small-product",
  platform: "Responsive web app",
  constraints: "Keep the workflow lightweight",
  nonGoals: "No project management suite",
} satisfies IdeaBriefInput;

async function localArtifact() {
  const result = await generateIdeaBrief(brief, { providers: [] });
  return result.artifact;
}

function looksLikeTwoWordTitleCase(value: string) {
  return /^[A-Z][a-z]+\s+[A-Z][a-z]+$/.test(value);
}

test("exploration uses a valid local draft when no provider is configured", async () => {
  const artifact = await localArtifact();
  const result = await generateExploration(
    {
      brief,
      artifact,
      input: {
        constraintIds: ["weekend-build", "value-in-60-seconds"],
        customConstraint: "Avoid a setup wizard",
      },
    },
    { providers: [] },
  );

  assert.equal(result.provider, "local");
  assert.equal(result.model, "local-draft");
  assert.equal(explorationOutputSchema.safeParse(result.exploration).success, true);
  assert.deepEqual(
    result.exploration.directions.map((direction) => direction.mode),
    ["safer", "bolder", "stranger"],
  );
  assert.equal(
    result.exploration.directions.some((direction) => looksLikeTwoWordTitleCase(direction.projectName)),
    false,
  );

  const output = JSON.stringify(result.exploration);
  assert.match(output, /Weekend build/);
  assert.match(output, /Value in 60 seconds/);
  assert.match(output, /Avoid a setup wizard/);
});

test("local drafts use descriptive sentence-case working titles", async () => {
  const artifact = await localArtifact();

  assert.equal(looksLikeTwoWordTitleCase(artifact.projectName), false);
  assert.match(artifact.projectName, /meeting notes/i);
});

test("a local exploration direction expands into a schema-valid artifact", async () => {
  const artifact = await localArtifact();
  const exploration = await generateExploration(
    {
      brief,
      artifact,
      input: { constraintIds: [], customConstraint: "" },
    },
    { providers: [] },
  );
  const preview = exploration.exploration.directions.find(
    (direction) => direction.mode === "bolder",
  );

  assert.ok(preview);

  const result = await expandExplorationDirection(
    {
      brief,
      artifact,
      input: { constraintIds: [], customConstraint: "" },
      preview,
    },
    { providers: [] },
  );

  assert.equal(result.provider, "local");
  assert.equal(ideaArtifactSchema.safeParse(result.artifact).success, true);
  assert.equal(result.artifact.projectName, preview.projectName);
  assert.equal(result.artifact.northStar.headline, preview.headline);
  assert.deepEqual(result.artifact.mvpScope.include, preview.mvpMoves);
});
