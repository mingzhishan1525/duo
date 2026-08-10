# Apify Store Listing Draft

## Title

Website Contact Intelligence

## Short Description

Extract public business emails, phone numbers, social links, and basic company information from public company websites.

## Description

Website Contact Intelligence is a lightweight B2B data organization Actor for public company websites. Provide a list of website URLs, and the Actor visits each homepage plus common public company pages such as contact, about, and team pages.

It extracts publicly listed business contact details and basic company metadata, then saves one structured JSON item per domain to the Apify Dataset.

This Actor is built for B2B market research, CRM data cleanup, AI Agent workflows, n8n automation, SEO agencies, and sales operations teams that need a simple public website contact intelligence layer.

## Good Use Cases

- Build a public company contact dataset from known business websites.
- Clean or enrich CRM records with publicly listed business contact channels.
- Feed n8n or AI Agent workflows with structured website contact data.
- Research potential B2B accounts from a domain list.
- Pair with a Shopify merchant discovery Actor to collect public business contact channels.

## Not Supported

- Email sending
- Bulk outreach automation
- Private email discovery
- Private social account scraping
- Login-only data extraction
- Browser automation
- CRM sync
- Lead scoring
- AI enrichment or analysis

## Input Example

```json
{
  "startUrls": [
    {
      "url": "https://example.com"
    }
  ],
  "maxPagesPerDomain": 5,
  "maxConcurrency": 5,
  "respectRobotsTxt": true
}
```

## Output Example

```json
{
  "domain": "example.com",
  "companyName": "Example",
  "title": "Example Domain",
  "metaDescription": "",
  "emails": ["contact@example.com"],
  "phoneNumbers": [],
  "contactPages": ["/contact"],
  "socialLinks": {
    "linkedin": "https://www.linkedin.com/company/example",
    "twitter": "",
    "facebook": "",
    "instagram": ""
  },
  "aboutText": "",
  "sourcePages": ["https://example.com/", "https://example.com/contact"],
  "timestamp": "2026-08-10T00:00:00.000Z",
  "errors": []
}
```

## Pricing Suggestion

Start with pay-per-event pricing:

- 100 websites for $1
- 1,000 websites for $5

Monthly bundles can be added after usage patterns are clear:

- Free: 50 websites/month
- Starter: $19/month for 5,000 websites
- Pro: $49/month for 20,000 websites

## Compliance Note

This Actor is intended for public company websites and publicly listed business contact information only. Users are responsible for ensuring their use complies with applicable privacy, anti-spam, data protection, and website terms requirements.

The default configuration respects `robots.txt` and skips disallowed pages.
