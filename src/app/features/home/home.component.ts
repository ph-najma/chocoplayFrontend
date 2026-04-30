// @ts-nocheck
import { AfterViewInit, Component, OnDestroy, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class HomePageComponent implements AfterViewInit, OnDestroy {
  ngAfterViewInit(): void {
    this.initPage();
  }

  ngOnDestroy(): void {
    // Existing page scripts attach global listeners/intervals.
    // A full teardown can be added later if needed.
  }

  private initPage(): void {
          "use strict";

          /* ── CONSTANTS ─────────────────────────────────────────── */
          const WINS = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6],
          ];
          const SYM = { X: "✕", O: "○" };
          const NAME = { X: "Player 1", O: "Player 2" };
          const WIN_COORDS = {
            0: { x1: 0.5, y1: 0.5, x2: 2.5, y2: 0.5 },
            1: { x1: 0.5, y1: 1.5, x2: 2.5, y2: 1.5 },
            2: { x1: 0.5, y1: 2.5, x2: 2.5, y2: 2.5 },
            3: { x1: 0.5, y1: 0.5, x2: 0.5, y2: 2.5 },
            4: { x1: 1.5, y1: 0.5, x2: 1.5, y2: 2.5 },
            5: { x1: 2.5, y1: 0.5, x2: 2.5, y2: 2.5 },
            6: { x1: 0.5, y1: 0.5, x2: 2.5, y2: 2.5 },
            7: { x1: 2.5, y1: 0.5, x2: 0.5, y2: 2.5 },
          };

          /* ── AUDIO ─────────────────────────────────────────────── */
          let _ctx = null,
            soundOn = true;
          const ac = () =>
            _ctx ||
            (_ctx = new (window.AudioContext || (window).webkitAudioContext)());
          function beep({
            f = 440,
            t = "sine",
            dur = 0.12,
            g = 0.25,
            delay = 0,
          } = {}) {
            if (!soundOn) return;
            try {
              const ctx = ac(),
                o = ctx.createOscillator(),
                v = ctx.createGain();
              o.connect(v);
              v.connect(ctx.destination);
              o.type = t;
              o.frequency.setValueAtTime(f, ctx.currentTime + delay);
              v.gain.setValueAtTime(0, ctx.currentTime + delay);
              v.gain.linearRampToValueAtTime(g, ctx.currentTime + delay + 0.01);
              v.gain.exponentialRampToValueAtTime(
                0.001,
                ctx.currentTime + delay + dur,
              );
              o.start(ctx.currentTime + delay);
              o.stop(ctx.currentTime + delay + dur + 0.05);
            } catch (e) {}
          }
          const sfxPlace = (p) =>
            beep({ f: p === "X" ? 540 : 370, t: "triangle", dur: 0.1, g: 0.22 });
          const sfxWin = () =>
            [0, 0.08, 0.17, 0.27].forEach((d, i) =>
              beep({ f: [523, 659, 784, 1047][i], dur: 0.22, g: 0.28, delay: d }),
            );
          const sfxDraw = () => {
            beep({ f: 320, t: "sawtooth", dur: 0.2, g: 0.14 });
            beep({ f: 270, t: "sawtooth", dur: 0.2, g: 0.14, delay: 0.16 });
          };
          const sfxClick = () => beep({ f: 820, t: "square", dur: 0.05, g: 0.1 });

          /* ── STATE ─────────────────────────────────────────────── */
          const st = {
            board: Array(9).fill(null),
            curr: "X",
            over: false,
            scores: { X: 0, O: 0, draws: 0 },
          };

          /* ── DOM ───────────────────────────────────────────────── */
          const $ = (id) => document.getElementById(id);
          const cells = () => document.querySelectorAll(".cell");
          const board = $("board");
          const turnBar = $("turnBar");
          const turnSym = $("turnSym");
          const turnText = $("turnText");
          const scoreX = $("scoreX");
          const scoreO = $("scoreO");
          const scoreDraws = $("scoreDraws");
          const cardX = $("scoreCardX");
          const cardO = $("scoreCardO");
          const overlay = $("winnerOverlay");
          const wEmoji = $("wEmoji");
          const wLabel = $("wLabel");
          const wSym = $("wSym");
          const wSub = $("wSub");
          const winLineSvg = $("winLineSvg");
          const winLine = $("winLine");
          const loader = $("loader");
          const navToggle = $("navToggle");
          const navMenu = $("navMenu");
          const themeBtn = $("themeBtn");
          const particlesRoot = $("particles");
          const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
          );
          let particleTimer = null;

          /* ── LOADER ────────────────────────────────────────────── */
          window.addEventListener("load", () => {
            setTimeout(() => loader.classList.add("out"), 1600);
          });

          /* ── RENDER ────────────────────────────────────────────── */
          function renderBoard() {
            cells().forEach((c, i) => {
              const v = st.board[i];
              c.textContent = v ? SYM[v] : "";
              c.className = "cell" + (v ? ` ${v.toLowerCase()}-mark taken` : "");
              c.setAttribute(
                "aria-label",
                `Cell ${i + 1}${v ? `, ${NAME[v]}` : ", empty"}`,
              );
              c.removeAttribute("data-hover");
              if (!st.over && !v) {
                c.setAttribute("data-hover", SYM[st.curr]);
                c.classList.add(`${st.curr.toLowerCase()}-hover`);
              }
            });
          }

          function renderTurn() {
            const p = st.curr;
            turnSym.textContent = SYM[p];
            turnSym.className = `turn-sym ${p.toLowerCase()}`;
            turnText.textContent = `${NAME[p]}'s Turn`;
            turnBar.className = `turn-bar ${p.toLowerCase()}-turn`;
            cardX.classList.toggle("active", p === "X");
            cardO.classList.toggle("active", p === "O");
            turnSym.animate(
              [
                { transform: "scale(1)" },
                { transform: "scale(1.45) rotate(-12deg)" },
                { transform: "scale(1)" },
              ],
              { duration: 380, easing: "cubic-bezier(.34,1.56,.64,1)" },
            );
          }

          function renderScores() {
            const f = (n) => String(n).padStart(2, "0");
            scoreX.textContent = f(st.scores.X);
            scoreO.textContent = f(st.scores.O);
            scoreDraws.textContent = f(st.scores.draws);
          }

          function bump(el) {
            el.classList.remove("bump");
            void el.offsetWidth;
            el.classList.add("bump");
            setTimeout(() => el.classList.remove("bump"), 460);
          }

          /* ── WIN LINE ──────────────────────────────────────────── */
          function drawWinLine(idx) {
            const c = WIN_COORDS[idx];
            if (!c) return;
            winLine.setAttribute("x1", c.x1);
            winLine.setAttribute("y1", c.y1);
            winLine.setAttribute("x2", c.x2);
            winLine.setAttribute("y2", c.y2);
            winLine.style.transition = "none";
            winLine.style.strokeDashoffset = "6";
            void winLine.getBoundingClientRect();
            winLine.style.transition = "";
            winLineSvg.classList.add("show");
          }
          function clearWinLine() {
            winLineSvg.classList.remove("show");
          }

          /* ── CONFETTI ──────────────────────────────────────────── */
          function spawnConfetti() {
            const colors = [
              "#E8A84C",
              "#C8793A",
              "#F5C842",
              "#FDF0DC",
              "#4caf50",
              "#9B1B30",
              "#fff",
            ];
            for (let i = 0; i < 70; i++) {
              const el = document.createElement("div");
              const size = 5 + Math.random() * 10;
              const br = Math.random() > 0.4 ? "50%" : "2px";
              el.className = "confetti-piece";
              el.style.cssText = `left:${8 + Math.random() * 84}%;top:${4 + Math.random() * 22}%;width:${size}px;height:${size}px;background:${colors[Math.floor(Math.random() * colors.length)]};border-radius:${br};animation-duration:${0.9 + Math.random() * 1.1}s;animation-delay:${Math.random() * 0.45}s;`;
              document.body.appendChild(el);
              el.addEventListener("animationend", () => el.remove());
            }
          }

          function spawnRings(x, y) {
            for (let i = 0; i < 4; i++) {
              setTimeout(() => {
                const r = document.createElement("div");
                r.className = "ring-burst";
                r.style.cssText = `left:${x}px;top:${y}px;animation-duration:${0.65 + i * 0.18}s;border:${2 + i}px solid ${i % 2 === 0 ? "var(--choco-gold)" : "var(--choco-caramel)"};`;
                document.body.appendChild(r);
                r.addEventListener("animationend", () => r.remove());
              }, i * 100);
            }
          }

          /* ── RIPPLE ────────────────────────────────────────────── */
          function ripple(cell, e) {
            const rect = cell.getBoundingClientRect();
            const x = (e.clientX || rect.left + rect.width / 2) - rect.left;
            const y = (e.clientY || rect.top + rect.height / 2) - rect.top;
            const r = document.createElement("div");
            r.className = "ripple";
            const s = rect.width * 0.6;
            r.style.cssText = `left:${x}px;top:${y}px;width:${s}px;height:${s}px;margin-left:${-s / 2}px;margin-top:${-s / 2}px`;
            cell.appendChild(r);
            r.addEventListener("animationend", () => r.remove());
          }

          /* ── HOVER GHOSTS ──────────────────────────────────────── */
          function updateGhosts() {
            cells().forEach((c) => {
              const i = +c.dataset.index;
              c.classList.remove("x-hover", "o-hover");
              c.removeAttribute("data-hover");
              if (!st.over && !st.board[i]) {
                c.setAttribute("data-hover", SYM[st.curr]);
                c.classList.add(`${st.curr.toLowerCase()}-hover`);
              }
            });
          }

          /* ── PARTICLES ─────────────────────────────────────────── */
          function spawnParticle() {
            if (prefersReducedMotion.matches || document.hidden) return;
            const el = document.createElement("div");
            el.className = "pixel-particle";
            const sz = [4, 6, 8][Math.floor(Math.random() * 3)];
            const col = ["#C8793A", "#E8A84C", "#4B1E08"][
              Math.floor(Math.random() * 3)
            ];
            el.style.cssText = `width:${sz}px;height:${sz}px;background:${col};left:${Math.random() * 100}%;bottom:${Math.random() * 60}%;animation-duration:${3 + Math.random() * 5}s;animation-delay:${Math.random() * 2}s;`;
            particlesRoot.appendChild(el);
            el.addEventListener("animationend", () => el.remove());
          }

          function syncParticles() {
            if (particleTimer) {
              clearInterval(particleTimer);
              particleTimer = null;
            }
            if (!prefersReducedMotion.matches && !document.hidden) {
              particleTimer = setInterval(spawnParticle, 750);
            }
          }

          /* ── GAME LOGIC ────────────────────────────────────────── */
          function checkWin(b) {
            for (const [a, bIdx, c] of WINS) {
              if (b[a] && b[a] === b[bIdx] && b[a] === b[c])
                return { w: b[a], combo: [a, bIdx, c] };
            }
            if (b.every(Boolean)) return { w: "draw", combo: [] };
            return null;
          }
          function comboIdx(c) {
            return WINS.findIndex(
              (w) => w[0] === c[0] && w[1] === c[1] && w[2] === c[2],
            );
          }

          /* ── CELL CLICK ────────────────────────────────────────── */
          function click(e) {
            const cell = e.currentTarget;
            const i = +cell.dataset.index;
            if (st.over || st.board[i]) return;

            ripple(cell, e);
            sfxPlace(st.curr);

            st.board[i] = st.curr;
            cell.textContent = SYM[st.curr];
            cell.classList.add(`${st.curr.toLowerCase()}-mark`, "taken", "pop");
            cell.removeAttribute("data-hover");
            updateGhosts();

            const res = checkWin(st.board);
            if (res) {
              st.over = true;
              board.classList.add("game-over");
              if (res.w === "draw") {
                st.scores.draws++;
                bump(scoreDraws);
                turnText.textContent = "It's a Draw!";
                turnSym.textContent = "=";
                board.classList.add("shake");
                setTimeout(() => board.classList.remove("shake"), 480);
                sfxDraw();
              } else {
                st.scores[res.w]++;
                bump(res.w === "X" ? scoreX : scoreO);
                res.combo.forEach((idx) => {
                  const c = board.querySelector(`[data-index="${idx}"]`);
                  if (c) c.classList.add("winner-cell");
                });
                drawWinLine(comboIdx(res.combo));
                turnText.textContent = `${NAME[res.w]} Wins! 🏆`;
                turnSym.textContent = SYM[res.w];
                sfxWin();
              }
              renderScores();
              setTimeout(() => showOverlay(res), 460);
            } else {
              st.curr = st.curr === "X" ? "O" : "X";
              renderTurn();
              updateGhosts();
            }
          }

          /* ── OVERLAY ───────────────────────────────────────────── */
          function showOverlay(res) {
            if (res.w === "draw") {
              wEmoji.textContent = "🤝";
              wLabel.textContent = "It's a Draw!";
              wSym.textContent = "=";
              wSym.className = "winner-sym";
              wSub.textContent = "Chocolate split equally between rivals!";
            } else {
              wEmoji.textContent = "🏆";
              wLabel.textContent = `${NAME[res.w]} Wins!`;
              wSym.textContent = SYM[res.w];
              wSym.className = `winner-sym${res.w === "O" ? " o" : ""}`;
              wSub.textContent = "The chocolate crown is yours!";
              spawnConfetti();
              setTimeout(
                () => spawnRings(window.innerWidth / 2, window.innerHeight / 2),
                150,
              );
            }
            setTimeout(() => overlay.classList.add("show"), 400);
          }
          function hideOverlay() {
            overlay.classList.remove("show");
          }

          /* ── RESET ─────────────────────────────────────────────── */
          function newRound() {
            st.board = Array(9).fill(null);
            st.over = false;
            board.classList.remove("game-over", "shake");
            clearWinLine();
            renderBoard();
            renderTurn();
            updateGhosts();
          }
          function resetAll() {
            st.scores = { X: 0, O: 0, draws: 0 };
            st.curr = "X";
            renderScores();
            newRound();
          }

          /* ── INIT ──────────────────────────────────────────────── */
          cells().forEach((c) => {
            c.addEventListener("click", click);
            c.addEventListener("keydown", (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                c.click();
              }
            });
          });

          $("btnRestart").addEventListener("click", () => {
            sfxClick();
            hideOverlay();
            newRound();
          });
          $("btnReset").addEventListener("click", () => {
            sfxClick();
            resetAll();
          });
          $("btnPlayAgain").addEventListener("click", () => {
            sfxClick();
            hideOverlay();
            setTimeout(newRound, 220);
          });
          $("btnViewScore").addEventListener("click", () => {
            sfxClick();
            hideOverlay();
          });
          overlay.addEventListener("click", (e) => {
            if (e.target === overlay) hideOverlay();
          });
          document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") hideOverlay();
          });

          $("soundBtn").addEventListener("click", () => {
            soundOn = !soundOn;
            $("soundBtn").textContent = soundOn ? "🔊" : "🔇";
            $("soundBtn").setAttribute("aria-pressed", String(soundOn));
            if (soundOn) sfxClick();
          });

          function applyTheme(theme) {
            const isLight = theme === "light";
            document.documentElement.setAttribute("data-theme", isLight ? "light" : "dark");
            localStorage.setItem("chocoplay-theme", isLight ? "light" : "dark");
            themeBtn.textContent = isLight ? "☀️" : "🌙";
            themeBtn.title = isLight ? "Switch to dark theme" : "Switch to light theme";
            themeBtn.setAttribute("aria-pressed", String(isLight));
          }

          const savedTheme = localStorage.getItem("chocoplay-theme");
          applyTheme(savedTheme === "light" ? "light" : "dark");

          themeBtn.addEventListener("click", () => {
            const currentTheme = document.documentElement.getAttribute("data-theme");
            applyTheme(currentTheme === "light" ? "dark" : "light");
            sfxClick();
          });

          navToggle.addEventListener("click", () => {
            const isOpen = navMenu.classList.toggle("open");
            navToggle.setAttribute("aria-expanded", String(isOpen));
            navMenu.hidden = !isOpen;
          });

          // Nav pills click feedback
          document.querySelectorAll(".nav-pill").forEach((p) => {
            p.addEventListener("click", () => {
              document
                .querySelectorAll(".nav-pill")
                .forEach((x) => x.classList.remove("active"));
              p.classList.add("active");
              sfxClick();
            });
          });

          // Flavor pills
          document.querySelectorAll(".flavor-pill").forEach((p) => {
            p.addEventListener("click", () => sfxClick());
          });

          document.addEventListener("visibilitychange", syncParticles);
          prefersReducedMotion.addEventListener("change", syncParticles);

          renderBoard();
          renderTurn();
          renderScores();
          syncParticles();
        
  }
}
