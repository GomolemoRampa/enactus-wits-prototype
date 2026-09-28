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
    if (isSupabaseConfigured() && supabase) {
      try {
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

          localStorage.setItem(this.resourcesKey, JSON.stringify(mapped));
          return mapped;
        }
      } catch (err) {
        console.warn('[ResourceService] Supabase fetch failed, using local cache:', err);
      }
    }
    return this.getResources();
  }

  /**
   * Fetch categories from live Supabase DB
   */
  public async fetchCategories(): Promise<ResourceCategory[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
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

          localStorage.setItem(this.categoriesKey, JSON.stringify(mapped));
          return mapped;
        }
      } catch (err) {
        console.warn('[ResourceService] Supabase categories fetch failed:', err);
      }
    }
    return this.getCategories();
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
    if (isSupabaseConfigured() && supabase) {
      try {
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

        if (!error && data) {
          const newRes: Resource = {
            ...resource,
            id: String(data.resource_id),
            dateAdded: (data.uploaded_at || new Date().toISOString()).split('T')[0],
          };
          const list = this.getResources();
          list.unshift(newRes);
          localStorage.setItem(this.resourcesKey, JSON.stringify(list));
          return newRes;
        }
      } catch (err) {
        console.warn('[ResourceService] Supabase createResource fallback to local:', err);
      }
    }

    // Local / Offline fallback
    const list = this.getResources();
    const newRes: Resource = {
      ...resource,
      id: `res-${Date.now()}`,
      dateAdded: new Date().toISOString().split('T')[0],
    };
    list.unshift(newRes);
    localStorage.setItem(this.resourcesKey, JSON.stringify(list));
    return newRes;
  }

  public async updateResource(id: string, updates: Partial<Resource>): Promise<Resource | null> {
    const list = this.getResources();
    const index = list.findIndex(r => r.id === id);
    if (index === -1) return null;

    const updated = {
      ...list[index],
      ...updates,
    };
    list[index] = updated;
    localStorage.setItem(this.resourcesKey, JSON.stringify(list));
    return updated;
  }

  public async deleteResource(id: string): Promise<boolean> {
    if (isSupabaseConfigured() && supabase && !id.startsWith('res-')) {
      try {
        await supabase.from('resource').delete().eq('resource_id', Number(id));
      } catch (err) {
        console.warn('[ResourceService] Supabase deleteResource fallback:', err);
      }
    }

    const list = this.getResources();
    const filtered = list.filter(r => r.id !== id);
    if (filtered.length === list.length) return false;
    localStorage.setItem(this.resourcesKey, JSON.stringify(filtered));
    return true;
  }

  // Admin Category Operations
  public async createCategory(name: string, description: string): Promise<ResourceCategory> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('resource_category')
          .insert({ category_name: name.trim() })
          .select()
          .single();

        if (!error && data) {
          const newCat: ResourceCategory = {
            id: String(data.category_id),
            name: data.category_name,
            description: description.trim(),
            createdAt: (data.created_at || new Date().toISOString()).split('T')[0],
          };
          const categories = this.getCategories();
          categories.push(newCat);
          localStorage.setItem(this.categoriesKey, JSON.stringify(categories));
          return newCat;
        }
      } catch (err) {
        console.warn('[ResourceService] Supabase createCategory fallback:', err);
      }
    }

    const categories = this.getCategories();
    const newCat: ResourceCategory = {
      id: `cat-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    categories.push(newCat);
    localStorage.setItem(this.categoriesKey, JSON.stringify(categories));
    return newCat;
  }

  public async deleteCategory(id: string): Promise<boolean> {
    if (isSupabaseConfigured() && supabase && !id.startsWith('cat-')) {
      try {
        await supabase.from('resource_category').delete().eq('category_id', Number(id));
      } catch (err) {
        console.warn('[ResourceService] Supabase deleteCategory fallback:', err);
      }
    }

    const categories = this.getCategories();
    const filtered = categories.filter(c => c.id !== id);
    if (filtered.length === categories.length) return false;
    localStorage.setItem(this.categoriesKey, JSON.stringify(filtered));
    return true;
  }
}

export const resourceService = new ResourceService();
