document.addEventListener("DOMContentLoaded", function () {
  const svgElement = document.querySelector("svg#map-layer");
  const popup = document.getElementById("popup");
  const originalOrder = Array.from(svgElement.children);

  let lastX = 0, lastY = 0;
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
    if (popup.style.display === "block" && activeAnchor) {
      const bbox = activeAnchor.querySelector("g").getBBox();
      popup.style.left = `${bbox.x + bbox.width + 10}px`;
      popup.style.top = `${bbox.y + bbox.height / 2}px`;
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
        if (activeAnchor) {
          removeHoverEffect(activeAnchor.querySelector("g"));
          activeAnchor = null;
        }
      }
    }, 150);
  }

  function applyHoverEffect(group) {
    group.style.transition = "transform 0.2s ease";
    group.style.transform = "scale(1.05)";
    group.style.filter = "brightness(1.2)";
  }

  function removeHoverEffect(group) {
    group.style.transform = "scale(1)";
    group.style.filter = "brightness(1)";
  }

  function initializeMap() {
    svgElement.querySelectorAll("a").forEach(function (anchor) {
      const group = anchor.querySelector("g");
      const prefId = anchor.id;
      if (!group) return;

      group.addEventListener("mouseenter", function (e) {
        isHoveringAnchor = true;

        if (activeAnchor === anchor && popup.style.display === "block") return;

        activeAnchor = anchor;

        const bbox = group.getBBox();
        group.style.transformOrigin = "center center";

        svgElement.appendChild(anchor);
        applyHoverEffect(group);

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
      });

      group.addEventListener("click", function () {
        window.location.href = `${prefId}.html`;
      });
    });
  }
});
