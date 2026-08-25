(function () {
  "use strict";

  const searchInput = document.getElementById("menuSearch");
  const vegToggle = document.getElementById("vegOnlyToggle");
  const spiceButtons = document.querySelectorAll(".spice-filter__btn");
  const tabs = document.querySelectorAll(".menu-tab");
  const sections = document.querySelectorAll(".menu-section");
  const emptyMsg = document.getElementById("menuEmpty");

  const state = { search: "", vegOnly: false, spice: "all", category: "all" };

  function matches(item) {
    const name = item.dataset.name || "";
    const desc = item.dataset.desc || "";
    const veg = item.dataset.veg === "true";
    const spice = parseInt(item.dataset.spice, 10);
    const category = item.dataset.category;

    if (state.category !== "all" && category !== state.category) return false;
    if (state.vegOnly && !veg) return false;
    if (state.spice === "0" && spice !== 0) return false;
    if (state.spice === "2" && spice < 1) return false;
    if (state.spice === "3" && spice < 3) return false;
    if (state.search) {
      const q = state.search.toLowerCase();
      if (!name.includes(q) && !desc.includes(q)) return false;
    }
    return true;
  }

  function setSectionExpanded(section, expanded) {
    const head = section.querySelector(".menu-section__head");
    const items = section.querySelector(".menu-items");
    if (!head || !items) return;
    head.setAttribute("aria-expanded", String(expanded));
    items.hidden = !expanded;
  }

  // Collapsed accordion by default is the whole point of this page (avoids
  // rendering all ~130 dishes open at once) — but the moment someone is
  // actively searching or filtering, auto-expand any section with matches
  // so results are never hidden behind an extra click.
  function filtersActive() {
    return Boolean(state.search) || state.vegOnly || state.spice !== "all" || state.category !== "all";
  }

  function applyFilters() {
    let visibleTotal = 0;
    const active = filtersActive();

    sections.forEach((section) => {
      let visibleInSection = 0;
      section.querySelectorAll(".menu-item").forEach((item) => {
        const show = matches(item);
        item.style.display = show ? "" : "none";
        if (show) {
          visibleInSection++;
          visibleTotal++;
        }
      });

      section.style.display = visibleInSection > 0 ? "" : "none";

      if (visibleInSection > 0 && active) {
        setSectionExpanded(section, true);
      }
    });

    if (emptyMsg) emptyMsg.hidden = visibleTotal !== 0;
  }

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      state.search = searchInput.value.trim();
      applyFilters();
    });
  }

  if (vegToggle) {
    vegToggle.addEventListener("click", () => {
      state.vegOnly = !state.vegOnly;
      vegToggle.dataset.active = String(state.vegOnly);
      applyFilters();
    });
  }

  spiceButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      spiceButtons.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      state.spice = btn.dataset.spice;
      applyFilters();
    });
  });

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("is-active"));
      tab.classList.add("is-active");
      state.category = tab.dataset.cat;
      applyFilters();
      if (state.category !== "all") {
        const target = document.getElementById(state.category);
        if (target) {
          setSectionExpanded(target, true);
          setTimeout(() => target.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
        }
      }
    });
  });

  // Accordion: click any section header to expand/collapse just that
  // category. Independent of the filter state above — this is what keeps
  // the default "All" view short instead of one long page of everything.
  sections.forEach((section) => {
    const head = section.querySelector(".menu-section__head");
    if (!head) return;
    head.addEventListener("click", () => {
      const isExpanded = head.getAttribute("aria-expanded") === "true";
      setSectionExpanded(section, !isExpanded);
    });
  });

  // If the page was loaded with a #category hash, activate that tab
  window.addEventListener("DOMContentLoaded", () => {
    const hash = window.location.hash.replace("#", "");
    if (hash) {
      const tab = document.querySelector(`.menu-tab[data-cat="${hash}"]`);
      if (tab) tab.click();
    }
  });
})();