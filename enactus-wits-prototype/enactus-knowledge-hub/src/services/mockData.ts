import { Course } from '../types/course';
import { Resource, ResourceCategory } from '../types/resource';
import { EnactusUser } from '../types/auth';

// Pre-seeded Enactus Personas for SSO Testing
export const MOCK_ENACTUS_USERS: EnactusUser[] = [
  {
    id: 'user-mem-01',
    enactusId: 'ENACTUS-WITS-2026-081',
    name: 'Lerato Khumalo',
    email: 'l.khumalo@students.wits.ac.za',
    role: 'Member',
    businessStageId: 'Idea',
    faculty: 'Commerce, Law and Management',
    teamRole: 'Project Lead (SolarWater Initiative)',
    isRegisteredOnMainSystem: true,
  },
  {
    id: 'user-mem-02',
    enactusId: 'ENACTUS-WITS-2026-104',
    name: 'Thabo Ndlovu',
    email: 't.ndlovu@students.wits.ac.za',
    role: 'Member',
    businessStageId: 'Prototype',
    faculty: 'Engineering and the Built Environment',
    teamRole: 'Technical Lead (EcoBriquette Pilot)',
    isRegisteredOnMainSystem: true,
  },
  {
    id: 'user-mem-03',
    enactusId: 'ENACTUS-WITS-2026-042',
    name: 'Siyabonga Mokoena',
    email: 's.mokoena@students.wits.ac.za',
    role: 'Member',
    businessStageId: 'Running Business',
    faculty: 'Health Sciences & Entrepreneurship',
    teamRole: 'Operations Director (AgriHydro Enterprise)',
    isRegisteredOnMainSystem: true,
  },
  {
    id: 'user-adm-01',
    enactusId: 'ENACTUS-WITS-ADMIN-007',
    name: 'Nomvula Dlamini',
    email: 'n.dlamini@enactuswits.org.za',
    role: 'Administrator',
    department: 'Research & Curriculum Subcommittee',
    teamRole: 'Head of Knowledge & Training',
    isRegisteredOnMainSystem: true,
  },
  {
    id: 'user-sadm-01',
    enactusId: 'ENACTUS-WITS-EXEC-001',
    name: 'Dr. Kagiso Molefe',
    email: 'president@enactuswits.org.za',
    role: 'Super Admin',
    department: 'Executive Committee',
    teamRole: 'Enactus Wits President',
    isRegisteredOnMainSystem: true,
  },
  {
    id: 'user-fa-01',
    enactusId: 'ENACTUS-WITS-FA-003',
    name: 'Prof. Arthur Wits',
    email: 'arthur.wits@wits.ac.za',
    role: 'Faculty Advisor',
    department: 'School of Business Sciences',
    teamRole: 'Senior Faculty Advisor',
    isRegisteredOnMainSystem: true,
  }
];

export const INITIAL_CATEGORIES: ResourceCategory[] = [
  {
    id: 'cat-needs',
    name: 'Needs Assessment & Problem Discovery',
    description: 'Frameworks and tools for identifying community needs, root causes, and stakeholder alignment.',
    createdAt: '2026-01-10',
  },
  {
    id: 'cat-model',
    name: 'Business Modeling & Strategy',
    description: 'Social Lean Canvas, value proposition design, and revenue stream modeling.',
    createdAt: '2026-01-10',
  },
  {
    id: 'cat-proto',
    name: 'Product & Prototype Testing',
    description: 'MVP validation, minimum viable pilot execution, and iterative user feedback.',
    createdAt: '2026-01-12',
  },
  {
    id: 'cat-finance',
    name: 'Financial Management & Costing',
    description: 'Budgeting, unit economics, cash flow forecasting, and pricing for underserved markets.',
    createdAt: '2026-01-15',
  },
  {
    id: 'cat-pitch',
    name: 'Pitching, Storytelling & Competitions',
    description: 'National and World Cup competition pitch deck structures, criteria scoring, and narrative design.',
    createdAt: '2026-01-20',
  },
  {
    id: 'cat-legal',
    name: 'Legal, Governance & IP',
    description: 'NPC registration, community MoU templates, IP agreements, and compliance standards.',
    createdAt: '2026-02-01',
  }
];

