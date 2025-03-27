export interface User {
  _id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
}

export interface Crime {
  _id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  status: 'pending' | 'investigating' | 'resolved' | 'rejected';
  reportedBy: string;
  mediaFiles: Array<{
    url: string;
    type: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  adminLogin: (code: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}