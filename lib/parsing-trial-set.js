export const TrialType = Object.freeze({
  initialGame: "initialGame",
  blank: "blank",
  image: "image",
});

export function parse(contents) {
  const trials = [
    {
      type: TrialType.initialGame,
    },
    {
      type: TrialType.blank,
    },
  ];
  trials.push({
    type: TrialType.image,
  });
  return trials;
}
