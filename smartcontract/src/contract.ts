import { NearBindgen, near, call, view, initialize, LookupMap } from 'near-sdk-js';

// One month in nanoseconds (approximated)
const ONE_MONTH_NS = BigInt(30 * 24 * 60 * 60 * 1000000000);

@NearBindgen({})
class SubscriptionContract {
  owner: string;
  subscriptionPrice: bigint; // in yoctoNEAR
  subscribers: LookupMap<bigint>; // maps account ID to subscription expiry timestamp

  constructor() {
    this.owner = '';
    this.subscriptionPrice = BigInt(0);
    this.subscribers = new LookupMap('s');
  }

  @initialize({})
  init({ owner, subscriptionPrice }: { owner: string, subscriptionPrice: string }) {
    this.owner = owner;
    this.subscriptionPrice = BigInt(subscriptionPrice);
    this.subscribers = new LookupMap('s');
  }

  @call({payableFunction: true})
  subscribe(): void {
    // Get the attached deposit
    const deposit = near.attachedDeposit();
    
    // Check if enough NEAR was attached
    if (deposit < this.subscriptionPrice) {
      throw new Error('Not enough deposit to subscribe. Required: ' + this.subscriptionPrice.toString());
    }

    // Get current time
    const now = near.blockTimestamp();
    
    // Get the subscriber's account ID
    const subscriberId = near.predecessorAccountId();
    
    // Calculate new expiry time
    let expiry: bigint;
    const currentExpiry = this.subscribers.get(subscriberId);
    
    if (currentExpiry !== null && currentExpiry > now) {
      // If subscription hasn't expired yet, add one month to current expiry
      expiry = currentExpiry + ONE_MONTH_NS;
    } else {
      // New subscription or expired - one month from now
      expiry = now + ONE_MONTH_NS;
    }
    
    // Update the subscription
    this.subscribers.set(subscriberId, expiry);
    
    // Transfer the payment to the contract owner
    near.log(`Subscription payment of ${deposit.toString()} yoctoNEAR sent to ${this.owner}`);
    const promise = near.promiseBatchCreate(this.owner);
    near.promiseBatchActionTransfer(promise, deposit);
  }

  @view({})
  isSubscribed({ accountId }: { accountId: string }): boolean {
    const expiry = this.subscribers.get(accountId);
    if (expiry === null) {
      return false;
    }
    
    const now = near.blockTimestamp();
    return expiry > now;
  }

  @view({})
  getSubscriptionExpiry({ accountId }: { accountId: string }): string | null {
    const expiry = this.subscribers.get(accountId);
    if (expiry === null) {
      return null;
    }
    
    return expiry.toString();
  }

  @view({})
  getSubscriptionPrice(): string {
    return this.subscriptionPrice.toString();
  }

  @call({})
  updateSubscriptionPrice({ newPrice }: { newPrice: string }): void {
    // Only the owner can update the price
    if (near.predecessorAccountId() !== this.owner) {
      throw new Error('Only the owner can update the subscription price');
    }
    
    this.subscriptionPrice = BigInt(newPrice);
  }

  @call({})
  cleanupExpiredSubscriptions({ accountIds }: { accountIds: string[] }): void {
    const now = near.blockTimestamp();
    
    for (const accountId of accountIds) {
      const expiry = this.subscribers.get(accountId);
      if (expiry !== null && expiry <= now) {
        // Remove expired subscription
        this.subscribers.remove(accountId);
      }
    }
  }
}
