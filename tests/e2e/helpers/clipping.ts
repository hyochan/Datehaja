// Serialized by page.evaluate: keep this function independent of module state.
export function horizontalClipping() {
  const scrollableAncestor = (el: Element) => {
    for (let parent = el.parentElement; parent; parent = parent.parentElement) {
      const style = getComputedStyle(parent);
      if (
        (style.overflowX === "auto" || style.overflowX === "scroll") &&
        parent.scrollWidth > parent.clientWidth + 2
      ) return true;
    }
    return false;
  };
  const lostWidth = (box: DOMRect, el: Element, text = false) => {
    let left = Math.max(box.left, 0);
    let right = Math.min(box.right, window.innerWidth);
    // Text must fit inside its button even when the button box itself fits.
    if (text) {
      const control = el.getBoundingClientRect();
      left = Math.max(left, control.left);
      right = Math.min(right, control.right);
    }
    for (let parent = el.parentElement; parent; parent = parent.parentElement) {
      if (getComputedStyle(parent).overflowX !== "visible") {
        const clip = parent.getBoundingClientRect();
        left = Math.max(left, clip.left + parent.clientLeft);
        right = Math.min(right, clip.left + parent.clientLeft + parent.clientWidth);
      }
    }
    return box.width - Math.max(0, right - left);
  };
  const lost: string[] = [];
  document.querySelectorAll(
    "h1,h2,h3,h4,h5,h6,p,li,button,a[href],label,input,select,textarea,figcaption",
  ).forEach((el) => {
    const box = el.getBoundingClientRect();
    if (!box.width || !box.height || scrollableAncestor(el)) return;
    let missing = lostWidth(box, el);
    if (el.tagName === "BUTTON") {
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        if (!node.textContent?.trim()) continue;
        const range = document.createRange();
        range.selectNodeContents(node);
        for (const rect of range.getClientRects()) {
          missing = Math.max(missing, lostWidth(rect, el, true));
        }
      }
    }
    if (missing > 4) lost.push(
      `${el.tagName} "${(el.textContent ?? "").trim().slice(0, 40)}" loses ${Math.round(missing)}px`,
    );
  });
  return lost;
}
