import { chromium, type Browser, type ConsoleMessage, type Page } from "playwright";

const baseUrl = process.env.E2E_BASE_URL ?? "http://localhost:3000";
const viewports = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "laptop", width: 1024, height: 768 },
  { name: "desktop", width: 1280, height: 900 },
  { name: "wide", width: 1440, height: 900 },
];

async function main() {
  const browser = await chromium.launch();

  try {
    await checkDemoFlow(browser);
    await checkStreamingTransport(browser);
    await checkScrollbar(browser);
    await checkStickyNav(browser);
    await checkAgentSphere(browser);
    await checkMarketPulse(browser);
    await checkReducedMotion(browser);
    await captureResponsiveScreenshots(browser);
    console.log("e2e: demo flow, streaming, scrollbar, sticky nav, agent sphere, market pulse, reduced motion and responsive capture passed");
  } finally {
    await browser.close();
  }
}

/** `/api/chat` must deliver trace events as they happen, not buffer them into one lump. */
async function checkStreamingTransport(browser: Browser) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${baseUrl}/app/agent`, { waitUntil: "domcontentloaded" });

  const timeline = await page.evaluate(async () => {
    const started = performance.now();
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ command: "Analyze BTC on 4H", stream: true }),
    });

    const contentType = response.headers.get("content-type") ?? "";
    const reader = response.body!.pipeThrough(new TextDecoderStream()).getReader();
    const events: { type: string; at: number }[] = [];
    let buffer = "";

    for (;;) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      buffer += value;
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (line.trim().length > 0) {
          events.push({ type: JSON.parse(line).type, at: performance.now() - started });
        }
      }
    }

    return { contentType, events };
  });

  assert(timeline.contentType.includes("application/x-ndjson"), `expected an NDJSON stream, got ${timeline.contentType}`);

  const types = timeline.events.map((event) => event.type);
  assert(types[0] === "intent", `stream must open with the routed intent, got ${types[0]}`);
  assert(types.at(-1) === "done", `stream must close with the finished execution, got ${types.at(-1)}`);

  const traceCount = types.filter((type) => type === "trace").length;
  assert(traceCount >= 8, `expected at least 8 streamed trace events, saw ${traceCount}`);

  // Everything landing in the same instant would mean the response was buffered.
  const firstTrace = timeline.events.find((event) => event.type === "trace");
  const doneAt = timeline.events.at(-1)!.at;
  assert(firstTrace !== undefined, "no trace event was streamed");
  assert(firstTrace.at < doneAt, `trace events must precede the done message (${firstTrace.at} vs ${doneAt})`);

  await page.close();
}

/** The scrollbar has to report real scroll, and dragging it has to move the page. */
async function checkScrollbar(browser: Browser) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto(`${baseUrl}/app/analyze`, { waitUntil: "domcontentloaded" });

  const bar = page.locator("[data-scrollbar]");
  await bar.waitFor({ timeout: 30_000 });

  // The bar ships in the server-rendered HTML with a zero-height thumb, so its
  // attributes are readable before hydration and report nothing real. Wait until
  // the client has actually measured it.
  await page.waitForFunction(() => document.documentElement.scrollHeight - window.innerHeight > 200, undefined, { timeout: 30_000 });
  // Only the client sets an inline opacity, so this is a real hydration signal.
  // `data-scroll-progress` is not: it ships in the SSR markup already set to 0.
  await page.waitForFunction(() => document.querySelector<HTMLElement>("[data-scrollbar]")?.style.opacity !== "", undefined, { timeout: 30_000 });

  const progress = async () => Number(await bar.getAttribute("data-scroll-progress"));
  const scrollTo = async (fraction: number) => {
    await page.evaluate((value) => window.scrollTo(0, (document.documentElement.scrollHeight - window.innerHeight) * value), fraction);
    await page.waitForTimeout(250);
  };

  assert((await progress()) === 0, `the scrollbar should read empty at the top, saw ${await progress()}`);

  await scrollTo(0.5);
  const middle = await progress();
  assert(middle > 0.4 && middle < 0.6, `half a page scrolled should read near 0.5, saw ${middle}`);

  // The gutter fills as the page is read, so its height is the reading.
  const half = await fillRatio(page);
  assert(half > 0.4 && half < 0.6, `the gutter should be about half filled, saw ${half.toFixed(3)}`);

  await scrollTo(1);
  assert((await progress()) === 1, `the scrollbar should read full at the bottom, saw ${await progress()}`);
  assert((await fillRatio(page)) > 0.98, `the gutter should be full at the bottom, saw ${(await fillRatio(page)).toFixed(3)}`);

  // Grab at 80% rather than the very bottom: Next's dev indicator sits in the
  // bottom-left corner and swallows the pointerdown there.
  const box = (await bar.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height * 0.8);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2, box.y + 10, { steps: 8 });
  await page.mouse.up();
  await page.waitForTimeout(250);

  const scrolled = await page.evaluate(() => window.scrollY);
  assert(scrolled < 60, `dragging the gutter to the top should scroll the page there, scrollY is ${scrolled}`);

  await page.close();
}

/** How much of the gutter is filled, 0..1. */
async function fillRatio(page: Page) {
  return page.evaluate(() => {
    const track = document.querySelector<HTMLElement>("[data-scrollbar]");
    const fill = document.querySelector<HTMLElement>("[data-scrollbar-fill]");

    return track && fill && track.clientHeight > 0 ? fill.clientHeight / track.clientHeight : 0;
  });
}

/**
 * The nav floats 20px below the top of the viewport and pins there. The title
 * block sits right below it at rest and scrolls away under it once the page
 * moves, since keeping it on screen for the whole session costs about 130px of
 * every page for information already read. The nav's logo cell has to land
 * exactly where the vertical scroll gutter runs beneath it — that intersection
 * is the whole point of the 20px offset on both.
 */
async function checkStickyNav(browser: Browser) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto(`${baseUrl}/app/analyze`, { waitUntil: "domcontentloaded" });
  await page.locator("[data-sticky-nav]").waitFor({ timeout: 30_000 });
  await page.waitForFunction(() => document.documentElement.scrollHeight - window.innerHeight > 200, undefined, { timeout: 30_000 });

  const boxOf = async (selector: string) => (await page.locator(selector).boundingBox())!;
  const topOf = async (selector: string) => (await boxOf(selector)).y;

  const navAtRest = await topOf("[data-sticky-nav]");
  assert(Math.abs(navAtRest - 20) < 2, `the nav should float 20px below the top, saw ${navAtRest}`);

  const titleAtRest = await topOf("[data-market-header]");
  assert(titleAtRest > 60, `the title band should sit below the nav at rest, saw ${titleAtRest}`);

  // The logo cell and the scroll gutter both sit 20px off their edge and share
  // the same width, so the logo has to land inside the gutter's horizontal span.
  const logoBox = await boxOf('[data-sticky-nav] a[aria-label="Chaos Market AI home"]');
  const gutterBox = await boxOf("[data-scrollbar]");
  const logoCentreX = logoBox.x + logoBox.width / 2;
  assert(
    logoCentreX > gutterBox.x - 2 && logoCentreX < gutterBox.x + gutterBox.width + 2,
    `the logo should sit above the scroll gutter, logo centre ${logoCentreX} vs gutter [${gutterBox.x}, ${gutterBox.x + gutterBox.width}]`,
  );
  assert(Math.abs(gutterBox.x - 20) < 2, `the scroll gutter should sit 20px from the left, saw ${gutterBox.x}`);
  assert(gutterBox.y < 1, `the scroll gutter should run flush to the top, saw y=${gutterBox.y}`);

  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(300);

  const navScrolled = await topOf("[data-sticky-nav]");
  assert(Math.abs(navScrolled - 20) < 2, `the nav should stay pinned 20px from the top, ended at ${navScrolled}`);
  assert((await topOf("[data-market-header]")) < -40, "the title band should have scrolled away rather than pinning with the nav");

  await assertNavigable(page, "scrolled nav", "analyze");
  await page.close();
}

/**
 * The agent's body must track the real workflow: resting before a command, beating
 * faster while Binance tools are in flight, and settling once the run completes.
 */
async function checkAgentSphere(browser: Browser) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${baseUrl}/app/agent`, { waitUntil: "domcontentloaded" });

  const sphere = page.locator("[data-agent-sphere]");
  await sphere.waitFor({ timeout: 30_000 });

  assert((await sphere.getAttribute("data-agent-state")) === "resting", "the agent should rest before any command");
  const restingRate = await readSphereRate(sphere);

  const modulation = await measurePulseModulation(page, "[data-agent-sphere] canvas");
  assert(modulation > 0.02, `agent sphere renders but does not beat (modulation ${modulation.toFixed(4)})`);

  // "working" can last only a few hundred milliseconds on a warm cache, so record
  // every transition up front rather than trying to catch one in the act.
  await page.evaluate(() => {
    const target = document.querySelector("[data-agent-sphere]")!;
    const seen: { state: string; rate: number }[] = [];
    const capture = () => {
      const state = target.getAttribute("data-agent-state") ?? "";
      const rate = Number(/(\d+) BPM/.exec((target as HTMLElement).innerText)?.[1] ?? 0);

      if (seen.at(-1)?.state !== state) {
        seen.push({ state, rate });
      }
    };

    capture();
    new MutationObserver(capture).observe(target, { attributes: true, subtree: true, childList: true, characterData: true });
    (window as unknown as { __agentStates: typeof seen }).__agentStates = seen;
  });

  await page.getByRole("button", { name: "Analyze BTC on 4H" }).click();
  await page.getByText(/signal alignment/i).first().waitFor({ timeout: 60_000 });
  await page.waitForTimeout(300);

  const states = await page.evaluate(() => (window as unknown as { __agentStates: { state: string; rate: number }[] }).__agentStates);
  const names = states.map((entry) => entry.state);

  assert(names.includes("working"), `the agent never entered a working state, saw ${names.join(" -> ")}`);
  assert(names.at(-1) === "complete", `the agent should settle as complete, ended at ${names.at(-1)}`);

  const working = states.find((entry) => entry.state === "working")!;
  assert(working.rate > restingRate, `working rate ${working.rate} should exceed resting rate ${restingRate}`);
  assert(/steps executed/.test(await sphere.innerText()), "a settled agent should report how many steps actually ran");

  await page.close();
}

