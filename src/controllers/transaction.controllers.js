/**
 * Steps to create a new transaction
 * 1. Validate Request
 * 2. Validate the idempotency key
 * 3. Check account status
 * 4. Derive sender balance from ledger
 * 5. Create Transaction(Pending)
 * 6. Create Debit ledger entry
 * 7. Create Credit ledger entry
 * 8. Mark Transaction completed
 * 9. commit mongodb session
 * 10. send email notification
 */