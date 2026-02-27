# Code Import Guide

This guide shows you how to use the new **Code Import** feature to quickly generate Gantt Charts and RACI Matrices.

## Features Added

### 1. Dual RACI Marks ✅
- Support for multiple RACI values in a single cell (e.g., `R/A`, `C/I`, `R/C/I`)
- Click individual R, A, C, I buttons below each cell to toggle values
- Visual gradient for cells with multiple values

### 2. Import from JSON Code ✅
- Import Gantt Charts from JSON
- Import RACI Matrices from JSON
- Easy-to-use code editor with examples

---

## How to Use

### Gantt Chart Import

1. Click the **"Import Code"** button in the Gantt editor
2. Paste your JSON code or click **"Load Example"**
3. Click **"Import"**

#### JSON Format for Gantt Chart

```json
{
  "timelineMonths": 12,
  "timelineUnit": "months",
  "phases": [
    {
      "name": "Planning Phase",
      "startMonth": 1,
      "duration": 2,
      "deliverables": "Project plan, Requirements document",
      "color": "blue"
    },
    {
      "name": "Development Phase",
      "startMonth": 3,
      "duration": 6,
      "deliverables": "Core features, API, Database",
      "color": "green"
    },
    {
      "name": "Testing & Launch",
      "startMonth": 9,
      "duration": 3,
      "deliverables": "QA testing, Production deployment",
      "color": "purple"
    }
  ]
}
```

#### Available Colors
- `purple`, `blue`, `green`, `orange`, `pink`, `teal`, `red`, `indigo`, `yellow`, `cyan`

---

### RACI Matrix Import

1. Click the **"Import Code"** button in the RACI editor
2. Paste your JSON code or click **"Load Example"**
3. Click **"Import"**

#### JSON Format for RACI Matrix

```json
{
  "tasks": [
    "Design UI",
    "Develop Backend API",
    "Write Tests",
    "Deploy to Production"
  ],
  "stakeholders": [
    "John (Lead Developer)",
    "Sarah (Product Manager)",
    "Mike (QA Engineer)",
    "Lisa (DevOps)"
  ],
  "assignments": {
    "Design UI": {
      "John": "R/A",
      "Sarah": "C",
      "Mike": "I",
      "Lisa": "I"
    },
    "Develop Backend API": {
      "John": "R",
      "Sarah": "A",
      "Mike": "I",
      "Lisa": "C"
    },
    "Write Tests": {
      "John": "C",
      "Sarah": "A",
      "Mike": "R",
      "Lisa": "I"
    },
    "Deploy to Production": {
      "John": "C",
      "Sarah": "I",
      "Mike": "C",
      "Lisa": "R/A"
    }
  }
}
```

#### RACI Values
- **Single values:** `R`, `A`, `C`, `I`
- **Dual values:** `R/A`, `C/I`, `R/C`, etc.
- **Triple values:** `R/A/C`, `R/C/I`, etc.
- **All values:** `R/A/C/I`

---

## Example: Complete Project Import

You can ask Claude to generate the JSON code for your project. Here's an example:

### Prompt to Claude:
```
Generate JSON code for a 6-month e-commerce platform project with:
- 4 phases: Discovery, Development, Testing, Launch
- RACI matrix with 5 stakeholders and 6 tasks
```

### Claude's Response:
```json
{
  "gantt": {
    "timelineMonths": 6,
    "timelineUnit": "months",
    "phases": [
      {
        "name": "Discovery & Planning",
        "startMonth": 1,
        "duration": 1,
        "deliverables": "Requirements, User stories, Technical design",
        "color": "purple"
      },
      {
        "name": "Development",
        "startMonth": 2,
        "duration": 3,
        "deliverables": "Product catalog, Shopping cart, Payment integration",
        "color": "blue"
      },
      {
        "name": "Testing",
        "startMonth": 5,
        "duration": 1,
        "deliverables": "QA testing, Bug fixes, Performance optimization",
        "color": "green"
      },
      {
        "name": "Launch",
        "startMonth": 6,
        "duration": 1,
        "deliverables": "Production deployment, Monitoring, Documentation",
        "color": "orange"
      }
    ]
  },
  "raci": {
    "tasks": [
      "Requirements Gathering",
      "UI/UX Design",
      "Backend Development",
      "Frontend Development",
      "QA Testing",
      "Deployment"
    ],
    "stakeholders": [
      "Alex (Tech Lead)",
      "Jordan (Product Manager)",
      "Sam (Frontend Dev)",
      "Taylor (Backend Dev)",
      "Casey (QA Engineer)"
    ],
    "assignments": {
      "Requirements Gathering": {
        "Alex": "C",
        "Jordan": "R/A",
        "Sam": "I",
        "Taylor": "I",
        "Casey": "I"
      },
      "UI/UX Design": {
        "Alex": "A",
        "Jordan": "C",
        "Sam": "R",
        "Taylor": "I",
        "Casey": "I"
      },
      "Backend Development": {
        "Alex": "A",
        "Jordan": "I",
        "Sam": "C",
        "Taylor": "R",
        "Casey": "I"
      },
      "Frontend Development": {
        "Alex": "A",
        "Jordan": "C",
        "Sam": "R",
        "Taylor": "C",
        "Casey": "I"
      },
      "QA Testing": {
        "Alex": "I",
        "Jordan": "A",
        "Sam": "C",
        "Taylor": "C",
        "Casey": "R"
      },
      "Deployment": {
        "Alex": "R/A",
        "Jordan": "I",
        "Sam": "C",
        "Taylor": "C",
        "Casey": "C"
      }
    }
  }
}
```

Then you import the `gantt` section into Gantt editor and `raci` section into RACI editor!

---

## Tips

1. **Use dual marks** when someone has multiple responsibilities (e.g., `R/A` for someone who both does the work AND is accountable)

2. **Import separate sections**: The JSON can have both `gantt` and `raci` sections. Import each separately into its respective editor.

3. **Validate your JSON**: Use a JSON validator if you're writing code manually

4. **Ask Claude for help**: Describe your project to Claude and ask it to generate the import code!

---

## Workflow Example

### Step 1: Describe Your Project to Claude
"I need a Gantt chart and RACI matrix for a mobile app development project.
Timeline: 8 months.
Phases: Planning (1 month), Design (1.5 months), Development (4 months), Testing (1 month), Launch (0.5 months).
Team: Product Manager, UI Designer, iOS Developer, Android Developer, QA Engineer"

### Step 2: Claude Generates the Code
Claude will generate the complete JSON structure for both Gantt and RACI.

### Step 3: Import
Copy the JSON and use "Import Code" in each editor.

### Step 4: Customize
Fine-tune the imported data using the visual editors.

---

## Supported Languages

Currently supported:
- ✅ **JSON** (fully supported)

Coming soon:
- TypeScript objects
- Python dictionaries
- YAML format

---

## Need Help?

If you encounter any issues or need help generating the import code, just ask Claude:
- "Generate Gantt import code for [your project description]"
- "Create RACI matrix code for [your team and tasks]"
- "Show me an example of dual RACI marks for a project manager"
