// Resource Library and Category Models

export type ResourceFileType = 'PDF' | 'Template' | 'Spreadsheet' | 'Guide' | 'Deck' | 'Document' | 'Link';
export type ResourceBusinessStage = 'Idea' | 'Prototype' | 'Running Business' | 'All Stages';

export interface ResourceCategory {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface Resource {
  id: string;
  title: string;
  summary: string;
  fileType: ResourceFileType;
  businessStage: ResourceBusinessStage;
  category: string;
  author: string;
  fileSize?: string;
  downloadUrl: string;
  dateAdded: string;
  tags: string[];
  keyTopics?: string[];
}
