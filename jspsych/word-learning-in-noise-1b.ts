import * as XLSX from "xlsx";

import "jspsych/css/jspsych.css";

function importAll(r) {
  const cache = {};
  r.keys().forEach((key) => (cache[key] = r(key)));
  return cache;
}

function createChildElement(parent, tag) {
  const child = document.createElement(tag);
  parent.append(child);
  return child;
}

async function run() {
  const images = importAll(
    require.context("../assets/images/", false, /\.png$/)
  );
  const audio = importAll(require.context("../assets/audio/", false, /\.wav$/));
  const orders = importAll(require.context("../assets/", false, /\.xlsx$/));
  let response = await fetch(orders["./order.xlsx"]);
  let buffer = await response.arrayBuffer();
  const f = XLSX.read(buffer);
  console.log(f);
}

export function selectConditionBeforeRunning(jsPsych) {
  const page = createChildElement(document.body, "div");
  const conditionLabel = createChildElement(
    createChildElement(page, "div"),
    "label"
  );
  conditionLabel.textContent = "Condition";
  const conditionSelect = createChildElement(conditionLabel, "select");
  const confirmButton = createChildElement(page, "button");
  confirmButton.textContent = "Confirm";
  confirmButton.addEventListener("click", () => {
    run();
  });
}
