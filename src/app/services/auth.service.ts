import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Browser } from '@capacitor/browser';
import { App } from '@capacitor/app';

export interface AuthToken {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  tokenType: string;
}

export interface UserProfile {
  id: string;
  displayName: string;
  mail: string;
  mobilePhone?: string;
  jobTitle?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly AUTH_ENDPOINT = 'https://login.microsoftonline.com';
  private readonly GRAPH_ENDPOINT = 'https://graph.microsoft.com/v1.0';
  
  private authToken$ = new BehaviorSubject<AuthToken | null>(null);
  private userProfile$ = new BehaviorSubject<UserProfile | null>(null);
  private isAuthenticated$ = new BehaviorSubject<boolean>(false);

  private tokenExpiryTimer: any;

  constructor(private http: HttpClient) {
    this.initializeAuthState();
    this.setupDeepLinking();
  }

  // Public Observables
  getAuthToken$(): Observable<AuthToken | null> {
    return this.authToken$.asObservable();
  }

  getUserProfile$(): Observable<UserProfile | null> {
    return this.userProfile$.asObservable();
  }

  isAuthenticated(): Observable<boolean> {
    return this.isAuthenticated$.asObservable();
  }

  /**
   * Initiates Microsoft SSO login flow
   */
  login(): void {
    const scopes = ['User.Read'];
    const scope = scopes.map(s => `${environment.msGraph}/${s}`).join(' ');
    
    const params = {
      client_id: environment.clientId,
      response_type: 'code',
      redirect_uri: environment.redirectUri,
      response_mode: 'query',
      scope: scope,
      state: this.generateState(),
      prompt: 'select_account'
    };

    const authUrl = this.buildAuthUrl(params);
    this.openBrowserForLogin(authUrl);
  }

  /**
   * Handles OAuth callback and exchanges code for token
   */
  handleAuthCallback(code: string): Observable<AuthToken> {
    const body = {
      grant_type: 'authorization_code',
      client_id: environment.clientId,
      code: code,
      redirect_uri: environment.redirectUri,
      scope: 'User.Read'
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    return this.http.post<any>(
      `${this.AUTH_ENDPOINT}/${environment.tenantId}/oauth2/v2.0/token`,
      this.encodeBody(body),
      { headers }
    ).pipe(
      tap(response => {
        const token: AuthToken = {
          accessToken: response.access_token,
          refreshToken: response.refresh_token,
          expiresIn: response.expires_in,
          tokenType: response.token_type
        };
        this.storeToken(token);
        this.authToken$.next(token);
        this.isAuthenticated$.next(true);
        this.setTokenExpiryTimer(response.expires_in);
        this.fetchUserProfile(token.accessToken);
      })
    );
  }

  /**
   * Refreshes the access token
   */
  refreshToken(): Observable<AuthToken> {
    const token = this.authToken$.value;
    if (!token?.refreshToken) {
      throw new Error('No refresh token available');
    }

    const body = {
      grant_type: 'refresh_token',
      client_id: environment.clientId,
      refresh_token: token.refreshToken,
      scope: 'User.Read offline_access'
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    return this.http.post<any>(
      `${this.AUTH_ENDPOINT}/${environment.tenantId}/oauth2/v2.0/token`,
      this.encodeBody(body),
      { headers }
    ).pipe(
      tap(response => {
        const newToken: AuthToken = {
          accessToken: response.access_token,
          refreshToken: response.refresh_token || token.refreshToken,
          expiresIn: response.expires_in,
          tokenType: response.token_type
        };
        this.storeToken(newToken);
        this.authToken$.next(newToken);
        this.setTokenExpiryTimer(response.expires_in);
      })
    );
  }

  /**
   * Fetches user profile from Microsoft Graph
   */
  private fetchUserProfile(accessToken: string): void {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    });

    this.http.get<any>(`${this.GRAPH_ENDPOINT}/me`, { headers })
      .subscribe({
        next: (profile) => {
          const userProfile: UserProfile = {
            id: profile.id,
            displayName: profile.displayName,
            mail: profile.mail,
            mobilePhone: profile.mobilePhone,
            jobTitle: profile.jobTitle
          };
          this.userProfile$.next(userProfile);
          this.storeUserProfile(userProfile);
        },
        error: (err) => console.error('Error fetching user profile:', err)
      });
  }

