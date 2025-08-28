document.addEventListener("DOMContentLoaded", function () {
  const svgElement = document.querySelector("svg#map-layer");
  const popup = document.getElementById("popup");
  let activeAnchor = null;
  let hideTimeout = null;
//こめんと
  function showPopup(anchor, group) {
    const bbox = group.getBBox();
    const svgRect = svgElement.getBoundingClientRect();

    const pageX = svgRect.left + bbox.x + bbox.width * 0.8;
    const pageY = svgRect.top + bbox.y - bbox.height * 0.3;

    popup.innerHTML = `<strong>${anchor.id}</strong>`;
    popup.style.left = `${pageX}px`;
    popup.style.top = `${pageY}px`;
    popup.style.display = "block";

    activeAnchor = anchor;

    group.style.transition = "transform 0.2s ease";
    group.style.transform = "scale(1.05)";
    const path = group.querySelector("path.pref-line");
    if (path) {
      path.style.fill = "#87c89b";
      path.style.stroke = "#005c1c";
      path.style.strokeWidth = "2px";
    }
  }

  function hidePopup() {
    if (activeAnchor) {
      const group = activeAnchor.querySelector("g");
      group.style.transform = "scale(1)";
      const path = group.querySelector("path.pref-line");
      if (path) {
        path.style.fill = "#c9efc8";
        path.style.stroke = "#ffffff";
        path.style.strokeWidth = "1px";
      }
    }
    popup.style.display = "none";
    activeAnchor = null;
  }

  svgElement.querySelectorAll("a").forEach(function (anchor) {
    const group = anchor.querySelector("g");

    group.addEventListener("mouseenter", () => {
      clearTimeout(hideTimeout);
      showPopup(anchor, group);
    });

    group.addEventListener("mouseleave", () => {
      hideTimeout = setTimeout(hidePopup, 300);
    });

    group.addEventListener("click", () => {
      window.location.href = `${anchor.id}.html`;
    });
  });

  popup.addEventListener("mouseenter", () => {
    clearTimeout(hideTimeout);
  });

  popup.addEventListener("mouseleave", () => {
    hideTimeout = setTimeout(hidePopup, 300);
  });
});
