export type Speaker = 'user' | 'model';

export interface TranscriptEntry {
  speaker: Speaker;
  text: string;
  imageUrl?: string;
  isPending?: boolean;
}