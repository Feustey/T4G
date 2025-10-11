export interface Annotation {
  kind: string;
  name: string;
  category: string;
  description: string;
  label: string;
  value: string;
}

export interface IAnnotation extends Annotation {
  id: string;
}
