document.addEventListener("DOMContentLoaded", function () {
  const svgElement = document.querySelector("svg#map-layer");
  const popup = document.getElementById("popup");
  const originalOrder = Array.from(svgElement.children);

  let lastX = 0, lastY = 0;
  let activeAnchor = null;
  let cityData = {};

  fetch("cities.json")
    .then(response => response.json())
    .then(data => {
      cityData = data;
      initializeMap();
    })
    .catch(error => {
      console.error("市町村データの読み込みに失敗しました:", error);
      initializeMap();
    });

  function updatePopup() {
    if (popup.style.display === "block") {
      popup.style.left = `${lastX}px`;
      popup.style.top = `${lastY}px`;
    }
    requestAnimationFrame(updatePopup);
  }
  updatePopup();

  function initializeMap() {
    svgElement.querySelectorAll("a").forEach(function (anchor) {
      const group = anchor.querySelector("g");
      const prefId = anchor.id;

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
        activeAnchor = anchor;
      });

      group.addEventListener("mousemove", function (e) {
        lastX = e.pageX;
        lastY = e.pageY;
      });

      group.addEventListener("mouseleave", function () {
        // ポップアップがマウス上にある場合は消さない
        setTimeout(() => {
          if (!popup.matches(":hover")) {
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
          }
        }, 200); // 少し遅延させて hover 判定できるように
      });

      group.addEventListener("click", function () {
        window.location.href = `${prefId}.html`;
      });
    });
  }
});
