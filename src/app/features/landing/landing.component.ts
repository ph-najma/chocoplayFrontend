// @ts-nocheck
import { AfterViewInit, Component, OnDestroy, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-landing',
  standalone: true,
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class LandingPageComponent implements AfterViewInit, OnDestroy {
  ngAfterViewInit(): void {
    this.initPage();
  }

  ngOnDestroy(): void {
    // Existing page scripts attach global listeners/intervals.
    // A full teardown can be added later if needed.
  }

  private initPage(): void {
          "use strict";
          const particlesRoot = document.getElementById("particles");
          const btnStart = document.getElementById("btnStart");
          const pvWrap = document.getElementById("pvWrap");
          const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
          );
          let particleTimer = null;

          /* ── PARTICLES ── */
          function spawnParticle() {
            if (prefersReducedMotion.matches || document.hidden) return;
            const el = document.createElement("div");
            el.className = "p-dot";
            const sz = [4, 6, 8][Math.floor(Math.random() * 3)];
            const col = ["#C8793A", "#E8A84C", "#4B1E08", "#F5C842"][
              Math.floor(Math.random() * 4)
            ];
            const br = Math.random() > 0.4 ? "50%" : "2px";
            el.style.cssText = `
        width:${sz}px; height:${sz}px;
        background:${col}; border-radius:${br};
        left:${Math.random() * 100}%;
        bottom:${Math.random() * 40}%;
        animation-duration:${3 + Math.random() * 4}s;
        animation-delay:${Math.random() * 1.5}s;
      `;
            particlesRoot.appendChild(el);
            el.addEventListener("animationend", () => el.remove());
          }
          function syncParticles() {
            if (particleTimer) {
              clearInterval(particleTimer);
              particleTimer = null;
            }
            if (!prefersReducedMotion.matches && !document.hidden) {
              particleTimer = setInterval(spawnParticle, 900);
            }
          }

          /* ── WIN LINE TRIGGER ── */
          setTimeout(() => {
            pvWrap.classList.add("ready");
          }, 800);

          /* ── CONFETTI ON CTA CLICK ── */
          function spawnConfetti() {
            const colors = [
              "#E8A84C",
              "#C8793A",
              "#F5C842",
              "#FDF0DC",
              "#9B1B30",
              "#fff",
              "#2D7A5F",
            ];
            for (let i = 0; i < 55; i++) {
              const el = document.createElement("div");
              el.className = "confetti";
              const size = 5 + Math.random() * 9;
              el.style.cssText = `
          left:${10 + Math.random() * 80}%;
          top:${5 + Math.random() * 20}%;
          width:${size}px; height:${size}px;
          background:${colors[Math.floor(Math.random() * colors.length)]};
          border-radius:${Math.random() > 0.4 ? "50%" : "2px"};
          animation-duration:${0.8 + Math.random() * 0.9}s;
          animation-delay:${Math.random() * 0.3}s;
        `;
              document.body.appendChild(el);
              el.addEventListener("animationend", () => el.remove());
            }
          }

          btnStart.addEventListener("click", (e) => {
            spawnConfetti();
            // Small delay to let confetti show before navigation
            const href = e.currentTarget.getAttribute("href");
            if (href !== "#") {
              e.preventDefault();
              setTimeout(() => {
                window.location.href = href;
              }, 320);
            }
          });

          /* ── HAPTIC / TOUCH FEEDBACK ── */
          btnStart.addEventListener(
            "touchstart",
            () => {
              if (navigator.vibrate) navigator.vibrate(18);
            },
            { passive: true },
          );
          document.addEventListener("visibilitychange", syncParticles);
          prefersReducedMotion.addEventListener("change", syncParticles);
          syncParticles();
        
  }
}
