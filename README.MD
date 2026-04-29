# SPOMS - Supplier and Purchase Order Management System

## Members

- Dennis Lopez Jr
- John Lester Poquita
- Angel Rose Cepe
- Jennifer Urboda

A Flask-based Supplier and Purchase Order Management System built to manage suppliers, purchase orders, payments, and reports using JSON storage.

## Accounts

- **Admin** - Username: dennis, Password: lopez
- **Purchasing Officer** - Username: jani, Pasword: jani
- **Finance Officer** - Username: angel, Password: angel
- **Store owner** - Username: jennifer, Password: jennifer

## Project Modules

### Module 1: Supplier Management

This module is implemented and functional in the current code.

**Features:**
- Add new supplier
- View supplier list
- Update supplier information
- Delete supplier
- Search suppliers by text and status
- Display supplier details in the supplier list

**How it works:**
- The `suppliers` route loads supplier data from `data/suppliers.json`.
- `templates/suppliers.html` provides a searchable table and modal form for add/edit.
- The API endpoints `/api/suppliers` and `/api/suppliers/<sid>` handle create, update, and delete actions.

### Module 2: Purchase Order Management

This module is implemented and functional in the current code.

**Features:**
- Create new purchase order
- Select supplier from existing suppliers
- Add product/item and quantity
- Enter unit price
- Automatically compute subtotal and total
- Update order details/status
- Cancel purchase order via status field
- Track order status as Pending, Approved, Delivered, or Cancelled

**How it works:**
- The `orders` route loads data from `data/orders.json` and supplier names from `data/suppliers.json`.
- `templates/purchase_orders.html` provides a creation modal, order table, search, and status update interface.
- The API endpoints `/api/orders` and `/api/orders/<po_number>` handle order creation and updating.

### Module 3: Delivery and Receiving

This module is partially implemented through order status management.

**Implemented behavior:**
- Delivered items are tracked by the order `status` field.
- The `delivery` field records the expected or actual delivery date.
- Order completion is verified by setting status to `Delivered`.
- Delivery status can be updated through the order status edit workflow.

**Note:**
- There is no separate dedicated delivery-only route or receiving form in the current code.
- Delivery handling is currently integrated into purchase order status updates.

### Module 4: Payment Method Management

This module is implemented and functional in the current code.

**Features:**
- Record supplier payment
- Select payment method (`Bank Transfer`, `Check`, `Cash`)
- Update payment status (`Pending`, `Partial`, `Paid`)
- View payment history and status in a searchable table

**How it works:**
- The `payments` route loads data from `data/payments.json` and existing purchase orders from `data/orders.json`.
- `templates/payments.html` provides a payment-record modal, order selection, auto-fill supplier/total amount, and status editing.
- The API endpoints `/api/payments` and `/api/payments/<payment_id>` handle payment create and status updates.

### Module 5: Reporting

This module is implemented and functional in the current code.

**Features:**
- Purchase order reporting
- Displays orders grouped by status
- Summarizes totals for pending, delivered, and approved orders
- Excludes cancelled orders from the main purchase order report table

**How it works:**
- The `reports` route loads orders, payments, suppliers, and feedback data.
- `templates/reports.html` renders a report table and summary metrics derived from current order data.

## Usage

1. Run the app:

   ```powershell
   python app.py
   ```

2. Open this URL in your browser:

   ```text
   http://127.0.0.1:5000
   ```

3. Login with demo credentials or add new users manually in `data/users.json`.

4. Use the navigation menu to access:
   - Suppliers
   - Purchase Orders
   - Payments
   - Reports

## Notes

- Data is stored in JSON files under `data/`.
- The current code does not include a dedicated product/item master module; product details are entered directly on purchase orders.
- Delivery and receiving are managed through order status updates rather than a separate delivery workflow.

Currently developing the live web.