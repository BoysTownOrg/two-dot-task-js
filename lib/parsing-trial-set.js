export const TrialType = Object.freeze({
  initialGame: "initialGame",
  blank: "blank",
});

export function parse(contents) {
  return [
    {
      type: TrialType.initialGame,
    },
    {
      type: TrialType.blank,
    },
  ];
}
