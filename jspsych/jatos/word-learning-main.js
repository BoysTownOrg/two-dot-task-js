import { selectConditionBeforeRunning } from "../task.js";

import { initJsPsych } from "jspsych";

jatos.onLoad(() => {
  const jsPsych = initJsPsych({
    on_finish: () => jatos.endStudy(jsPsych.data.get().json()),
  });
  selectConditionBeforeRunning(jsPsych);
});
