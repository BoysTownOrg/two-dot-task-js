import { selectConditionBeforeRunning } from "../word-learning-in-noise-2";

import { initJsPsych } from "jspsych";

declare const jatos: any;

jatos.onLoad(() => {
  const jsPsych = initJsPsych({
    on_finish: () => jatos.endStudy(jsPsych.data.get().json()),
  });
  selectConditionBeforeRunning(jsPsych);
});
