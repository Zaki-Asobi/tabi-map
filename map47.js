document.addEventListener("DOMContentLoaded", function () {
  const svgElement = document.querySelector("svg#map-layer");
  const popup = document.getElementById("popup");

  let lastX = 0, lastY = 0;
  let activeAnchor = null;
  let currentPrefId = null; //現在表示中の都道府県ID
  let cityData = {};
  let isHoveringPopup = false;
  let isHoveringAnchor = false;
  let hideTimer = null;

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
      popup.style.top = `${lastY + 20}px`;
    }
    requestAnimationFrame(updatePopupPosition);
  }
  updatePopupPosition();

  //ポップアップのホバー状態
  popup.addEventListener("pointerenter", () => {
    isHoveringPopup = true;
    clearTimeout(hideTimer);
  });
  popup.addEventListener("pointerleave", () => {
    isHoveringPopup = false;
    scheduleHide();
  });

  function scheduleHide() {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      if (!isHoveringAnchor && !isHoveringPopup) {
        popup.style.display = "none";
        activeAnchor = null;
        currentPrefId = null; // ロック解除
      }
    }, 140); // 少し短めにしてチラつき軽減
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

      // 入った瞬間に内容を作る。ただし同じ都道府県なら再描画しない
      anchor.addEventListener("pointerenter", function (e) {
        isHoveringAnchor = true;
        lastX = e.pageX;
        lastY = e.pageY;

        if (currentPrefId === prefId && popup.style.display === "block") {
          // 位置だけ追従して、内容は更新しない
          activeAnchor = anchor;
          return;
        }

        activeAnchor = anchor;
        currentPrefId = prefId; // ロック

        // transform-origin を安定させる（DOM移動はしない）
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
            html += `<li><a href="${city.url}" target="_blank" rel="noopener noreferrer">${city.name}</a></li>`;
          });
          html += "</ul>";
        } else {
          html += "<p>市町村データが見つかりません</p>";
        }

        popup.innerHTML = html;
        popup.style.display = "block";
      });

      // 移動中は座標だけ更新
      anchor.addEventListener("pointermove", function (e) {
        if (activeAnchor === anchor) {
          lastX = e.pageX;
          lastY = e.pageY;
        }
      });

      // 出たら遅延で非表示を検討（ポップアップ上なら維持）
      anchor.addEventListener("pointerleave", function () {
        isHoveringAnchor = false;
        removeHoverEffect();
        scheduleHide();
      });

      // クリック遷移は従来通り
      group.addEventListener("click", function () {
        window.location.href = `${prefId}.html`;
      });
    });
  }
});