export const INITIAL_COURSES: Course[] = [
  {
    id: 'course-idea-101',
    title: 'Social Need Identification & Root Cause Analysis',
    description: 'Master the Enactus 77-question assessment framework to pinpoint genuine community bottlenecks and assess economic feasibility.',
    category: 'Needs Assessment & Problem Discovery',
    businessStage: 'Idea',
    durationHours: 4,
    instructor: 'Nomvula Dlamini (Head of Training)',
    learningOutcomes: [
      'Conduct rigorous field-based community interviews without confirmation bias',
      'Construct a verifiable Problem Tree separating symptoms from root causes',
      'Identify target beneficiary vs payer dynamics in social enterprises'
    ],
    prerequisites: ['Completed Enactus Wits Orientation'],
    createdAt: '2026-02-01',
    updatedAt: '2026-02-15',
    modules: [
      {
        id: 'mod-101-1',
        title: 'Module 1: The Enactus Criterion and Community Needs',
        durationMinutes: 45,
        summary: 'Understanding how to apply business concepts to create sustainable community impact.',
        content: 'The Enactus standard requires evaluating which project effectively creates economic opportunity. In this module we deconstruct the difference between charity interventions and sustainable enterprise models.',
        keyTakeaways: [
          'Charity solves immediate distress; enterprise creates ongoing self-sufficiency',
          'Beneficiaries must have agency and skin in the game',
          'Baseline metrics must be documented before proposing any solution'
        ]
      },
      {
        id: 'mod-101-2',
        title: 'Module 2: Root Cause Mapping & 5 Whys Technique',
        durationMinutes: 60,
        summary: 'Deep-dive analysis into why past community initiatives failed and where leverage exists.',
        content: 'Learn how to apply root cause analysis to community challenges in informal settlements and rural hubs around Gauteng. Document the economic constraints of local micro-retailers.',
        keyTakeaways: [
          'Never build a solution for an unverified symptom',
          'Conduct at least 25 primary stakeholder conversations',
          'Map indirect influencers including municipal ward committees'
        ]
      },
      {
        id: 'mod-101-3',
        title: 'Module 3: Lean Social Canvas for Idea Formulation',
        durationMinutes: 75,
        summary: 'Drafting the initial 1-page business thesis for review by the project subcommittee.',
        content: 'Step-by-step drafting of the Social Enterprise Lean Canvas. Defining unique value propositions, channels, early adopters, and unfair advantages.',
        keyTakeaways: [
          'Complete boxes 1-4 before attempting financial projections',
          'Submit the draft canvas to the Subcommittee for stage-gate approval'
        ]
      }
    ]
  },
  {
    id: 'course-proto-201',
    title: 'Minimum Viable Product (MVP) & Pilot Deployment',
    description: 'Translate conceptual social models into small-scale physical or digital pilots to test critical customer assumptions.',
    category: 'Product & Prototype Testing',
    businessStage: 'Prototype',
    durationHours: 6,
    instructor: 'Thabo Ndlovu & Engineering Advisory Group',
    learningOutcomes: [
      'Define minimum success criteria for 30-day community pilots',
      'Build low-cost prototypes with locally accessible materials and components',
      'Establish quantitative feedback telemetry and user satisfaction scores'
    ],
    createdAt: '2026-02-05',
    updatedAt: '2026-02-20',
    modules: [
      {
        id: 'mod-201-1',
        title: 'Module 1: Designing the Pilot Test Hypothesis Matrix',
        durationMinutes: 50,
        summary: 'Formulating falsifiable hypotheses before spending project budget.',
        content: 'Every prototype must test exactly 1 to 2 riskiest assumptions. For example: Will tavern owners pay R50/week for organic waste collection?',
        keyTakeaways: [
          'Hypothesis format: We believe [action] will result in [metric] within [timeframe]',
          'Set explicit fail/pivot triggers in advance'
        ]
      },
      {
        id: 'mod-201-2',
        title: 'Module 2: Field Safety, Ethics, and Informed Consent in Piloting',
        durationMinutes: 60,
        summary: 'Regulatory and ethical obligations when deploying prototypes in communities.',
        content: 'Wits University research and community engagement protocols require signed consent forms, safety risk assessments, and indemnity protocols.',
        keyTakeaways: [
          'All field trials require Faculty Advisor sign-off',
          'Maintain transparent data security protocols for community participants'
        ]
      },
      {
        id: 'mod-201-3',
        title: 'Module 3: Analyzing Pilot Results and Deciding to Pivot or Persevere',
        durationMinutes: 70,
        summary: 'Interpreting pilot data and presenting evidence-based progress to executive committee.',
        content: 'Review quantitative transaction numbers vs qualitative satisfaction feedback. Re-evaluating cost per unit produced during low-volume pilot phases.',
        keyTakeaways: [
          'Differentiate between polite feedback and authentic willingness-to-pay',
          'Document pilot anomalies in the Enactus project log'
        ]
      }
    ]
  },
  {
    id: 'course-run-301',
    title: 'Scaling Operations, Financial Governance & Impact Audits',
    description: 'Transition an established prototype into a self-sustaining venture with robust book-keeping, governance boards, and community handover pathways.',
    category: 'Financial Management & Costing',
    businessStage: 'Running Business',
    durationHours: 8,
    instructor: 'Dr. Kagiso Molefe & Wits Commercialization Team',
    learningOutcomes: [
      'Implement double-entry cash records and financial separation from student funds',
      'Establish a Community Advisory Trust or cooperative legal structure',
      'Prepare comprehensive impact audit reports adhering to Enactus Worldwide criteria'
    ],
    createdAt: '2026-01-25',
    updatedAt: '2026-03-01',
    modules: [
      {
        id: 'mod-301-1',
        title: 'Module 1: Enterprise Financial Governance & Tax Exemption',
        durationMinutes: 90,
        summary: 'Managing commercial revenues within university legal structures.',
        content: 'Detailed guidance on handling sales receipts, supplier invoices, VAT implications, and setting up dedicated project sub-accounts.',
        keyTakeaways: [
          'Zero cash handling without dual signed receipt vouchers',
          'Monthly reconciliation is mandatory for national competition eligibility'
        ]
      },
      {
        id: 'mod-301-2',
        title: 'Module 2: Supply Chain Optimization & Local Employment',
        durationMinutes: 80,
        summary: 'Building resilience into input sourcing and fair wage models.',
        content: 'Developing local supplier contracts, inventory buffers, and calculating Living Wage equivalents for community workers.',
        keyTakeaways: [
          'Maintain minimum 2 redundant supplier sources for key raw materials',
          'Track direct jobs created vs indirect livelihoods influenced'
        ]
      },
      {
        id: 'mod-301-3',
        title: 'Module 3: Project Handover & Long-Term Community Ownership',
        durationMinutes: 70,
        summary: 'Planning the exit strategy so the venture thrives beyond student graduation.',
        content: 'The ultimate criterion of Enactus success is long-term sustainability when students withdraw. How to train community managers and transfer operational assets.',
        keyTakeaways: [
          'Start succession training 6 months prior to handover date',
          'Establish a multi-stakeholder oversight board'
        ]
      }
    ]
  },
  {
    id: 'course-all-401',
    title: 'Enactus National Competition Pitch Deck Architecture',
    description: 'Crafting compelling, evidence-backed 12-minute presentation decks scored against the official Enactus judging handbook.',
    category: 'Pitching, Storytelling & Competitions',
    businessStage: 'All Stages',
    durationHours: 5,
    instructor: 'Enactus Wits Presentation Faculty',
    learningOutcomes: [
      'Structure the 12-minute pitch to address Needs, Action, and Impact systematically',
      'Integrate audited financial and metric proofs cleanly into visual slides',
      'Execute high-pressure Q&A defenses with corporate judge panels'
    ],
    createdAt: '2026-02-10',
    updatedAt: '2026-03-05',
    modules: [
      {
        id: 'mod-401-1',
        title: 'Module 1: The Anatomy of a Winning Presentation Script',
        durationMinutes: 60,
        summary: 'Balancing beneficiary human stories with rigorous commercial statistics.',
        content: 'How top world cup teams pace their presentations: 2 mins on Need/Problem, 4 mins on Business Solution/Action, 4 mins on Direct Audited Impact, 2 mins on Future Scaling.',
        keyTakeaways: [
          'Every claim must have a visible data citation on slide',
          'Video clips must not exceed 45 seconds total runtime'
        ]
      },
      {
        id: 'mod-401-2',
        title: 'Module 2: Handling Judging Q&A with Precision',
        durationMinutes: 60,
        summary: 'Frameworks for assigning team member question domains (Finance, Operations, Tech).',
        content: 'Judges test the depth of member involvement. How to answer direct unit cost, margin, and community governance questions concisely without evasiveness.',
        keyTakeaways: [
          'Never interrupt a judge; pause for 2 seconds before answering',
          'Anchor every answer in verified pilot or production data'
        ]
      }
    ]
  }
];

