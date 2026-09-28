import { EnactusUser, AuthSession, UserRole } from '../../types/auth';
import { MOCK_ENACTUS_USERS } from '../mockData';

export interface IEnactusSSOAdapter {
  loginWithSSO(personaId?: string): Promise<AuthSession>;
  logout(): Promise<void>;
  validateSession(token: string): Promise<EnactusUser | null>;
  getCurrentSession(): AuthSession | null;
  getAvailablePersonas(): EnactusUser[];
}

/**
 * Isolated SSO Authentication Adapter for Enactus Wits Knowledge Hub.
 * Handles Single Sign-On token verification and user claims against the primary Enactus Wits Support System.
 */
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

  /**
   * Retrieves all available mock personas from the simulated identity provider.
   */
  public getAvailablePersonas(): EnactusUser[] {
    return MOCK_ENACTUS_USERS;
  }

  /**
   * Performs Single Sign-On against the Enactus Wits Identity Provider.
   * 
   * =========================================================================
   * TODO: CONNECT REAL ENACTUS WITS OAUTH2 / OIDC IDENTITY PROVIDER ENDPOINT
   * =========================================================================
   * When deploying to production with the main Enactus Wits Support System:
   * 1. Redirect to: `${MAIN_SYSTEM_AUTH_URL}/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${CALLBACK_URL}&response_type=code`
   * 2. Exchange authorization code for access token via `${MAIN_SYSTEM_AUTH_URL}/oauth/token`
   * 3. Fetch user profile and roles from `${MAIN_SYSTEM_AUTH_URL}/api/v1/user/me`
   * 4. Verify that `isRegisteredOnMainSystem === true` and extract BusinessStageID and Role.
   */
  public async loginWithSSO(personaId?: string): Promise<AuthSession> {
    // Simulate network latency for identity provider handshake
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Default to the first member persona (Lerato Khumalo - Idea Stage) if not specified
    const userToLogin = personaId 
      ? MOCK_ENACTUS_USERS.find(u => u.id === personaId) || MOCK_ENACTUS_USERS[0]
      : MOCK_ENACTUS_USERS[0];

    // Mock token generated from identity provider
    const session: AuthSession = {
      token: `sso_jwt_${userToLogin.id}_${Date.now()}`,
      user: { ...userToLogin },
      expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
    };

    this.currentSession = session;
    localStorage.setItem(this.storageKey, JSON.stringify(session));
    return session;
  }

  public async logout(): Promise<void> {
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
