export interface User {
  _id: string;
  email: string;
  name: string;
}

export interface Crime {
  _id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  status: 'pending' | 'solved';
  uplodedBy: User;
  images: Array<{
    fileUrl: string;
    fileType: string;
  }>;
  video?: string;
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