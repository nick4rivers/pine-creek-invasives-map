(function () {
  "use strict";
  var SP = window.SPECIES, GR = window.GROUPS;
  var fmt = function (n, d) { return Number(n).toLocaleString("en-US", { maximumFractionDigits: d == null ? 0 : d, minimumFractionDigits: d == null ? 0 : d }); };
  var ac = function (a) { return a < 0.1 ? "<0.1" : a < 10 ? fmt(a, 1) : fmt(a); };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var median = function (arr) { var a = arr.filter(function (x) { return x != null; }).sort(function (x, y) { return x - y; }); if (!a.length) return null; var m = Math.floor(a.length / 2); return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2; };

  // ---- Stats per species, computed from the data ----
  var feats = window.INVASIVES.features;
  var stats = {};
  feats.forEach(function (f) {
    var p = f.properties, s = stats[p.sci] || (stats[p.sci] = { n: 0, acres: 0, net: 0, covers: [], feats: [] });
    s.n++; s.acres += p.acres; s.net += p.acres * (p.infested == null ? 100 : p.infested) / 100;
    s.covers.push(p.cover); s.feats.push(f);
  });
  Object.keys(stats).forEach(function (k) { stats[k].cover = median(stats[k].covers); });
  var order = Object.keys(stats).sort(function (a, b) { return stats[b].acres - stats[a].acres; });
  var totalAc = order.reduce(function (t, k) { return t + stats[k].acres; }, 0);

  document.getElementById("st-miles").textContent = fmt(window.SURVEY.track_miles);
  document.getElementById("st-swath").textContent = fmt(window.SURVEY.swath_acres);
  document.getElementById("st-n").textContent = fmt(feats.length);
  document.getElementById("st-ac").textContent = fmt(totalAc);

  // ---- Map ----
  var map = L.map("map", { zoomControl: true, preferCanvas: false });
  map.attributionControl.setPrefix('<a href="https://leafletjs.com">Leaflet</a>');
  var basemaps = {
    "Imagery": L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", { maxZoom: 19, attribution: "Imagery © Esri, Maxar, Earthstar Geographics" }),
    "USGS Topo": L.tileLayer("https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}", { maxZoom: 16, attribution: "USGS The National Map" }),
    "Terrain": L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", { maxZoom: 17, attribution: "© OpenStreetMap contributors, SRTM | © OpenTopoMap (CC-BY-SA)" })
  };
  var current = basemaps["Imagery"].addTo(map);
  var bmBox = document.getElementById("basemaps");
  Object.keys(basemaps).forEach(function (name) {
    var b = document.createElement("button");
    b.type = "button"; b.textContent = name; b.setAttribute("aria-pressed", name === "Imagery");
    b.onclick = function () {
      map.removeLayer(current); current = basemaps[name].addTo(map); current.bringToBack();
      bmBox.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
    };
    bmBox.appendChild(b);
  });
  L.control.scale({ imperial: true, metric: true, position: "bottomleft" }).addTo(map);

  // Coverage layers
  map.createPane("coverage"); map.getPane("coverage").style.zIndex = 350;
  var extent = L.geoJSON(window.EXTENT, { pane: "coverage", interactive: false, style: { color: "#fbfaf2", weight: 2, dashArray: "6 5", fill: false, opacity: .9 } });
  var swath = L.geoJSON(window.SWATH, { pane: "coverage", interactive: false, style: { color: "#2f7f8f", weight: 0, fillColor: "#3fa3b5", fillOpacity: .28 } });
  var tracks = L.geoJSON(window.TRACKS, { pane: "coverage", interactive: false, style: { color: "#f2f0e6", weight: 1.2, opacity: .85 } });
  extent.addTo(map); swath.addTo(map);

  var layersBox = document.getElementById("layers");
  [["extent", "Survey area outline", extent, true], ["swath", "Ground searched (±25 m of tracks)", swath, true], ["tracks", "GPS tracks (" + fmt(window.SURVEY.track_miles) + " mi)", tracks, false]].forEach(function (d) {
    var id = "lyr-" + d[0];
    var lab = document.createElement("label");
    lab.innerHTML = '<input type="checkbox" id="' + id + '"' + (d[3] ? " checked" : "") + '><span class="key ' + d[0] + '"></span>' + esc(d[1]);
    lab.querySelector("input").onchange = function (e) { if (e.target.checked) d[2].addTo(map); else map.removeLayer(d[2]); };
    layersBox.appendChild(lab);
  });

  // Invasive polygons + centroid dots so tiny patches stay visible when zoomed out
  var spLayers = {};
  function popupHtml(p) {
    var s = SP[p.sci] || {};
    var rows = [
      ["Mapped area", ac(p.acres) + " ac"],
      ["Area infested", p.infested != null ? fmt(p.infested) + "%" : "–"],
      ["Canopy cover", p.cover != null ? fmt(p.cover) + "%" : "–"],
      ["Pattern", p.dist || "–"],
      ["Count", p.count ? esc(p.count) + " " + esc((p.count_uom || "").toLowerCase()) : "–"],
      ["Distance to water", p.water_ft != null ? fmt(p.water_ft) + " ft" : "–"],
      ["Elevation", p.elev ? fmt(p.elev) + " ft" : "–"],
      ["Surveyed", p.date],
      ["USGS quad", esc(p.quad)]
    ];
    return '<div class="pop-id">' + esc(p.id) + '</div><div class="pop-title">' + esc(p.common || s.common) + '</div><div class="pop-sci">' + esc(p.sci) + '</div>' +
      '<dl class="pop-grid">' + rows.map(function (r) { return "<dt>" + r[0] + "</dt><dd>" + r[1] + "</dd>"; }).join("") + "</dl>" +
      (p.notes ? '<p class="pop-notes">“' + esc(p.notes) + '”</p>' : "") +
      '<button type="button" class="pop-more" data-sci="' + esc(p.sci) + '">About ' + esc(p.common || s.common) + "</button>";
  }
  order.forEach(function (sci) {
    var color = (SP[sci] || {}).color || "#e04";
    var fc = { type: "FeatureCollection", features: stats[sci].feats };
    var poly = L.geoJSON(fc, {
      style: { color: color, weight: 2, fillColor: color, fillOpacity: .45, opacity: 1 },
      onEachFeature: function (f, l) { l.bindPopup(popupHtml(f.properties), { maxWidth: 300 }); }
    });
    var dots = L.layerGroup(stats[sci].feats.map(function (f) {
      var c = L.geoJSON(f).getBounds().getCenter();
      var r = Math.max(5, Math.min(14, 4 + Math.sqrt(f.properties.acres) * 1.2));
      return L.circleMarker(c, { radius: r, color: "#1b1b1b", weight: 1, fillColor: color, fillOpacity: .95 }).bindPopup(popupHtml(f.properties), { maxWidth: 300 });
    }));
    spLayers[sci] = { poly: poly, dots: dots, on: true };
  });

  function refreshDots() {
    var showDots = map.getZoom() <= 14;
    order.forEach(function (sci) {
      var L1 = spLayers[sci];
      if (L1.on) { if (!map.hasLayer(L1.poly)) L1.poly.addTo(map); }
      else map.removeLayer(L1.poly);
      if (L1.on && showDots) { if (!map.hasLayer(L1.dots)) L1.dots.addTo(map); }
      else map.removeLayer(L1.dots);
    });
  }
  map.on("zoomend", refreshDots);

  map.on("popupopen", function (e) {
    var b = e.popup.getElement().querySelector(".pop-more");
    if (b) b.onclick = function () { openSpecies(b.getAttribute("data-sci")); };
  });

  // ---- Legend ----
  var legend = document.getElementById("legend");
  var maxAc = stats[order[0]].acres;
  var groupsInOrder = [];
  order.forEach(function (sci) { var g = SP[sci].group; if (groupsInOrder.indexOf(g) < 0) groupsInOrder.push(g); });
  groupsInOrder.forEach(function (g) {
    var gl = document.createElement("div");
    gl.className = "group-label";
    gl.innerHTML = "<span>" + esc(GR[g].label) + '</span><button type="button">About group</button>';
    gl.querySelector("button").onclick = function () { openGroup(g); };
    legend.appendChild(gl);
    order.filter(function (sci) { return SP[sci].group === g; }).forEach(function (sci) {
      var s = SP[sci], st = stats[sci];
      var row = document.createElement("div");
      row.className = "sp-row";
      row.innerHTML =
        '<input type="checkbox" checked id="chk-' + s.code + '" aria-label="Show ' + esc(s.common) + ' on map">' +
        '<button type="button" class="sp-name"><span class="swatch" style="background:' + s.color + '"></span><span class="sp-text"><span class="sp-common">' + esc(s.common) + '</span><span class="sp-sci">' + esc(sci) + "</span></span></button>" +
        '<div class="sp-num"><b>' + st.n + "</b> · " + ac(st.acres) + ' ac<div class="bar"><i style="width:' + Math.max(2, 100 * st.acres / maxAc) + "%;background:" + s.color + '"></i></div></div>';
      row.querySelector("input").onchange = function (e) { spLayers[sci].on = e.target.checked; refreshDots(); syncAllBtn(); };
      row.querySelector(".sp-name").onclick = function () { openSpecies(sci); };
      legend.appendChild(row);
    });
  });
  var allBtn = document.getElementById("toggle-all");
  function syncAllBtn() { allBtn.textContent = order.some(function (k) { return spLayers[k].on; }) ? "Hide all" : "Show all"; }
  allBtn.onclick = function () {
    var turnOn = allBtn.textContent === "Show all";
    order.forEach(function (k) { spLayers[k].on = turnOn; document.getElementById("chk-" + SP[k].code).checked = turnOn; });
    refreshDots(); syncAllBtn();
  };

  // ---- Rare plants summary (no locations) ----
  var C = window.CONTEXT;
  document.getElementById("rare").innerHTML =
    '<ul class="rare-list">' + C.rare.map(function (r) {
      return '<li><span><span class="tag">' + r.list + "</span>" + esc(r.common) + " <i>" + esc(r.sci) + '</i></span><span class="n">' + r.n + " occ.</span></li>";
    }).join("") + C.si.map(function (r) {
      return '<li><span><span class="tag">SI</span>' + esc(r.common) + " <i>" + esc(r.sci) + '</i></span><span class="n">' + r.n + " occ.</span></li>";
    }).join("") + "</ul>" +
    '<p class="hint" style="margin-top:6px">TES: Forest Service threatened, endangered and sensitive. SI: Lassen NF species of interest.</p>';

  // ---- Species and group profile sheet ----
  var sheet = document.getElementById("sheet"), body = document.getElementById("sheet-body");
  document.getElementById("sheet-close").onclick = function () { sheet.hidden = true; };
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") sheet.hidden = true; });

  function openSpecies(sci) {
    var s = SP[sci], st = stats[sci], g = GR[s.group];
    body.innerHTML =
      '<div class="grp"><span class="swatch" style="background:' + s.color + '"></span>' + esc(g.label) + "</div>" +
      '<h2 id="sheet-title">' + esc(s.common) + '</h2><p class="sci">' + esc(sci) + "</p>" +
      '<div class="sheet-figs"><div><b>' + st.n + "</b><span>occurrences</span></div><div><b>" + ac(st.acres) + "</b><span>gross acres</span></div><div><b>" + ac(st.net) + "</b><span>net acres</span></div></div>" +
      "<dl>" +
      "<div><dt>In Pine Creek</dt><dd>" + esc(s.pine) + (st.cover != null ? " Median canopy cover across occurrences: " + fmt(st.cover) + "%." : "") + "</dd></div>" +
      "<div><dt>Ecology</dt><dd>" + esc(s.ecology) + "</dd></div>" +
      "<div><dt>Restoration relevance</dt><dd>" + esc(s.restoration) + "</dd></div>" +
      "<div><dt>Origin</dt><dd>" + esc(s.origin) + "</dd></div>" +
      "<div><dt>Growth form</dt><dd>" + esc(s.form) + "</dd></div>" +
      (s.calipc ? "<div><dt>Cal-IPC rating</dt><dd>" + esc(s.calipc) + "</dd></div>" : "") +
      "</dl>" +
      '<div class="sheet-actions"><button type="button" class="primary" id="zoom-sp">Zoom to occurrences</button><button type="button" id="grp-sp">About ' + esc(g.label.toLowerCase()) + "</button></div>";
    document.getElementById("zoom-sp").onclick = function () {
      if (!spLayers[sci].on) { spLayers[sci].on = true; document.getElementById("chk-" + s.code).checked = true; refreshDots(); syncAllBtn(); }
      map.flyToBounds(spLayers[sci].poly.getBounds(), { padding: [40, 40], maxZoom: 16 });
    };
    document.getElementById("grp-sp").onclick = function () { openGroup(s.group); };
    sheet.hidden = false;
  }
  function openGroup(gk) {
    var g = GR[gk];
    var members = order.filter(function (k) { return SP[k].group === gk; });
    var n = 0, a = 0; members.forEach(function (k) { n += stats[k].n; a += stats[k].acres; });
    body.innerHTML =
      '<div class="grp">Species group</div><h2 id="sheet-title">' + esc(g.label) + "</h2>" +
      '<p class="sci">' + n + " occurrences · " + ac(a) + " gross acres in Pine Creek</p>" +
      "<dl><div><dt>What they have in common</dt><dd>" + esc(g.blurb) + "</dd></div></dl>" +
      '<div class="members">' + members.map(function (k) { return '<button type="button" data-sci="' + esc(k) + '"><span class="swatch" style="background:' + SP[k].color + '"></span>' + esc(SP[k].common) + "</button>"; }).join("") + "</div>" +
      '<div class="sheet-actions"><button type="button" class="primary" id="show-grp">Show only this group</button></div>';
    body.querySelectorAll(".members button").forEach(function (b) { b.onclick = function () { openSpecies(b.getAttribute("data-sci")); }; });
    document.getElementById("show-grp").onclick = function () {
      order.forEach(function (k) { var on = SP[k].group === gk; spLayers[k].on = on; document.getElementById("chk-" + SP[k].code).checked = on; });
      refreshDots(); syncAllBtn();
    };
    sheet.hidden = false;
  }

  map.fitBounds(extent.getBounds(), { padding: [20, 20] });
  refreshDots();
})();
