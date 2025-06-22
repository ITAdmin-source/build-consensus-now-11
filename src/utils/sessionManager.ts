
// Utility for managing anonymous user sessions
export class SessionManager {
  private static SESSION_KEY = 'polis_session_id';
  
  static getSessionId(): string {
    let sessionId = localStorage.getItem(this.SESSION_KEY);
    
    if (!sessionId) {
      sessionId = this.generateSessionId();
      localStorage.setItem(this.SESSION_KEY, sessionId);
    }
    
    return sessionId;
  }
  
  static clearSession(): void {
    localStorage.removeItem(this.SESSION_KEY);
  }
  
  private static generateSessionId(): string {
    return 'anon_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}
