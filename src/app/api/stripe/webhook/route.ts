import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { clerkClient } from '@clerk/clerk-sdk-node';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sigHeaders = await headers();
  const signature = sigHeaders.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCancellation(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleSuccessfulPayment(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleFailedPayment(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  
  // Get customer to find the user
  const customer = await stripe.customers.retrieve(customerId);
  if (!customer || customer.deleted) {
    console.error('Customer not found:', customerId);
    return;
  }

  const userId = customer.metadata?.clerk_user_id;
  if (!userId) {
    console.error('No Clerk user ID found for customer:', customerId);
    return;
  }

  // Determine subscription tier based on price ID
  let subscriptionTier = 'free';
  if (subscription.status === 'active' && subscription.items.data.length > 0) {
    const priceId = subscription.items.data[0].price.id;
    
    // Map price IDs to tiers (you'll need to set these in your Stripe dashboard)
    const tierMap: Record<string, string> = {
      'price_pro_monthly': 'pro',
      'price_pro_yearly': 'pro',
      'price_vip_monthly': 'vip',
      'price_vip_yearly': 'vip',
    };
    
    subscriptionTier = tierMap[priceId] || 'free';
  }

  // Update user metadata in Clerk
  await clerkClient.users.updateUserMetadata(userId, {
    publicMetadata: {
      subscriptionTier,
      stripeCustomerId: customerId,
      subscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
    },
  });

  console.log(`Updated user ${userId} to tier: ${subscriptionTier}`);
}

async function handleSubscriptionCancellation(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const customer = await stripe.customers.retrieve(customerId);
  
  if (!customer || customer.deleted) return;

  const userId = customer.metadata?.clerk_user_id;
  if (!userId) return;

  // Downgrade to free tier
  await clerkClient.users.updateUserMetadata(userId, {
    publicMetadata: {
      subscriptionTier: 'free',
      subscriptionStatus: 'canceled',
    },
  });

  console.log(`Downgraded user ${userId} to free tier`);
}

async function handleSuccessfulPayment(invoice: Stripe.Invoice) {
  console.log(`Payment succeeded for invoice: ${invoice.id}`);
  // Additional logic for successful payments if needed
}

async function handleFailedPayment(invoice: Stripe.Invoice) {
  console.log(`Payment failed for invoice: ${invoice.id}`);
  // Handle failed payments - maybe send notifications
}
