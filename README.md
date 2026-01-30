# CheckoutAngular

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.1.5.

## Running the application

The application supports multiple environment configurations: playground, stage, and test.

### Prerequisites

1. **Set up environment variables** - Copy the example environment file and configure your values:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:
- `TOKEN` - Your API token for authorization
- `SLUG` - Your slug when accessing norce services (e.g., `order-demo` if accessing admin from https://order-demo.admin-se.playground.norce.tech)

2. **Install dependencies**:

```bash
npm install
```

### Adapter configuration

Adapters must be set up via the **Norce Admin GUI** for your merchant/channel.

The checkout application dynamically loads adapters based on the configuration returned by the Norce Order API.

#### Supported adapter combinations

| Platform                | Shipping                   | Payment                |
|-------------------------|----------------------------|------------------------|
| Norce (with shipping)   | -                          | Walley                 |
| Norce                   | -                          | Walley (with shipping) |
| Norce                   | Ingrid                     | Walley                 |
| Norce                   | Ingrid (with address form) | Adyen                  |

#### Available adapters

- **Platform**: Norce
- **Payment**: Walley, Adyen
- **Shipping**: Ingrid
- **Voucher**: Awardit (optional in all setup combinations)

#### Setting up adapters

1. Log in to the Norce Checkout Admin GUI
2. Navigate to your merchant/channel configuration
3. Configure platform, payment and shipping adapters as needed
4. The checkout will automatically use the configured adapters

### Starting the application

Choose the environment you want to run:

```bash
npm run start:playground  # Connects to playground environment
npm run start:stage       # Connects to stage environment
npm run start:test        # Connects to test environment
```

The application will be available at `http://localhost:4200/`.
This page includes a form you can use to initialize a norce checkout order from a basket.

#### Environment configurations

| Environment     | Environment file              | API target                              |
|-----------------|-------------------------------|-----------------------------------------|
| Playground      | `environment.playground.ts`    | `https://{SLUG}.api-se.playground.norce.tech/checkout` |
| Stage           | `environment.stage.ts`         | `https://{SLUG}.api-se.stage.norce.tech/checkout` |
| Test            | `environment.test.ts`          | Internal test services                  |

All configurations automatically include the `TOKEN` from your `.env` file in API requests.

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
