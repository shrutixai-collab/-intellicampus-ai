# Circular Distribution Flow

## Objective
Create, AI-draft, and distribute school/college circulars to targeted parent/student groups via WhatsApp.

## Required Inputs
- Circular title
- Target audience (All / Class-specific / Staff only)
- Category (Event / Academic / Administrative / Fee / Holiday)
- Content (manual or AI-generated)

## Steps
1. Admin enters title + selects category and audience
2. Optional: Click "AI Draft" → AI generates appropriate content based on title keywords
3. Admin reviews and edits the draft
4. Preview shown as WhatsApp message format
5. Confirm and send → system dispatches to all numbers in target group
6. Track delivery: Sent / Read / Pending counts updated every 15 min
7. "Resend to Pending" option available for undelivered messages

## Expected Outputs
- Circular stored in database with metadata
- WhatsApp messages sent to all target recipients
- Delivery report available (Sent %, Read %)
- Dashboard activity updated

## Edge Cases
- Number not on WhatsApp → fallback to SMS
- Bounce rate >20% → alert admin to verify contact list
- Duplicate circular same title same week → warning prompt
