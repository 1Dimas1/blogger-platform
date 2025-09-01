import { Injectable } from '@nestjs/common';
import { GmailOAuthAdapter } from './gmail-oauth.adapter';

export interface IOAuthManager {
  getValidAccessToken(): Promise<string>;
}

export interface OAuthTokensSession {
  accessToken: string;
  expiresAt: Date;
}

@Injectable()
export class GmailOAuthManager implements IOAuthManager {
  private tokenSession: OAuthTokensSession | null = null;

  constructor(private oAuthAdapter: GmailOAuthAdapter) {}

  async getValidAccessToken(): Promise<string> {
    try {
      if (this.isTokenSessionValid()) {
        return this.tokenSession!.accessToken;
      }

      if (this.tokenSession) {
        return await this.refreshToken();
      }

      return await this.getNewToken();
    } catch (error) {
      console.error('Error in getValidAccessToken:', error);
      throw error;
    }
  }

  private async getNewToken(): Promise<string> {
    const accessToken: string = await this.oAuthAdapter.getAccessToken();
    this.updateTokenSession(accessToken);
    return accessToken;
  }

  private async refreshToken(): Promise<string> {
    const accessToken: string = await this.oAuthAdapter.refreshAccessToken();
    this.updateTokenSession(accessToken);
    return accessToken;
  }

  private updateTokenSession(accessToken: string): void {
    this.tokenSession = {
      accessToken,
      expiresAt: new Date(Date.now() + 3600 * 1000),
    };
  }

  private isTokenSessionValid(): boolean {
    if (!this.tokenSession) return false;

    const bufferTime: number = 5 * 60 * 1000;
    return this.tokenSession.expiresAt.getTime() - bufferTime > Date.now();
  }
}
