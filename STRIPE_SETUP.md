# Stripe Integration Setup Guide

This document outlines the steps needed to complete the Stripe integration setup.

## Prerequisites

1. **Stripe Account**: Create a Stripe account at https://stripe.com
2. **Database Migration**: Run database migrations to create the new tables

## Environment Variables

Add the following environment variables to your `.env` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_... # Your Stripe secret key
STRIPE_WEBHOOK_SECRET=whsec_... # Webhook signing secret (get from Stripe dashboard)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... # Your Stripe publishable key

# Stripe Price IDs (create these in Stripe dashboard)
STRIPE_PRICE_BASIC_MONTH=price_...
STRIPE_PRICE_BASIC_YEAR=price_...
STRIPE_PRICE_PRO_MONTH=price_...
STRIPE_PRICE_PRO_YEAR=price_...
STRIPE_PRICE_PREMIUM_MONTH=price_...
STRIPE_PRICE_PREMIUM_YEAR=price_...
```

## Database Migration

Run the following command to create the new database tables:

```bash
npx drizzle-kit generate
npx drizzle-kit push
```

Or use your existing migration script.

## Stripe Dashboard Setup

### 1. Create Products and Prices

1. Go to Stripe Dashboard → Products
2. Create products for each subscription tier:
   - Basic (Monthly): $4.99/month
   - Basic (Yearly): $49.99/year (or calculate 20% discount)
   - Pro (Monthly): $9.99/month
   - Pro (Yearly): $95.99/year
   - Premium (Monthly): $19.99/month
   - Premium (Yearly): $191.99/year

3. Create products for one-time purchases:
   - QR Code Stickers Pack
   - Wallet Cards
   - (Add more as needed)

4. Copy the Price IDs and add them to your `.env` file

### 2. Create Products in Database

You'll need to insert product records into the database. You can do this via:

1. Admin panel (if you create an admin product management page)
2. Direct database insert
3. Migration script

Example SQL:
```sql
INSERT INTO product (id, name, description, stripe_product_id, stripe_price_id, price, currency, is_active)
VALUES 
  (UUID(), 'QR Code Stickers Pack', 'Pack of 10 QR code stickers', 'prod_...', 'price_...', 9.99, 'usd', true),
  (UUID(), 'Wallet Card', 'Durable wallet card with QR code', 'prod_...', 'price_...', 4.99, 'usd', true);
```

### 3. Configure Webhooks

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/stripe/webhook`
3. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the webhook signing secret to your `.env` file

## Features Implemented

### Subscription Management
- ✅ Monthly and yearly subscription options
- ✅ Subscription cancellation (at period end)
- ✅ Subscription resumption
- ✅ Subscription status tracking
- ✅ Automatic renewal handling

### One-Time Purchases
- ✅ Product catalog page
- ✅ Shopping cart functionality
- ✅ Checkout integration
- ✅ Order creation

### Order Management
- ✅ User order history page
- ✅ Admin order management page
- ✅ Order status updates (pending, processing, completed, shipped, delivered, cancelled)
- ✅ Tracking number support
- ✅ Order notes

### Notifications
- ✅ Notification system for order updates
- ✅ Notification system for subscription updates
- ✅ Notification inbox page
- ✅ Unread notification tracking

### Address Management
- ✅ User address storage
- ✅ Default address selection
- ✅ Address used for shipping

## API Routes

### Stripe
- `POST /api/stripe/checkout` - Create checkout session
- `POST /api/stripe/webhook` - Handle Stripe webhooks
- `GET /api/stripe/subscription` - Get user subscription
- `DELETE /api/stripe/subscription` - Cancel subscription
- `PATCH /api/stripe/subscription` - Resume subscription

### Orders
- `GET /api/orders` - Get user orders
- `GET /api/admin/orders` - Get all orders (admin)
- `PATCH /api/admin/orders` - Update order (admin)

### Products
- `GET /api/products` - Get all active products

### Notifications
- `GET /api/notifications` - Get user notifications
- `PATCH /api/notifications` - Mark notification as read

### Address
- `GET /api/address` - Get user addresses
- `POST /api/address` - Create address
- `PUT /api/address` - Update address

## Pages

### User Pages
- `/dashboard/account` - Account settings with subscription management
- `/dashboard/orders` - Order history
- `/dashboard/notifications` - Notification inbox
- `/dashboard/shop` - Product catalog

### Admin Pages
- `/admin/orders` - Order management dashboard

## Testing

### Test Mode
Use Stripe test mode for development:
- Test card: `4242 4242 4242 4242`
- Any future expiry date
- Any CVC

### Webhook Testing
Use Stripe CLI for local webhook testing:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Next Steps

1. Run database migrations
2. Set up Stripe products and prices
3. Configure webhooks
4. Add environment variables
5. Test subscription flow
6. Test one-time purchase flow
7. Test order management
8. Test notifications

## Notes

- The subscription prices in `constants.ts` are display-only. Actual pricing is configured in Stripe.
- Yearly pricing should be approximately 20% less than monthly (10 months of monthly price).
- All monetary values are stored as decimals in the database.
- Stripe handles all payment processing and security.

