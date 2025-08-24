document.addEventListener("DOMContentLoaded", function () {
  const svgElement = document.querySelector("svg#map-layer");
  const popup = document.getElementById("popup");
  const originalOrder = Array.from(svgElement.children);

  let lastX = 0, lastY = 0;
  let activeAnchor = null;
  let cityData = {};
  let isHoveringPopup = false;

  fetch("cities.json")
    .then(response => response.json())
    .then(data => {
      cityData = data;
      console.log("✅ cityData loaded:", cityData);
      initializeMap();
    })
    .catch(error => {
      console.error("❌ 市町村データの読み込みに失敗しました:", error);
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

  popup.addEventListener("mouseenter", () => {
    isHoveringPopup = true;
  });

  popup.addEventListener("mouseleave", () => {
    isHoveringPopup = false;
    hidePopupIfNecessary();
  });

  function hidePopupIfNecessary() {
    if (!isHoveringPopup && !activeAnchor?.matches(":hover")) {
      popup.style.display = "none";
      activeAnchor = null;
    }
  }

  function initializeMap() {
    svgElement.querySelectorAll("a").forEach(function (anchor) {
      const group = anchor.querySelector("g");
      const prefId = anchor.id;

      if (!group) {
        console.warn(`⚠️ <g> not found inside <a id="${prefId}">`);
        return;
      }

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
        console.log(`📍 ${prefId} bbox center:`, centerX, centerY);

        group.style.transformOrigin = `${centerX}px ${centerY}px`;
        svgElement.appendChild(anchor);

        applyHoverEffect();

        const cities = cityData[prefId];
        console.log(`🔍 Hovered: ${prefId}`, cities);

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
        console.log("📦 popup.innerHTML:", popup.innerHTML);
        console.log("🎨 popup.style:", popup.style);

        activeAnchor = anchor;
      });

      group.addEventListener("mousemove", function (e) {
        lastX = e.pageX;
        lastY = e.pageY;
        console.log("🖱️ Mouse position:", lastX, lastY);
      });

      group.addEventListener("mouseleave", function () {
        setTimeout(() => {
          hidePopupIfNecessary();
          removeHoverEffect();

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
