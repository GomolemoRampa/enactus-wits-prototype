import { Resource, ResourceCategory, ResourceBusinessStage, ResourceFileType } from '../types/resource';
import { INITIAL_RESOURCES, INITIAL_CATEGORIES } from './mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

// Helper mapping between Stage Names and Stage IDs (Group11 ERD: 1=Idea, 2=Prototype, 3=RunningBusiness)
const STAGE_NAME_TO_ID: Record<string, number> = {
  'Idea': 1,
  'Prototype': 2,
  'Running Business': 3,
  'RunningBusiness': 3,
};

const STAGE_ID_TO_NAME: Record<number, ResourceBusinessStage> = {
  1: 'Idea',
  2: 'Prototype',
  3: 'Running Business',
};

class ResourceService {
  private resourcesKey = 'enactus_kh_resources';
  private categoriesKey = 'enactus_kh_categories';

  constructor() {
    this.initStorage();
  }

  private initStorage(): void {
    if (!localStorage.getItem(this.resourcesKey)) {
      localStorage.setItem(this.resourcesKey, JSON.stringify(INITIAL_RESOURCES));
    }
    if (!localStorage.getItem(this.categoriesKey)) {
      localStorage.setItem(this.categoriesKey, JSON.stringify(INITIAL_CATEGORIES));
    }
  }

  /**
   * Fetch resources from live Supabase DB with cache fallback
   */
  public async fetchResources(): Promise<Resource[]> {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase is not configured or offline.');
    }

    const { data, error } = await supabase
      .from('resource')
      .select(`
        resource_id,
        title,
        content_type,
        url,
        business_stage_id,
        category_id,
        uploaded_at,
        resource_category ( category_id, category_name ),
        app_user ( full_name )
      `)
      .order('uploaded_at', { ascending: false });

    if (error) throw error;

    if (data && data.length > 0) {
      const mapped: Resource[] = data.map((r: any) => ({
        id: String(r.resource_id),
        title: r.title,
        summary: `Verified Enactus incubation resource (${r.content_type}).`,
        fileType: (r.content_type as ResourceFileType) || 'Document',
        businessStage: r.business_stage_id ? (STAGE_ID_TO_NAME[r.business_stage_id] || 'All Stages') : 'All Stages',
        category: r.resource_category?.category_name || 'General',
        author: r.app_user?.full_name || 'Enactus Wits Faculty',
        downloadUrl: r.url || '#',
        dateAdded: (r.uploaded_at || new Date().toISOString()).split('T')[0],
        tags: [r.content_type, r.resource_category?.category_name].filter(Boolean),
      }));
      return mapped;
    }
    
    return [];
  }

  /**
   * Fetch categories from live Supabase DB
   */
  public async fetchCategories(): Promise<ResourceCategory[]> {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase is not configured or offline.');
    }

    const { data, error } = await supabase
      .from('resource_category')
      .select('category_id, category_name, created_at')
      .order('category_name', { ascending: true });

    if (error) throw error;

    if (data && data.length > 0) {
      const mapped: ResourceCategory[] = data.map((c: any) => ({
        id: String(c.category_id),
        name: c.category_name,
        description: `Official incubation topic category.`,
        createdAt: (c.created_at || new Date().toISOString()).split('T')[0],
      }));
      return mapped;
    }
    
    return [];
  }

  public getResources(): Resource[] {
    try {
      const data = localStorage.getItem(this.resourcesKey);
      return data ? JSON.parse(data) : INITIAL_RESOURCES;
    } catch {
      return INITIAL_RESOURCES;
    }
  }

  public getCategories(): ResourceCategory[] {
    try {
      const data = localStorage.getItem(this.categoriesKey);
      return data ? JSON.parse(data) : INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  }

  public filterResources(options: {
    stage?: ResourceBusinessStage | 'All';
    category?: string;
    searchQuery?: string;
  }): Resource[] {
    let list = this.getResources();

    if (options.stage && options.stage !== 'All') {
      list = list.filter(
        r => r.businessStage === options.stage || r.businessStage === 'All Stages'
      );
    }

    if (options.category && options.category !== 'All') {
      list = list.filter(r => r.category === options.category);
    }

    if (options.searchQuery && options.searchQuery.trim() !== '') {
      const q = options.searchQuery.toLowerCase().trim();
      list = list.filter(
        r =>
          r.title.toLowerCase().includes(q) ||
          r.summary.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q) ||
          r.author.toLowerCase().includes(q) ||
          r.tags.some(t => t.toLowerCase().includes(q)) ||
          (r.keyTopics && r.keyTopics.some(kt => kt.toLowerCase().includes(q)))
      );
    }

    return list;
  }

  // Admin Resource Operations (Async with Supabase support)
  public async createResource(resource: Omit<Resource, 'id' | 'dateAdded'>, currentUserId?: number): Promise<Resource> {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase is not configured or offline.');
    }

    const stageId = STAGE_NAME_TO_ID[resource.businessStage] || null;

    const { data, error } = await supabase
      .from('resource')
      .insert({
        title: resource.title,
        content_type: resource.fileType || 'Document',
        url: resource.downloadUrl || '#',
        business_stage_id: stageId,
        uploaded_by_user_id: currentUserId || 2, // default admin ID
      })
      .select()
      .single();

    if (error) throw error;

    return {
      ...resource,
      id: String(data.resource_id),
      dateAdded: (data.uploaded_at || new Date().toISOString()).split('T')[0],
    };
  }

  public async updateResource(id: string, updates: Partial<Resource>): Promise<Resource | null> {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase is not configured or offline.');
    }

    const { data, error } = await supabase
      .from('resource')
      .update({
        title: updates.title,
        content_type: updates.fileType,
        url: updates.downloadUrl,
        business_stage_id: updates.businessStage ? STAGE_NAME_TO_ID[updates.businessStage] : undefined,
      })
      .eq('resource_id', Number(id))
      .select()
      .single();

    if (error) throw error;

    return {
      ...(updates as Resource), // Simplification since full resource mapping logic depends on existing data usually, but returning updates mapped works for the caller
      id: String(data.resource_id),
    };
  }

  public async deleteResource(id: string): Promise<boolean> {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase is not configured or offline.');
    }
    
    const { error } = await supabase.from('resource').delete().eq('resource_id', Number(id));
    
    if (error) throw error;
    
    return true;
  }

  // Admin Category Operations
  public async createCategory(name: string, description: string): Promise<ResourceCategory> {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase is not configured or offline.');
    }
    
    const { data, error } = await supabase
      .from('resource_category')
      .insert({ category_name: name.trim() })
      .select()
      .single();

    if (error) throw error;
    
    return {
      id: String(data.category_id),
      name: data.category_name,
      description: description.trim(),
      createdAt: (data.created_at || new Date().toISOString()).split('T')[0],
    };
  }

  public async deleteCategory(id: string): Promise<boolean> {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase is not configured or offline.');
    }
    
    const { error } = await supabase.from('resource_category').delete().eq('category_id', Number(id));
    
    if (error) throw error;
    
    return true;
  }
}

export const resourceService = new ResourceService();
