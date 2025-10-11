export interface Experience {
  kind?: string;
  title: string;
  role: string;
  city: string;
  industry: string;
  company: string;
  country: string;
  from: string;
  to: string;
  isCurrent: boolean;
}

export interface IExperience extends Experience {
  id: string;
}
