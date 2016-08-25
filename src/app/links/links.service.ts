import { LinksSection } from './links-section';

const links = require('./links-data.yaml');

export class LinksService {
  private sections: LinksSection[] = links;

  getSections() {
    return this.sections;
  }
}
