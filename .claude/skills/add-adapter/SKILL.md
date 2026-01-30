---
name: add-adapter
description: Add a new payment, shipping, or voucher adapter to the Norce Checkout Angular codebase following the adapter pattern. Use when the user wants to add a new adapter integration.
---

# Add Adapter

You are an expert in the Norce Checkout Angular adapter pattern. Help the user add a new adapter (payment, shipping, or voucher) to the codebase.

## Adapter Types

- **Payment**: Implements `IPaymentService` (e.g., Walley, Adyen)
- **Shipping**: Implements `IShippingService` (e.g., Ingrid)
- **Voucher**: Implements `IVoucherService` (e.g., Awardit)

## Steps to Add a New Adapter

### 1. Gather Adapter Information

Ask the user for:

- Adapter name (e.g., "my-payment")
- Adapter type (payment, shipping, or voucher)
- Adapter identifier (the string value returned by Norce Order API)
- **Documentation URL** (e.g., official documentation site for the external adapter - this may include frontend initialization guides, event listeners, SDK usage, etc.)
- Any other relevant resources (GitHub repos, examples, etc.)

### 2. Generate OpenAPI Types

**IMPORTANT: Never edit files in `src/openapi/`** - They are auto-generated and any changes will be overwritten. If the OpenAPI spec has issues (e.g., duplicate operation IDs), report them to the API team rather than fixing the generated file.

Generate the types from the OpenAPI spec (requires access to internal test services):

```bash
# Example for a payment adapter named "my-payment"
npx openapi-typescript https://my-payment-adapter.checkout.test.internal.norce.tech/docs/v1/openapi.yaml \
  --output src/openapi/my-payment-adapter.ts \
  --alphabetize --export-type --root-types --root-types-no-schema-prefix
```

### 3. Create the Service

Create `src/app/features/{adapter-type}/{adapter-name}/{adapter-name}.service.ts` implementing the appropriate interface:

- `IPaymentService` for payment adapters
- `IShippingService` for shipping adapters
- `IVoucherService` for voucher adapters

### 4. Register the Service

Add to `src/app/features/{adapter-type}/provide-{adapter-type}-services.ts` using multi-provider pattern:

```typescript
{
  provide: PAYMENT_SERVICES,  // or SHIPPING_SERVICES, VOUCHER_SERVICES
  useExisting: MyAdapterService,
  multi: true,
}
```

### 5. Add Adapter Identifier

Add to `src/app/core/adapter.ts`:

```typescript
const PaymentAdapter = {
  Walley: "walley_checkout_adapter",
  Adyen: "adyen_dropin_adapter",
  MyAdapter: "my_adapter_identifier", // <- Add this
} as const;
```

### 6. Create the Component

Create `src/app/features/{adapter-type}/{adapter-name}/{adapter-name}.component.ts` that uses your service.

### 7. Add Component to Factory

In the factory component (e.g., `PaymentFactoryComponent` for payments):

1. Import the new component
2. Add to the components mapping:

```typescript
import {MyAdapterComponent} from '~/app/features/payments/my-adapter/my-adapter.component';

private PAYMENT_COMPONENTS = {
  [this.adapters.payment.Walley]: WalleyComponent,
  [this.adapters.payment.Adyen]: AdyenComponent,
  [this.adapters.payment.MyAdapter]: MyAdapterComponent,  // <- Add this
} as const;
```

### 8. Add Proxy Configuration

Add the adapter service name to `src/proxy.conf.test.js` in the services array (alphabetically sorted):

```javascript
const services = [
  "adyen-adapter",
  "my-adapter", // <- Add this (e.g., "klarna-adapter", "quickpay-adapter")
  "walley-adapter",
];
```

The service name must match the internal test service URL (e.g., `https://my-adapter.checkout.test.internal.norce.tech`).

### 9. Add to Confirmation Factory

For snippet payments, you must also add the component to the `ConfirmationFactoryComponent` at `src/app/features/confirmation/confirmation-factory/confirmation-factory.component.ts`:

```typescript
import { MyAdapterComponent } from '~/app/features/payments/my-adapter/my-adapter.component';

private CONFIRMATION_COMPONENTS = {
  [this.adapters.payment.Walley]: WalleyComponent,
  [this.adapters.payment.Kustom]: KustomComponent,
  [this.adapters.payment.Qliro]: QliroComponent,
  [this.adapters.payment.MyAdapter]: MyAdapterComponent,  // <- Add for snippet payments
} as const;
```

If it is not a snippet payment, you can skip this step.

## Important Notes

- Always read existing adapter implementations (Walley, Adyen, Ingrid) as reference
- The adapter identifier in `adapter.ts` must match the value returned by the Norce Order API
- Use TypeScript strict mode - avoid `any` types
- Follow existing code style: named exports, standalone components, Angular Signals via `ngxtension`
