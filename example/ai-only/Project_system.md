---
spec: system
from: Project_brief.md
---
purpose: an online clothing store where customers browse, buy clothes and manage their account [purpose]
purpose: customers can't easily shop the range online today; this gives them a simple storefront [problem]
user: customers — browse and buy clothes, and manage their login [users]
user: admins — manage users and products [users]
look: clean and friendly, lots of white space, large product imagery [designs]
look: like clean retail sites with large imagery, e.g. ASOS, Uniqlo [apps-you-like]
look: unlike cluttered marketplaces with heavy ads [apps-to-avoid]
skill: React + TypeScript front end — ClothingWebsite is a React site [ClothingWebsite/application-spec.json#core.language]
skill: Go HTTP APIs on Azure Functions — ClothingAPI is Go on a Function App [ClothingAPI/application-spec.json#core.language, ClothingAPI/application-spec.json#core.hosting]
skill: SQL Server schema design — ClothingDatabase holds every model [database-technology]
skill: JWT authentication and role checks — one login, three roles [roles, ClothingAPI/application-spec.json#accessAndInterface.authType]
skill: Azure infrastructure as code — the AI writes Bicep [infrastructure-policy]
UNKNOWN: how does a customer register? MVP needs it, but CreateUser is Admin-only and no item covers it [deliverables, ClothingAPI/Login.json#operations]
UNKNOWN: what does "see their account" show? MVP needs it and no item covers it [deliverables]
UNKNOWN: what can a Manager do? The role is listed and nothing uses it [roles]
