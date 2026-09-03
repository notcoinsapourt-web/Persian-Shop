# Persian Shop API Architecture

## System Flow

Telegram Bot -> Persian Shop API -> Website -> Telegram Mini App

## Core Modules

- Products
- Categories
- Users
- Orders
- Payments
- Wallet
- Admin Settings

## API Resources

/products
/categories
/users
/orders
/payments
/wallet

## Product Model

```json
{
  "id": "",
  "name": "",
  "category": "",
  "image": "",
  "description": "",
  "duration": "",
  "price": 0,
  "instructions": "",
  "status": "active",
  "created_at": ""
}
```

## Integration Targets

- Telegram Bot
- Telegram WebApp SDK
- Future Admin Panel
