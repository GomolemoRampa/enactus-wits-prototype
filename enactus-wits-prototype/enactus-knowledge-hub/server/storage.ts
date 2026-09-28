import { Course } from '../src/types/course';
import { Resource, ResourceCategory } from '../src/types/resource';
import { ChatInteractionLog, FlaggedQuestion } from '../src/types/chat';
import { INITIAL_COURSES, INITIAL_RESOURCES, INITIAL_CATEGORIES } from '../src/services/mockData';

class BackendStorage {
  public courses: Course[] = [...INITIAL_COURSES];
  public resources: Resource[] = [...INITIAL_RESOURCES];
  public categories: ResourceCategory[] = [...INITIAL_CATEGORIES];
  public chatLogs: ChatInteractionLog[] = [
    {
      id: 'log-seed-01',
      userId: 'user-mem-01',
      userName: 'Lerato Khumalo',
      userRole: 'Member',
      businessStage: 'Idea',
      query: 'What template should I use for community interviews?',
      response: 'Recommended Resource: Enactus Community Needs Assessment Field Questionnaire (77 Questions). It covers demographic profiling and willingness-to-pay validation.',
      timestamp: '2026-03-10T10:14:00.000Z',
      isFlagged: false,
      sourcesCount: 2
    },
    {
      id: 'log-seed-02',
      userId: 'user-mem-02',
      userName: 'Thabo Ndlovu',
      userRole: 'Member',
      businessStage: 'Prototype',
      query: 'Who won the soccer match on Saturday?',
      response: 'This question is outside our currently indexed Knowledge Hub courses and resources. I have flagged this query for an Enactus Administrator to review.',
      timestamp: '2026-03-12T14:22:00.000Z',
      isFlagged: true,
      flagReason: 'Query outside Knowledge Hub domain.',
      sourcesCount: 0
    }
  ];
  public flaggedQuestions: FlaggedQuestion[] = [
    {
      id: 'flag-seed-01',
      userId: 'user-mem-02',
      userName: 'Thabo Ndlovu',
      userRole: 'Member',
      businessStage: 'Prototype',
      question: 'Who won the soccer match on Saturday?',
      timestamp: '2026-03-12T14:22:00.000Z',
      status: 'Dismissed',
      adminNotes: 'Out of scope inquiry. General trivia.',
      reviewedBy: 'Nomvula Dlamini (Admin)',
      reviewedAt: '2026-03-12T15:00:00.000Z'
    },
    {
      id: 'flag-seed-02',
      userId: 'user-mem-01',
      userName: 'Lerato Khumalo',
      userRole: 'Member',
      businessStage: 'Idea',
      question: 'Do we have sample export compliance guidelines for SADC agricultural ventures?',
      timestamp: '2026-03-14T09:30:00.000Z',
      status: 'Pending Review',
      adminNotes: '',
    }
  ];

  public logInteraction(log: Omit<ChatInteractionLog, 'id'>): ChatInteractionLog {
    const newLog: ChatInteractionLog = {
      ...log,
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    this.chatLogs.unshift(newLog);
    return newLog;
  }

  public flagQuestion(question: Omit<FlaggedQuestion, 'id' | 'status'>): FlaggedQuestion {
    const newFlag: FlaggedQuestion = {
      ...question,
      id: `flag-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      status: 'Pending Review',
    };
    this.flaggedQuestions.unshift(newFlag);
    return newFlag;
  }
}

export const serverStorage = new BackendStorage();
