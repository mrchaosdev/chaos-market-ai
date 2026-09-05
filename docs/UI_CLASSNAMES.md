# UI class names

Semantic DOM hooks use the `cm-` namespace. They sit beside Tailwind utility
classes and do not currently own any visual styles. Use them when referring to a
specific UI region, writing targeted CSS, or selecting elements in UI tests.

## Naming convention

```text
cm-component
cm-component__element
cm-component--state
cm-component__element--variant
```

State and variant modifiers may be generated from component props. Examples:
`cm-status--running`, `cm-number--positive`, and
`cm-app-nav__item--analyze`.

## Page and layout hooks

| Area | Main selectors |
| --- | --- |
| Document | `.cm-document`, `.cm-document__body` |
| Landing | `.cm-landing`, `.cm-landing-header`, `.cm-landing-hero`, `.cm-landing-workspace`, `.cm-landing-product` |
| App shell | `.cm-app-shell`, `.cm-app-shell__frame`, `.cm-app-shell__content` |
| Top navigation | `.cm-top-nav`, `.cm-app-nav`, `.cm-app-nav__item` |
| Mobile navigation | `.cm-mobile-nav`, `.cm-mobile-nav__toggle`, `.cm-mobile-nav__panel`, `.cm-mobile-nav__item` |
| Market header | `.cm-market-header`, `.cm-market-header__identity`, `.cm-market-header__metrics` |
| Overview route | `.cm-overview-page`, `.cm-overview-page__main`, `.cm-overview-page__aside` |
| Analyze route | `.cm-page--analyze` |
| Compare route | `.cm-page--compare` |
| Entry route | `.cm-page--entry` |
| History route | `.cm-page--history`, `.cm-history__table`, `.cm-history__row` |
| Settings route | `.cm-page--settings`, `.cm-settings__runtime`, `.cm-settings__safety` |

## Feature hooks

| Feature | Root and useful descendants |
| --- | --- |
| Analysis | `.cm-analysis`, `.cm-analysis__price-card`, `.cm-analysis__chart`, `.cm-analysis__indicators`, `.cm-analysis__signal-card`, `.cm-analysis__evidence`, `.cm-analysis__interpretation`, `.cm-analysis__risk` |
| Overview | `.cm-overview-panel`, `.cm-overview-panel__regime`, `.cm-overview-panel__movers`, `.cm-overview-panel__primary-analysis` |
| Compare | `.cm-compare-panel`, `.cm-compare-panel__assets`, `.cm-compare-asset`, `.cm-compare-table`, `.cm-compare-panel__interpretation` |
| Entry | `.cm-entry-panel`, `.cm-entry-panel__fields`, `.cm-entry-field`, `.cm-entry-panel__evidence`, `.cm-entry-panel__analysis` |
| Agent workflow | `.cm-agent-workflow`, `.cm-agent-workflow__sidebar`, `.cm-agent-workflow__dock`, `.cm-agent-workflow__result`, `.cm-agent-result-header`, `.cm-agent-result-tabs`, `.cm-agent-workflow__trace`, `.cm-agent-workflow__output` |
| Agent trace | `.cm-agent-trace`, `.cm-agent-trace__group`, `.cm-agent-trace-row` |
| Agent sphere | `.cm-agent-sphere`, `.cm-agent-sphere__vitals` |
| Market pulse | `.cm-market-pulse`, `.cm-market-pulse__readouts` |
| Market chart | `.cm-market-chart`, `.cm-market-chart__legend`, `.cm-market-chart__canvas` |
| Market watch | `.cm-market-watch`, `.cm-market-watch__row` |
| Symbol picker | `.cm-symbol-picker`, `.cm-symbol-picker__item`, `.cm-symbol-picker__item--disabled` |
| Loading panel | `.cm-loading-panel`, `.cm-loading-panel__bars`, `.cm-loading-panel__bar` |
| Token icon | `.cm-token-icon`, `.cm-token-icon--fallback` |
| Workflow metadata | `.cm-workflow-meta`, `.cm-workflow-meta__item`, `.cm-workflow-meta__run-id` |

## Shared primitives

The shared component roots follow their component names: `.cm-panel`,
`.cm-metric`, `.cm-status`, `.cm-number`, `.cm-command-input`, `.cm-command`,
`.cm-terminal-surface`, `.cm-domain-error`, `.cm-progress`, `.cm-ticker`,
`.cm-trace`, `.cm-trace-row`, `.cm-logo`, `.cm-sphere`, `.cm-scrollbar`,
`.cm-badge`, `.cm-label`, `.cm-divider`, and `.cm-field`.

Search the source for a selector to see every available descendant. Keep these
semantic hooks stable when changing Tailwind utilities so edit requests and UI
tests do not depend on presentation details.
