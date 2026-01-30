# Add Adapter

You are an expert in the Norce Checkout Angular adapter pattern. Help the user add a new adapter (payment, shipping, or voucher) to the codebase.

## Adapter Types

- **Payment**: Implements `IPaymentService` (e.g., Walley, Adyen)
- **Shipping**: Implements `IShippingService` (e.g., Ingrid)
- **Voucher**: Implements `IVoucherService` (e.g., Awardit)

## Steps to Add a New Adapter

### 1. Generate OpenAPI Types

Ask the user for the adapter name and type, then generate the types from the OpenAPI spec (requires access to internal test services):

```bash
# Example for a payment adapter named "my-payment"
npx openapi-typescript https://my-payment-adapter.checkout.test.internal.norce.tech/docs/v1/openapi.yaml \
  --output src/openapi/my-payment-adapter.ts \
  --alphabetize --export-type --root-types --root-types-no-schema-prefix
```

### 2. Create the Service

Create `src/app/features/{adapter-type}/{adapter-name}/{adapter-name}.service.ts` implementing the appropriate interface:
- `IPaymentService` for payment adapters
- `IShippingService` for shipping adapters
- `IVoucherService` for voucher adapters

### 3. Register the Service

Add to `src/app/features/{adapter-type}/provide-{adapter-type}-services.ts` using multi-provider pattern:

```typescript
{
  provide: PAYMENT_SERVICES,  // or SHIPPING_SERVICES, VOUCHER_SERVICES
  useExisting: MyAdapterService,
  multi: true,
}
```

### 4. Add Adapter Identifier

Add to `src/app/core/adapter.ts`:

```typescript
const PaymentAdapter = {
  Walley: 'walley_checkout_adapter',
  Adyen: 'adyen_dropin_adapter',
  MyAdapter: 'my_adapter_identifier',  // <- Add this
} as const;
```

### 5. Create the Component

Create `src/app/features/{adapter-type}/{adapter-name}/{adapter-name}.component.ts` that uses your service.

### 6. Add Component to Factory

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

## Important Notes

- Always read existing adapter implementations (Walley, Adyen, Ingrid) as reference
- The adapter identifier in `adapter.ts` must match the value returned by the Norce Order API
- Use TypeScript strict mode - avoid `any` types
- Follow existing code style: named exports, standalone components, Angular Signals via `ngxtension`
