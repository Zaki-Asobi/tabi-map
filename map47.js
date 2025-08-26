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
    if (popup.style.display === "block") {
      popup.style.left = `${lastX}px`;
      popup.style.top = `${lastY + 20}px`; // カーソルの下に余白
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
        activeAnchor = null;
      }
    }, 150);
  }

  function initializeMap() {
    svgElement.querySelectorAll("a").forEach(function (anchor) {
      const group = anchor.querySelector("g");
      const prefId = anchor.id;

      if (!group) return;

      function applyHoverEffect() {
        group.style.transition = "transform 0.2s ease";
        group.style.transform = "scale(1.05)";
      }

      function removeHoverEffect() {
        group.style.transform = "scale(1)";
      }

group.addEventListener("mouseenter", function (e) {
  isHoveringAnchor = true;

  // カーソル位置を記録（初回のみ）
  lastX = e.pageX;
  lastY = e.pageY;

  // 同じ都道府県でポップアップが表示中なら再描画しない
  if (activeAnchor === anchor && popup.style.display === "block") return;

  activeAnchor = anchor;

  const bbox = group.getBBox();
  const centerX = bbox.x + bbox.width / 2;
  const centerY = bbox.y + bbox.height / 2;
  group.style.transformOrigin = `${centerX}px ${centerY}px`;

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

  // ポップアップ内容が同じなら再描画しない
  if (popup.innerHTML === html && popup.style.display === "block") return;

  popup.innerHTML = html;
  popup.style.display = "block";
});


      group.addEventListener("mouseleave", function () {
        isHoveringAnchor = false;

        setTimeout(() => {
          checkHidePopup();
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
