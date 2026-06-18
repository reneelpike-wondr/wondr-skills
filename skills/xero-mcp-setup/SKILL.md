---
name: Xero MCP Setup
description: "Complete guide to connect Xero accounting to Claude Code via the official Xero MCP server. Covers app creation, auth, multi-org config, and troubleshooting."
---

# Xero MCP Setup for Claude Code

Set up the official Xero MCP server so Claude Code can read and manage your Xero accounting data directly: invoices, contacts, payments, bank transactions, P&L reports, payroll, and more.

---

## What You Get

Once configured, Claude Code gains **60 Xero tools** including:

| Category | Tools |
|---|---|
| **Invoices** | list-invoices, create-invoice, update-invoice |
| **Contacts** | list-contacts, create-contact, update-contact |
| **Payments** | list-payments, create-payment |
| **Bank Transactions** | list-bank-transactions, create-bank-transaction, update-bank-transaction |
| **Credit Notes** | list-credit-notes, create-credit-note, update-credit-note |
| **Quotes** | list-quotes, create-quote, update-quote |
| **Reports** | list-profit-and-loss, list-report-balance-sheet, list-trial-balance, list-aged-receivables-by-contact, list-aged-payables-by-contact |
| **Accounts** | list-accounts, list-tax-rates, list-items, create-item, update-item |
| **Manual Journals** | list-manual-journals, create-manual-journal, update-manual-journal |
| **Organisation** | list-organisation-details |
| **Tracking** | list-tracking-categories, create-tracking-category, update-tracking-category, create-tracking-option, update-tracking-options |
| **Contact Groups** | list-contact-groups |
| **Payroll (NZ/UK only)** | list-payroll-employees, list-payroll-employee-leave, list-payroll-employee-leave-balances, list-payroll-employee-leave-types, list-payroll-leave-periods, list-payroll-leave-types, list-timesheets, create-payroll-timesheet, get-payroll-timesheet, add-payroll-timesheet-line, update-payroll-timesheet-line, approve-payroll-timesheet, revert-payroll-timesheet, delete-payroll-timesheet |

---

## Prerequisites

- **Claude Code** installed and working
- A **Xero account** (free trial works)
- Admin access to the Xero organisation you want to connect

---

## Step 1: Create a Xero App (Custom Connection)

This is the part most people get stuck on. Follow exactly.

1. Go to **https://developer.xero.com/app/manage**
2. Click **"New app"**
3. Fill in:
   - **App name**: anything (e.g. "Claude Code")
   - **Integration type**: select **"Custom connection"**
   - This is critical. Do NOT select "Web app" or "Partner". Custom connection uses client_credentials grant, which means no browser login, no expiring refresh tokens, no user interaction needed.
4. **Select your organisation** from the dropdown (the Xero org you want Claude to access)
5. Click **"Create app"**

### Get Your Credentials

1. After creating the app, you'll land on the app's configuration page
2. Copy the **Client ID** (shown on the page)
3. Click **"Generate a secret"** to create the Client Secret
4. **Copy the Client Secret immediately**. Xero only shows it once. If you lose it, you'll need to generate a new one.

### Set Scopes

Still on the app configuration page:

1. Scroll down to **"Scopes"** or **"Configuration"**
2. Enable these scopes (tick the checkboxes):
   - `accounting.transactions` (read and write invoices, bills, payments)
   - `accounting.transactions.read`
   - `accounting.contacts` (read and write contacts)
   - `accounting.contacts.read`
   - `accounting.settings` (read account codes, tax rates)
   - `accounting.settings.read`
   - `accounting.reports.read` (P&L, balance sheet, trial balance, aged reports)
3. If you need payroll (NZ or UK only), also enable:
   - `payroll.employees`
   - `payroll.employees.read`
   - `payroll.settings`
   - `payroll.settings.read`
   - `payroll.timesheets`
   - `payroll.timesheets.read`
4. Click **Save**

---

## Step 2: Install the MCP Server

Open your terminal and run:

```bash
npm install -g @xeroapi/xero-mcp-server@latest
```

Or skip this step. The config below uses `npx -y` which auto-downloads it on first run.

---

## Step 3: Add to Claude Code Config

Open your `.mcp.json` file. This is usually at:

- **Project level**: `.claude/projects/<your-project>/.mcp.json`
- **Or create one** in your project root: `.mcp.json`

Add this entry inside the `"mcpServers"` object:

```json
{
  "mcpServers": {
    "xero": {
      "command": "npx",
      "args": ["-y", "@xeroapi/xero-mcp-server@latest"],
      "env": {
        "XERO_CLIENT_ID": "YOUR_CLIENT_ID_HERE",
        "XERO_CLIENT_SECRET": "YOUR_CLIENT_SECRET_HERE"
      }
    }
  }
}
```

Replace `YOUR_CLIENT_ID_HERE` and `YOUR_CLIENT_SECRET_HERE` with the values from Step 1.

### Multiple Xero Organisations

If you have more than one Xero org (e.g. a business + a holding company), create a separate Xero app for each org (Custom Connections are 1:1 with an organisation), then add multiple entries:

