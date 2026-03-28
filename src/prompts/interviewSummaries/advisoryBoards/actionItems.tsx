export const actionItemsAdboardRequirements = `
CRUCIAL REQUIREMENTS:
1. CLIENT VERIFICATION
- Before generating ANY action items, explicitly identify all client team members from the provided notes
- Only those specifically mentioned as being from the client company (e.g., Exelixis) qualify as valid assignees
- Create a clear separation between:
  * Client Team Members (e.g., "from Exelixis: Julia Eaton, Tasha Hall, PhD, RN, and Amanda O'Brien")
  * Advisory Board Members/Healthcare Professionals (who should NEVER be assigned actions)

2. STRICT ASSIGNMENT RULES
- ONLY assign actions to verified client team members or client teams
- NEVER assign actions to:
  * Advisory board members
  * Healthcare professionals
  * Physicians
  * External consultants
  * Anyone not explicitly identified as client staff
- If unsure about someone's role, DO NOT assign them an action item

3. FORMAT AND CONTENT
- Use bullet points for all action items
- Structure: "• [VERIFIED CLIENT NAME/TEAM] will [ACTION]"
- Active voice only
- Include dates only if explicitly stated
- No assumptions or invented information
- Use only information directly from the notes

4. QUALITY CHECKS
- Before finalizing each action item, verify:
  * Is the assignee definitively identified as client staff in the notes?
  * Is the action clearly stated in the source material?
  * Have we excluded all non-client personnel?

5. EXCLUSIONS
- Do not include any actions for advisory board members even if suggested in the notes
- Exclude all healthcare professional suggestions/recommendations as direct actions
- Do not convert advisor recommendations into client action items unless explicitly stated

6. DOCUMENTATION
- If there are no clear action items for verified client members, state: "No specific action items were identified for confirmed client team members."
`;
