/* ============================================================
   PSI Quote Request Questionnaire — data
   Source of truth: "PSI_Quote_Questionnaire_Spec.pdf" (provided).
   Every question is multiple-choice; "Other / Need guidance" is
   always appended as a fallback so clients aren't blocked.
   ============================================================ */
window.PSI_QUOTE = {
  gateway: {
    q: "What kind of project are you considering?",
    options: [
      { label: "Home addition (adding new square footage)", flow: "addition" },
      { label: "Bathroom renovation", flow: "bathroom" },
      { label: "Kitchen renovation", flow: "kitchen" },
      { label: "Basement finishing", flow: "basement" },
      { label: "Whole-house remodel", flow: "whole" },
      { label: "Deck, porch, or outdoor living", flow: "deck" },
      { label: "Roofing", flow: "roofing" },
      { label: "Siding / exterior", flow: "siding" },
      { label: "Garage or detached structure", flow: "garage" },
      { label: "Commercial buildout", flow: "commercial" },
      { label: "Multiple of the above", flow: null },
      { label: "Not sure yet, I want to explore", flow: null },
    ],
  },

  flows: {
    addition: {
      title: "Home Addition",
      questions: [
        {
          q: "What type of addition are you planning?",
          opts: [
            "Single-story bump-out (under 200 sqft)",
            "Single-story full addition",
            "Two-story addition",
            "Sunroom / four-season room",
            "In-law suite / ADU",
            "Garage conversion to living space",
            "Not sure yet",
          ],
        },
        {
          q: "Approximate square footage of the new space?",
          opts: [
            "Under 200 sqft",
            "200–400 sqft",
            "400–800 sqft",
            "800–1,500 sqft",
            "1,500+ sqft",
            "I need help figuring this out",
          ],
        },
        {
          q: "What is the primary purpose of the new space?",
          opts: [
            "Additional bedroom(s)",
            "Family room / living space",
            "Kitchen expansion",
            "Bathroom / primary suite",
            "Home office",
            "Multi-purpose",
            "Rental unit / separate living",
          ],
        },
        {
          q: "How many bedrooms will the addition include?",
          opts: ["0", "1", "2", "3 or more"],
        },
        {
          q: "How many bathrooms will the addition include?",
          opts: ["0", "Half bath only", "1 full bath", "2+ full baths"],
        },
        {
          q: "Foundation type?",
          opts: [
            "Slab on grade",
            "Crawl space",
            "Full basement",
            "Match existing foundation",
            "Not sure, need recommendation",
          ],
        },
        {
          q: "How should the new roof tie into the existing house?",
          opts: [
            "Match existing pitch and shingles",
            "Flat / low-slope addition",
            "Different style (gable, shed, etc.)",
            "Not sure, need design help",
          ],
        },
        {
          q: "Will utilities need to be relocated or extended?",
          opts: [
            "Just extending existing",
            "Some relocation (plumbing or electrical)",
            "Major relocation needed",
            "Not sure",
          ],
        },
        {
          q: "What's the HVAC plan?",
          opts: [
            "Extend existing system",
            "Add a mini-split for the new space",
            "Separate dedicated system",
            "Not sure",
          ],
        },
        {
          q: "How will the exterior finish be handled?",
          opts: [
            "Match existing siding exactly",
            "Re-side entire house for uniformity",
            "Mix of materials (siding + accent)",
            "Not sure",
          ],
        },
        {
          q: "Will trees, landscaping, or hardscape need to be removed?",
          opts: [
            "No, the build area is clear",
            "Minor removal (a few shrubs)",
            "Significant removal needed",
            "Tree removal required",
            "Not sure",
          ],
        },
        {
          q: "Do you have architectural plans?",
          opts: [
            "Yes, fully stamped/permit-ready",
            "Yes, conceptual drawings only",
            "No, I'd need PSI to coordinate design",
            "No, but I want to bring my own architect",
          ],
        },
        {
          q: "Have you confirmed zoning / setback compliance for the addition?",
          opts: [
            "Yes, fully confirmed",
            "I've checked informally",
            "No, need help navigating this",
            "Not sure what that means",
          ],
        },
        {
          q: "When would you like to start?",
          opts: [
            "As soon as possible",
            "Within 1–3 months",
            "3–6 months out",
            "6–12 months out",
            "Just gathering information",
          ],
        },
        {
          q: "What's your rough budget range for this addition?",
          opts: [
            "Under $75,000",
            "$75,000 – $150,000",
            "$150,000 – $300,000",
            "$300,000+",
            "I need guidance on realistic pricing",
          ],
        },
      ],
    },

    bathroom: {
      title: "Bathroom Renovation",
      questions: [
        {
          id: "bathType",
          q: "What type of bathroom are you renovating?",
          opts: [
            "Half bath / powder room",
            "3-piece (toilet, sink, tub OR shower)",
            "4-piece (toilet, sink, tub, separate shower)",
            "5-piece (above + double vanity or extras)",
            "Primary / master suite bath",
          ],
        },
        {
          q: "Approximate bathroom size?",
          opts: [
            "Under 40 sqft (small)",
            "40–80 sqft (standard)",
            "80–120 sqft (large)",
            "120+ sqft (spa / primary)",
            "Not sure",
          ],
        },
        {
          q: "What is the scope of work?",
          opts: [
            "Cosmetic refresh (paint, fixtures, vanity)",
            "Full gut and rebuild",
            "Layout change (moving fixtures)",
            "Bump-out / expanding into adjacent space",
          ],
        },
        {
          q: "Are you keeping the existing layout?",
          opts: [
            "Yes, fixtures stay in the same locations",
            "Minor changes (e.g., swap tub for shower)",
            "Major reconfiguration",
          ],
        },
        {
          q: "Plumbing scope?",
          opts: [
            "Reuse existing rough-in",
            "All new supply and waste lines",
            "Partial relocation",
            "Not sure",
          ],
        },
        {
          id: "showerConfig",
          q: "Shower / tub configuration?",
          skipIf: (a) => a.bathType === "Half bath / powder room",
          opts: [
            "Tub only (no shower)",
            "Tub-shower combo (single unit)",
            "Standalone walk-in shower",
            "Walk-in shower + freestanding soaker tub",
            "Wet room (open shower zone)",
            "Steam shower",
          ],
        },
        {
          q: "Tile coverage?",
          opts: [
            "Floor only",
            "Floor + shower walls only",
            "Floor to ceiling everywhere",
            "Accent wall(s) only",
            "Minimal / no tile",
          ],
        },
        {
          q: "Do you want a niche in the shower?",
          skipIf: (a) =>
            a.bathType === "Half bath / powder room" ||
            a.showerConfig === "Tub only (no shower)",
          opts: [
            "Single niche",
            "Double niche (stacked)",
            "Full ledge / horizontal band",
            "No niche",
            "Not sure",
          ],
        },
        {
          q: "Shower glass / enclosure?",
          skipIf: (a) =>
            a.bathType === "Half bath / powder room" ||
            a.showerConfig === "Tub only (no shower)",
          opts: [
            "Frameless glass",
            "Semi-frameless",
            "Sliding glass door",
            "Curtain",
            "None (open or wet room)",
          ],
        },
        {
          q: "Vanity configuration?",
          opts: [
            "Single sink",
            "Double sink",
            "Floating / wall-mount",
            "Custom built-in",
            "Reusing existing vanity",
          ],
        },
        {
          q: "Heated floor?",
          opts: ["Yes", "No", "Open to it if budget allows"],
        },
        {
          q: "Ventilation upgrade?",
          opts: [
            "Yes, new exhaust fan needed",
            "Existing fan is fine",
            "Add humidity-sensing / timer fan",
            "Not sure",
          ],
        },
        {
          q: "What level of finishes are you targeting?",
          opts: [
            "Builder-grade / budget-friendly",
            "Mid-range (most clients land here)",
            "High-end / designer",
            "Luxury / no expense spared",
            "Mix: splurge on some areas, save on others",
          ],
        },
        {
          q: "When would you like the project completed?",
          opts: [
            "As soon as possible",
            "Within 1–3 months",
            "3–6 months out",
            "Flexible",
          ],
        },
        {
          q: "Budget range for this bathroom?",
          opts: [
            "Under $15,000",
            "$15,000 – $30,000",
            "$30,000 – $60,000",
            "$60,000+",
            "I need guidance on realistic pricing",
          ],
        },
      ],
    },

    kitchen: {
      title: "Kitchen Renovation",
      questions: [
        {
          q: "What is the scope of work?",
          opts: [
            "Cosmetic refresh (paint, hardware, countertops)",
            "Full gut and rebuild",
            "Layout change (moving plumbing or appliances)",
            "Expansion into adjacent room (wall removal)",
          ],
        },
        {
          q: "Approximate kitchen size?",
          opts: [
            "Galley / small",
            "Standard (10x12 to 12x14)",
            "Open-concept / large",
            "Eat-in / chef's kitchen",
          ],
        },
        {
          q: "Are you keeping the existing layout?",
          opts: [
            "Yes, exact same layout",
            "Minor changes",
            "Full reconfiguration",
          ],
        },
        {
          q: "Cabinetry direction?",
          opts: [
            "Refacing existing cabinets",
            "Stock cabinets (off the shelf)",
            "Semi-custom (configurable)",
            "Full custom build",
            "Not sure",
          ],
        },
        {
          q: "Countertop preference?",
          opts: [
            "Quartz",
            "Granite",
            "Marble / natural stone",
            "Butcher block",
            "Mixed materials (e.g., quartz perimeter + butcher block island)",
            "Not sure",
          ],
        },
        {
          q: "Island?",
          opts: [
            "Yes, new island",
            "Yes, modify or expand existing",
            "No island",
            "Not sure, need design help",
          ],
        },
        {
          q: "Appliances?",
          opts: [
            "Keeping existing appliances",
            "Standard new appliance package",
            "High-end (Bosch, KitchenAid, etc.)",
            "Pro-grade (Sub-Zero, Wolf, Thermador)",
            "Mix",
          ],
        },
        {
          q: "Plumbing changes?",
          opts: [
            "Same locations as existing",
            "Relocating sink / dishwasher",
            "Adding pot filler",
            "Adding second sink (island or prep)",
            "Major reroute",
          ],
        },
        {
          q: "Electrical scope?",
          opts: [
            "Reuse existing wiring",
            "Add circuits for new appliances",
            "Full kitchen rewire",
            "Panel upgrade likely needed",
            "Not sure",
          ],
        },
        {
          q: "Removing any walls?",
          opts: [
            "Yes, and I know it's load-bearing",
            "Yes, and I think it's non-load-bearing",
            "No",
            "Not sure (need PSI to assess)",
          ],
        },
        {
          q: "Flooring?",
          opts: [
            "Replace flooring in kitchen",
            "Replace and match adjacent rooms",
            "Keep existing",
            "Not sure",
          ],
        },
        {
          q: "Lighting plan?",
          opts: [
            "Recessed (can lights)",
            "Pendants over island",
            "Under-cabinet lighting",
            "Full designer lighting plan",
            "Keep existing fixtures",
          ],
        },
        {
          q: "Range ventilation?",
          opts: [
            "New hood vented to exterior",
            "New recirculating hood",
            "Already vented properly",
            "Not sure",
          ],
        },
        {
          q: "When would you like the project completed?",
          opts: [
            "As soon as possible",
            "Within 1–3 months",
            "3–6 months out",
            "Flexible",
          ],
        },
        {
          q: "Budget range for this kitchen?",
          opts: [
            "Under $30,000",
            "$30,000 – $60,000",
            "$60,000 – $100,000",
            "$100,000+",
            "I need guidance on realistic pricing",
          ],
        },
      ],
    },

    basement: {
      title: "Basement Finishing",
      questions: [
        {
          q: "Current state of basement?",
          opts: [
            "Completely unfinished / raw",
            "Partially finished",
            "Fully finished, but needs redo",
          ],
        },
        {
          q: "Approximate square footage to finish?",
          opts: [
            "Under 500 sqft",
            "500–1,000 sqft",
            "1,000–1,500 sqft",
            "1,500+ sqft",
          ],
        },
        {
          q: "Ceiling height?",
          opts: ["Under 7 feet", "7–8 feet", "8 feet or taller", "Not sure"],
        },
        {
          q: "Primary use of finished basement?",
          opts: [
            "Family / rec room",
            "Bedroom suite",
            "Home gym",
            "Home theater / entertainment",
            "In-law apartment / rental unit",
            "Mixed use",
          ],
        },
        {
          q: "Adding a bathroom?",
          opts: [
            "No",
            "Half bath",
            "Full bath",
            "There's already plumbing rough-in for one",
          ],
        },
        {
          q: "Adding bedroom(s)?",
          note: "note: egress windows required by code",
          opts: ["No", "Yes, 1 bedroom", "Yes, 2+ bedrooms"],
        },
        {
          q: "Adding a kitchenette or wet bar?",
          opts: [
            "No",
            "Wet bar only",
            "Kitchenette (sink + microwave + small fridge)",
            "Full kitchen",
            "Not sure",
          ],
        },
        {
          q: "Any moisture / water issues in the basement?",
          opts: [
            "None ever",
            "Occasional dampness",
            "Active leaks or water intrusion",
            "I don't know, need an assessment",
          ],
        },
        {
          q: "Waterproofing needs?",
          opts: [
            "No waterproofing needed",
            "Interior drain / sump",
            "French drain (exterior)",
            "Full waterproofing system",
            "Not sure",
          ],
        },
        {
          q: "Flooring preference?",
          opts: [
            "Luxury vinyl plank (LVP)",
            "Carpet",
            "Polished / stained concrete",
            "Tile",
            "Mix",
            "Not sure",
          ],
        },
        {
          q: "Ceiling type?",
          opts: [
            "Drop ceiling (access to utilities)",
            "Drywall ceiling",
            "Exposed / painted (industrial)",
            "Hybrid",
            "Not sure",
          ],
        },
        {
          q: "HVAC plan for the basement?",
          opts: [
            "Extend existing HVAC",
            "Add mini-split",
            "Separate zone",
            "Not sure",
          ],
        },
        {
          q: "Have you addressed egress code requirements?",
          note: "esp. for bedrooms",
          opts: ["Yes, already addressed", "No", "Not sure what's required"],
        },
        {
          q: "When would you like the project completed?",
          opts: [
            "As soon as possible",
            "Within 1–3 months",
            "3–6 months out",
            "Flexible",
          ],
        },
        {
          q: "Budget range?",
          opts: [
            "Under $30,000",
            "$30,000 – $60,000",
            "$60,000 – $100,000",
            "$100,000+",
            "Need guidance",
          ],
        },
      ],
    },

    whole: {
      title: "Whole-House Remodel",
      questions: [
        {
          q: "Is the house currently occupied?",
          opts: [
            "Yes, we'll live in it during work",
            "Yes, but we'll move out during construction",
            "No, vacant",
            "It's a new purchase / closing soon",
          ],
        },
        {
          q: "Approximate total square footage of the house?",
          opts: [
            "Under 1,500 sqft",
            "1,500–2,500 sqft",
            "2,500–4,000 sqft",
            "4,000+ sqft",
          ],
        },
        {
          q: "How much of the house are you remodeling?",
          opts: [
            "Just specific rooms (multiple, but not whole)",
            "About half",
            "Most of it (80%+)",
            "Full gut",
          ],
        },
        {
          q: "Age of the house?",
          opts: [
            "Pre-1940",
            "1940–1970",
            "1970–2000",
            "2000–present",
            "Not sure",
          ],
        },
        {
          q: "Are you removing or relocating walls?",
          opts: [
            "No",
            "A few walls",
            "Major open-concept reconfiguration",
            "Not sure",
          ],
        },
        {
          q: "Kitchen scope?",
          opts: [
            "Not touching kitchen",
            "Cosmetic refresh",
            "Full kitchen renovation",
            "Full reconfiguration",
          ],
        },
        {
          q: "Bathroom scope?",
          opts: [
            "Not touching bathrooms",
            "Cosmetic refresh",
            "Full renovation of 1–2 baths",
            "Full renovation of all baths",
          ],
        },
        {
          q: "Electrical scope?",
          opts: [
            "Reusing existing",
            "Updating in renovated areas only",
            "Full house rewire",
            "Panel upgrade likely",
          ],
        },
        {
          q: "Plumbing scope?",
          opts: [
            "Reusing existing",
            "Updating in renovated areas only",
            "Full re-plumb (replace galvanized / old lines)",
            "Not sure",
          ],
        },
        {
          q: "HVAC scope?",
          opts: [
            "Existing system stays",
            "Service / replace existing",
            "New ductwork / new system",
            "Adding zones or mini-splits",
          ],
        },
        {
          q: "Roofing condition?",
          opts: [
            "Recently replaced, leave alone",
            "Aging but functional",
            "Needs replacement during this project",
            "Not sure",
          ],
        },
        {
          q: "Siding / exterior?",
          opts: [
            "Not touching exterior",
            "Touch-up / paint only",
            "Partial siding replacement",
            "Full exterior redo",
          ],
        },
        {
          q: "Flooring scope?",
          opts: [
            "Keeping existing throughout",
            "New flooring in renovated areas only",
            "New flooring throughout entire house",
            "Mix",
          ],
        },
        {
          q: "Windows?",
          opts: ["Keeping all existing", "Replacing some", "Replacing all"],
        },
        {
          q: "Are you working with a designer or architect?",
          opts: [
            "Yes, already engaged",
            "Not yet, but planning to",
            "No, want PSI to coordinate design-build",
            "Not sure",
          ],
        },
        {
          q: "Do you have permits sorted?",
          opts: ["Yes", "No, need help", "Not sure what's required"],
        },
        {
          q: "When would you like to start?",
          opts: [
            "As soon as possible",
            "Within 1–3 months",
            "3–6 months out",
            "6–12 months out",
            "Just exploring",
          ],
        },
        {
          q: "Total project budget range?",
          opts: [
            "Under $150,000",
            "$150,000 – $300,000",
            "$300,000 – $600,000",
            "$600,000+",
            "Need guidance",
          ],
        },
      ],
    },

    deck: {
      title: "Deck / Outdoor Living",
      questions: [
        {
          q: "What are you building?",
          opts: [
            "New deck",
            "Replacing existing deck",
            "Adding to existing deck",
            "Patio / hardscape",
            "Covered porch",
            "Pergola / pavilion",
            "Outdoor kitchen",
            "Multiple of the above",
          ],
        },
        {
          q: "Approximate square footage?",
          opts: ["Under 200 sqft", "200–400 sqft", "400–800 sqft", "800+ sqft"],
        },
        {
          q: "Decking material preference?",
          opts: [
            "Pressure-treated wood",
            "Cedar",
            "Composite (Trex, TimberTech, etc.)",
            "PVC / capped composite",
            "Hardwood (ipe, mahogany)",
            "Not sure",
          ],
        },
        {
          q: "Number of levels?",
          opts: [
            "Single level",
            "Two-tier",
            "Multi-level with stairs / transitions",
          ],
        },
        {
          q: "Height off the ground?",
          opts: [
            "Ground level",
            '1–4 feet (railings required at 30"+)',
            "4–8 feet",
            "8+ feet (second-story / elevated)",
          ],
        },
        {
          q: "Railing style?",
          opts: [
            "Wood pickets",
            "Composite to match decking",
            "Aluminum / metal balusters",
            "Cable rail",
            "Glass panels",
            "Not sure / no railing needed",
          ],
        },
        {
          q: "Are you adding a roof or cover?",
          opts: [
            "No, open deck",
            "Pergola (open frame)",
            "Solid roof (covered porch)",
            "Retractable awning",
            "Existing roof extension",
          ],
        },
        {
          q: "Stairs?",
          opts: [
            "No stairs needed",
            "One short flight (under 4 steps)",
            "Standard staircase",
            "Multiple staircases",
            "Not sure",
          ],
        },
        {
          q: "Built-ins or features?",
          opts: [
            "None",
            "Built-in seating / benches",
            "Built-in planters",
            "Outdoor kitchen / bar",
            "Fire feature",
            "Hot tub / spa pad",
            "Lighting package",
          ],
        },
        {
          q: "Foundation / footings?",
          opts: [
            "Concrete footings (most common)",
            "Helical piers",
            "Floating / surface-mount",
            "Existing footings (replacement deck)",
            "Not sure",
          ],
        },
        {
          q: "Connection to house?",
          opts: [
            "Ledger board attached to house",
            "Free-standing (not attached)",
            "Connected to existing structure",
            "Not sure",
          ],
        },
        {
          q: "Site conditions?",
          opts: [
            "Flat and clear",
            "Sloped lot",
            "Trees / obstructions to work around",
            "Existing deck must be torn down first",
          ],
        },
        {
          q: "Permit handled by?",
          opts: [
            "I'll get the permit",
            "PSI to handle permitting",
            "Not sure if permit is needed",
          ],
        },
        {
          q: "When would you like it completed?",
          opts: [
            "ASAP / this season",
            "Within 1–3 months",
            "3–6 months out",
            "Flexible / next season",
          ],
        },
        {
          q: "Budget range?",
          opts: [
            "Under $15,000",
            "$15,000 – $30,000",
            "$30,000 – $60,000",
            "$60,000+",
            "Need guidance",
          ],
        },
      ],
    },

    roofing: {
      title: "Roofing",
      questions: [
        {
          q: "What kind of roofing project?",
          opts: [
            "Full roof replacement",
            "Partial replacement (one slope / section)",
            "Repair (leak / damage)",
            "New roof on addition or new structure",
          ],
        },
        {
          q: "Current roof material?",
          opts: [
            "Asphalt shingles",
            "Metal",
            "Tile",
            "Slate",
            "Flat / rubber (EPDM / TPO)",
            "Mixed",
            "Not sure",
          ],
        },
        {
          q: "Approximate age of current roof?",
          opts: [
            "Under 10 years",
            "10–20 years",
            "20+ years",
            "Original to the house",
            "Not sure",
          ],
        },
        {
          q: "Approximate roof size / house footprint?",
          opts: [
            "Small (under 1,500 sqft)",
            "Medium (1,500–2,500 sqft)",
            "Large (2,500–4,000 sqft)",
            "Very large (4,000+ sqft)",
            "Not sure",
          ],
        },
        {
          q: "Number of stories?",
          opts: ["1 story", "1.5 stories", "2 stories", "3+ stories"],
        },
        {
          q: "Roof complexity?",
          opts: [
            "Simple (gable, single pitch)",
            "Moderate (a few dormers / valleys)",
            "Complex (multiple roof lines, hips, valleys, dormers)",
          ],
        },
        {
          q: "Desired new material?",
          opts: [
            "Architectural asphalt shingles (most common)",
            "Premium / designer shingles",
            "Standing seam metal",
            "Tile",
            "Slate / synthetic slate",
            "Flat roof membrane",
            "Not sure, open to recommendations",
          ],
        },
        {
          q: "Active leaks or damage?",
          opts: [
            "Yes, active leak",
            "Yes, visible damage but no leak yet",
            "No, preventive replacement",
            "Just aging out",
          ],
        },
        {
          q: "Tearing off old roof, or layering?",
          opts: [
            "Full tear-off (recommended)",
            "Layer over existing",
            "Not sure",
            "It already has 2 layers (must tear off)",
          ],
        },
        {
          q: "Gutters?",
          opts: [
            "Keep existing",
            "Replace gutters at same time",
            "Add gutter guards / leaf protection",
            "New gutters where there are none",
          ],
        },
        {
          q: "Insurance claim involved?",
          opts: [
            "Yes, already filed",
            "Yes, considering filing",
            "No",
            "Not sure",
          ],
        },
        {
          q: "When would you like the work done?",
          opts: [
            "ASAP / leak emergency",
            "Within 1–3 months",
            "3–6 months out",
            "Flexible",
          ],
        },
      ],
    },

    siding: {
      title: "Siding / Exterior",
      questions: [
        {
          q: "What's the scope?",
          opts: [
            "Full siding replacement",
            "Partial siding (one or two sides)",
            "Repair only",
            "New siding on addition",
            "Exterior makeover (siding + trim + paint)",
          ],
        },
        {
          q: "Current siding material?",
          opts: [
            "Vinyl",
            "Aluminum",
            "Wood / cedar",
            "Fiber cement (Hardie)",
            "Brick / masonry",
            "Stucco",
            "Mixed",
            "Not sure",
          ],
        },
        {
          q: "Desired new siding?",
          opts: [
            "Vinyl",
            "Fiber cement (Hardie or LP SmartSide)",
            "Engineered wood",
            "Cedar / real wood",
            "Stone or brick veneer accent",
            "Mix of materials",
            "Not sure, open to recommendations",
          ],
        },
        {
          q: "Approximate house size?",
          opts: [
            "Small (under 1,500 sqft)",
            "Medium (1,500–2,500 sqft)",
            "Large (2,500–4,000 sqft)",
            "Very large (4,000+ sqft)",
          ],
        },
        {
          q: "Number of stories?",
          opts: ["1 story", "1.5 / cape", "2 story", "3+ story"],
        },
        {
          q: "Insulation upgrade at the same time?",
          opts: ["Yes, add insulation under new siding", "No", "Not sure"],
        },
        {
          q: "Replacing trim, soffit, fascia?",
          opts: ["Yes, all of it", "Some of it", "No, just siding"],
        },
        {
          q: "Window replacement at same time?",
          opts: [
            "Yes, replacing windows now",
            "Maybe, would consider",
            "No, keeping existing windows",
          ],
        },
        {
          q: "Gutter work needed?",
          opts: [
            "Yes, replace gutters",
            "Keep existing gutters",
            "Add gutters / downspouts",
          ],
        },
        {
          q: "Any rot, damage, or repair issues known?",
          opts: [
            "Yes, known damage",
            "Suspect there may be issues",
            "No",
            "Not sure",
          ],
        },
        {
          q: "Color / style direction?",
          opts: [
            "Match existing",
            "Modernize / refresh",
            "Bold / dramatic change",
            "Need help with selection",
          ],
        },
        {
          q: "When would you like the work done?",
          opts: ["ASAP / this season", "1–3 months", "3–6 months", "Flexible"],
        },
        {
          q: "Budget range?",
          opts: [
            "Under $20,000",
            "$20,000 – $40,000",
            "$40,000 – $80,000",
            "$80,000+",
            "Need guidance",
          ],
        },
      ],
    },

    garage: {
      title: "Garage / Detached Structure",
      questions: [
        {
          q: "What kind of structure?",
          opts: [
            "Attached garage",
            "Detached garage",
            "Shed / workshop",
            "Pole barn",
            "Carriage house with living space above",
            "Pool house / accessory building",
          ],
        },
        {
          q: "Size?",
          opts: [
            "1-car (under 300 sqft)",
            "2-car (400–600 sqft)",
            "3-car (600–900 sqft)",
            "4+ car or oversized",
          ],
        },
        {
          q: "Number of stories?",
          opts: [
            "1 story",
            "1.5 story (loft / storage above)",
            "2 story (full living space above)",
          ],
        },
        {
          q: "Finished interior?",
          opts: [
            "Bare / unfinished (just shell)",
            "Insulated and drywalled",
            "Fully finished (paint, trim, floor)",
          ],
        },
        {
          q: "Heating / cooling?",
          opts: [
            "None",
            "Heated only",
            "Heated and cooled (mini-split)",
            "Connected to home HVAC",
          ],
        },
        {
          q: "Electrical?",
          opts: [
            "Lighting and outlets only",
            "Heavy-duty (workshop circuits, 220V)",
            "Sub-panel",
            "EV charger",
          ],
        },
        {
          q: "Plumbing?",
          opts: [
            "None",
            "Utility sink only",
            "Half bath",
            "Full bath",
            "Full kitchen / apartment",
          ],
        },
        {
          q: "Door / openings?",
          opts: [
            "1 overhead door",
            "2 overhead doors",
            "3+ overhead doors",
            "Custom (carriage / glass)",
          ],
        },
        {
          q: "Foundation?",
          opts: [
            "Slab",
            "Frost wall + slab",
            "Full foundation with basement",
            "Pier / post",
            "Not sure",
          ],
        },
        {
          q: "Exterior finish?",
          opts: [
            "Match house",
            "Different, complementary style",
            "Metal / pole barn style",
            "Not sure",
          ],
        },
        {
          q: "Has the location been determined?",
          opts: [
            "Yes, exact spot chosen",
            "General area, not exact",
            "Still figuring it out",
          ],
        },
        {
          q: "Zoning / permit status?",
          opts: [
            "Confirmed and approved",
            "Not yet checked",
            "Need help navigating",
          ],
        },
        {
          q: "Timeline?",
          opts: ["ASAP", "1–3 months", "3–6 months", "Flexible"],
        },
        {
          q: "Budget range?",
          opts: [
            "Under $30,000",
            "$30,000 – $60,000",
            "$60,000 – $120,000",
            "$120,000+",
            "Need guidance",
          ],
        },
      ],
    },

    commercial: {
      title: "Commercial Buildout",
      questions: [
        {
          q: "What kind of space?",
          opts: [
            "Retail",
            "Restaurant / food service",
            "Office",
            "Medical / dental",
            "Warehouse / industrial",
            "Mixed use",
            "Other",
          ],
        },
        {
          q: "Are you the building owner or tenant?",
          opts: [
            "Owner",
            "Tenant (with landlord approval)",
            "Tenant (still negotiating lease)",
            "Not yet, evaluating before signing",
          ],
        },
        {
          q: "Approximate square footage?",
          opts: [
            "Under 1,000 sqft",
            "1,000–3,000 sqft",
            "3,000–6,000 sqft",
            "6,000–10,000 sqft",
            "10,000+ sqft",
          ],
        },
        {
          q: "Current state of the space?",
          opts: [
            "White-box / shell",
            "Previously occupied (needs demo + buildout)",
            "Already operating, doing renovation",
            "New construction (ground-up)",
          ],
        },
        {
          q: "Scope?",
          opts: [
            "Cosmetic refresh",
            "Full interior buildout",
            "Layout reconfiguration",
            "New construction shell + buildout",
          ],
        },
        {
          q: "Plumbing scope?",
          opts: [
            "No plumbing work",
            "Restrooms only",
            "Kitchen / commercial sinks",
            "Extensive (commercial kitchen)",
          ],
        },
        {
          q: "Electrical scope?",
          opts: [
            "Minor (lighting refresh)",
            "Standard buildout",
            "Heavy commercial (large panel, dedicated equipment circuits)",
            "Not sure",
          ],
        },
        {
          q: "HVAC scope?",
          opts: [
            "Existing is adequate",
            "New rooftop unit(s)",
            "Reconfigure ductwork",
            "New zoning / split system",
            "Not sure",
          ],
        },
        {
          q: "ADA / code compliance work needed?",
          opts: [
            "Yes, known issues to address",
            "Not sure, need assessment",
            "No, already compliant",
          ],
        },
        {
          q: "Special requirements?",
          opts: [
            "Health department approval (food service)",
            "Medical / dental specifications",
            "Fire suppression / sprinklers",
            "Sound isolation",
            "Refrigeration / walk-ins",
            "None of the above",
          ],
        },
        {
          q: "Working with a designer or architect?",
          opts: [
            "Yes",
            "Not yet",
            "Want PSI to coordinate design-build",
            "Not sure",
          ],
        },
        {
          q: "Permit status?",
          opts: [
            "Permits in hand",
            "In progress",
            "Not started, need help",
            "Not sure what's required",
          ],
        },
        {
          q: "Hours of access during construction?",
          opts: [
            "24/7 / unrestricted",
            "Business hours only",
            "After-hours only (active business)",
            "Weekends only",
          ],
        },
        {
          q: "Target opening or completion date?",
          opts: ["ASAP", "1–3 months", "3–6 months", "6+ months", "Flexible"],
        },
        {
          q: "Budget range?",
          opts: [
            "Under $50,000",
            "$50,000 – $150,000",
            "$150,000 – $500,000",
            "$500,000+",
            "Need guidance",
          ],
        },
      ],
    },
  },

  intake: [
    { key: "name", label: "Full name", type: "text", required: true },
    { key: "email", label: "Email address", type: "email", required: true },
    { key: "phone", label: "Phone number", type: "tel", required: true },
    {
      key: "contactMethod",
      label: "Preferred contact method",
      type: "select",
      opts: ["Call", "Text", "Either"],
    },
    {
      key: "address",
      label: "Project address (street, city, ZIP)",
      type: "text",
      required: true,
    },
    {
      key: "bestTime",
      label: "Best time to reach you",
      type: "select",
      opts: ["Morning", "Afternoon", "Evening", "Anytime"],
    },
    {
      key: "heard",
      label: "How did you hear about PSI?",
      type: "select",
      opts: [
        "Google search",
        "Referral",
        "Facebook/Instagram",
        "Drove past a job site",
        "Repeat customer",
        "Other",
      ],
    },
    {
      key: "notes",
      label: "Anything else we should know about your project?",
      type: "textarea",
    },
    {
      key: "photos",
      label: "Upload photos of the space or inspiration images (optional)",
      type: "file",
    },
  ],

  fallbackOption: "Other / Need guidance",
};
