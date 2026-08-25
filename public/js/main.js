(function () {
  "use strict";

  /* ============ Sticky header shadow ============ */
  const header = document.getElementById("siteHeader");
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 12);
    const backToTop = document.getElementById("backToTop");
    if (backToTop) backToTop.classList.toggle("is-visible", window.scrollY > 500);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ============ Mobile nav ============ */
  const hamburger = document.getElementById("hamburgerBtn");
  const mainNav = document.getElementById("mainNav");
  if (hamburger && mainNav) {
    hamburger.addEventListener("click", () => {
      const isOpen = mainNav.classList.toggle("is-open");
      hamburger.classList.toggle("is-open", isOpen);
      hamburger.setAttribute("aria-expanded", String(isOpen));
    });
    mainNav.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        mainNav.classList.remove("is-open");
        hamburger.classList.remove("is-open");
        hamburger.setAttribute("aria-expanded", "false");
      })
    );
  }

  /* ============ Back to top ============ */
  const backToTop = document.getElementById("backToTop");
  if (backToTop) {
    backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  /* ============ Scroll reveal ============ */
  /* Elements are visible by default in the base CSS (no-JS-safe). Only once
     we know JS is running do we opt them into the hidden-then-fade-in
     animation, so a slow/blocked script can never leave content invisible. */
  const revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && revealEls.length) {
    revealEls.forEach((el) => el.classList.add("reveal-pending"));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  }
  // else: nothing to do — elements are already visible via the base CSS.

  /* ============ Count-up stats ============ */
  const counters = document.querySelectorAll(".trust-stat__num");
  if (counters.length) {
    const animateCount = (el) => {
      const target = parseInt(el.dataset.target, 10) || 0;
      const duration = 1400;
      const start = performance.now();
      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.floor(eased * target);
        el.textContent = value.toLocaleString() + (progress >= 1 && target >= 1000 ? "+" : "");
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target.toLocaleString() + (target >= 1000 ? "+" : "");
      };
      requestAnimationFrame(step);
    };
    if ("IntersectionObserver" in window) {
      const counterIo = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animateCount(entry.target);
              counterIo.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.4 }
      );
      counters.forEach((c) => counterIo.observe(c));
    } else {
      counters.forEach(animateCount);
    }
  }

  /* ============ Testimonial carousel ============ */
  const track = document.getElementById("testimonialTrack");
  const dotsWrap = document.getElementById("testimonialDots");
  if (track && dotsWrap) {
    const slides = Array.from(track.children);
    let index = 0;
    slides.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.setAttribute("aria-label", "Go to testimonial " + (i + 1));
      if (i === 0) dot.classList.add("is-active");
      dot.addEventListener("click", () => goTo(i));
      dotsWrap.appendChild(dot);
    });
    function goTo(i) {
      index = (i + slides.length) % slides.length;
      track.style.transform = `translateX(-${index * 100}%)`;
      Array.from(dotsWrap.children).forEach((d, di) => d.classList.toggle("is-active", di === index));
    }
    let auto = setInterval(() => goTo(index + 1), 6000);
    dotsWrap.addEventListener("pointerdown", () => { clearInterval(auto); });
  }

  /* ============ Gallery lightbox ============ */
  const galleryTiles = document.querySelectorAll("[data-lightbox]");
  if (galleryTiles.length) {
    const lightbox = document.createElement("div");
    lightbox.className = "lightbox";
    lightbox.innerHTML = `<button class="lightbox__close" aria-label="Close">&times;</button><div class="lightbox__panel"></div>`;
    document.body.appendChild(lightbox);
    const panel = lightbox.querySelector(".lightbox__panel");
    const close = () => lightbox.classList.remove("is-open");
    lightbox.querySelector(".lightbox__close").addEventListener("click", close);
    lightbox.addEventListener("click", (e) => { if (e.target === lightbox) close(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });

    galleryTiles.forEach((tile) => {
      tile.addEventListener("click", () => {
        panel.className = "lightbox__panel " + Array.from(tile.classList).find((c) => c.startsWith("sw-"));
        panel.textContent = tile.textContent.trim();
        lightbox.classList.add("is-open");
      });
    });
  }

  /* ============ Newsletter form ============ */
  const newsletterForm = document.getElementById("newsletterForm");
  const newsletterMsg = document.getElementById("newsletterMsg");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("newsletterEmail").value;
      newsletterMsg.textContent = "Signing you up…";
      newsletterMsg.classList.add("is-visible");
      try {
        const res = await fetch("/api/newsletter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        newsletterMsg.textContent = data.message || "You're on the list!";
        newsletterForm.reset();
      } catch (err) {
        newsletterMsg.textContent = "Something went wrong — please try again.";
      }
    });
  }

  /* ============================================================
     TIFFIN CART — shared across all pages via localStorage
     ============================================================ */
  const CART_KEY = "rollcall_order_v1";

  function getCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || {};
    } catch (e) {
      return {};
    }
  }
  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    renderCart();
  }
  function setItemQty(id, name, price, qty) {
    const cart = getCart();
    if (qty <= 0) {
      delete cart[id];
    } else {
      cart[id] = { name, price, qty };
    }
    saveCart(cart);
  }
  function changeItemQty(id, name, price, delta) {
    const cart = getCart();
    const current = cart[id] ? cart[id].qty : 0;
    setItemQty(id, name, price, current + delta);
  }
  function clearCart() {
    localStorage.removeItem(CART_KEY);
    renderCart();
  }
  function cartTotals(cart) {
    const entries = Object.entries(cart);
    const count = entries.reduce((sum, [, item]) => sum + item.qty, 0);
    const total = entries.reduce((sum, [, item]) => sum + item.qty * item.price, 0);
    return { count, total };
  }
  function money(n) {
    return "$" + n.toFixed(2);
  }

  function renderCart() {
    const cart = getCart();
    const { count, total } = cartTotals(cart);

    // Header badge
    const cartCount = document.getElementById("cartCount");
    if (cartCount) cartCount.textContent = String(count);

    // Drawer (present on every page via footer partial)
    const drawerItems = document.getElementById("tiffinItems");
    const drawerTotal = document.getElementById("tiffinTotal");
    if (drawerItems && drawerTotal) {
      renderLineItems(drawerItems, cart, "No items yet — add dishes from the menu.");
      drawerTotal.textContent = money(total);
    }

    // Menu page sidebar
    const sidebarItems = document.getElementById("sidebarItems");
    const sidebarTotal = document.getElementById("sidebarTotal");
    const sidebarCount = document.getElementById("sidebarCount");
    if (sidebarItems && sidebarTotal) {
      renderLineItems(sidebarItems, cart, null, "sidebarEmpty");
      sidebarTotal.textContent = money(total);
      if (sidebarCount) sidebarCount.textContent = count + (count === 1 ? " item" : " items");
    }

    // Sync all steppers on the page with current quantities
    document.querySelectorAll(".stepper").forEach((stepper) => {
      const id = stepper.dataset.id;
      const countEl = stepper.querySelector(".stepper__count");
      if (countEl) countEl.textContent = cart[id] ? cart[id].qty : 0;
    });
  }

  function renderLineItems(container, cart, emptyText, emptyElId) {
    const entries = Object.entries(cart);
    container.innerHTML = "";
    const emptyEl = emptyElId ? document.getElementById(emptyElId) : null;

    if (entries.length === 0) {
      if (emptyEl) {
        emptyEl.style.display = "block";
      } else if (emptyText) {
        const p = document.createElement("p");
        p.className = "tiffin-drawer__hint";
        p.textContent = emptyText;
        container.appendChild(p);
      }
      return;
    }
    if (emptyEl) emptyEl.style.display = "none";

    entries.forEach(([id, item]) => {
      const row = document.createElement("div");
      row.className = "tiffin-line-item";
      row.innerHTML = `
        <div>
          <div class="tiffin-line-item__name">${item.name}</div>
          <div class="tiffin-line-item__meta">${item.qty} × ${money(item.price)}</div>
        </div>
        <button class="tiffin-line-item__remove" data-remove="${id}">Remove</button>
      `;
      container.appendChild(row);
    });

    container.querySelectorAll("[data-remove]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const cartNow = getCart();
        delete cartNow[btn.dataset.remove];
        saveCart(cartNow);
      });
    });
  }

  // Add-to-tiffin buttons (home page bestsellers)
  document.querySelectorAll(".add-to-tiffin").forEach((btn) => {
    btn.addEventListener("click", () => {
      const { id, name, price } = btn.dataset;
      changeItemQty(id, name, parseFloat(price), 1);
      btn.textContent = "Added ✓";
      setTimeout(() => (btn.textContent = "Add +"), 1200);
      openDrawerBriefFlash();
    });
  });

  // Steppers (menu page)
  document.querySelectorAll(".stepper").forEach((stepper) => {
    const { id, name, price } = stepper.dataset;
    stepper.querySelectorAll(".stepper__btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const delta = btn.dataset.action === "inc" ? 1 : -1;
        changeItemQty(id, name, parseFloat(price), delta);
      });
    });
  });

  // Clear tiffin
  const clearBtn = document.getElementById("clearTiffin");
  if (clearBtn) clearBtn.addEventListener("click", clearCart);

  // Drawer open/close
  const drawer = document.getElementById("tiffinDrawer");
  const backdrop = document.getElementById("tiffinBackdrop");
  const tiffinToggle = document.getElementById("tiffinToggle");
  const tiffinClose = document.getElementById("tiffinClose");
  function openDrawer() {
    if (!drawer) return;
    drawer.classList.add("is-open");
    backdrop.classList.add("is-open");
  }
  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove("is-open");
    backdrop.classList.remove("is-open");
  }
  function openDrawerBriefFlash() {
    // subtle nudge: pulse the cart count instead of forcing the drawer open
    const cartCount = document.getElementById("cartCount");
    if (!cartCount) return;
    cartCount.style.transform = "scale(1.35)";
    setTimeout(() => (cartCount.style.transform = "scale(1)"), 220);
  }
  if (tiffinToggle) tiffinToggle.addEventListener("click", openDrawer);
  if (tiffinClose) tiffinClose.addEventListener("click", closeDrawer);
  if (backdrop) backdrop.addEventListener("click", closeDrawer);

  // Initial paint
  renderCart();

  // expose for menu.js
  window.RollCallCart = { getCart, changeItemQty, clearCart, cartTotals };
})();