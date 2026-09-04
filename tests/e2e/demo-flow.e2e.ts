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
    await checkMarketPulse(browser);
    await checkReducedMotion(browser);
    await captureResponsiveScreenshots(browser);
    console.log("e2e: demo flow, streaming, market pulse, reduced motion and responsive capture passed");
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
async function measurePulseModulation(page: Page) {
  return page.evaluate(async () => {
    const canvas = document.querySelector<HTMLCanvasElement>("[data-market-pulse] canvas");
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
  });
}

async function checkDemoFlow(browser: Browser) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = collectConsoleErrors(page);

  await page.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
  await page.getByRole("heading", { name: /make it inspect the market/i }).waitFor({ timeout: 30_000 });

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
