function addEventListener(element, event, f) {
  element.addEventListener(event, f);
}

export function addClickEventListener(element, f) {
  addEventListener(element, "click", f);
}

export function divElement() {
  return document.createElement("div");
}

export function pixelsString(a) {
  return `${a}px`;
}

export function adopt(parent, child) {
  parent.append(child);
}

export function clear(parent) {
  // https://stackoverflow.com/a/3955238
  while (parent.firstChild) {
    parent.removeChild(parent.lastChild);
  }
}

function gridTemplate(n) {
  return `repeat(${n}, 1fr)`;
}

export function grid(rows, columns) {
  const grid_ = divElement();
  grid_.style.display = "grid";
  grid_.style.gridTemplateRows = gridTemplate(rows);
  grid_.style.gridTemplateColumns = gridTemplate(columns);
  grid_.style.gridGap = `${pixelsString(20)} ${pixelsString(20)}`;
  return grid_;
}
