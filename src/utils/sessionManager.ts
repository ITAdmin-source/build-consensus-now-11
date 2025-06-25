
// Utility for managing anonymous user sessions
export class SessionManager {
  private static SESSION_KEY = 'polis_session_id';
  
  static getSessionId(): string {
    let sessionId = localStorage.getItem(this.SESSION_KEY);
    
    if (!sessionId) {
      sessionId = this.generateSessionId();
      localStorage.setItem(this.SESSION_KEY, sessionId);
      console.log('Generated new session ID:', sessionId);
    }
    
    return sessionId;
  }
  
  static clearSession(): void {
    localStorage.removeItem(this.SESSION_KEY);
    console.log('Session cleared');
  }
  
  private static generateSessionId(): string {
    // Generate a more robust session ID
    const timestamp = Date.now();
    const randomPart = Math.random().toString(36).substring(2, 15);
    const additionalRandom = Math.random().toString(36).substring(2, 9);
    return `anon_${timestamp}_${randomPart}_${additionalRandom}`;
  }
  
  // Helper method to validate session ID format
  static isValidSessionId(sessionId: string): boolean {
    return sessionId && sessionId.startsWith('anon_') && sessionId.length > 10;
  }
}
