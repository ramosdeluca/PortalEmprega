export interface Company {
  id: number;
  name: string;
  cnpj: string;
  email: string;
  whatsapp: string;
  logo: string;
  subscription_status: 'active' | 'inactive' | 'canceled';
}

export interface Job {
  id: number;
  company_id: number;
  company_name?: string;
  company_logo?: string;
  company_whatsapp?: string;
  title: string;
  cbo_code: string;
  cbo_name: string;
  description: string;
  requirements: string;
  location: string;
  type: string;
  work_model: string;
  salary: string;
  deadline: string;
  status: 'active' | 'closed';
  created_at: string;
  candidatesCount?: number;
}

export interface Candidate {
  id: number;
  job_id: number;
  name: string;
  phone: string;
  email: string;
  linkedin?: string;
  resume_url: string;
  message: string;
  created_at: string;
}

export interface Interview {
  id: number;
  candidate_id: number;
  date: string;
  time: string;
  notes: string;
  created_at: string;
}

export interface CandidateProfile {
  id: string;
  name: string;
  email: string;
  whatsapp?: string;
  current_occupation?: string;
  availability?: string;
  resume_url?: string;
  linkedin?: string;
  about_me?: string;
  created_at: string;
}

export interface CBO {
  codigo: string;
  nome: string;
  sinonimos?: string;
}
