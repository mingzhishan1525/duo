# Website Contact Intelligence

Extract public business contact details and basic company information from public company websites.

This Actor is designed for B2B data organization, market research, CRM cleanup, AI Agent workflows, and n8n automation. It visits each provided website homepage, discovers common public company pages, and returns structured contact intelligence as Apify Dataset items.

## What It Extracts

- Domain
- Company name
- Homepage title
- Meta description
- Public business emails
- Likely business phone numbers
- Contact page paths
- LinkedIn company pages
- Twitter/X, Facebook, and Instagram links
- Short about text
- Source pages used for extraction
- Page-level errors

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

## Intended Use

- B2B market research
- Public company database building
- CRM contact data cleanup
- Sales operations research
- SEO agency research
- AI Agent and n8n workflows

## Not Supported

This Actor does not provide:

- Email sending
- Bulk outreach automation
- Private email discovery
- Private social account scraping
- Login or cookie-based extraction
- Browser automation
- CRM sync
- Lead scoring
- AI enrichment
- Dashboard views

## Compliance

This Actor is intended for public company websites and publicly listed business contact information only. It respects `robots.txt` by default. Users are responsible for ensuring their use complies with applicable privacy, anti-spam, data protection, and website terms requirements.
