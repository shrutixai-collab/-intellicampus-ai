# Complaint Routing Flow

## Objective
Auto-categorize incoming complaints, assign to correct department, and send acknowledgement to parent.

## Required Inputs
- Complaint text (parent submission)
- Student name and class
- Category selected (or auto-detected)
- Priority assessment

## Steps
1. Receive complaint from parent (form or WhatsApp)
2. AI classifies category: Transport / Academic / Infrastructure / Fee / Canteen / Discipline / Other
3. AI assesses priority based on keywords (urgent, safety, exam, board → High)
4. Auto-assign to department head based on category map:
   - Transport → Transport Head
   - Academic → HoD of relevant subject
   - Infrastructure → Admin / Maintenance
   - Fee → Accounts Office
   - Discipline → Principal
5. Send AI-generated acknowledgement to parent (Ref# + expected resolution time)
6. Log in complaint register with all metadata

## Expected Outputs
- Complaint registered with unique Ref# (auto-incremented)
- Assignee notified (email/SMS simulated)
- Parent receives WhatsApp acknowledgement within 2 minutes
- Dashboard activity feed updated

## Edge Cases
- Duplicate complaint (same parent, same issue, <7 days) → link to existing ticket
- Complaint in Hindi/Marathi → auto-translate or flag for manual review
- Anonymous complaint → assign to Admin with note
