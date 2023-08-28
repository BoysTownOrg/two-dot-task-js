import { selectConditionBeforeRunning } from "../word-learning-in-noise-1b";

import { initJsPsych } from "jspsych";

import "jspsych/css/jspsych.css";

declare const jatos: any;

jatos.onLoad(() => {
  const jsPsych = initJsPsych({
    on_finish: () => jatos.endStudy(jsPsych.data.get().json()),
  });
  selectConditionBeforeRunning(jsPsych);
});
