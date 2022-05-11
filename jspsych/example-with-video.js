import { selectConditionBeforeRunning } from "./word-learning-in-masks.js";

function main() {
  const jsPsych = initJsPsych();
  selectConditionBeforeRunning(jsPsych);
}

main();
