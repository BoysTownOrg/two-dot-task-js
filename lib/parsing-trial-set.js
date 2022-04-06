export const TrialType = Object.freeze({
  initialGame: "initialGame",
});

export function parse(contents) {
  return [
    {
      type: TrialType.initialGame,
    },
  ];
}
