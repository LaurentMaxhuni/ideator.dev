import { Plus, Trash2 } from "lucide-react";

import type { ArtifactSectionName } from "@ideator.dev/ai";

type EditorProps = {
  section: ArtifactSectionName;
  value: unknown;
  onChange: (value: unknown) => void;
};

type TextFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  minLength: number;
  maxLength: number;
  rows?: number;
  hint?: string;
};

type ListEditorProps = {
  id: string;
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  minItems: number;
  maxItems: number;
  maxLength: number;
  addLabel: string;
};

const inputClass =
  "w-full rounded-lg border border-input bg-background/55 px-3.5 py-3 text-sm leading-6 text-foreground outline-none transition-[background-color,border-color,box-shadow] duration-180 ease-spring placeholder:text-muted-foreground/50 focus:border-primary/60 focus-visible:ring-2 focus-visible:ring-ring/40";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asText(value: unknown) {
  return typeof value === "string" ? value : "";
}

function asTextList(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function updateRecord(value: unknown, key: string, content: unknown) {
  return { ...(isRecord(value) ? value : {}), [key]: content };
}

function TextField({
  id,
  label,
  value,
  onChange,
  minLength,
  maxLength,
  rows = 3,
  hint,
}: TextFieldProps) {
  return (
    <label className="block" htmlFor={id}>
      <span className="flex items-end justify-between gap-4">
        <span className="text-xs font-medium text-foreground">{label}</span>
        <span className="tabular-nums text-[0.65rem] text-muted-foreground">
          {value.length} / {maxLength}
        </span>
      </span>
      {hint ? <span className="mt-1 block text-xs leading-5 text-muted-foreground">{hint}</span> : null}
      <textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required
        minLength={minLength}
        maxLength={maxLength}
        rows={rows}
        className={`${inputClass} mt-2 resize-y`}
      />
    </label>
  );
}

function ListEditor({
  id,
  label,
  items,
  onChange,
  minItems,
  maxItems,
  maxLength,
  addLabel,
}: ListEditorProps) {
  function updateItem(index: number, value: string) {
    onChange(items.map((item, itemIndex) => (itemIndex === index ? value : item)));
  }

  function removeItem(index: number) {
    if (items.length > minItems) {
      onChange(items.filter((_, itemIndex) => itemIndex !== index));
    }
  }

  return (
    <fieldset className="rounded-xl border border-border/70 bg-background/25 p-4">
      <div className="flex items-center justify-between gap-4">
        <legend className="text-xs font-medium text-foreground">{label}</legend>
        <span className="tabular-nums text-[0.65rem] text-muted-foreground">
          {items.length} / {maxItems}
        </span>
      </div>
      <div className="mt-3 space-y-2.5">
        {items.map((item, index) => (
          <div key={`${id}-${index}`} className="grid grid-cols-[1fr_auto] gap-2">
            <label className="sr-only" htmlFor={`${id}-${index}`}>
              {label} item {index + 1}
            </label>
            <textarea
              id={`${id}-${index}`}
              value={item}
              onChange={(event) => updateItem(index, event.target.value)}
              required
              minLength={3}
              maxLength={maxLength}
              rows={2}
              className={`${inputClass} resize-y`}
            />
            <button
              type="button"
              onClick={() => removeItem(index)}
              disabled={items.length <= minItems}
              className="grid size-11 place-items-center rounded-md border border-border bg-background/45 text-muted-foreground transition-[background-color,border-color,color,transform] duration-180 ease-spring hover:-translate-y-0.5 hover:border-destructive/45 hover:text-destructive focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:translate-y-px disabled:cursor-not-allowed disabled:opacity-35"
              aria-label={`Remove ${label.toLowerCase()} item ${index + 1}`}
            >
              <Trash2 className="size-3.5" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...items, ""])}
        disabled={items.length >= maxItems}
        className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-md border border-border bg-background/35 px-3 text-xs font-medium text-foreground transition-[background-color,border-color,transform] duration-180 ease-spring hover:-translate-y-0.5 hover:border-primary/45 hover:bg-primary/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:translate-y-px disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Plus className="size-3.5" aria-hidden="true" /> {addLabel}
      </button>
    </fieldset>
  );
}

function RecordFields({
  section,
  value,
  onChange,
}: {
  section: ArtifactSectionName;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const record = isRecord(value) ? value : {};

  if (section === "northStar") {
    return (
      <div className="space-y-5">
        <TextField id="north-star-headline" label="Headline" value={asText(record.headline)} onChange={(content) => onChange(updateRecord(record, "headline", content))} minLength={3} maxLength={180} rows={2} />
        <TextField id="north-star-summary" label="Summary" value={asText(record.summary)} onChange={(content) => onChange(updateRecord(record, "summary", content))} minLength={20} maxLength={800} rows={4} />
      </div>
    );
  }

  if (section === "whoItsFor") {
    return (
      <div className="space-y-5">
        <TextField id="audience-primary" label="Primary user" value={asText(record.primaryUser)} onChange={(content) => onChange(updateRecord(record, "primaryUser", content))} minLength={3} maxLength={180} rows={2} hint="Name one specific person or role, not a broad market." />
        <TextField id="audience-situation" label="Situation" value={asText(record.situation)} onChange={(content) => onChange(updateRecord(record, "situation", content))} minLength={12} maxLength={500} rows={3} />
        <TextField id="audience-promise" label="Promise" value={asText(record.promise)} onChange={(content) => onChange(updateRecord(record, "promise", content))} minLength={12} maxLength={500} rows={3} />
      </div>
    );
  }

  if (section === "mvpScope") {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        <ListEditor id="scope-include" label="In the first version" items={asTextList(record.include)} onChange={(items) => onChange(updateRecord(record, "include", items))} minItems={3} maxItems={8} maxLength={220} addLabel="Add in-scope item" />
        <ListEditor id="scope-exclude" label="Deliberately left out" items={asTextList(record.exclude)} onChange={(items) => onChange(updateRecord(record, "exclude", items))} minItems={2} maxItems={8} maxLength={220} addLabel="Add non-goal" />
      </div>
    );
  }

  if (section === "experience") {
    return (
      <div className="space-y-5">
        <TextField id="experience-direction" label="Experience direction" value={asText(record.direction)} onChange={(content) => onChange(updateRecord(record, "direction", content))} minLength={20} maxLength={600} rows={4} />
        <div className="grid gap-4 lg:grid-cols-2">
          <ListEditor id="experience-principles" label="Design principles" items={asTextList(record.principles)} onChange={(items) => onChange(updateRecord(record, "principles", items))} minItems={3} maxItems={6} maxLength={180} addLabel="Add principle" />
          <ListEditor id="experience-first-run" label="First-run steps" items={asTextList(record.firstRun)} onChange={(items) => onChange(updateRecord(record, "firstRun", items))} minItems={3} maxItems={6} maxLength={220} addLabel="Add first-run step" />
        </div>
      </div>
    );
  }

  if (section === "technicalBlueprint") {
    return (
      <div className="space-y-5">
        <TextField id="technical-shape" label="Architecture shape" value={asText(record.shape)} onChange={(content) => onChange(updateRecord(record, "shape", content))} minLength={20} maxLength={700} rows={4} />
        <div className="grid gap-4 lg:grid-cols-3">
          <ListEditor id="technical-stack" label="Stack" items={asTextList(record.stack)} onChange={(items) => onChange(updateRecord(record, "stack", items))} minItems={3} maxItems={8} maxLength={160} addLabel="Add technology" />
          <ListEditor id="technical-data" label="Data model" items={asTextList(record.dataModel)} onChange={(items) => onChange(updateRecord(record, "dataModel", items))} minItems={2} maxItems={6} maxLength={220} addLabel="Add data object" />
          <ListEditor id="technical-risks" label="Risks" items={asTextList(record.risks)} onChange={(items) => onChange(updateRecord(record, "risks", items))} minItems={2} maxItems={6} maxLength={220} addLabel="Add risk" />
        </div>
      </div>
    );
  }

  if (section === "immediateNextStep") {
    return (
      <div className="space-y-5">
        <TextField id="next-title" label="Step title" value={asText(record.title)} onChange={(content) => onChange(updateRecord(record, "title", content))} minLength={3} maxLength={140} rows={2} />
        <TextField id="next-action" label="Action" value={asText(record.action)} onChange={(content) => onChange(updateRecord(record, "action", content))} minLength={12} maxLength={500} rows={4} />
        <TextField id="next-done" label="Done when" value={asText(record.doneWhen)} onChange={(content) => onChange(updateRecord(record, "doneWhen", content))} minLength={12} maxLength={280} rows={3} />
      </div>
    );
  }

  return null;
}

function MilestoneEditor({ value, onChange }: { value: unknown; onChange: (value: unknown) => void }) {
  const milestones = Array.isArray(value) ? value.filter(isRecord) : [];

  function updateMilestone(index: number, key: string, content: unknown) {
    onChange(
      milestones.map((milestone, milestoneIndex) =>
        milestoneIndex === index ? updateRecord(milestone, key, content) : milestone,
      ),
    );
  }

  return (
    <div className="space-y-4">
      {milestones.map((milestone, index) => (
        <fieldset key={`milestone-${index}`} className="rounded-xl border border-border/70 bg-background/25 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-4">
            <legend className="text-xs font-semibold text-foreground">Milestone {index + 1}</legend>
            <button
              type="button"
              onClick={() => onChange(milestones.filter((_, milestoneIndex) => milestoneIndex !== index))}
              disabled={milestones.length <= 3}
              className="inline-flex min-h-9 items-center gap-2 rounded-md px-2.5 text-xs text-muted-foreground transition-[color,transform] duration-180 ease-spring hover:-translate-y-0.5 hover:text-destructive active:translate-y-px disabled:cursor-not-allowed disabled:opacity-35"
            >
              <Trash2 className="size-3.5" aria-hidden="true" /> Remove
            </button>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-[0.35fr_1fr_0.55fr]">
            <TextField id={`milestone-${index}-id`} label="Short ID" value={asText(milestone.id)} onChange={(content) => updateMilestone(index, "id", content)} minLength={2} maxLength={32} rows={2} />
            <TextField id={`milestone-${index}-name`} label="Name" value={asText(milestone.name)} onChange={(content) => updateMilestone(index, "name", content)} minLength={3} maxLength={120} rows={2} />
            <TextField id={`milestone-${index}-window`} label="Ship window" value={asText(milestone.shipWindow)} onChange={(content) => updateMilestone(index, "shipWindow", content)} minLength={3} maxLength={80} rows={2} />
          </div>
          <div className="mt-4 space-y-4">
            <TextField id={`milestone-${index}-outcome`} label="Outcome" value={asText(milestone.outcome)} onChange={(content) => updateMilestone(index, "outcome", content)} minLength={12} maxLength={300} rows={3} />
            <ListEditor id={`milestone-${index}-steps`} label="Steps" items={asTextList(milestone.steps)} onChange={(items) => updateMilestone(index, "steps", items)} minItems={2} maxItems={5} maxLength={220} addLabel="Add step" />
          </div>
        </fieldset>
      ))}
      <button
        type="button"
        onClick={() => onChange([...milestones, { id: `m${milestones.length + 1}`, name: "", outcome: "", shipWindow: "", steps: ["", ""] }])}
        disabled={milestones.length >= 6}
        className="inline-flex min-h-10 items-center gap-2 rounded-md border border-border bg-background/35 px-3 text-xs font-medium text-foreground transition-[background-color,border-color,transform] duration-180 ease-spring hover:-translate-y-0.5 hover:border-primary/45 hover:bg-primary/[0.06] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Plus className="size-3.5" aria-hidden="true" /> Add milestone
      </button>
    </div>
  );
}

export function ArtifactSectionEditor({ section, value, onChange }: EditorProps) {
  if (section === "whyItMatters") {
    return (
      <TextField
        id="why-it-matters"
        label="Problem and urgency"
        value={asText(value)}
        onChange={onChange}
        minLength={20}
        maxLength={900}
        rows={6}
        hint="Describe the real tension. Avoid market-size language and generic claims."
      />
    );
  }

  if (section === "milestones") {
    return <MilestoneEditor value={value} onChange={onChange} />;
  }

  return <RecordFields section={section} value={value} onChange={onChange} />;
}
