import { EnactusUser, AuthSession, UserRole } from '../../types/auth';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';

export interface IEnactusSSOAdapter {
  loginWithCredentials(email?: string, password?: string): Promise<AuthSession>;
  logout(): Promise<void>;
  validateSession(token: string): Promise<EnactusUser | null>;
  getCurrentSession(): AuthSession | null;
}

class EnactusSSOAdapter implements IEnactusSSOAdapter {
  private storageKey = 'enactus_kh_sso_session';
  private currentSession: AuthSession | null = null;

  constructor() {
    this.restoreSession();
  }

  private restoreSession(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed: AuthSession = JSON.parse(stored);
        if (parsed.expiresAt > Date.now()) {
          this.currentSession = parsed;
        } else {
          localStorage.removeItem(this.storageKey);
          this.currentSession = null;
        }
      }
    } catch {
      this.currentSession = null;
    }
  }

  public async loginWithCredentials(email?: string, password?: string): Promise<AuthSession> {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error("Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables.");
    }
    
    if (!email || !password) {
      throw new Error("Email and password are required.");
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.session) {
      throw new Error(authError?.message || "Login failed");
    }

    // Fetch user details from the 'app_user' table
    const { data: userData, error: userError } = await supabase
      .from("app_user")
      .select("*")
      .eq("auth_user_id", authData.session.user.id)
      .single();

    if (userError || !userData) {
      console.warn("Could not find user profile in the database.", userError);
    }

    // Explicitly resolve role name to avoid any PostgREST join ambiguity
    let resolvedRole = 'Member';
    if (userData?.role_id) {
      const { data: roleData } = await supabase.from('role').select('role_name').eq('role_id', userData.role_id).single();
      if (roleData) resolvedRole = roleData.role_name;
    }

    // Explicitly resolve business stage name
    let resolvedStage = undefined;
    if (userData?.business_stage_id) {
      const { data: stageData } = await supabase.from('business_stage').select('stage_name').eq('business_stage_id', userData.business_stage_id).single();
      if (stageData) resolvedStage = stageData.stage_name;
    }

    const user: EnactusUser = {
      id: userData?.user_id || authData.session.user.id,
      enactusId: userData?.auth_user_id || authData.session.user.id,
      name: userData?.full_name || 'Enactus User',
      email: userData?.wits_email || authData.session.user.email || '',
      role: (resolvedRole as UserRole) || 'Member',
      isRegisteredOnMainSystem: !!userData,
      businessStageId: resolvedStage,
    };

    const session: AuthSession = {
      token: authData.session.access_token,
      user,
      expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7,
    };

    this.currentSession = session;
    localStorage.setItem(this.storageKey, JSON.stringify(session));
    return session;
  }

  public async logout(): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      await supabase.auth.signOut();
    }
    this.currentSession = null;
    localStorage.removeItem(this.storageKey);
  }

  public async validateSession(token: string): Promise<EnactusUser | null> {
    if (!this.currentSession || this.currentSession.token !== token) {
      return null;
    }
    if (this.currentSession.expiresAt < Date.now()) {
      await this.logout();
      return null;
    }
    return this.currentSession.user;
  }

  public getCurrentSession(): AuthSession | null {
    if (this.currentSession && this.currentSession.expiresAt > Date.now()) {
      return this.currentSession;
    }
    return null;
  }
}

export const enactusSSO = new EnactusSSOAdapter();
