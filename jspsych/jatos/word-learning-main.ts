import { selectConditionBeforeRunning } from "../task";

import { initJsPsych } from "jspsych";

declare const jatos: any;

jatos.onLoad(() => {
  const jsPsych = initJsPsych({
    on_finish: () => jatos.endStudy(jsPsych.data.get().json()),
  });
  selectConditionBeforeRunning(jsPsych);
});