  /**
   * Logs out the user
   */
  logout(): Observable<any> {
    return new Observable(observer => {
      this.clearAuthData();
      this.authToken$.next(null);
      this.userProfile$.next(null);
      this.isAuthenticated$.next(false);
      
      if (this.tokenExpiryTimer) {
        clearTimeout(this.tokenExpiryTimer);
      }

      observer.next();
      observer.complete();
    });
  }

  /**
   * Gets current access token
   */
  getAccessToken(): string | null {
    return this.authToken$.value?.accessToken || null;
  }

  /**
   * Gets current user profile
   */
  getUserProfile(): UserProfile | null {
    return this.userProfile$.value;
  }

  // ==================== PRIVATE METHODS ====================

  private initializeAuthState(): void {
    const stored = this.getStoredToken();
    if (stored) {
      this.authToken$.next(stored);
      this.isAuthenticated$.next(true);
      
      // Check if token is still valid
      const expiryTime = this.getTokenExpiry();
      if (expiryTime && expiryTime > Date.now()) {
        this.setTokenExpiryTimer(Math.floor((expiryTime - Date.now()) / 1000));
      } else {
        this.refreshToken().subscribe();
      }
    }

    const storedProfile = this.getStoredUserProfile();
    if (storedProfile) {
      this.userProfile$.next(storedProfile);
    }
  }

  private setupDeepLinking(): void {
    App.addListener('appUrlOpen', (data: any) => {
      const slashIndex = data.url.indexOf('//') + 2;
      const paramsString = data.url.substring(slashIndex);
      const params = new URLSearchParams(paramsString.split('?')[1]);
      
      const code = params.get('code');
      const error = params.get('error');

      if (code) {
        this.handleAuthCallback(code).subscribe({
          error: (err) => console.error('Auth callback error:', err)
        });
      } else if (error) {
        console.error('Auth error:', error);
      }
    });
  }

  private buildAuthUrl(params: any): string {
    const queryParams = new URLSearchParams(params).toString();
    return `${this.AUTH_ENDPOINT}/${environment.tenantId}/oauth2/v2.0/authorize?${queryParams}`;
  }

  private async openBrowserForLogin(url: string): Promise<void> {
    await Browser.open({ url });
  }

  private encodeBody(obj: any): string {
    return Object.keys(obj)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
      .join('&');
  }

  private generateState(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  private storeToken(token: AuthToken): void {
    localStorage.setItem('auth_token', JSON.stringify(token));
    localStorage.setItem('token_expiry', (Date.now() + token.expiresIn * 1000).toString());
  }

  private getStoredToken(): AuthToken | null {
    const stored = localStorage.getItem('auth_token');
    return stored ? JSON.parse(stored) : null;
  }

  private getTokenExpiry(): number | null {
    const expiry = localStorage.getItem('token_expiry');
    return expiry ? parseInt(expiry, 10) : null;
  }

  private storeUserProfile(profile: UserProfile): void {
    localStorage.setItem('user_profile', JSON.stringify(profile));
  }

  private getStoredUserProfile(): UserProfile | null {
    const stored = localStorage.getItem('user_profile');
    return stored ? JSON.parse(stored) : null;
  }

  private clearAuthData(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('token_expiry');
    localStorage.removeItem('user_profile');
  }

  private setTokenExpiryTimer(expiresIn: number): void {
    if (this.tokenExpiryTimer) {
      clearTimeout(this.tokenExpiryTimer);
    }

    // Refresh token 5 minutes before expiry
    const refreshTime = (expiresIn - 300) * 1000;
    this.tokenExpiryTimer = setTimeout(() => {
      this.refreshToken().subscribe({
        error: (err) => console.error('Token refresh failed:', err)
      });
    }, refreshTime);
  }
}