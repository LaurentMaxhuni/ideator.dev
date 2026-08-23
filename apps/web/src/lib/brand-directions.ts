export type BrandColor = {
  name: string;
  value: string;
};

export type BrandPalette = {
  name: string;
  colors: [BrandColor, BrandColor, BrandColor, BrandColor];
};

export type FontPairing = {
  name: string;
  display: string;
  body: string;
  displayStack: string;
  bodyStack: string;
  note: string;
};

export type LogoVariant = "frame" | "cut" | "modules" | "threshold";

export type BrandDirection = {
  id: LogoVariant;
  label: string;
  method: string;
  rationale: string;
  palette: BrandPalette;
  font: FontPairing;
};

const palettes: BrandPalette[] = [
  {
    name: "Warm instrument",
    colors: [
      { name: "Deep ink", value: "#172a33" },
      { name: "Soft paper", value: "#f5eedf" },
      { name: "Signal amber", value: "#e8b84a" },
      { name: "Mineral mint", value: "#9dcfc5" },
    ],
  },
  {
    name: "Field notes",
    colors: [
      { name: "Forest", value: "#18332d" },
      { name: "Fog", value: "#edf0e5" },
      { name: "Lichen", value: "#a5c65f" },
      { name: "Slate", value: "#697a73" },
    ],
  },
  {
    name: "Editorial signal",
    colors: [
      { name: "Night blue", value: "#182335" },
      { name: "Warm ivory", value: "#f2eadc" },
      { name: "Muted coral", value: "#c96558" },
      { name: "Old gold", value: "#c6a85e" },
    ],
  },
  {
    name: "Quiet contrast",
    colors: [
      { name: "Charcoal", value: "#222220" },
      { name: "Chalk", value: "#f3efe6" },
      { name: "Clay", value: "#d2765f" },
      { name: "Steel", value: "#8ca29f" },
    ],
  },
];

const fontPairings: FontPairing[] = [
  {
    name: "Humanist utility",
    display: "Outfit SemiBold",
    body: "Outfit Regular",
    displayStack: 'var(--font-outfit), "Segoe UI", sans-serif',
    bodyStack: 'var(--font-outfit), "Segoe UI", sans-serif',
    note: "Direct and approachable. A safe fit for product interfaces that should feel light on their feet.",
  },
  {
    name: "Editorial contrast",
    display: "Georgia",
    body: "Outfit Regular",
    displayStack: 'Georgia, "Times New Roman", serif',
    bodyStack: 'var(--font-outfit), "Segoe UI", sans-serif',
    note: "Adds judgment and personality without making the working interface feel ornamental.",
  },
  {
    name: "Technical precision",
    display: "Outfit Medium",
    body: "System mono",
    displayStack: 'var(--font-outfit), "Segoe UI", sans-serif',
    bodyStack: 'ui-monospace, "SFMono-Regular", Consolas, monospace',
    note: "Useful for developer tools, instruments, and products where small labels carry real meaning.",
  },
  {
    name: "Compact system",
    display: "Trebuchet MS",
    body: "Segoe UI",
    displayStack: '"Trebuchet MS", Arial, sans-serif',
    bodyStack: '"Segoe UI", system-ui, sans-serif',
    note: "A denser, practical voice that works well for mobile utilities and repeated operational use.",
  },
];

const methods: Array<Omit<BrandDirection, "palette" | "font" | "rationale">> = [
  {
    id: "frame",
    label: "Framed path",
    method: "Product action",
  },
  {
    id: "cut",
    label: "Cut initial",
    method: "Monogram + negative space",
  },
  {
    id: "modules",
    label: "Modular steps",
    method: "Construction geometry",
  },
  {
    id: "threshold",
    label: "Open threshold",
    method: "Metaphor reduction",
  },
];

function hashString(value: string) {
  let hash = 0;

  for (const character of value) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }

  return hash;
}

function compact(value: string, maxLength: number) {
  const trimmed = value.trim();
  return trimmed.length <= maxLength ? trimmed : `${trimmed.slice(0, maxLength - 1).trimEnd()}…`;
}

export function createBrandDirections(
  projectName: string,
  domain: string,
  coreAction: string,
  iteration = 0,
): BrandDirection[] {
  const offset = (hashString(`${projectName}:${domain}`) + iteration) % methods.length;
  const action = compact(coreAction, 92);
  const rationales: Record<LogoVariant, string> = {
    frame: `A contained route makes the product action visible: ${action}`,
    cut: `The first letter is reduced to a useful cut and opening, suggesting a decision rather than a decorative monogram.`,
    modules: `Three measured parts turn the first build into a small system while keeping one protected center.`,
    threshold: `An incomplete boundary marks the move from uncertainty into evidence without relying on a literal icon.`,
  };

  return methods.map((method, index) => ({
    ...method,
    rationale: rationales[method.id],
    palette: palettes[(index + offset) % palettes.length] ?? palettes[0],
    font: fontPairings[(index + offset * 2) % fontPairings.length] ?? fontPairings[0],
  }));
}
