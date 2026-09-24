# FreshHarvest — Scrum Backlog & Sprint Plan

**Project:** SCRUM (freshharvest12.atlassian.net)
**Team:**
- Arun P — arunp.24cse@kongu.edu
- Anbarasan A — anbarasana.24cse@kongu.edu
- Arisudhan P — arisudhanp.24cse@kongu.edu

**Workflow:** To Do → In Progress → Testing → Done
**Sprint length assumed:** 2 weeks each (4 sprints = 8 weeks). *Assumption — adjust to your semester calendar.*

---

## Assumptions (stated explicitly, since none were given for these)
1. Payment is a **mock/sandbox** payment gateway (e.g., Razorpay/Stripe test mode) — no real money movement, since this is a college project.
2. Delivery tracking is **status-based** (Placed → Packed → Shipped → Out for Delivery → Delivered), not live GPS tracking.
3. Admin panel is a **separate simple dashboard**, not a full RBAC system with granular permissions.
4. Notifications (email/SMS) are **out of scope for MVP** unless you tell me otherwise.
5. Single currency, single delivery region — no multi-warehouse logic.

---

## EPIC 1: User Management
**Goal:** Customers and Farmers can register, log in, and manage their identity.

| Story | Description | Acceptance Criteria | Priority | Points | Assignee |
|---|---|---|---|---|---|
| US-1 Customer Registration | As a customer, I want to register with email/password so I can access the marketplace. | Given valid details, account is created and stored hashed; duplicate email is rejected with error; success redirects to login. | High | 3 | Arun P |
| US-2 Customer Login | As a customer, I want to log in so I can access my account. | Valid credentials return JWT/session; invalid credentials show error; session persists until logout. | High | 3 | Anbarasan A |
| US-3 Farmer Registration | As a farmer, I want to register separately so I can list products. | Registration form captures name, phone, farm location; role stored as FARMER; pending/approved status field exists. | High | 3 | Arisudhan P |
| US-4 Role-based Access | As a system, I want to restrict pages by role so users only see relevant features. | Customer cannot access farmer dashboard and vice versa; unauthorized access returns 403/redirect. | High | 5 | Arun P |
| US-5 Edit Profile | As a user, I want to edit my profile so my details stay current. | Name, phone, address editable; email immutable; changes persist after refresh. | Medium | 2 | Anbarasan A |
| US-6 Logout | As a user, I want to log out so my session ends securely. | Session/token invalidated; redirected to login page. | Low | 1 | Arisudhan P |

**Subtask pattern (apply to each story):** Frontend UI → Backend API → DB schema/migration → Unit test → Integration test.

---

## EPIC 2: Farmer Management
**Goal:** Farmers manage their profile and get admin approval to sell.

| Story | Description | Acceptance Criteria | Priority | Points | Assignee |
|---|---|---|---|---|---|
| US-7 Farmer Profile Setup | As a farmer, I want to add farm details (name, location, description) so customers trust my listings. | Profile form saves to DB; farm name and location are required fields. | High | 3 | Anbarasan A |
| US-8 Admin Approves Farmer | As an admin, I want to approve/reject farmer registrations so only verified farmers can sell. | Farmer status changes Pending → Approved/Rejected; unapproved farmers can't add products. | High | 3 | Arisudhan P |
| US-9 View Farmer Dashboard | As a farmer, I want a dashboard summarizing my products and orders. | Dashboard shows product count, pending orders, total sales (basic aggregation). | Medium | 5 | Arun P |

---

## EPIC 3: Product Management
**Goal:** Farmers list products; customers discover them.

| Story | Description | Acceptance Criteria | Priority | Points | Assignee |
|---|---|---|---|---|---|
| US-10 Add Product | As a farmer, I want to add a product with price, quantity, and image so customers can buy it. | Product saved with name, price, qty, category, image URL, farmer ID; validation on price/qty > 0. | High | 5 | Anbarasan A |
| US-11 Edit/Delete Product | As a farmer, I want to edit or delete my product listing. | Edits persist; delete removes/deactivates product; farmer can only modify own products. | High | 3 | Arisudhan P |
| US-12 Browse Products | As a customer, I want to browse all available products. | Product list loads with pagination; shows name, price, image, farmer name. | High | 3 | Arun P |
| US-13 Search Products | As a customer, I want to search products by name. | Search returns matching products (case-insensitive substring match); empty state handled. | High | 3 | Anbarasan A |
| US-14 Filter Products | As a customer, I want to filter by category/price range so I find relevant items faster. | Filters combine (category + price) correctly; "clear filters" resets list. | Medium | 5 | Arisudhan P |
| US-15 Product Detail View | As a customer, I want to view full product details before buying. | Detail page shows description, farmer info, price, stock, and average rating. | High | 2 | Arun P |
| US-16 Set Availability | As a farmer, I want to mark a product as out-of-stock automatically when quantity hits 0. | Stock auto-flips to "unavailable" at qty=0; customer can't add to cart if unavailable. | Medium | 3 | Anbarasan A |

---

## EPIC 4: Shopping Cart
**Goal:** Customers assemble orders before checkout.

