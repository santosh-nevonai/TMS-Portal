// ============================================================================
// Demo authentication — hardcoded dummy credentials for the fleet console.
// No backend: sessions are validated against DEMO_USERS and persisted in
// localStorage so a refresh keeps you signed in.
// ============================================================================

export interface DemoUser {
  email: string;
  password: string;
  name: string;
  role: string;
  initials: string;
}

// Dummy credentials — safe to display on the login screen.
export const DEMO_USERS: DemoUser[] = [
  { email: 'admin@nevonai.com',    password: 'Admin@123',   name: 'Santosh Kumar', role: 'Operations Admin',    initials: 'SK' },
  { email: 'approver@nevonai.com', password: 'Approve@123', name: 'Anjali Rao',    role: 'Campaign Approver',   initials: 'AR' },
  { email: 'viewer@nevonai.com',   password: 'Viewer@123',  name: 'Priya Nair',    role: 'Read-only Analyst',   initials: 'PN' },
];

export interface Session {
  name: string;
  email: string;
  role: string;
  initials: string;
}

const STORAGE_KEY = 'nevon.fleet.session';

/** Validate credentials against the demo users. Persists a session on success. */
export function authenticate(email: string, password: string): Session | null {
  const match = DEMO_USERS.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password,
  );
  if (!match) return null;

  const session: Session = {
    name: match.name,
    email: match.email,
    role: match.role,
    initials: match.initials,
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    /* storage unavailable — session simply won't persist across reloads */
  }
  return session;
}

export function getSession(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return getSession() !== null;
}

export function logout(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
