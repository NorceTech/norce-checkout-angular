# Project: Norce Checkout Angular

Angular 19 e-commerce checkout application for Norce platform. Uses adapter pattern to dynamically load payment (Walley, Adyen), shipping (Ingrid), and voucher (Awardit) providers based on API configuration.

## Code Style

- TypeScript strict mode, avoid `any` types
- Named exports preferred, no default exports
- Standalone Angular components (imports array)
- Angular Signals via `ngxtension` for reactive values
- RxJS for async streams

## Commands

```bash
npm run start:playground  # Development (default)
npm run start:stage       # Stage environment
npm run start:test        # Test environment with internal services
npm run build             # Production build
npm run watch             # Development watch mode
npm run test              # Run Jasmine/Karma tests
```

## Architecture

### Directory Structure

```
src/app/
├── core/           # Core services, entities, interceptors
├── features/       # Feature modules (payments, shippings, vouchers)
├── pages/          # Route components (create-order, checkout, confirmation)
├── layouts/        # Layout components
└── shared/         # Shared utilities
```

### Adapter Pattern (Core Concept)

Adapters are loaded dynamically based on Norce Order API response. Multi-provider pattern in `app.config.ts`:

- `PAYMENT_SERVICES` - Walley, Adyen
- `SHIPPING_SERVICES` - Ingrid
- `VOUCHER_SERVICES` - Awardit (optional)

Adapter identifiers in `src/app/core/adapter.ts` match API response values.

### Key Services

- `ContextService` - Computed context (merchant, channel, orderId) from env/query params
- `SyncService` - Tracks in-flight HTTP requests via `syncInterceptor`
- `OrderService` - Core order management
- `PlatformService` / `NorceAdapterService` - Platform operations

### HTTP Interceptors (registered in app.config.ts)

1. `contextInterceptor` - Adds Authorization header and context
2. `syncInterceptor` - Tracks in-flight requests for loading states

### Application Flow

1. `/` - CreateOrderComponent (initialize checkout from basket)
2. `/checkout` - CheckoutComponent (complete checkout with adapters)
3. `/confirmation` - ConfirmationComponent (order confirmation)

### State Management

No global state library. Uses RxJS + Angular Signals.

### OpenAPI Types

`src/openapi/` contains generated type definitions from OpenAPI specs.

**IMPORTANT: Never edit files in `src/openapi/`** - They are auto-generated and any changes will be overwritten. If the OpenAPI spec has issues (e.g., duplicate operation IDs), report them to the API team rather than fixing the generated file.

## Adding a New Adapter

Use `/add-adapter` skill to add a new payment, shipping, or voucher adapter.

## Styling

- TailwindCSS with layers: `tailwind-base, primeng, tailwind-utilities`
- PrimeNG with custom "Noir" theme (zinc-based dark theme)
- Font: "Space Grotesk"

## Adding a New Adapter

1. **Generate OpenAPI types** (requires access to internal test services):

```bash
# Example for a payment adapter (e.g., "my-payment")
npx openapi-typescript https://my-payment-adapter.checkout.test.internal.norce.tech/docs/v1/openapi.yaml \
  --output src/openapi/my-payment-adapter.ts \
  --alphabetize --export-type --root-types --root-types-no-schema-prefix
```

2. **Create the service** implementing the appropriate interface (e.g., `IPaymentService`, `IShippingService`, `IVoucherService`) in `src/app/features/*/my-adapter/my-adapter.service.ts`

3. **Register the service** in `src/app/features/*/provide-*-services.ts` using the multi-provider pattern:

```typescript
{
  provide: PAYMENT_SERVICES,  // or SHIPPING_SERVICES, VOUCHER_SERVICES
  useExisting: MyAdapterService,
  multi: true,
}
```

4. **Add the adapter identifier** to `src/app/core/adapter.ts`:

```typescript
const PaymentAdapter = {
  Walley: "walley_checkout_adapter",
  Adyen: "adyen_dropin_adapter",
  MyAdapter: "my_adapter_identifier", // <- Add this
} as const;
```

5. **Create the component** in `src/app/features/*/my-adapter/my-adapter.component.ts` that uses your service

6. **Add component to factory** - Import and register in the factory component (e.g., `PaymentFactoryComponent`):

```typescript
import {MyAdapterComponent} from '~/app/features/payments/my-adapter/my-adapter.component';

private PAYMENT_COMPONENTS = {
  [this.adapters.payment.Walley]: WalleyComponent,
  [this.adapters.payment.Adyen]: AdyenComponent,
  [this.adapters.payment.MyAdapter]: MyAdapterComponent,  // <- Add this
} as const;
```

## Path Aliases

`~/` → `src/`
