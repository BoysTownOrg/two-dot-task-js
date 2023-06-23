import * as XLSX from "xlsx";

import jsPsychHtmlButtonResponse from "@jspsych/plugin-html-button-response";
import jsPsychImageButtonResponse from "@jspsych/plugin-image-button-response";
import jsPsychPreload from "@jspsych/plugin-preload";
import { JsPsych } from "jspsych";

import * as plugins from "./plugin.js";

function importAll(r): { [id: string]: string } {
  const imports: { [id: string]: string } = {};
  r.keys().forEach((key: string) => (imports[key] = r(key)));
  return imports;
}

function assetKey(filename: string): string {
  return `./${filename}`;
}

async function run(jsPsych: JsPsych) {
  const imagePaths = importAll(
    require.context("../assets/images/", false, /\.png$/)
  );
  const audioPaths = importAll(
    require.context("../assets/audio/", false, /\.wav$/)
  );
  const orderPath = importAll(require.context("../assets/", false, /\.xlsx$/));
  let response = await fetch(orderPath["./order.xlsx"]);
  let buffer = await response.arrayBuffer();
  const order = XLSX.utils.sheet_to_json(XLSX.read(buffer).Sheets["Day 1"]);
  const standardImageHeightPixels = 400;
  const bottomRightButtonHTML =
    '<button class="jspsych-btn" style="position: absolute; bottom: 5%; right: 5%">%choice%</button>';
  const trials = [];
  for (const trial of order) {
    console.log(trial);
    console.log(trial["Task"]);
    console.log(trial["WAV filename audio - 0SNR"]);
    console.log(trial["image files"]);
    const imageFileName = trial["image files"];
    trials.push({
      type: jsPsychImageButtonResponse,
      stimulus: imagePaths[assetKey(imageFileName)],
      stimulus_height: standardImageHeightPixels,
      choices: ["Continue"],
      prompt: "",
      button_html: bottomRightButtonHTML,
    });
  }
  jsPsych.run([
    {
      type: jsPsychPreload,
      auto_preload: true,
    },
    {
      type: jsPsychHtmlButtonResponse,
      stimulus: 'Press "Start" when ready.',
      choices: ["Start"],
      button_html: bottomRightButtonHTML,
    },
    ...trials,
    {
      type: jsPsychHtmlButtonResponse,
      stimulus: 'The test is done. Press "Finish" to complete. Thank you.',
      choices: ["Finish"],
      button_html: bottomRightButtonHTML,
    },
  ]);
}

export function selectConditionBeforeRunning(jsPsych: JsPsych) {
  const page = document.createElement("div");
  document.body.append(page);
  const topOfPage = document.createElement("div");
  page.append(topOfPage);
  const conditionLabel = document.createElement("label");
  topOfPage.append(conditionLabel);
  conditionLabel.textContent = "Condition";
  const conditionSelect = document.createElement("select");
  conditionLabel.append(conditionSelect);
  const zeroSNR = document.createElement("option");
  conditionSelect.append(zeroSNR);
  zeroSNR.textContent = "0SNR";
  const confirmButton = document.createElement("button");
  page.append(confirmButton);
  confirmButton.textContent = "Confirm";
  confirmButton.addEventListener("click", () => {
    document.body.removeChild(page);
    run(jsPsych);
  });
}