async function readSphereRate(sphere: ReturnType<Page["locator"]>) {
  return Number(/(\d+) BPM/.exec(await sphere.innerText())?.[1] ?? 0);
}

/** The pulse must actually beat, and its readouts must match the deterministic mapping. */
async function checkMarketPulse(browser: Browser) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });

  await page.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
  const panel = page.locator("[data-market-pulse]").first();
  await panel.waitFor({ timeout: 60_000 });

  const readout = await panel.innerText();
  assert(/\d+ BPM/.test(readout), `market pulse is missing a rate readout: ${readout}`);
  assert(/\d+ \/ \d+/.test(readout), `market pulse is missing an amplitude readout: ${readout}`);
  assert(/not a forecast and not\s+a probability/i.test(readout), "market pulse is missing its non-prediction disclaimer");

  const modulation = await measurePulseModulation(page);
  assert(modulation > 0.02, `market pulse renders but does not beat (modulation ${modulation.toFixed(4)})`);

  await page.close();
}

/** With reduced motion the sphere must still render, but hold completely still. */
async function checkReducedMotion(browser: Browser) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 950 }, reducedMotion: "reduce" });

  await page.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
  await page.locator("[data-market-pulse]").first().waitFor({ timeout: 60_000 });

  // The sphere paints from a React effect, so it can lag the element becoming visible.
  await page.waitForFunction(
    () => {
      const canvas = document.querySelector<HTMLCanvasElement>("[data-market-pulse] canvas");
      const context = canvas?.getContext("2d");

      if (!canvas || !context || canvas.width === 0) {
        return false;
      }

      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;

      for (let index = 3; index < pixels.length; index += 4) {
        if (pixels[index] > 0) {
          return true;
        }
      }

      return false;
    },
    undefined,
    { timeout: 15_000 },
  );

  const modulation = await measurePulseModulation(page);
  assert(modulation < 0.005, `reduced motion must hold still, saw modulation ${modulation.toFixed(4)}`);

  await page.close();
}

