import { Tag } from '../';

export class TagSimilarity {
  constructor(
    public from: Tag,
    public to: Tag,
    public similarity: number
  ) {}
}
