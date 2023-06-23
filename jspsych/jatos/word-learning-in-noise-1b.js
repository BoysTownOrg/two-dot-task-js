import { selectConditionBeforeRunning } from "../word-learning-in-noise-1b.ts";

import { initJsPsych } from "jspsych";

jatos.onLoad(() => {
  const jsPsych = initJsPsych({
    on_finish: () => jatos.endStudy(jsPsych.data.get().json()),
  });
  selectConditionBeforeRunning(jsPsych);
});
