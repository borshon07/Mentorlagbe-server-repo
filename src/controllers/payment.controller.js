import { getDB } from "../config/db.js";
import { stripe } from "../config/stripe.js";

const users = () => getDB().collection("users");
const payments = () => getDB().collection("payments");

const PLANS = {
  tutor: { name: "Pro Tutor Plan", amount: 15 },
  student: { name: "Pro Student Plan", amount: 10 },
};

async function fulfillSession(session) {
  if (session.payment_status !== "paid") return false;

  const { email, name, role } = session.metadata;
  const plan = PLANS[role];
  if (!email || !plan) return false;

  await payments().updateOne(
    { stripeSessionId: session.id },
    {
      $setOnInsert: {
        userEmail: email,
        userName: name,
        userRole: role,
        planName: plan.name,
        amount: session.amount_total / 100,
        currency: session.currency,
        transactionId: session.payment_intent,
        stripeSessionId: session.id,
        paymentStatus: "paid",
        paidAt: new Date(),
      },
    },
    { upsert: true }
  );

  await users().updateOne({ email }, { $set: { plan: "pro" } });
  return true;
}

// Student / Tutor: checkout session toiri
export const createCheckoutSession = async (req, res) => {
  try {
    const dbUser = await users().findOne({ email: req.user.email });
    if (!dbUser) return res.status(404).json({ message: "User not found" });

    const plan = PLANS[dbUser.role];
    if (!plan) {
      return res.status(403).json({ message: "Only students and tutors can upgrade" });
    }
    if (dbUser.plan === "pro") {
      return res.status(400).json({ message: "You are already on the Pro plan" });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: dbUser.email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: plan.amount * 100,
            product_data: { name: plan.name },
          },
        },
      ],
      metadata: { email: dbUser.email, name: dbUser.name, role: dbUser.role },
      success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/payment/cancel`,
    });

    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ message: "Failed to create checkout session" });
  }
};

// Success page theke call hoy (webhook er backup)
export const verifySession = async (req, res) => {
  try {
    const { session_id } = req.query;
    if (!session_id) {
      return res.status(400).json({ message: "session_id is required" });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.metadata?.email !== req.user.email) {
      return res.status(403).json({ message: "This payment does not belong to you" });
    }

    const ok = await fulfillSession(session);
    if (!ok) return res.status(400).json({ message: "Payment not completed" });

    res.json({ message: "Payment verified", plan: "pro" });
  } catch (error) {
    res.status(500).json({ message: "Failed to verify payment" });
  }
};

// Stripe webhook (raw body lage)
export const handleWebhook = async (req, res) => {
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers["stripe-signature"],
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send("Webhook signature verification failed");
  }

  try {
    if (event.type === "checkout.session.completed") {
      await fulfillSession(event.data.object);
    }
    res.json({ received: true });
  } catch (error) {
    res.status(500).json({ message: "Webhook handler failed" });
  }
};