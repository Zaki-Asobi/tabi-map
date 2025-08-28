document.addEventListener("DOMContentLoaded", function () {
  const svgElement = document.querySelector("svg#map-layer");
  const popup = document.getElementById("popup");
  const originalOrder = Array.from(svgElement.children);
  let activeAnchor = null;
  let hideTimeout = null;

  function showPopup(anchor, group) {
    const bbox = group.getBBox();
    const svgRect = svgElement.getBoundingClientRect();

    const pageX = svgRect.left + bbox.x + bbox.width * 0.8;
    const pageY = svgRect.top + bbox.y - bbox.height * 0.2;

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

      const originalIndex = originalOrder.indexOf(activeAnchor);
      svgElement.removeChild(activeAnchor);
      if (originalIndex >= 0 && originalIndex < svgElement.children.length) {
        svgElement.insertBefore(activeAnchor, svgElement.children[originalIndex]);
      } else {
        svgElement.appendChild(activeAnchor);
      }
    }

    popup.style.display = "none";
    activeAnchor = null;
  }

  svgElement.querySelectorAll("a").forEach(function (anchor) {
    const group = anchor.querySelector("g");

    group.addEventListener("mouseenter", () => {
      clearTimeout(hideTimeout);
      const bbox = group.getBBox();
      const centerX = bbox.x + bbox.width / 2;
      const centerY = bbox.y + bbox.height / 2;
      group.style.transformOrigin = `${centerX}px ${centerY}px`;
      svgElement.appendChild(anchor); // bring to front
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
