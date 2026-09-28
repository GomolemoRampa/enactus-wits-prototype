import { ChatMessage, ChatInteractionLog, FlaggedQuestion } from '../types/chat';
import { EnactusUser } from '../types/auth';
import { courseService } from './courseService';
import { resourceService } from './resourceService';

class ChatService {
  private chatLogsKey = 'enactus_kh_client_chat_logs';
  private flaggedKey = 'enactus_kh_client_flagged';

  constructor() {
    this.initStorage();
  }

  private initStorage(): void {
    if (!localStorage.getItem(this.chatLogsKey)) {
      localStorage.setItem(this.chatLogsKey, JSON.stringify([]));
    }
    if (!localStorage.getItem(this.flaggedKey)) {
      localStorage.setItem(this.flaggedKey, JSON.stringify([]));
    }
  }

  public async sendMessage(query: string, user: EnactusUser): Promise<ChatMessage> {
    const timestamp = new Date().toISOString();
    
    // Try calling backend Gemini API
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, user }),
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMsg: ChatMessage = {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          content: data.reply,
          timestamp,
          isFlagged: data.isFlagged,
          flagReason: data.flagReason,
          sources: data.sources,
        };
        this.saveLocalInteraction(user, query, assistantMsg);
        return assistantMsg;
      }
    } catch (err) {
      console.warn('Backend API unavailable, using client-side grounded knowledge assistant:', err);
    }

    // Client-side grounding fallback
    return this.generateClientFallbackAnswer(query, user, timestamp);
  }

  private generateClientFallbackAnswer(
    query: string,
    user: EnactusUser,
    timestamp: string
  ): ChatMessage {
    const queryLower = query.toLowerCase().trim();

    // Tokenize query into meaningful keywords (remove stop words)
    const stopWords = new Set([
      'what', 'where', 'how', 'when', 'who', 'which', 'is', 'are', 'was', 'were',
      'do', 'does', 'did', 'can', 'could', 'would', 'should', 'will', 'shall',
      'have', 'has', 'had', 'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on',
      'at', 'to', 'for', 'of', 'with', 'by', 'from', 'about', 'into', 'through',
      'we', 'i', 'you', 'they', 'he', 'she', 'it', 'my', 'our', 'your', 'their',
      'this', 'that', 'these', 'those', 'there', 'here', 'any', 'some', 'all',
      'find', 'get', 'give', 'me', 'us', 'tell', 'show', 'please', 'help',
    ]);
    const queryWords = queryLower
      .replace(/[?!.,;:'"()]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.has(w));

    const courses = courseService.getCourses();
    const resources = resourceService.getResources();

    // Check for clearly out-of-domain inquiries
    const outOfScopeKeywords = [
      'weather', 'football', 'world cup 1998', 'movie', 'celebrity', 'song',
      'president', 'election', 'attendance', 'dues', 'agm'
    ];
    const isOutOfScope = outOfScopeKeywords.some(kw => queryLower.includes(kw));

    // Word-based matching: a course/resource matches if ANY keyword appears in its searchable text
    const matchedCourses = courses.filter(c => {
      const searchText = [
        c.title, c.description, c.category,
        ...c.modules.map(m => m.title + ' ' + m.content)
      ].join(' ').toLowerCase();
      return queryWords.some(word => searchText.includes(word));
    });

    const matchedResources = resources.filter(r => {
      const searchText = [
        r.title, r.summary, r.category,
        ...r.tags
      ].join(' ').toLowerCase();
      return queryWords.some(word => searchText.includes(word));
    });

    const sources = [
      ...matchedCourses.map(c => ({ id: c.id, title: c.title, type: 'course' as const, stage: c.businessStage, category: c.category })),
      ...matchedResources.map(r => ({ id: r.id, title: r.title, type: 'resource' as const, stage: r.businessStage, category: r.category }))
    ];

    if (isOutOfScope || (sources.length === 0 && !queryLower.includes('enactus') && !queryLower.includes('course') && !queryLower.includes('resource') && !queryLower.includes('stage'))) {
      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        content: "This question is outside our currently indexed Knowledge Hub courses, resources, and business stage guidelines. I have logged and flagged this query for an Enactus Administrator to review, provide guidance, or add new reference material to the Knowledge Hub.",
        timestamp,
        isFlagged: true,
        flagReason: "Query outside Knowledge Hub course and resource domain.",
        sources: []
      };
      this.saveLocalInteraction(user, query, assistantMsg);
      this.saveLocalFlagged(user, query, "Query outside Knowledge Hub domain.");
      return assistantMsg;
    }

    let reply = "Based on the Enactus Wits Knowledge Hub:\n\n";
    if (queryLower.includes('financial') || queryLower.includes('cost') || queryLower.includes('cogs') || queryLower.includes('ledger')) {
      reply += "For financial management and costing:\n";
      reply += "- Course: Scaling Operations, Financial Governance & Impact Audits\n";
      reply += "- Resource: Unit Economics & Cost of Goods Sold (COGS) Calculator\n";
      reply += "- Resource: Audited Financial Statement Ledger for Enactus Projects";
    } else if (queryLower.includes('pilot') || queryLower.includes('prototype') || queryLower.includes('mvp')) {
      reply += "For prototype validation and pilots:\n";
      reply += "- Course: Minimum Viable Product (MVP) & Pilot Deployment\n";
      reply += "- Resource: 30-Day Prototype Pilot Checklist & Metric Log\n";
      reply += "- Ensure faculty advisor safety sign-off before field testing.";
    } else if (queryLower.includes('idea') || queryLower.includes('interview') || queryLower.includes('need') || queryLower.includes('canvas')) {
      reply += "For idea discovery and needs assessment:\n";
      reply += "- Course: Social Need Identification & Root Cause Analysis\n";
      reply += "- Resource: Enactus Community Needs Assessment Field Questionnaire (77 Questions)\n";
      reply += "- Resource: Social Lean Canvas Template & Example Benchmark";
    } else if (queryLower.includes('pitch') || queryLower.includes('deck') || queryLower.includes('competition')) {
      reply += "For national competition presentations:\n";
      reply += "- Course: Enactus National Competition Pitch Deck Architecture\n";
      reply += "- Resource: Enactus National Competition Slide Deck Master Template (16:9)";
    } else {
      reply += `Found ${sources.length} relevant item(s) in the Knowledge Hub:\n\n`;
      sources.slice(0, 5).forEach(s => {
        reply += `• [${s.type.toUpperCase()}] ${s.title}\n  Stage: ${s.stage || 'General'} | Category: ${s.category || 'General'}\n`;
      });
      if (sources.length > 5) {
        reply += `\n...and ${sources.length - 5} more result(s).`;
      }
      reply += "\nYou can explore detailed modules and downloads in the Courses and Resources tabs.";
    }

    const assistantMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'assistant',
      content: reply,
      timestamp,
      isFlagged: false,
      sources: sources.slice(0, 5)
    };

    this.saveLocalInteraction(user, query, assistantMsg);
    return assistantMsg;
  }

  private saveLocalInteraction(user: EnactusUser, query: string, msg: ChatMessage): void {
    try {
      const raw = localStorage.getItem(this.chatLogsKey);
      const list: ChatInteractionLog[] = raw ? JSON.parse(raw) : [];
      list.unshift({
        id: `log-${Date.now()}`,
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        businessStage: user.businessStageId,
        query,
        response: msg.content,
        timestamp: msg.timestamp,
        isFlagged: !!msg.isFlagged,
        flagReason: msg.flagReason,
        sourcesCount: msg.sources?.length || 0
      });
      localStorage.setItem(this.chatLogsKey, JSON.stringify(list));
    } catch {}
  }

  private saveLocalFlagged(user: EnactusUser, question: string, notes?: string): void {
    try {
      const raw = localStorage.getItem(this.flaggedKey);
      const list: FlaggedQuestion[] = raw ? JSON.parse(raw) : [];
      list.unshift({
        id: `flag-${Date.now()}`,
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        businessStage: user.businessStageId,
        question,
        timestamp: new Date().toISOString(),
        status: 'Pending Review',
        adminNotes: notes || '',
      });
      localStorage.setItem(this.flaggedKey, JSON.stringify(list));
    } catch {}
  }

  public async getChatLogs(): Promise<ChatInteractionLog[]> {
    try {
      const res = await fetch('/api/chat/logs');
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    const raw = localStorage.getItem(this.chatLogsKey);
    return raw ? JSON.parse(raw) : [];
  }

  public async getFlaggedQuestions(): Promise<FlaggedQuestion[]> {
    try {
      const res = await fetch('/api/chat/flagged');
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    const raw = localStorage.getItem(this.flaggedKey);
    return raw ? JSON.parse(raw) : [];
  }

  public async updateFlaggedQuestion(
    id: string,
    updates: { status?: 'Pending Review' | 'Answered' | 'Dismissed'; adminAnswer?: string; adminNotes?: string; reviewedBy?: string }
  ): Promise<void> {
    try {
      await fetch(`/api/chat/flagged/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch {}

    const raw = localStorage.getItem(this.flaggedKey);
    if (raw) {
      const list: FlaggedQuestion[] = JSON.parse(raw);
      const idx = list.findIndex(f => f.id === id);
      if (idx >= 0) {
        list[idx] = {
          ...list[idx],
          ...updates,
          reviewedAt: new Date().toISOString(),
        };
        localStorage.setItem(this.flaggedKey, JSON.stringify(list));
      }
    }
  }
}

export const chatService = new ChatService();
