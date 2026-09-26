export type AppraisalRating = 'Exceeds' | 'Improve' | 'Meets';

export type Appraisal = Readonly<{
  dept: string;
  employee: string;
  id: string;
  period: string;
  rating: AppraisalRating;
  reviewer: string;
  score: number;
}>;
