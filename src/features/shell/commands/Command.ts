export interface Command {
  name: string;
  description: string;
  execute(args: string[]): Promise<void>;
}