/** Relative swing of total canvas ink over ~1.6s, sampled per animation frame. */
async function measurePulseModulation(page: Page, selector = "[data-market-pulse] canvas") {
  return page.evaluate(async (target) => {
    const canvas = document.querySelector<HTMLCanvasElement>(target);
    const context = canvas?.getContext("2d", { willReadFrequently: true });

    if (!canvas || !context) {
      return 0;
    }

    const samples: number[] = [];
    const startedAt = performance.now();

    while (performance.now() - startedAt < 1600) {
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      let total = 0;

      for (let index = 3; index < pixels.length; index += 4) {
        total += pixels[index];
      }

      // A sample taken between clearRect and the redraw reads as empty; it is a
      // measurement artefact, not a frame the user ever sees.
      if (total > 0) {
        samples.push(total);
      }

      await new Promise((resolve) => requestAnimationFrame(resolve));
    }

    if (samples.length === 0) {
      return 0;
    }

    const min = Math.min(...samples);
    const max = Math.max(...samples);

    return max === 0 ? 0 : (max - min) / max;
  }, selector);
}

async function checkDemoFlow(browser: Browser) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = collectConsoleErrors(page);

  await page.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
  await page.getByRole("heading", { name: /make it inspect the market/i }).waitFor({ timeout: 30_000 });
  // The landing has its own header, so it can lose the nav without any /app page noticing.
  await assertNavigable(page, "landing", null);

  await runAgentWorkflow(page);

  await page.locator("canvas").first().waitFor({ timeout: 30_000 });

  const traceRows = await page.locator("[data-trace-row]").count();
  assert(traceRows >= 8, `expected at least 8 real trace rows, saw ${traceRows}`);
  await assertEveryTraceRowVisible(page, "demo flow");

  const body = (await page.locator("body").innerText()).toLowerCase();
  for (const phrase of ["buy now", "sell now", "go long", "go short", "guaranteed"]) {
    assert(!body.includes(phrase), `agent screen rendered forbidden phrase: ${phrase}`);
  }

  assert(errors.length === 0, `console errors: ${errors.join(" | ")}`);
  await page.close();
}

