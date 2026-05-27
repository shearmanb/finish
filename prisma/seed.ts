import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function slug(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

type Upsertable = {
  upsert: (args: {
    where: { id: string };
    update: Record<string, never>;
    create: Record<string, unknown>;
  }) => Promise<unknown>;
};

// Create-if-absent so re-seeding never clobbers the user's later edits.
async function lookup(model: Upsertable, id: string, data: Record<string, unknown>) {
  await model.upsert({ where: { id }, update: {}, create: { id, ...data } });
}

async function main() {
  // One cast: each delegate satisfies the minimal Upsertable shape above.
  const m = prisma as unknown as Record<string, Upsertable>;
  // ---------- Distilleries ----------
  const distilleries = [
    "Buffalo Trace",
    "Heaven Hill",
    "Jim Beam",
    "Wild Turkey",
    "Maker's Mark",
    "Four Roses",
    "Woodford Reserve",
    "Old Forester",
    "Barton 1792",
    "Michter's",
    "Willett",
    "Knob Creek",
    "Elijah Craig",
    "Eagle Rare",
    "Blanton's",
    "Russell's Reserve",
    "Larceny",
    "New Riff",
    "Angel's Envy",
    "Bardstown Bourbon Company",
    "Rabbit Hole",
    "Green River",
    "Kentucky Peerless",
    "MGP / Ross & Squibb",
    "Sazerac",
  ];
  for (const [i, name] of distilleries.entries()) {
    await lookup(m.distillery, `dist_${slug(name)}`, {
      name,
      sortIndex: i,
    });
  }

  // ---------- Glassware ----------
  const glassware = [
    "Glencairn",
    "Copita",
    "NEAT Glass",
    "Tulip",
    "Rocks / Old Fashioned",
    "Snifter",
    "Highball",
  ];
  for (const [i, name] of glassware.entries()) {
    await lookup(m.glassware, `glass_${slug(name)}`, { name, sortIndex: i });
  }

  // ---------- Stores ----------
  const stores = [
    "VABC",
    "Online",
    "SharedPour",
    "T8ke Lottery",
    "Total Wine",
    "Local Liquor Store",
  ];
  for (const [i, name] of stores.entries()) {
    await lookup(m.store, `store_${slug(name)}`, { name, sortIndex: i });
  }

  // ---------- Locations ----------
  const locations = [
    "Home",
    "Bar",
    "Restaurant",
    "Friend's Place",
    "Distillery",
    "Tasting Event",
  ];
  for (const [i, name] of locations.entries()) {
    await lookup(m.location, `loc_${slug(name)}`, { name, sortIndex: i });
  }

  // ---------- Mouthfeel ----------
  const mouthfeel = [
    "Oily",
    "Creamy",
    "Smooth",
    "Round",
    "Coating",
    "Viscous",
    "Thin",
    "Watery",
    "Drying / Tannic",
    "Hot",
    "Astringent",
  ];
  for (const [i, name] of mouthfeel.entries()) {
    await lookup(m.mouthfeel, `mf_${slug(name)}`, { name, sortIndex: i });
  }

  // ---------- Tasting phases ----------
  const phases = [
    { id: "phase_appearance", name: "Appearance / Color" },
    { id: "phase_nose_neat", name: "Nose (neat)" },
    { id: "phase_nose_rest", name: "Nose (after rest)" },
    { id: "phase_palate", name: "Palate" },
    { id: "phase_finish", name: "Finish" },
    { id: "phase_water", name: "With water" },
  ];
  for (const [i, p] of phases.entries()) {
    await lookup(m.tastingPhase, p.id, { name: p.name, sortIndex: i });
  }

  // ---------- Rating dimensions ----------
  const dims = [
    { id: "dim_nose", name: "Nose" },
    { id: "dim_palate", name: "Palate" },
    { id: "dim_finish", name: "Finish" },
    { id: "dim_overall", name: "Overall" },
  ];
  for (const [i, d] of dims.entries()) {
    await lookup(m.ratingDimension, d.id, {
      name: d.name,
      scaleType: "NUMERIC",
      minValue: 0,
      maxValue: 10,
      step: null,
      sortIndex: i,
    });
  }

  // t8ke descriptive anchors on the Overall dimension.
  const t8ke: [number, string, string][] = [
    [0, "Disgusting", "So bad I poured it out."],
    [1, "Bad", "Multiple flaws; wouldn't drink by choice."],
    [2, "Poor", "I wouldn't consume by choice."],
    [3, "Flawed", "Drinkable, but with clear problems."],
    [4, "Sub-par", "Not bad, but many things I'd rather have."],
    [5, "Good", "Solid; just fine."],
    [6, "Very Good", "A cut above."],
    [7, "Great", "Well above average."],
    [8, "Excellent", "Really quite exceptional."],
    [9, "Incredible", "An all-time favorite."],
    [10, "Perfect", "Perfect."],
  ];
  for (const [value, label, description] of t8ke) {
    await lookup(m.ratingScaleAnchor, `anc_overall_${value}`, {
      dimensionId: "dim_overall",
      value,
      label,
      description,
    });
  }

  // ---------- Flavor wheel ----------
  // [categoryName, parentId|null, flavors[]]
  const flavorTree: [string, string | null, string[]][] = [
    [
      "Sweet",
      null,
      [
        "Caramel",
        "Toffee",
        "Butterscotch",
        "Brown Sugar",
        "Honey",
        "Maple",
        "Molasses",
        "Vanilla",
        "Marshmallow",
      ],
    ],
    ["Fruit", null, []],
    ["Fruit – Red", "cat_fruit", ["Cherry", "Strawberry", "Raspberry"]],
    ["Fruit – Orchard", "cat_fruit", ["Apple", "Pear", "Peach", "Apricot"]],
    ["Fruit – Citrus", "cat_fruit", ["Orange", "Lemon", "Zest"]],
    ["Fruit – Dried", "cat_fruit", ["Raisin", "Fig", "Date", "Prune"]],
    [
      "Baking Spice",
      null,
      ["Cinnamon", "Nutmeg", "Clove", "Allspice", "Ginger", "Anise"],
    ],
    ["Hot Spice", null, ["Black Pepper", "White Pepper", "Rye Spice"]],
    [
      "Oak / Wood",
      null,
      ["Toasted Oak", "Charred Oak", "Cedar", "Pencil Shavings", "Resin"],
    ],
    [
      "Grain / Cereal",
      null,
      ["Corn", "Cornbread", "Rye Bread", "Malt", "Biscuit", "Oatmeal"],
    ],
    ["Nutty", null, ["Almond", "Pecan", "Walnut", "Hazelnut", "Peanut"]],
    [
      "Chocolate / Coffee",
      null,
      ["Milk Chocolate", "Dark Chocolate", "Cocoa", "Mocha", "Espresso"],
    ],
    [
      "Floral / Herbal",
      null,
      ["Rose", "Honeysuckle", "Mint", "Eucalyptus", "Dill", "Tobacco Flower"],
    ],
    [
      "Earthy / Leather",
      null,
      ["Leather", "Tobacco", "Pipe Smoke", "Cigar", "Earth", "Old Books"],
    ],
    [
      "Dessert / Rich",
      null,
      [
        "Crème Brûlée",
        "Custard",
        "Pie Crust",
        "Cinnamon Roll",
        "Pecan Pie",
        "Banana Bread",
      ],
    ],
    ["Smoke / Char", null, ["Campfire", "Charcoal", "BBQ", "Burnt Sugar"]],
    [
      "Off-notes / Faults",
      null,
      ["Acetone", "Nail Polish", "Sulfur", "Cardboard", "Soapy", "Ethanol Burn"],
    ],
  ];

  let catIndex = 0;
  for (const [name, parentId, flavors] of flavorTree) {
    const catId = `cat_${slug(name)}`;
    await lookup(m.flavorCategory, catId, {
      name,
      parentId,
      sortIndex: catIndex++,
    });
    for (const [i, fname] of flavors.entries()) {
      await lookup(m.flavor, `fla_${slug(name)}_${slug(fname)}`, {
        name: fname,
        categoryId: catId,
        sortIndex: i,
      });
    }
  }

  // ---------- Bottle types (hierarchical) ----------
  const rootTypes = [
    "Bourbon",
    "Rye",
    "Tennessee Whiskey",
    "American Single Malt",
    "Scotch",
    "Irish Whiskey",
    "Japanese Whisky",
    "Canadian Whisky",
    "World Whisky",
    "Blend",
  ];
  for (const [i, name] of rootTypes.entries()) {
    await lookup(m.bottleType, `bt_${slug(name)}`, { name, parentId: null, sortIndex: i });
  }
  const bourbonSubTypes = [
    "High Rye Bourbon",
    "Wheated Bourbon",
    "Four Grain Bourbon",
    "Kentucky Straight Bourbon",
  ];
  for (const [i, name] of bourbonSubTypes.entries()) {
    await lookup(m.bottleType, `bt_${slug(name)}`, {
      name,
      parentId: "bt_bourbon",
      sortIndex: i,
    });
  }
  const scotchSubTypes = ["Single Malt Scotch", "Blended Scotch", "Blended Malt Scotch"];
  for (const [i, name] of scotchSubTypes.entries()) {
    await lookup(m.bottleType, `bt_${slug(name)}`, {
      name,
      parentId: "bt_scotch",
      sortIndex: i,
    });
  }

  // ---------- Mash bill types ----------
  const mashBills = [
    "Unknown",
    "Traditional (75%+ corn)",
    "High Rye (25%+ rye)",
    "Wheated (wheat sub-grain)",
    "Four Grain",
    "High Corn (90%+ corn)",
  ];
  for (const [i, name] of mashBills.entries()) {
    await lookup(m.mashBillType, `mb_${slug(name)}`, { name, sortIndex: i });
  }

  // ---------- Finish types ----------
  const finishTypes = [
    "Port",
    "Sherry (Oloroso)",
    "Sherry (PX)",
    "Madeira",
    "Rum",
    "Toasted Oak",
    "Double Oak",
    "Beer / Stout",
    "Wine",
    "Cognac / Brandy",
    "Maple",
    "Honey Barrel",
  ];
  for (const [i, name] of finishTypes.entries()) {
    await lookup(m.finishType, `ft_${slug(name)}`, { name, sortIndex: i });
  }

  // ---------- Guided tasting steps ----------
  const steps: {
    id: string;
    phaseId: string;
    title: string;
    instruction: string;
    capturesFlavors: boolean;
  }[] = [
    {
      id: "step_appearance",
      phaseId: "phase_appearance",
      title: "Pour & look",
      instruction:
        "Pour about an ounce into a Glencairn. Hold it to the light, swirl gently, and watch the legs. Note the color and body.",
      capturesFlavors: false,
    },
    {
      id: "step_nose_neat",
      phaseId: "phase_nose_neat",
      title: "First nose, neat",
      instruction:
        "Mouth slightly open, take short sniffs without swirling. What hits you first?",
      capturesFlavors: true,
    },
    {
      id: "step_nose_rest",
      phaseId: "phase_nose_rest",
      title: "Let it rest, nose again",
      instruction:
        "Set it down for about 5 minutes to open up, swirl gently, and nose again. What has emerged or changed?",
      capturesFlavors: true,
    },
    {
      id: "step_palate",
      phaseId: "phase_palate",
      title: "First sip",
      instruction:
        "Take a small sip and coat your whole mouth (a “Kentucky chew”). Note the arrival, mid-palate, and texture.",
      capturesFlavors: true,
    },
    {
      id: "step_finish",
      phaseId: "phase_finish",
      title: "The finish",
      instruction:
        "Swallow and wait. How long does it linger? Is it warming, drying, sweet?",
      capturesFlavors: true,
    },
    {
      id: "step_water",
      phaseId: "phase_water",
      title: "Add a few drops of water",
      instruction:
        "Add 2–3 drops of water (or a small cube), wait a moment, then nose and sip again. How did it change?",
      capturesFlavors: true,
    },
  ];
  for (const [i, s] of steps.entries()) {
    await lookup(m.guidedStep, s.id, {
      phaseId: s.phaseId,
      title: s.title,
      instruction: s.instruction,
      capturesNote: true,
      capturesFlavors: s.capturesFlavors,
      sortIndex: i,
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
