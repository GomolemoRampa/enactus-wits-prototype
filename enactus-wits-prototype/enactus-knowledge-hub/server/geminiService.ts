import { GoogleGenerativeAI } from '@google/generative-ai';
import { Course } from '../src/types/course';
import { Resource } from '../src/types/resource';
import { ChatSourceCitation } from '../src/types/chat';

export interface ChatResponsePayload {
  reply: string;
  isFlagged: boolean;
  flagReason?: string;
  sources: ChatSourceCitation[];
}

export class GeminiKnowledgeAssistantService {
  private genAI: GoogleGenerativeAI | null = null;
  private apiKey: string | null = null;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || null;
    if (this.apiKey) {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
    }
  }

  public setApiKey(key: string): void {
    this.apiKey = key;
    this.genAI = new GoogleGenerativeAI(key);
  }

  /**
   * Generates a grounded response based strictly on Enactus Knowledge Hub courses and resources.
   * If the question is outside scope or lacks reliable grounding, flags the question and returns fallback.
   */
  public async generateAnswer(params: {
    userQuery: string;
    userName: string;
    userRole: string;
    userStage?: string;
    courses: Course[];
    resources: Resource[];
  }): Promise<ChatResponsePayload> {
    const { userQuery, userName, userRole, userStage, courses, resources } = params;

    // 1. Identify relevant course and resource citations based on semantic / keyword match
    const queryLower = userQuery.toLowerCase().trim();
    
    // Check if query is clearly out of domain (e.g. random pop culture, general world trivia, main system events/reports)
    const outOfScopeKeywords = [
      'weather', 'football', 'world cup 1998', 'movie', 'celebrity', 'song',
      'president of the united states', 'general election', 'horoscope',
      'main system attendance', 'agm announcement', 'member dues payment'
    ];
    
    const isExplicitlyOutOfScope = outOfScopeKeywords.some(kw => queryLower.includes(kw));

    // Find matching courses & resources
    const matchedCourses = courses.filter(c => {
      return (
        c.title.toLowerCase().includes(queryLower) ||
        c.description.toLowerCase().includes(queryLower) ||
        c.category.toLowerCase().includes(queryLower) ||
        c.modules.some(m => m.title.toLowerCase().includes(queryLower) || m.content.toLowerCase().includes(queryLower)) ||
        queryLower.split(' ').filter(w => w.length > 3).some(w => c.title.toLowerCase().includes(w) || c.description.toLowerCase().includes(w))
      );
    });

    const matchedResources = resources.filter(r => {
      return (
        r.title.toLowerCase().includes(queryLower) ||
        r.summary.toLowerCase().includes(queryLower) ||
        r.category.toLowerCase().includes(queryLower) ||
        r.tags.some(t => queryLower.includes(t.toLowerCase())) ||
        (r.keyTopics && r.keyTopics.some(kt => queryLower.includes(kt.toLowerCase()))) ||
        queryLower.split(' ').filter(w => w.length > 3).some(w => r.title.toLowerCase().includes(w) || r.summary.toLowerCase().includes(w))
      );
    });

    const sources: ChatSourceCitation[] = [
      ...matchedCourses.map(c => ({
        id: c.id,
        title: c.title,
        type: 'course' as const,
        stage: c.businessStage,
        category: c.category,
      })),
      ...matchedResources.map(r => ({
        id: r.id,
        title: r.title,
        type: 'resource' as const,
        stage: r.businessStage,
        category: r.category,
      }))
    ];

    // If clearly out of scope or no relevant domain terms in query, flag query and return clean fallback
    const businessDomainTerms = [
      'course', 'resource', 'enactus', 'stage', 'idea', 'prototype', 'running',
      'pilot', 'mvp', 'finance', 'cogs', 'budget', 'canvas', 'needs', 'assessment',
      'questionnaire', 'mou', 'legal', 'pitch', 'deck', 'competition', 'module',
      'business', 'market', 'customer', 'community', 'enterprise', 'social',
      'cost', 'pricing', 'revenue', 'interview', 'problem', 'tree', 'wits'
    ];

    const hasDomainRelevance = businessDomainTerms.some(term => queryLower.includes(term));

    if (isExplicitlyOutOfScope || (!hasDomainRelevance && sources.length === 0)) {
      return {
        reply: "This question is outside our currently indexed Knowledge Hub courses, resources, and business stage guidelines. I have logged and flagged this query for an Enactus Administrator to review, provide guidance, or add new reference material to the Knowledge Hub.",
        isFlagged: true,
        flagReason: "Query outside Knowledge Hub course and resource domain.",
        sources: []
      };
    }

    // 2. Build Knowledge Base context for Gemini
    const contextCourses = courses.map(c => `
COURSE: ${c.title}
Stage: ${c.businessStage}
Category: ${c.category}
Summary: ${c.description}
Learning Outcomes: ${c.learningOutcomes.join('; ')}
Modules:
${c.modules.map(m => `  - ${m.title}: ${m.summary} (${m.content})`).join('\n')}
`).join('\n---\n');

    const contextResources = resources.map(r => `
RESOURCE: ${r.title}
Type: ${r.fileType}
Stage: ${r.businessStage}
Category: ${r.category}
Summary: ${r.summary}
Tags: ${r.tags.join(', ')}
Key Topics: ${r.keyTopics ? r.keyTopics.join(', ') : 'N/A'}
`).join('\n---\n');

    const systemPrompt = `You are the Enactus Wits Knowledge Hub Assistant.
You assist Enactus Wits students, project leads, and advisors in navigating courses, business templates, pilot methodologies, financial modeling, and competition preparation.

STRICT RULES & CONSTRAINTS:
1. ONLY answer questions using the provided Enactus Knowledge Hub Courses and Resources below.
2. DO NOT use emojis anywhere in your response. Emojis are strictly forbidden.
3. Keep responses structured, concise, professional, and directly actionable.
4. Reference the specific Course titles and Resource titles when giving advice.
5. If the user's question asks about main system features like general member attendance, events scheduling, or official executive announcements, state clearly that those are managed on the primary Enactus Support System and not in this Knowledge Hub.
6. If the provided Knowledge Hub context does not contain sufficient information to answer reliably, output: "[OUT_OF_SCOPE]" followed by a brief explanation.

USER CONTEXT:
- Name: ${userName}
- Role: ${userRole}
- Active Business Stage: ${userStage || 'All Stages'}

INDEXED KNOWLEDGE BASE:

=== COURSES ===
${contextCourses}

=== RESOURCES ===
${contextResources}
`;

    // If Gemini API is configured, call Gemini
    if (this.genAI && this.apiKey) {
      try {
        const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent([
          systemPrompt,
          `User question: ${userQuery}`
        ]);
        const responseText = result.response.text().trim();

        if (responseText.includes('[OUT_OF_SCOPE]')) {
          const cleanReason = responseText.replace('[OUT_OF_SCOPE]', '').trim() || 'Requires administrator guidance.';
          return {
            reply: `This specific inquiry requires additional context not currently available in our course repository. I have flagged this for an Enactus Administrator to review. Reason: ${cleanReason}`,
            isFlagged: true,
            flagReason: cleanReason,
            sources: sources.slice(0, 3)
          };
        }

        // Clean out any accidental emojis
        const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
        const sanitizedReply = responseText.replace(emojiRegex, '');

        return {
          reply: sanitizedReply,
          isFlagged: false,
          sources: sources.slice(0, 4)
        };
      } catch (err: any) {
        console.error('Gemini API call failed, using deterministic grounded fallback:', err.message);
      }
    }

    // Deterministic Knowledge Grounding Engine (Fallback / Offline / Keyless Mode)
    return this.generateDeterministicAnswer(userQuery, sources, userStage);
  }

  private generateDeterministicAnswer(
    query: string,
    sources: ChatSourceCitation[],
    userStage?: string
  ): ChatResponsePayload {
    const q = query.toLowerCase();

    if (sources.length === 0) {
      return {
        reply: "This question is outside our currently indexed Knowledge Hub courses and resources. I have flagged this query for an Enactus Administrator to review.",
        isFlagged: true,
        flagReason: "No matching course or resource content found in repository.",
        sources: []
      };
    }

    // Grounded synthesis based on matched resources & courses
    let replyParts: string[] = [];

    const topCourse = sources.find(s => s.type === 'course');
    const topResource = sources.find(s => s.type === 'resource');

    if (q.includes('finance') || q.includes('cost') || q.includes('cogs') || q.includes('unit') || q.includes('price')) {
      replyParts.push("For financial modeling and cost structuring in Enactus projects:");
      replyParts.push("- Recommended Course: 'Scaling Operations, Financial Governance & Impact Audits' covers double-entry cash flow records, revenue separation, and audit reconciliation.");
      replyParts.push("- Key Resource: 'Unit Economics & Cost of Goods Sold (COGS) Calculator' allows you to calculate variable materials, direct labor, packaging, and gross margins per unit.");
      replyParts.push("- For running business stage projects, ensure compliance with the 'Audited Financial Statement Ledger' before national competitions.");
    } else if (q.includes('pilot') || q.includes('prototype') || q.includes('mvp') || q.includes('test')) {
      replyParts.push("For prototype testing and pilot deployments:");
      replyParts.push("- Recommended Course: 'Minimum Viable Product (MVP) & Pilot Deployment' provides frameworks for formulating falsifiable hypotheses and assessing willingness-to-pay.");
      replyParts.push("- Key Resource: '30-Day Prototype Pilot Checklist & Metric Log' tracks daily output, defect rates, and customer escalation protocols.");
      replyParts.push("- Remember that all community field trials must adhere to Wits research ethics protocols and faculty advisor safety review.");
    } else if (q.includes('idea') || q.includes('need') || q.includes('problem') || q.includes('canvas') || q.includes('interview')) {
      replyParts.push("For early-stage social enterprise ideation and problem validation:");
      replyParts.push("- Recommended Course: 'Social Need Identification & Root Cause Analysis' guides you through the 5 Whys technique and separating symptoms from root causes.");
      replyParts.push("- Key Resource: 'Enactus Community Needs Assessment Field Questionnaire (77 Questions)' for structured community stakeholder discovery.");
      replyParts.push("- Key Resource: 'Social Lean Canvas Template & Example Benchmark' for drafting your project's 1-page business thesis.");
    } else if (q.includes('pitch') || q.includes('competition') || q.includes('deck') || q.includes('present')) {
      replyParts.push("For national competition presentations and pitching:");
      replyParts.push("- Recommended Course: 'Enactus National Competition Pitch Deck Architecture' outlines the 12-minute presentation structure (Need, Action, Impact, Scaling).");
      replyParts.push("- Key Resource: 'Enactus National Competition Slide Deck Master Template (16:9)' formatted to competition typography and data guidelines.");
    } else if (q.includes('legal') || q.includes('mou') || q.includes('governance') || q.includes('coop')) {
      replyParts.push("For community agreements and project governance:");
      replyParts.push("- Key Resource: 'Community Memorandum of Understanding (MoU) Legal Template' sets clear terms between Enactus Wits, faculty, and community leaders.");
      replyParts.push("- Review Module 3 of the Running Business course on long-term community ownership and asset handover.");
    } else {
      replyParts.push("Based on the Knowledge Hub repository, here is the relevant guidance:");
      if (topCourse) {
        replyParts.push(`- Relevant Course: '${topCourse.title}' (${topCourse.stage || 'General'} stage)`);
      }
      if (topResource) {
        replyParts.push(`- Key Resource: '${topResource.title}'`);
      }
      replyParts.push("You can access and enroll in these directly from the Courses and Resources tabs above.");
    }

    return {
      reply: replyParts.join('\n\n'),
      isFlagged: false,
      sources: sources.slice(0, 3)
    };
  }
}
