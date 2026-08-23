import assert from "node:assert/strict";
import test from "node:test";
import { z } from "zod";

import {
  explorationInputSchema,
  explorationOutputSchema,
  forkRequestSchema,
  type DirectionPreview,
  type ForkMode,
} from "./schemas.ts";

function preview(mode: ForkMode): DirectionPreview {
  return {
    mode,
    projectName: `${mode} project`,
    headline: `A specific ${mode} product direction`,
    thesis: `This is a concrete and sufficiently detailed thesis for the ${mode} product direction.`,
    primaryUser: "Independent product builders",
    wedge: "Start with one frequent decision that existing tools make unnecessarily difficult.",
    mvpMoves: ["Capture one input", "Produce one useful output", "Test the result with a user"],
    experienceHook: "The result changes visibly as soon as the core action is complete.",
    biggestRisk: "The narrow first action may not be frequent enough to create a habit.",
    firstTest: "Ask five target users to complete the core action without explanation.",
  };
}

test("exploration input accepts zero, one, or two curated constraints", () => {
  for (const constraintIds of [
    [],
    ["weekend-build"],
    ["weekend-build", "no-onboarding"],
  ]) {
    assert.equal(
      explorationInputSchema.safeParse({ constraintIds, customConstraint: "" }).success,
      true,
    );
  }
});

test("exploration input rejects duplicates, a third card, and oversized custom input", () => {
  assert.equal(
    explorationInputSchema.safeParse({
      constraintIds: ["weekend-build", "weekend-build"],
      customConstraint: "",
    }).success,
    false,
  );
  assert.equal(
    explorationInputSchema.safeParse({
      constraintIds: ["weekend-build", "no-onboarding", "offline-first"],
      customConstraint: "",
    }).success,
    false,
  );
  assert.equal(
    explorationInputSchema.safeParse({ constraintIds: [], customConstraint: "x".repeat(241) }).success,
    false,
  );
});

test("fork requests accept only supported modes", () => {
  assert.equal(forkRequestSchema.safeParse({ mode: "safer" }).success, true);
  assert.equal(forkRequestSchema.safeParse({ mode: "reckless" }).success, false);
  assert.equal(forkRequestSchema.safeParse({ mode: "bolder", preview: {} }).success, false);
});

test("exploration output requires exactly one safer, bolder, and stranger preview", () => {
  assert.equal(
    explorationOutputSchema.safeParse({
      directions: [preview("safer"), preview("bolder"), preview("stranger")],
    }).success,
    true,
  );

  assert.equal(
    explorationOutputSchema.safeParse({
      directions: [preview("safer"), preview("safer"), preview("stranger")],
    }).success,
    false,
  );
});

test("exploration output rejects malformed model content", () => {
  assert.equal(
    explorationOutputSchema.safeParse({
      directions: [
        preview("safer"),
        { ...preview("bolder"), mvpMoves: ["Only one move"] },
        preview("stranger"),
      ],
    }).success,
    false,
  );
  assert.equal(explorationOutputSchema.safeParse({ directions: "not-an-array" }).success, false);
});

test("exploration output produces a strict JSON schema for providers", () => {
  const jsonSchema = z.toJSONSchema(explorationOutputSchema, { target: "draft-7" });

  assert.equal(jsonSchema.type, "object");
  assert.equal(jsonSchema.additionalProperties, false);
  assert.deepEqual(jsonSchema.required, ["directions"]);
});
