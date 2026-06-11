/**
 * Font-scaling caps for iOS Dynamic Type / Android font size settings.
 *
 * React 19 ignores `Text.defaultProps`, so there is no global way to cap
 * scaling — spread these onto `<Text>` where the layout is tight. Text in
 * free-flowing containers (paragraphs, list rows) should stay uncapped so it
 * scales fully for accessibility.
 *
 *   DENSE_TEXT  — badges, count chips, stepper labels, segmented tabs.
 *   SCALED_TEXT — buttons, headers, hero numbers: room to grow, but bounded
 *                 so one-line labels stay one line.
 */
export const DENSE_TEXT = { maxFontSizeMultiplier: 1.1 } as const;
export const SCALED_TEXT = { maxFontSizeMultiplier: 1.2 } as const;