| Story | Description | Acceptance Criteria | Priority | Points | Assignee |
|---|---|---|---|---|---|
| US-17 Add to Cart | As a customer, I want to add a product to my cart. | Item appears in cart with qty=1; adding same item increments quantity; stock limit enforced. | High | 3 | Arisudhan P |
| US-18 Update/Remove Cart Item | As a customer, I want to change quantity or remove an item from my cart. | Qty updates recalculate subtotal; removing sets qty to 0 and item disappears. | High | 2 | Arun P |
| US-19 View Cart Summary | As a customer, I want to see item total, count, and grand total before checkout. | Cart page shows itemized list + total price, updates live on change. | High | 3 | Anbarasan A |

---

## EPIC 5: Order Management
**Goal:** Convert cart into a trackable order.

| Story | Description | Acceptance Criteria | Priority | Points | Assignee |
|---|---|---|---|---|---|
| US-20 Place Order | As a customer, I want to place an order from my cart so I can buy the products. | Order created with status "Placed"; cart cleared after order; stock decremented per item. | High | 5 | Arisudhan P |
| US-21 View Order History | As a customer, I want to see my past orders. | List shows order date, items, status, total; sorted newest first. | Medium | 3 | Arun P |
| US-22 Farmer Manages Orders | As a farmer, I want to see and update orders containing my products. | Farmer sees only orders with their products; can update item status (Packed/Shipped). | High | 5 | Anbarasan A |
| US-23 Admin Views All Orders | As an admin, I want to view all orders for oversight. | Admin order list is filterable by status/date. | Low | 3 | Arisudhan P |

---

## EPIC 6: Payment Management
**Goal:** Customers pay for orders (mock gateway per assumption #1).

| Story | Description | Acceptance Criteria | Priority | Points | Assignee |
|---|---|---|---|---|---|
| US-24 Checkout & Pay | As a customer, I want to pay for my order so it gets confirmed. | Mock payment API called; on success, order status → "Paid"; on failure, order stays "Pending Payment". | High | 5 | Arun P |
| US-25 Payment Confirmation | As a customer, I want a confirmation after payment. | Confirmation screen/page shows order ID, amount, status. | Medium | 2 | Anbarasan A |
| US-26 Admin Payment Records | As an admin, I want to view payment logs for reconciliation. | Table of transactions with order ID, amount, status, timestamp. | Low | 3 | Arisudhan P |

---

## EPIC 7: Delivery Management
**Goal:** Track order fulfillment status (per assumption #2).

| Story | Description | Acceptance Criteria | Priority | Points | Assignee |
|---|---|---|---|---|---|
| US-27 Update Delivery Status | As a farmer/admin, I want to update delivery status so customers know progress. | Status enum: Placed→Packed→Shipped→Out for Delivery→Delivered; only forward transitions allowed. | High | 3 | Arun P |
| US-28 Track My Order | As a customer, I want to see my order's current delivery status. | Order detail page shows current status with a simple progress indicator. | High | 3 | Anbarasan A |

---

## EPIC 8: Review & Rating
**Goal:** Customers give feedback after delivery.

| Story | Description | Acceptance Criteria | Priority | Points | Assignee |
|---|---|---|---|---|---|
| US-29 Submit Review | As a customer, I want to rate and review a product after delivery. | Review allowed only if order status = Delivered; rating 1–5 + text comment; one review per order-item. | Medium | 5 | Arisudhan P |
| US-30 View Product Reviews | As a customer, I want to see reviews before buying. | Product page shows average rating + list of reviews. | Medium | 2 | Arun P |
| US-31 Admin Moderates Reviews | As an admin, I want to remove abusive reviews. | Admin can delete a review; deleted review no longer counts toward average. | Low | 2 | Anbarasan A |

---

## Sprint Plan (4 Sprints)

### Sprint 1 — Foundation (User + Farmer Management)
**Goal:** Auth working for all roles; farmer approval flow live.
Stories: US-1 to US-9
Total points: ~28
Focus: DB schema, auth (JWT), role-based routing.

### Sprint 2 — Catalog & Cart
**Goal:** Customers can browse, search, filter, and build a cart.
Stories: US-10 to US-19
Total points: ~32
Focus: Product CRUD, search/filter queries, cart state (session or DB-backed).

### Sprint 3 — Orders & Payment
**Goal:** End-to-end purchase: cart → order → payment.
Stories: US-20 to US-26
Total points: ~26
Focus: Order creation logic, stock decrement, mock payment integration.

### Sprint 4 — Delivery & Reviews (Hardening)
**Goal:** Full main flow closed: place → pay → track → review. Bug-fixing & demo prep.
Stories: US-27 to US-31 + regression testing + deployment
Total points: ~15 + buffer for bugs
Focus: Status tracking UI, review gating logic, final integration testing, demo rehearsal.

---

## Team Assignment Summary (round-robin, roughly balanced load)
- **Arun P:** US-1, US-4, US-9, US-12, US-15, US-18, US-21, US-24, US-27, US-30
- **Anbarasan A:** US-2, US-5, US-7, US-10, US-13, US-16, US-19, US-22, US-25, US-28, US-31
- **Arisudhan P:** US-3, US-6, US-8, US-11, US-14, US-17, US-20, US-23, US-26, US-29

*(Rebalance freely — this just avoids one person owning an entire epic alone.)*

---

## Next step
I can create these Epics, Stories, and Sprints directly in your Jira SCRUM project (with assignees and story points set) if you connect your Atlassian/Jira account below.
