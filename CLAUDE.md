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

## Styling

- TailwindCSS with layers: `tailwind-base, primeng, tailwind-utilities`
- PrimeNG with custom "Noir" theme (zinc-based dark theme)
- Font: "Space Grotesk"

## Adding a New Adapter

1. Create service implementing interface (e.g., `IPaymentService`)
2. Add to `src/app/features/*/provide-*-services.ts` with multi-provider pattern
3. Register factory in `app.config.ts`
4. Add identifier to `src/app/core/adapter.ts`
5. Create factory component in `src/app/features/*/`

## Path Aliases

`~/` → `src/`
