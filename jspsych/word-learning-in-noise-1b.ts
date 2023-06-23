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

export function selectConditionBeforeRunning(jsPsych) {
  const images = importAll(
    require.context("../assets/images/", true, /\.png$/)
  );
  const audio = importAll(require.context("../assets/audio/", true, /\.wav$/));
  const page = createChildElement(document.body, "div");
  const conditionLabel = createChildElement(
    createChildElement(page, "div"),
    "label"
  );
  conditionLabel.textContent = "Condition";
  const conditionSelect = createChildElement(conditionLabel, "select");
  const confirmButton = createChildElement(page, "button");
  confirmButton.textContent = "Confirm";
  confirmButton.addEventListener("click", () => {});
}
