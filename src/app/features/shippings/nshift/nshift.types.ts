import type { WidgetSettings } from '~/openapi/nshift-adapter';

declare global {
  interface Window {
    nShiftCheckoutWidget: {
      createWidget: (
        container: string | HTMLElement,
        settings: NshiftSettings,
      ) => NshiftWidget;
    };
  }
}

export interface NshiftWidget {
  install(): void;
  uninstall(): void;
  disable(): void;
  enable(): void;
  updateOptions(data: unknown, result?: unknown): void;
  // resize(): void;
}

export type NshiftSettings = WidgetSettings & {
  resizeCallback?: (size: unknown) => any;
  resultCallback: (result: unknown) => any;
  accessibilityChangeCallback?: (diff: unknown) => any;
  accessibilityValidationCallback?: (message: unknown) => any;
};
