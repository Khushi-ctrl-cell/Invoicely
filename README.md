# Invoice Generator API

Production-ready Node.js + Express REST API for generating GST-compliant invoices with PDF export.

## Tech Stack

| Layer       | Technology                        |
|-------------|-----------------------------------|
| Runtime     | Node.js ≥ 18                      |
| Framework   | Express 4                         |
| Database    | MongoDB + Mongoose                |
| PDF Engine  | PDFKit                            |
| Security    | Helmet, CORS                      |
| Logging     | Morgan                            |
| Deployment  | Render                            |

---

## Project Structure

```
invoice-backend/
├── src/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── controllers/
│   │   ├── itemController.js  # Item CRUD
│   │   └── invoiceController.js # Invoice + PDF
│   ├── models/
│   │   ├── Item.js            # Item schema
│   │   └── Invoice.js         # Invoice schema (auto-computes totals)
│   ├── routes/
│   │   ├── itemRoutes.js
│   │   └── invoiceRoutes.js
│   ├── middleware/
│   │   ├── errorHandler.js    # Global error handler
│   │   └── notFound.js        # 404 handler
│   ├── utils/
│   │   └── pdfGenerator.js    # PDFKit invoice renderer
│   ├── app.js                 # Express app config
│   └── server.js              # Entry point + graceful shutdown
├── .env.example
├── .gitignore
├── render.yaml                # Render deployment config
└── README.md
```

---

## Quick Start

```bash
# 1. Clone and install
npm install

# 2. Configure environment
cp .env.example .env
# → Fill in MONGO_URI and company details

# 3. Run development server
npm run dev

# 4. Test health
curl http://localhost:5000/health
```

---

## Environment Variables

| Variable           | Required | Description                             |
|--------------------|----------|-----------------------------------------|
| `PORT`             | No       | Server port (default: 5000)             |
| `NODE_ENV`         | No       | development / production                |
| `MONGO_URI`        | **Yes**  | MongoDB connection string               |
| `ALLOWED_ORIGINS`  | No       | Comma-separated CORS origins            |
| `COMPANY_NAME`     | No       | Appears on invoices                     |
| `COMPANY_ADDRESS`  | No       | Appears on invoices                     |
| `COMPANY_EMAIL`    | No       | Appears on invoices                     |
| `COMPANY_PHONE`    | No       | Appears on invoices                     |
| `COMPANY_GSTIN`    | No       | Appears on invoices                     |
| `COMPANY_PAN`      | No       | Appears on invoices                     |

---

## API Reference

### Health

```
GET /health
```

---

### Items

#### List items
```
GET /api/items?search=&active=true&page=1&limit=50
```

#### Get single item
```
GET /api/items/:id
```

#### Create item
```
POST /api/items
Content-Type: application/json

{
  "name": "Web Development Service",
  "description": "Full-stack web development",
  "basePrice": 5000,
  "unit": "hr",
  "hsnCode": "998314",
  "variants": [
    { "name": "Junior", "additionalPrice": 0, "sku": "WD-JR" },
    { "name": "Senior", "additionalPrice": 2000, "sku": "WD-SR" }
  ]
}
```

#### Update item
```
PUT /api/items/:id
```

#### Delete item
```
DELETE /api/items/:id
```

---

### Invoices

#### Create invoice
```
POST /api/invoices
Content-Type: application/json

{
  "customer": {
    "name": "Acme Corp",
    "email": "accounts@acme.com",
    "phone": "+91 98765 43210",
    "gstin": "22AAAAA0000A1Z5",
    "address": {
      "line1": "Plot 42, Industrial Area",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001"
    }
  },
  "dueDate": "2025-07-31",
  "paymentTerms": "Net 30",
  "items": [
    {
      "name": "Web Development Service",
      "description": "Frontend + Backend",
      "hsnCode": "998314",
      "unit": "hr",
      "quantity": 40,
      "unitPrice": 1500,
      "gstRate": 18,
      "discountType": "percentage",
      "discountValue": 10
    }
  ],
  "notes": "Please pay via bank transfer.",
  "termsAndConditions": "Payment due within 30 days."
}
```

**Notes:**
- `invoiceNumber` is auto-generated (e.g., `INV-2025-0001`)
- All financial totals (`subtotal`, `totalGST`, `grandTotal`, etc.) are **auto-computed** server-side
- You do NOT need to send computed fields

#### List invoices
```
GET /api/invoices?status=draft&page=1&limit=20&search=acme&from=2025-01-01&to=2025-12-31
```

#### Get single invoice
```
GET /api/invoices/:id
```

#### Update status
```
PATCH /api/invoices/:id/status
{ "status": "paid" }
```
Valid statuses: `draft`, `sent`, `paid`, `overdue`, `cancelled`

#### Download PDF
```
GET /api/invoices/pdf/:id
```
Returns `application/pdf` stream.

#### Invoice stats
```
GET /api/invoices/stats
```

---

## Deployment on Render

1. Push code to GitHub
2. Create **New Web Service** on [render.com](https://render.com)
3. Connect your repo
4. Render auto-detects `render.yaml`
5. Set env vars in Render dashboard (especially `MONGO_URI`)
6. Deploy!

**MongoDB:** Use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) free tier. Whitelist `0.0.0.0/0` for Render's dynamic IPs.

---

## Invoice PDF Layout

The generated PDF includes:
- Company branding header with GSTIN
- Invoice number, dates, status badge
- Bill From / Bill To columns
- Line items table with HSN, Qty, Unit Price, Discount, GST%, GST Amount, Total
- Summary: Subtotal → Discount → Taxable Amount → GST → Grand Total
- Notes section
- Terms & Conditions
- Professional footer

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Descriptive error message"
}
```

| Code | Meaning                        |
|------|--------------------------------|
| 400  | Bad request / invalid ObjectId |
| 404  | Resource not found             |
| 409  | Duplicate key (e.g., invoiceNumber) |
| 422  | Mongoose validation error      |
| 500  | Internal server error          |