async function captureResponsiveScreenshots(browser: Browser) {
  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height } });

    await page.goto(`${baseUrl}/app/analyze`, { waitUntil: "domcontentloaded" });
    await page.locator("canvas").first().waitFor({ timeout: 60_000 });
    await assertNoPageOverflow(page, `${viewport.name} /app/analyze`);
    await assertNavigable(page, `${viewport.name} /app/analyze`, "analyze");
    await page.screenshot({ path: `test-results/analyze-${viewport.name}.png`, fullPage: true });

    await runAgentWorkflow(page);
    await assertNoPageOverflow(page, `${viewport.name} /app/agent`);
    await assertTraceRowsFit(page, viewport.name, viewport.width >= 1280 ? 130 : 160);
    await assertEveryTraceRowVisible(page, viewport.name);
    await page.screenshot({ path: `test-results/agent-${viewport.name}.png`, fullPage: true });

    await page.close();
  }
}

async function runAgentWorkflow(page: Page) {
  await page.goto(`${baseUrl}/app/agent`, { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Analyze BTC on 4H" }).click();
  await page.getByText(/signal alignment/i).first().waitFor({ timeout: 60_000 });
  await page.locator("[data-trace-row]").first().waitFor({ timeout: 30_000 });
  await waitForRevealSettled(page);
}

async function waitForRevealSettled(page: Page) {
  await page.waitForFunction(
    () => {
      const revealed = [...document.querySelectorAll("[data-trace-row], [data-reveal-meta], [data-reveal-body] > *")];

      return revealed.length > 0 && revealed.every((element) => Number(getComputedStyle(element).opacity) > 0.99);
    },
    undefined,
    { timeout: 15_000 },
  );
}

/**
 * Rows arrive one at a time over the stream, and a reveal animation that re-runs
 * across the whole list can strand the newest nodes at opacity 0 forever. Nothing
 * else in the suite would notice: the row is in the DOM, sized, and readable.
 */
async function assertEveryTraceRowVisible(page: Page, label: string) {
  const hidden = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>("[data-trace-row]")]
      .map((row, index) => ({ index, opacity: Number(getComputedStyle(row).opacity), key: row.dataset.traceKey ?? "" }))
      .filter((row) => row.opacity < 0.99),
  );

  assert(
    hidden.length === 0,
    `${label} left ${hidden.length} trace row(s) invisible: ${hidden.map((row) => `${row.key}@${row.opacity}`).join(", ")}`,
  );
}

