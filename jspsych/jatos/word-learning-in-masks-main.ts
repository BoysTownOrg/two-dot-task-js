import { selectConditionBeforeRunning } from "../word-learning-in-masks";

import { initJsPsych } from "jspsych";

declare const jatos: any;

jatos.onLoad(() => {
  const jsPsych = initJsPsych({
    on_finish: () => jatos.endStudy(jsPsych.data.get().json()),
  });
  selectConditionBeforeRunning(jsPsych);
});