export const INITIAL_RESOURCES: Resource[] = [
  {
    id: 'res-001',
    title: 'Enactus Community Needs Assessment Field Questionnaire (77 Questions)',
    summary: 'The standard interview guide used by Enactus teams across South Africa to evaluate community gaps, existing informal solutions, and willingness to pay.',
    fileType: 'PDF',
    businessStage: 'Idea',
    category: 'Needs Assessment & Problem Discovery',
    author: 'Enactus South Africa Training Directorate',
    fileSize: '1.2 MB',
    downloadUrl: '#download-needs-assessment-pdf',
    dateAdded: '2026-01-15',
    tags: ['Needs Assessment', 'Interviews', 'Fieldwork', 'Stage Gate 1'],
    keyTopics: ['Demographic profiling', 'Willingness to pay', 'Informal competitors', 'Safety checks']
  },
  {
    id: 'res-002',
    title: 'Social Lean Canvas Template & Example Benchmark',
    summary: 'Editable spreadsheet template tailored specifically for social enterprises, with sections for impact metrics, beneficiary segments, and subsidy models.',
    fileType: 'Spreadsheet',
    businessStage: 'Idea',
    category: 'Business Modeling & Strategy',
    author: 'Wits Enterprise Development Hub',
    fileSize: '450 KB',
    downloadUrl: '#download-lean-canvas-xlsx',
    dateAdded: '2026-01-20',
    tags: ['Lean Canvas', 'Business Model', 'Value Proposition'],
    keyTopics: ['Problem', 'Customer segments', 'Cost structure', 'Impact KPI']
  },
  {
    id: 'res-003',
    title: '30-Day Prototype Pilot Checklist & Metric Log',
    summary: 'Operational tracking checklist for deploying MVPs in community settings. Includes daily volume logs, scrap rate tracker, and customer issue escalation protocols.',
    fileType: 'Template',
    businessStage: 'Prototype',
    category: 'Product & Prototype Testing',
    author: 'Nomvula Dlamini',
    fileSize: '320 KB',
    downloadUrl: '#download-prototype-checklist-docx',
    dateAdded: '2026-02-02',
    tags: ['MVP', 'Testing', 'Quality Control', 'Telemetry'],
    keyTopics: ['Daily output', 'Customer complaints', 'Failure mode analysis']
  },
  {
    id: 'res-004',
    title: 'Unit Economics & Cost of Goods Sold (COGS) Calculator',
    summary: 'Financial modeling workbook to compute variable materials, direct labor, packaging, transport, and contribution margin per unit produced.',
    fileType: 'Spreadsheet',
    businessStage: 'Prototype',
    category: 'Financial Management & Costing',
    author: 'Dr. Kagiso Molefe',
    fileSize: '680 KB',
    downloadUrl: '#download-cogs-calculator-xlsx',
    dateAdded: '2026-02-12',
    tags: ['Unit Economics', 'COGS', 'Margins', 'Break-even'],
    keyTopics: ['Raw material wastage', 'Labor hours', 'Overhead allocation', 'Target selling price']
  },
  {
    id: 'res-005',
    title: 'Community Memorandum of Understanding (MoU) Legal Template',
    summary: 'Standard tripartite agreement template between Enactus Wits, University Faculty, and Community Leadership/Cooperative representatives.',
    fileType: 'Document',
    businessStage: 'Running Business',
    category: 'Legal, Governance & IP',
    author: 'Wits Law Clinic Advisory',
    fileSize: '540 KB',
    downloadUrl: '#download-community-mou-docx',
    dateAdded: '2026-02-18',
    tags: ['MoU', 'Legal', 'Governance', 'Community Handover'],
    keyTopics: ['Asset ownership', 'Revenue distribution', 'Dispute resolution', 'Liability']
  },
  {
    id: 'res-006',
    title: 'Audited Financial Statement Ledger for Enactus Projects',
    summary: 'Standardized Excel ledger meeting national competition audit guidelines for tracking monthly revenues, expenditures, bank reconciliations, and capital assets.',
    fileType: 'Spreadsheet',
    businessStage: 'Running Business',
    category: 'Financial Management & Costing',
    author: 'Enactus Wits Finance Committee',
    fileSize: '950 KB',
    downloadUrl: '#download-audit-ledger-xlsx',
    dateAdded: '2026-02-25',
    tags: ['Accounting', 'Audit', 'Governance', 'National Competition'],
    keyTopics: ['Bank reconciliation', 'Receipt tagging', 'Petty cash', 'Asset depreciation']
  },
  {
    id: 'res-007',
    title: 'Enactus National Competition Slide Deck Master Template (16:9)',
    summary: 'Official clean presentation slide master with approved typography, layout grids, icon libraries, and financial table layouts.',
    fileType: 'Deck',
    businessStage: 'All Stages',
    category: 'Pitching, Storytelling & Competitions',
    author: 'Enactus Wits Media Team',
    fileSize: '4.8 MB',
    downloadUrl: '#download-pitch-deck-pptx',
    dateAdded: '2026-03-01',
    tags: ['Pitch Deck', 'National Competition', 'PowerPoint', 'Design Grid'],
    keyTopics: ['Slide timing', 'Data graphs', 'Impact metrics', 'Judge criteria']
  }
];
