/**
 * @typedef {{
 *   environment: 'prod' | 'playground' | 'test' | 'stage';
 *   platform: 'norce',
 *   showPriceIncludingVat: boolean;
 *   context?: {
 *     merchant?: string | undefined;
 *     channel?: string | undefined;
 *   } | undefined;
 * }} Environment
 */