/**
 * The workspace must be navigable at every width. The previous rail was
 * `hidden lg:flex` and was the only navigation in the app, which left phones and
 * tablets with zero reachable links — a page could only be opened by typing a URL.
 */
async function assertNavigable(page: Page, label: string, expectedActive: string | null) {
  const nav = await page.evaluate(() => {
    const links = [...document.querySelectorAll<HTMLAnchorElement>("[data-nav-item]")].filter(
      (link) => link.getBoundingClientRect().width > 0,
    );

    return {
      count: links.length,
      active: links.filter((link) => link.dataset.navActive !== undefined).map((link) => link.dataset.navItem),
    };
  });

  assert(nav.count >= 7, `${label} shows only ${nav.count} navigation links; every workspace screen must be reachable`);

  if (expectedActive === null) {
    // The landing is not a workspace screen, so nothing should claim to be current.
    assert(nav.active.length === 0, `${label} marks ${nav.active.join(", ")} active, but no workspace screen is open`);
    return;
  }

  assert(nav.active.length === 1, `${label} highlights ${nav.active.length} active nav items (${nav.active.join(", ")}), expected exactly one`);
  assert(nav.active[0] === expectedActive, `${label} marks "${nav.active[0]}" active, expected "${expectedActive}"`);
}

async function assertNoPageOverflow(page: Page, label: string) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert(overflow <= 1, `${label} scrolls horizontally by ${overflow}px`);
}

async function assertTraceRowsFit(page: Page, label: string, maxRowHeight: number) {
  const offenders = await page.evaluate((limit) => {
    const rows = [...document.querySelectorAll("[data-trace-row]")];

    return rows.flatMap((row, index) => {
      const rowBox = row.getBoundingClientRect();
      const problems: string[] = [];

      if (row.scrollWidth > row.clientWidth + 1) {
        problems.push(`row ${index} content is ${row.scrollWidth - row.clientWidth}px wider than the row`);
      }

      if (rowBox.height > limit) {
        problems.push(`row ${index} is ${Math.round(rowBox.height)}px tall, over the ${limit}px wrap budget`);
      }

      for (const child of row.querySelectorAll("*")) {
        const box = child.getBoundingClientRect();
        const text = child.textContent?.trim() ?? "";

        if (box.right > rowBox.right + 1) {
          problems.push(`row ${index} <${child.tagName.toLowerCase()}> overflows the row by ${Math.round(box.right - rowBox.right)}px`);
        }

        if (text.length > 0 && box.width < 8) {
          problems.push(`row ${index} <${child.tagName.toLowerCase()}> holding "${text.slice(0, 20)}" is squeezed to ${Math.round(box.width)}px`);
        }
      }

      return problems;
    });
  }, maxRowHeight);

  assert(offenders.length === 0, `${label} trace layout broken: ${offenders.slice(0, 5).join("; ")}`);
}

function collectConsoleErrors(page: Page) {
  const errors: string[] = [];

  page.on("console", (message: ConsoleMessage) => {
    if (message.type() === "error") {
      errors.push(message.text());
    }
  });

  page.on("pageerror", (error) => errors.push(error.message));

  return errors;
}

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
