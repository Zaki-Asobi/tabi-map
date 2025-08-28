document.addEventListener("DOMContentLoaded", function () {
  const svgElement = document.querySelector("svg#map-layer");
  const popup = document.getElementById("popup");
  const originalOrder = Array.from(svgElement.children);

  let lastX = 0, lastY = 0;
  let activeAnchor = null;

  // ポップアップ位置を滑らかに更新
  function updatePopup() {
    if (popup.style.display === "block") {
      popup.style.left = `${lastX}px`;
      popup.style.top = `${lastY}px`;
    }
    requestAnimationFrame(updatePopup);
  }
  updatePopup();

  svgElement.querySelectorAll("a").forEach(function (anchor) {
    const group = anchor.querySelector("g");
    const prefId = anchor.id;

    // 視覚効果：拡大と色変更（CSSで補完）
    function applyHoverEffect() {
      group.style.transition = "transform 0.2s ease";
      group.style.transform = "scale(1.05)";
    }

    function removeHoverEffect() {
      group.style.transform = "scale(1)";
    }

    group.addEventListener("mouseenter", function () {
      const bbox = group.getBBox();
      const centerX = bbox.x + bbox.width / 2;
      const centerY = bbox.y + bbox.height / 2;
      group.style.transformOrigin = `${centerX}px ${centerY}px`;
      svgElement.appendChild(anchor);

      applyHoverEffect();

      // ポップアップ内容（今は都道府県名のみ）
      popup.innerHTML = `<strong>${prefId}</strong>`;
      popup.style.display = "block";
      activeAnchor = anchor;
    });

    group.addEventListener("mousemove", function (e) {
      lastX = e.pageX;
      lastY = e.pageY;
    });

    group.addEventListener("mouseleave", function () {
      popup.style.display = "none";
      activeAnchor = null;
      removeHoverEffect();

      const originalIndex = originalOrder.indexOf(anchor);
      svgElement.removeChild(anchor);
      if (originalIndex >= 0 && originalIndex < svgElement.children.length) {
        svgElement.insertBefore(anchor, svgElement.children[originalIndex]);
      } else {
        svgElement.appendChild(anchor);
      }
    });

    group.addEventListener("click", function () {
      window.location.href = `${prefId}.html`;
    });
  });
});
