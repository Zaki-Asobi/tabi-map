<script>
document.addEventListener("DOMContentLoaded", function () {
  const svgElement = document.querySelector("svg#map-layer");
  const popup = document.getElementById("popup");
  const originalOrder = Array.from(svgElement.children);

  let lastX = 0, lastY = 0;
  let activeAnchor = null;
  let cityData = {}; // 外部JSONを格納する変数

  //  外部JSON読み込み
  fetch("cities.json")
    .then(response => response.json())
    .then(data => {
      cityData = data;
      initializeMap(); // 読み込み後に地図イベントを設定
    })
    .catch(error => {
      console.error("市町村データの読み込みに失敗しました:", error);
      initializeMap(); // データなしでも最低限の挙動は維持
    });

  //  ポップアップ位置を滑らかに更新
  function updatePopup() {
    if (popup.style.display === "block") {
      popup.style.left = `${lastX}px`;
      popup.style.top = `${lastY}px`;
    }
    requestAnimationFrame(updatePopup);
  }
  updatePopup();

  //  地図イベント設定（cityData読み込み後に呼び出す）
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

        //  ポップアップ内容生成（都道府県名＋市町村リンク）
        let html = `<strong>${prefId}</strong>`;
        const cities = cityData[prefId];
        if (cities && cities.length > 0) {
          html += "<ul>";
          cities.forEach(city => {
            html += `<li><a href="${city.url}" target="_blank">${city.name}</a></li>`;
          });
          html += "</ul>";
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
  }
});
</script>
