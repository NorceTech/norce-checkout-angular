export type WindowIngrid = {
  _sw?: ((callback: (api: IngridApi) => any) => void) | undefined;
};

export interface IngridApi {
  suspend: () => void;
  resume: () => void;
  on: (
    event: IngridEventName,
    cb: (data?: unknown, meta?: IngridMeta) => Promise<void> | void,
  ) => void;
}

export enum IngridEventName {
  DataChanged = 'data_changed',
  Loaded = 'loaded',
  NoShippingOptions = 'no_shipping_options',
  SummaryChanged = 'summary_changed',
}

export interface IngridMeta {
  delivery_type_changed: boolean;
  external_method_id_changed: boolean;
  price_changed: boolean;
  search_address_changed: boolean;
  shipping_method_changed: boolean;
  initial_load: boolean;
  category_name_changed: boolean;
  pickup_location_changed: boolean;

  // summary_changed
  total_value_changed: boolean;
  delivery_address_changed: boolean;
  billing_address_changed: boolean;
}
