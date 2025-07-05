# 🧪 Stripe Integration Testing Guide

This guide will help you test the complete Stripe billing integration for SwedPrime SaaS.

## 🚀 Prerequisites

Before testing, ensure you have:

1. **Stripe Account**: Test mode enabled
2. **Firebase Project**: Functions deployed
3. **Environment Variables**: Configured via setup script
4. **Stripe CLI**: Installed for webhook testing

## 📋 Test Checklist

### Phase 1: Basic Setup Verification

- [ ] **Functions Deployed**
  ```bash
  firebase deploy --only functions
  ```

- [ ] **Health Check Working**
  ```bash
  curl https://your-project.web.app/api/health
  ```

- [ ] **Stripe Keys Configured**
  ```bash
  firebase functions:config:get
  ```

### Phase 2: Pricing Page Testing

- [ ] **Navigate to Pricing Page**
  - Visit: `/pricing`
  - Verify all three plans display correctly
  - Check Swedish currency formatting (SEK)

- [ ] **Plan Selection Flow**
  - Click "Get Started" on each plan
  - Verify redirect to checkout simulation
  - Check success redirect to billing page

### Phase 3: Webhook Event Testing

#### 3.1 Setup Stripe CLI
```bash
# Install Stripe CLI
# macOS: brew install stripe/stripe-cli/stripe
# Windows: Download from https://github.com/stripe/stripe-cli/releases

# Login to Stripe
stripe login

# Forward webhooks to local function
stripe listen --forward-to https://your-project.web.app/api/webhooks/stripe
```

#### 3.2 Test Events

- [ ] **Checkout Session Completed**
  ```bash
  stripe trigger checkout.session.completed
  ```
  - Check Firestore: Company subscription should be `active: true`
  - Verify plan field matches selected plan
  - Check timestamp fields are populated

- [ ] **Payment Succeeded**
  ```bash
  stripe trigger invoice.payment_succeeded
  ```
  - Verify subscription status remains active
  - Check `lastPaymentAt` timestamp

- [ ] **Payment Failed**
  ```bash
  stripe trigger invoice.payment_failed
  ```
  - Verify subscription status changes to `past_due`
  - Check `lastPaymentFailedAt` timestamp

- [ ] **Subscription Updated**
  ```bash
  stripe trigger customer.subscription.updated
  ```
  - Verify plan changes are reflected in Firestore
  - Check billing period updates

- [ ] **Subscription Canceled**
  ```bash
  stripe trigger customer.subscription.deleted
  ```
  - Verify subscription becomes `active: false`
  - Check `canceledAt` timestamp

### Phase 4: End-to-End Flow Testing

#### 4.1 Complete Checkout Flow

1. **Start Checkout**
   - Go to pricing page
   - Select a plan
   - Fill out checkout form with test data

2. **Test Cards**
   Use these Stripe test cards:
   - **Success**: `4242 4242 4242 4242`
   - **Decline**: `4000 0000 0000 0002`
   - **3D Secure**: `4000 0000 0000 3220`

3. **Verify Success Flow**
   - Complete payment with test card
   - Check redirect to billing page
   - Verify success message displays
   - Confirm Firestore data updated

#### 4.2 Billing Dashboard Testing

- [ ] **Current Plan Display**
  - Navigate to `/admin/{companyId}/billing`
  - Verify correct plan shows
  - Check billing date and payment method

- [ ] **Plan Change Modal**
  - Click "Change Plan"
  - Verify all plans display
  - Test plan selection (simulated)

- [ ] **Invoice History**
  - Check invoice table displays
  - Verify download buttons work
  - Test date formatting

### Phase 5: Access Control Testing

#### 5.1 Subscription Guards

- [ ] **Active Subscription Access**
  - With active subscription, access all admin features
  - Verify no blocking screens appear

- [ ] **Inactive Subscription Blocking**
  - Manually set `subscription.active: false` in Firestore
  - Try accessing admin features
  - Verify redirect to subscription required screen

- [ ] **Feature-Specific Guards**
  - Test `RequireSubscription` with different features
  - Verify upgrade prompts for higher-tier features

### Phase 6: Error Handling Testing

#### 6.1 Network Errors

- [ ] **Offline State**
  - Disconnect internet
  - Try accessing billing page
  - Verify graceful error handling

- [ ] **Invalid API Keys**
  - Use invalid Stripe keys
  - Test error messages and fallbacks

#### 6.2 Data Validation

- [ ] **Missing Company Data**
  - Test with non-existent company ID
  - Verify proper error messages

- [ ] **Malformed Webhook Data**
  - Send invalid webhook payloads
  - Check function logs for proper error handling

### Phase 7: Performance Testing

- [ ] **Function Cold Starts**
  - Monitor function execution times
  - Check memory usage and timeouts

- [ ] **Concurrent Webhooks**
  - Send multiple webhook events simultaneously
  - Verify all are processed correctly

## 🔍 Monitoring & Debugging

### Firebase Function Logs
```bash
# View real-time logs
firebase functions:log

# View specific function logs
firebase functions:log --only handleStripeWebhook
```

### Stripe Dashboard
1. **Events**: Monitor webhook delivery status
2. **Logs**: Check API request/response details
3. **Test Data**: View all test transactions

### Firestore Console
1. **Companies Collection**: Verify subscription data
2. **Real-time Updates**: Watch data change during tests
3. **Security Rules**: Test access permissions

## 📊 Test Data Examples

### Expected Firestore Structure
```javascript
// companies/{companyId}
{
  companyName: "Demo Company",
  subscription: {
    active: true,
    status: "active",
    plan: "standard",
    stripeCustomerId: "cus_...",
    stripeSubscriptionId: "sub_...",
    currentPeriodStart: Timestamp,
    currentPeriodEnd: Timestamp,
    trialEnd: Timestamp,
    lastPaymentAt: Timestamp,
    updatedAt: Timestamp
  }
}
```

### Webhook Event Verification
```bash
# Check webhook event in Stripe CLI
stripe events list --limit 10

# Resend specific event
stripe events resend evt_...
```

## ✅ Success Criteria

Your integration is working correctly when:

1. **All webhook events** update Firestore correctly
2. **Pricing page** displays all plans with proper formatting
3. **Billing dashboard** shows accurate subscription data
4. **Access control** properly blocks/allows based on subscription
5. **Error handling** gracefully manages edge cases
6. **Performance** meets acceptable response times

## 🐛 Common Issues & Solutions

### Issue: Webhook signature verification fails
**Solution**: Ensure webhook secret matches Stripe dashboard or CLI

### Issue: Function timeout
**Solution**: Increase timeout in function configuration

### Issue: Firestore permission denied
**Solution**: Check security rules allow function access

### Issue: Invalid price ID
**Solution**: Verify price IDs match Stripe dashboard products

## 📞 Support

If you encounter issues:

1. Check Firebase Function logs
2. Verify Stripe event delivery in dashboard
3. Ensure all environment variables are set
4. Test with minimal webhook payload
5. Contact support with specific error messages and logs

---

**Happy Testing! 🚀** 