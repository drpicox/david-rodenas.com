/** "When this scanner read `reading`, this motor did `move`, and the robot got closer." */
export interface Rule {
  readonly reading: number;
  readonly move: number;
}
