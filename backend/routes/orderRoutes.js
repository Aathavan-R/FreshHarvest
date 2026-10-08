const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');

// Optional auth helper: retrieves user info if token is provided
function getOptionalUser(req) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      return jwt.verify(token, JWT_SECRET);
    } catch {
      return null;
    }
  }
  return null;
}

// Helper to generate IDs
function generateOrderId() {
  const num = Math.floor(10000 + Math.random() * 90000);
  return `FH-ORD-${num}`;
}

function generateTxnId() {
  const num = Math.floor(100000 + Math.random() * 900000);
  return `TXN-FH-${num}`;
}

// -------------------------------------------------------------
// POST /api/orders (Place Order & Confirm Order)
// -------------------------------------------------------------
router.post('/', async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      items,
      paymentMethod,
      paymentDetails,
      deliveryInstructions
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Cart items are required to place an order.' });
    }

    if (!customerName || !customerPhone || !shippingAddress || !shippingAddress.street || !shippingAddress.city) {
      return res.status(400).json({ message: 'Recipient name, phone, and complete shipping address are required.' });
    }

    const validPaymentMethods = ['UPI', 'Credit/Debit Card', 'Net Banking', 'Cash on Delivery'];
    if (!paymentMethod || !validPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({ message: 'Please select a valid payment method.' });
    }

    const user = getOptionalUser(req);
    const userId = user ? user.id : (req.body.userId || 'guest');
    const email = customerEmail || (user ? user.email : 'customer@freshharvest.in');

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
    const deliveryFee = subtotal >= 300 ? 0 : 40;
    const tax = Math.round(subtotal * 0.05); // 5% GST
    const totalAmount = subtotal + deliveryFee + tax;

    const orderId = generateOrderId();
    const transactionId = generateTxnId();

    const isCod = paymentMethod === 'Cash on Delivery';
    const paymentStatus = isCod ? 'Pending' : 'Paid';

    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 1);
    estimatedDelivery.setHours(10, 0, 0, 0);

    const initialTimeline = [
      {
        status: 'Placed',
        timestamp: new Date(),
        note: `Order placed successfully via ${paymentMethod}`
      }
    ];

    const order = new Order({
      orderId,
      userId,
      customerName: customerName.trim(),
      customerEmail: email.trim().toLowerCase(),
      customerPhone: customerPhone.trim(),
      shippingAddress: {
        street: shippingAddress.street.trim(),
        city: shippingAddress.city.trim(),
        state: shippingAddress.state ? shippingAddress.state.trim() : 'Tamil Nadu',
        zipCode: shippingAddress.zipCode ? shippingAddress.zipCode.trim() : '638052',
        label: shippingAddress.label || 'Home'
      },
      items: items.map(it => ({
        productId: it.productId || it._id || it.id || 'p-1',
        name: it.name,
        price: Number(it.price),
        quantity: Number(it.quantity),
        unit: it.unit || 'kg',
        image: it.image || '',
        farmerName: it.farmerName || 'Local Organic Farmer'
      })),
      subtotal,
      deliveryFee,
      tax,
      totalAmount,
      paymentMethod,
      paymentStatus,
      transactionId,
      orderStatus: 'Placed',
      statusTimeline: initialTimeline,
      estimatedDelivery
    });

    await order.save();

    // Create Payment Record
    const payment = new Payment({
      transactionId,
      orderId,
      userId,
      customerName: customerName.trim(),
      customerEmail: email.trim().toLowerCase(),
      amount: totalAmount,
      paymentMethod,
      paymentDetails: paymentDetails || {},
      status: isCod ? 'Pending' : 'Completed',
      gatewayReference: `MOCK_GW_${Math.floor(Math.random() * 1000000)}`
    });

    await payment.save();

    res.status(201).json({
      message: 'Order placed successfully!',
      order,
      payment
    });
  } catch (err) {
    console.error('Error placing order:', err);
    res.status(500).json({ message: 'Failed to place order', error: err.message });
  }
});

// -------------------------------------------------------------
// GET /api/orders (View Orders List)
// -------------------------------------------------------------
router.get('/', async (req, res) => {
  try {
    const user = getOptionalUser(req);
    const filter = {};

    if (req.query.userId) {
      filter.userId = req.query.userId;
    } else if (user) {
      filter.$or = [{ userId: user.id }, { customerEmail: user.email }];
    } else if (req.query.email) {
      filter.customerEmail = req.query.email.toLowerCase();
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(50);
    res.json({ orders });
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ message: 'Failed to fetch orders', error: err.message });
  }
});