```json
{
  "mcpServers": {
    "xero-business": {
      "command": "npx",
      "args": ["-y", "@xeroapi/xero-mcp-server@latest"],
      "env": {
        "XERO_CLIENT_ID": "CLIENT_ID_FOR_BUSINESS",
        "XERO_CLIENT_SECRET": "SECRET_FOR_BUSINESS"
      }
    },
    "xero-holding": {
      "command": "npx",
      "args": ["-y", "@xeroapi/xero-mcp-server@latest"],
      "env": {
        "XERO_CLIENT_ID": "CLIENT_ID_FOR_HOLDING",
        "XERO_CLIENT_SECRET": "SECRET_FOR_HOLDING"
      }
    }
  }
}
```

Tools will appear as `mcp__xero-business__list-invoices` and `mcp__xero-holding__list-invoices`.

---

## Step 4: Restart Claude Code

Close and reopen Claude Code (or start a new session). The Xero MCP server will connect automatically.

---

## Step 5: Verify It Works

Ask Claude Code:

> "List my Xero organisation details"

You should see your company name, status, and country code returned. If that works, everything is connected.

---

## Troubleshooting

### "Connection refused" or server won't start

- **Check Node.js version**: requires Node 18+. Run `node --version` to verify.
- **Check npm/npx is available**: run `npx --version`
- **Try installing globally first**: `npm install -g @xeroapi/xero-mcp-server@latest`, then change config to use `node` directly:

```json
{
  "command": "node",
  "args": ["/usr/local/lib/node_modules/@xeroapi/xero-mcp-server/dist/index.js"],
  "env": {
    "XERO_CLIENT_ID": "...",
    "XERO_CLIENT_SECRET": "..."
  }
}
```

Adjust the path based on where npm installed it. Find it with: `npm root -g`

### "unauthorized_client" or "invalid_client" error

- **Wrong app type**: you created a "Web app" instead of a "Custom connection". Delete it and create a new one as Custom connection.
- **Secret expired or wrong**: go to developer.xero.com, find your app, generate a new secret, update the config.
- **Client ID typo**: double-check you copied the full ID with no extra spaces.

### "scope_not_found" or "insufficient_scope"

- Go back to your app at developer.xero.com
- Check that the required scopes are ticked (see Step 1)
- Save the changes
- Wait 30 seconds, then restart Claude Code

### "403 Forbidden" when calling a specific tool

- The Custom Connection might not have the right scope for that action
- For write operations (create/update), you need the non-read scope (e.g. `accounting.transactions` not just `accounting.transactions.read`)
- For reports, you need `accounting.reports.read`
- For payroll, you need payroll-specific scopes AND your Xero org must be NZ or UK region

### "Organisation not found" or wrong data returned

- Custom Connections are tied to one specific Xero organisation
- If you have multiple orgs, you need a separate app per org (see "Multiple Xero Organisations" above)
- Verify which org the app is connected to at developer.xero.com under the app settings

### MCP server starts but no tools appear

- Check Claude Code logs for errors (look in the terminal output)
- Ensure the `.mcp.json` file is in the right location and the JSON is valid
- Try running the server manually to see errors:

```bash
XERO_CLIENT_ID="your_id" XERO_CLIENT_SECRET="your_secret" npx -y @xeroapi/xero-mcp-server@latest
```

This should output MCP protocol messages. If it errors, the message will tell you what's wrong.

### "ETIMEDOUT" or network errors

- Check your internet connection
- Xero's API is at `api.xero.com` and auth is at `identity.xero.com`, both need to be reachable
- If you're behind a corporate proxy, set `HTTPS_PROXY` in the env block

### Token works in curl but not in MCP

- The MCP server handles token refresh automatically via client_credentials grant
- If curl works but MCP doesn't, the issue is likely the server startup, not auth
- Check Node.js version and try the manual install approach above

---

## Quick Verification Script

Run this in your terminal to verify your credentials work before configuring MCP:

```bash
curl -s -X POST "https://identity.xero.com/connect/token" \
  -u "YOUR_CLIENT_ID:YOUR_CLIENT_SECRET" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials&scope=accounting.transactions.read accounting.contacts.read accounting.settings.read"
```

If successful, you'll get a JSON response with an `access_token`. If not, the error message will tell you exactly what's wrong.

---

## Common Use Cases

Once connected, here's what you can ask Claude Code to do:

- "Show me all unpaid invoices"
- "Create an invoice for [contact] for $X"
- "Pull the P&L for last quarter"
- "List all contacts"
- "What's the balance sheet look like?"
- "Create a payment for invoice INV-0042"
- "Show aged receivables for [contact]"
- "List all bank transactions for this month"

---

## Security Notes

- Your Client ID and Secret are stored in `.mcp.json` on your local machine
- Never commit `.mcp.json` to a public git repo. Add it to `.gitignore`
- Custom Connection tokens are short-lived (30 minutes) and auto-refresh
- The MCP server only runs locally. No data is sent to third parties beyond Xero's own API
- You can revoke access at any time by deleting the app at developer.xero.com

---

## References

- **Official repo**: https://github.com/XeroAPI/xero-mcp-server
- **Xero Developer Portal**: https://developer.xero.com
- **Xero API docs**: https://developer.xero.com/documentation/api
- **Custom Connections guide**: https://developer.xero.com/documentation/guides/oauth2/custom-connections

---

*Built by Selr AI. Questions? Reach out in the community.*
