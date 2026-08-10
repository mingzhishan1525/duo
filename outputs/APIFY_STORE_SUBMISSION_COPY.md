# Apify Store Submission Copy

## Actor Name

website-contact-extractor

## Title

Website Contact Intelligence

## Short Description

Extract public business emails, phone numbers, social links, and basic company information from public company websites.

## Categories

- B2B data
- Market research
- Sales intelligence
- Automation

## Long Description

Website Contact Intelligence extracts public business contact details and basic company metadata from public company websites.

Provide a list of website URLs, and the Actor visits each homepage plus common public company pages such as contact, about, about-us, contact-us, and team pages. It returns one structured Dataset item per domain with public emails, likely business phone numbers, company metadata, public social links, about text, source pages, and page-level errors.

This Actor is designed for B2B market research, CRM contact data cleanup, public company database building, SEO agency research, AI Agent workflows, and n8n automation.

It uses direct HTTP requests with Axios and parses HTML with Cheerio. It does not use Playwright, Chrome, browser automation, login sessions, or cookies.

## Best For

- B2B market research
- Public company contact datasets
- CRM data cleanup
- Sales operations research
- SEO agency research
- AI Agent and n8n workflows

## Not For

- Email sending
- Bulk outreach automation
- Private email discovery
- Private social account scraping
- Login-only data extraction
- Browser automation
- CRM sync
- Lead scoring
- AI enrichment

## Compliance Note

This Actor is intended for public company websites and publicly listed business contact information only. It respects `robots.txt` by default. Users are responsible for ensuring their use complies with applicable privacy, anti-spam, data protection, and website terms requirements.

## Recommended Pricing

Start with pay-per-event pricing:

- 100 websites for $1
- 1,000 websites for $5

Monthly bundles can be added after usage patterns are clear:

- Free: 50 websites/month
- Starter: $19/month for 5,000 websites
- Pro: $49/month for 20,000 websites

## Build Notes

- Recommended validation build ref: `v0.1.1`
- Actor config: `.actor/actor.json`
- Runtime: Node.js
- Main dependencies: Apify SDK, Axios, Cheerio, robots-parser

## Private Test Requirement

Do not publish publicly until:

- Apify Console smoke run passes.
- 100-site validation passes.
- Manual spot check confirms acceptable email and phone precision.
- Output remains aligned with public business contact intelligence positioning.
