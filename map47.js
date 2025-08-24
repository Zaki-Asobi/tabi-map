document.addEventListener("DOMContentLoaded", function () {
  const svgElement = document.querySelector("svg#map-layer");
  const popup = document.getElementById("popup");
  let cityData = {};
  let activeAnchor = null;
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

  function updatePopupPosition(anchor) {
    if (!anchor || popup.style.display !== "block") return;
    const rect = anchor.getBoundingClientRect();
    const offsetY = 10; // 都道府県のすぐ上に表示
    popup.style.left = `${rect.left + rect.width / 2}px`;
    popup.style.top = `${rect.top - offsetY}px`;
  }

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
    if (!group) return;
    group.style.transition = "transform 0.2s ease";
    group.style.transform = "scale(1.05)";
    group.style.filter = "brightness(1.2)";
  }

  function removeHoverEffect(group) {
    if (!group) return;
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

        if (activeAnchor && activeAnchor !== anchor) {
          removeHoverEffect(activeAnchor.querySelector("g"));
        }

        activeAnchor = anchor;
        applyHoverEffect(group);

        const cities = cityData[prefId];
        if (!Array.isArray(cities) || cities.length === 0) {
          popup.style.display = "none";
          return;
        }

        let html = `<strong>${prefId}</strong><ul>`;
        cities.forEach(city => {
          html += `<li><a href="${city.url}" target="_blank">${city.name}</a></li>`;
        });
        html += "</ul>";

        popup.innerHTML = html;
        popup.style.display = "block";
        updatePopupPosition(anchor);
      });

      group.addEventListener("mouseleave", function () {
        isHoveringAnchor = false;
        checkHidePopup();
      });

      anchor.addEventListener("click", function () {
        window.location.href = `${prefId}.html`;
      });
    });
  }
});
