# Fee Reminder Flow

## Objective
Automatically identify students with pending fees and send tiered WhatsApp reminders to parents.

## Required Inputs
- Student fee records (paid/partial/overdue status)
- Parent contact numbers
- Current date and fee deadline

## Steps
1. Query all students with `feeStatus !== 'Paid'`
2. Categorize: Partial (1st reminder) vs Overdue by >30 days (2nd), >60 days (3rd)
3. Generate AI message based on tier (polite → firm → final)
4. Send via WhatsApp API (simulated in Phase 1)
5. Log reminder in student record with timestamp
6. Update dashboard activity feed

## Expected Outputs
- X reminders sent confirmation
- Updated `lastReminder` field in student records
- Toast notification in UI

## Edge Cases
- Parent phone invalid → flag in admin panel
- Student fee marked Paid after reminder sent → cancel pending reminders
- Multiple reminders same day → throttle to 1/day per student
