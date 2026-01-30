# CheckoutAngular

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.1.5.

## Running the playground

The playground configuration connects to the Norce playground environment.

### Prerequisites

1. **Set up environment variables** - Copy the example environment file and configure your values:

```bash
cp .env.example .env
```

Edit `.env` with your playground credentials:
- `TOKEN` - Your playground API token for authorization
- `SLUG` - Your playground merchant slug (e.g., `order-demo`)

2. **Install dependencies**:

```bash
npm install
```

### Adapter configuration

They must be set up via the **Norce Admin GUI** for your merchant/channel.

The checkout application dynamically loads adapters based on the configuration returned by the Norce Order API.

#### Supported adapter combinations

| Platform | Payment | Shipping | Description |
|----------|---------|----------|-------------|
| Norce (with shipping) | Walley (no shipping) | - | Norce handles shipping, Walley handles payment only |
| Norce (no shipping) | Walley (no shipping) | Ingrid | Ingrid handles shipping, Walley handles payment only |
| Norce (no shipping) | Adyen | Ingrid | Ingrid handles shipping, Adyen handles payment |
 | Norce (with shipping) | Adyen | - | Norce handles shipping, Adyen handles payment |

#### Available adapters

- **Platform**: Norce (only supported platform)
- **Payment**: Walley, Adyen
- **Shipping**: Ingrid (supports address form mode)
- **Voucher**: Awardit

#### Platform adapter configuration

The checkout currently only supports the **Norce** platform adapter. This is fixed and not configurable.

When setting up the Norce platform adapter in the Admin GUI, configure `mapShippingFromNorceCommerce`:

| Setting | When to use |
|---------|-------------|
| `mapShippingFromNorceCommerce: true` | Use when Norce handles shipping (combined with Walley payment-only) |
| `mapShippingFromNorceCommerce: false` | Use when an external shipping adapter is used (Ingrid) |

#### Setting up adapters

1. Log in to the Norce Admin GUI
2. Navigate to your merchant/channel configuration
3. Configure payment and shipping adapters as needed
4. The checkout will automatically use the configured adapters

### Starting the playground server

```bash
npm run start:playground
```

The application will be available at `http://localhost:4200/`.
This page includes a form you can use to initialize a norce checkout order from a basket.

The playground configuration:
- Uses `environment.playground.ts` for environment settings
- Proxies API requests to `https://{SLUG}.api-se.playground.norce.tech/checkout`
- Automatically includes the `TOKEN` from your `.env` file in API requests

[//]: # (# Generating types)

[//]: # ()
[//]: # (```bash)

[//]: # (npx openapi-typescript https://order.checkout.test.internal.norce.tech/docs/v1/openapi.yaml --output src/openapi/order.ts --alphabetize --export-type --root-types --root-types-no-schema-prefix)

[//]: # (npx openapi-typescript https://norce-adapter.checkout.test.internal.norce.tech/docs/v1/openapi.yaml --output src/openapi/norce-adapter.ts --alphabetize --export-type --root-types --root-types-no-schema-prefix)

[//]: # (npx openapi-typescript https://configuration.checkout.test.internal.norce.tech/docs/v1/openapi.yaml --output src/openapi/configuration.ts --alphabetize --export-type --root-types --root-types-no-schema-prefix)

[//]: # (npx openapi-typescript https://walley-adapter.checkout.test.internal.norce.tech/docs/v1/openapi.yaml --output src/openapi/walley-adapter.ts --alphabetize --export-type --root-types --root-types-no-schema-prefix)

[//]: # (npx openapi-typescript https://adyen-adapter.checkout.test.internal.norce.tech/docs/v1/openapi.yaml --output src/openapi/adyen-adapter.ts --alphabetize --export-type --root-types --root-types-no-schema-prefix)

[//]: # (npx openapi-typescript https://ingrid-adapter.checkout.test.internal.norce.tech/docs/v1/openapi.yaml --output src/openapi/ingrid-adapter.ts --alphabetize --export-type --root-types --root-types-no-schema-prefix)

[//]: # (npx openapi-typescript https://awardit-adapter.checkout.test.internal.norce.tech/docs/v1/openapi.yaml --output src/openapi/awardit-adapter.ts --alphabetize --export-type --root-types --root-types-no-schema-prefix)

[//]: # (```)