// -------------------------------------------------------------
// GET /api/orders/:orderId (View Single Order Details)
// -------------------------------------------------------------
router.get('/:orderId', async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }
    res.json({ order });
  } catch (err) {
    console.error('Error fetching order:', err);
    res.status(500).json({ message: 'Failed to fetch order', error: err.message });
  }
});

// -------------------------------------------------------------
// PATCH /api/orders/:orderId/status (Confirm Delivery / Advance Status)
// -------------------------------------------------------------
router.patch('/:orderId/status', async (req, res) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findOne({ orderId: req.params.orderId });

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    if (order.orderStatus === 'Cancelled') {
      return res.status(400).json({ message: 'Cannot update status of a cancelled order.' });
    }

    const validStatuses = ['Placed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid order delivery status.' });
    }

    order.orderStatus = status;
    if (status === 'Delivered') {
      order.deliveredAt = new Date();
      if (order.paymentMethod === 'Cash on Delivery' && order.paymentStatus === 'Pending') {
        order.paymentStatus = 'Paid';
        await Payment.updateOne({ transactionId: order.transactionId }, { status: 'Completed' });
      }
    }

    order.statusTimeline.push({
      status,
      timestamp: new Date(),
      note: note || `Status updated to ${status}`
    });

    await order.save();
    res.json({ message: `Order status updated to ${status}`, order });
  } catch (err) {
    console.error('Error updating order status:', err);
    res.status(500).json({ message: 'Failed to update order status', error: err.message });
  }
});

// -------------------------------------------------------------
// PATCH /api/orders/:orderId/cancel (Cancel Order)
// -------------------------------------------------------------
router.patch('/:orderId/cancel', async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findOne({ orderId: req.params.orderId });

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    if (order.orderStatus === 'Delivered') {
      return res.status(400).json({ message: 'Delivered orders cannot be cancelled.' });
    }

    if (order.orderStatus === 'Cancelled') {
      return res.status(400).json({ message: 'Order is already cancelled.' });
    }

    order.orderStatus = 'Cancelled';
    order.cancellationReason = reason || 'Cancelled by customer';
    if (order.paymentStatus === 'Paid') {
      order.paymentStatus = 'Refund Initiated';
      await Payment.updateOne({ transactionId: order.transactionId }, { status: 'Refunded' });
    } else {
      order.paymentStatus = 'Cancelled';
      await Payment.updateOne({ transactionId: order.transactionId }, { status: 'Failed' });
    }

    order.statusTimeline.push({
      status: 'Cancelled',
      timestamp: new Date(),
      note: `Order cancelled. Reason: ${order.cancellationReason}`
    });

    await order.save();
    res.json({ message: 'Order cancelled successfully', order });
  } catch (err) {
    console.error('Error cancelling order:', err);
    res.status(500).json({ message: 'Failed to cancel order', error: err.message });
  }
});

// -------------------------------------------------------------
// GET /api/payments (View Payment History)
// -------------------------------------------------------------
router.get('/payments/history', async (req, res) => {
  try {
    const user = getOptionalUser(req);
    const filter = {};

    if (req.query.userId) {
      filter.userId = req.query.userId;
    } else if (user) {
      filter.$or = [{ userId: user.id }, { customerEmail: user.email }];
    } else if (req.query.email) {
      filter.customerEmail = req.query.email.toLowerCase();
    }

    const payments = await Payment.find(filter).sort({ createdAt: -1 }).limit(50);
    res.json({ payments });
  } catch (err) {
    console.error('Error fetching payments:', err);
    res.status(500).json({ message: 'Failed to fetch payments', error: err.message });
  }
});

// -------------------------------------------------------------
// GET /api/payments/:transactionId (Payment Confirmation Details)
// -------------------------------------------------------------
router.get('/payments/txn/:transactionId', async (req, res) => {
  try {
    const payment = await Payment.findOne({ transactionId: req.params.transactionId });
    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found.' });
    }
    const order = await Order.findOne({ orderId: payment.orderId });
    res.json({ payment, order });
  } catch (err) {
    console.error('Error fetching payment confirmation:', err);
    res.status(500).json({ message: 'Failed to fetch payment details', error: err.message });
  }
});

module.exports = router;
