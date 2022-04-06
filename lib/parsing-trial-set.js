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
  const lines = contents.split("\n");
  for (const line of lines) {
    const csvEntries = line.split(",");
    if (csvEntries.length >= 7) {
      if (csvEntries[0] === "Repetition")
        trials.push({
          type: TrialType.image,
          imageFileName: csvEntries[6],
        });
    }
  }

  return trials;
}
