document.addEventListener("DOMContentLoaded", function () {
  const svgElement = document.querySelector("svg#map-layer");
  const popup = document.getElementById("popup");
  const originalOrder = Array.from(svgElement.children);

  let popupX = 0, popupY = 0;
  let activeAnchor = null;
  let cityData = {};
  let isHoveringPopup = false;
  let isHoveringAnchor = false;

  fetch("cities.json")
    .then(response => response.json())
    .then(data => {
      cityData = data;
      initializeMap();
    })
    .catch(() => {
      initializeMap();
    });

  function updatePopupPosition() {
    if (popup.style.display === "block") {
      popup.style.left = `${popupX}px`;
      popup.style.top = `${popupY - 60}px`;
    }
    requestAnimationFrame(updatePopupPosition);
  }
  updatePopupPosition();

  popup.addEventListener("mouseenter", () => {
    isHoveringPopup = true;
  });

  popup.addEventListener("mouseleave", () => {
    isHoveringPopup = false;
    checkHidePopup();
  });

  function checkHidePopup() {
    setTimeout(() => {
      if (!isHoveringAnchor && !isHoveringPopup) {
        popup.style.display = "none";
        removeAllHoverEffects();
        activeAnchor = null;
      }
    }, 150);
  }

  function removeAllHoverEffects() {
    svgElement.querySelectorAll("g.hovering").forEach(g => {
      g.style.transform = "scale(1)";
      g.classList.remove("hovering");
    });
  }

  function initializeMap() {
    svgElement.querySelectorAll("a").forEach(function (anchor) {
      const group = anchor.querySelector("g");
      const prefId = anchor.id;
      if (!group) return;

      function applyHoverEffect() {
        const bbox = group.getBBox();
        const centerX = bbox.x + bbox.width / 2;
        const centerY = bbox.y + bbox.height / 2;
        group.style.transformOrigin = `${centerX}px ${centerY}px`;
        group.style.transform = "scale(1.05)";
        group.classList.add("hovering");
      }

      function removeHoverEffect(group) {
        group.style.transform = "scale(1)";
        group.classList.remove("hovering");
      }

      group.addEventListener("mouseover", function (e) {
        if (activeAnchor === anchor) return;

        isHoveringAnchor = true;

        // 前の都道府県の拡大解除
        if (activeAnchor && activeAnchor !== anchor) {
          const prevGroup = activeAnchor.querySelector("g");
          if (prevGroup) removeHoverEffect(prevGroup);
        }

        activeAnchor = anchor;

        popupX = e.pageX;
        popupY = e.pageY;

        svgElement.appendChild(anchor);
        applyHoverEffect();

        const cities = cityData[prefId];
        let html = `<strong>${prefId}</strong>`;
        if (Array.isArray(cities) && cities.length > 0) {
          html += "<ul>";
          cities.forEach(city => {
            html += `<li><a href="${city.url}" target="_blank">${city.name}</a></li>`;
          });
          html += "</ul>";
        } else {
          html += "<p>市町村データが見つかりません</p>";
        }

        popup.innerHTML = html;
        popup.style.display = "block";
      });

      group.addEventListener("mouseleave", function () {
        isHoveringAnchor = false;
        checkHidePopup();

        setTimeout(() => {
          const originalIndex = originalOrder.indexOf(anchor);
          svgElement.removeChild(anchor);
          if (originalIndex >= 0 && originalIndex < svgElement.children.length) {
            svgElement.insertBefore(anchor, svgElement.children[originalIndex]);
          } else {
            svgElement.appendChild(anchor);
          }
        }, 100);
      });

      group.addEventListener("click", function () {
        window.location.href = `${prefId}.html`;
      });
    });
  }
});
