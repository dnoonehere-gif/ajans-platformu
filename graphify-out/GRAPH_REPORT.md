# Graph Report - .  (2026-07-11)

## Corpus Check
- 289 files · ~151,400 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1759 nodes · 2595 edges · 186 communities (98 shown, 88 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 97 edges (avg confidence: 0.78)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Admin Plans & Branch API
- Admin Pages & Dashboard
- Design Tokens (Type)
- Mail & Notifications API
- CIP Design Scripts
- Design Tokens (Color)
- Design Tokens (Component)
- Slide Search Engine
- Skill References Hub
- Design Tokens (Spacing)
- TypeScript References
- Tailwind Config Tests
- HTML Token Validator
- UI Components Library
- Logo Design Scripts
- Auth & Security API
- Brand & Content API
- Dashboard & Plans API
- Dashboard Page & KPI
- shadcn Components Config
- Legal Pages
- QR & Branch Management
- Project Architecture
- Package Dependencies
- Redis & Cache API
- Community 25
- Community 26
- Community 27
- Community 28
- Community 29
- Community 30
- Community 31
- Community 32
- Community 33
- Community 34
- Community 35
- Community 36
- Community 37
- Community 38
- Community 39
- Community 40
- Community 41
- Community 42
- Community 43
- Community 44
- Community 45
- Community 46
- Community 47
- Community 48
- Community 49
- Community 50
- Community 51
- Community 52
- Community 53
- Community 54
- Community 55
- Community 56
- Community 57
- Community 58
- Community 59
- Community 60
- Community 61
- Community 62
- Community 63
- Community 64
- Community 65
- Community 66
- Community 67
- Community 68
- Community 69
- Community 70
- Community 71
- Community 72
- Community 73
- Community 74
- Community 75
- Community 76
- Community 77
- Community 78
- Community 79
- Community 80
- Community 81
- Community 82
- Community 83
- Community 84
- Community 85
- Community 86
- Community 87
- Community 88
- Community 89
- Community 90
- Community 91
- Community 92
- Community 93
- Community 94
- Community 95
- Community 96
- Community 97
- Community 98
- Community 99
- Community 100
- Community 101
- Community 102
- Community 105
- Community 106
- Community 107
- Community 108
- Community 109
- Community 110
- Community 111
- Community 112
- Community 113
- Community 114
- Community 115
- Community 116
- Community 117
- Community 118
- Community 119
- Community 120
- Community 121
- Community 122
- Community 123
- Community 124
- Community 125
- Community 126
- Community 127
- Community 128
- Community 129
- Community 130
- Community 131
- Community 132
- Community 133
- Community 134
- Community 135
- Community 136
- Community 137
- Community 138
- Community 139
- Community 140
- Community 141
- Community 142
- Community 143
- Community 144
- Community 145
- Community 146
- Community 147
- Community 148
- Community 149
- Community 150
- Community 151
- Community 152
- Community 153
- Community 154
- Community 155
- Community 156
- Community 157
- Community 158
- Community 159
- Community 160
- Community 161
- Community 162
- Community 163
- Community 164
- Community 165
- Community 166
- Community 167
- Community 168
- Community 169
- Community 170
- Community 174
- Community 175
- Community 176
- Community 177
- Community 178
- Community 179
- Community 180
- Community 181
- Community 182
- Community 183
- Community 184

## God Nodes (most connected - your core abstractions)
1. `TailwindConfigGenerator` - 57 edges
2. `getAuthUser()` - 44 edges
3. `TestTailwindConfigGenerator` - 35 edges
4. `ShadcnInstaller` - 33 edges
5. `useBrand()` - 29 edges
6. `TestShadcnInstaller` - 26 edges
7. `auditFromRequest()` - 20 edges
8. `requireBrandPermission()` - 17 edges
9. `compilerOptions` - 17 edges
10. `Ajans Platformu` - 17 edges

## Surprising Connections (you probably didn't know these)
- `App Icon (Purple N with sparkle)` --brand_icon_for--> `Ajans Platformu`  [INFERRED]
  src/app/icon.svg → README.md
- `Ajans Platformu` --uses--> `framer-motion`  [EXTRACTED]
  README.md → package.json
- `Ajans Platformu` --uses--> `socket.io`  [EXTRACTED]
  README.md → package.json
- `Deployment Rehberi` --recommends--> `@upstash/redis`  [EXTRACTED]
  DEPLOYMENT.md → package.json
- `Ajans Platformu` --uses--> `bullmq`  [EXTRACTED]
  README.md → package.json

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Brand Identity System** — _claude_skills_brand_skill, _claude_skills_brand_references_voice_framework, _claude_skills_brand_references_messaging_framework, _claude_skills_brand_references_visual_identity, _claude_skills_brand_references_color_palette_management, _claude_skills_brand_references_typography_specifications [INFERRED 0.85]
- **Design Skill Sub-skill Routing** — _claude_skills_design_skill, _claude_skills_brand_skill, _claude_skills_design_system_skill, _claude_skills_banner_design_skill [EXTRACTED 1.00]

## Communities (186 total, 88 thin omitted)

### Community 0 - "Admin Plans & Branch API"
Cohesion: 0.06
Nodes (46): PATCH(), GET(), POST(), DELETE(), PATCH(), GET(), POST(), BRAND_ROLES (+38 more)

### Community 1 - "Admin Pages & Dashboard"
Cohesion: 0.04
Nodes (9): FEATURE_LABELS, ROLE_COLORS, ROLE_LABELS, STATUS_COLORS, STATUS_LABELS, PlaceReview, TODO: PayTR HMAC hash doğrulaması, globalForPrisma (+1 more)

### Community 2 - "Design Tokens (Type)"
Cohesion: 0.05
Nodes (53): $type, $value, $type, $value, $type, $value, $type, $value (+45 more)

### Community 3 - "Mail & Notifications API"
Cohesion: 0.10
Nodes (40): POST(), schema, POST(), schema, POST(), schema, GET(), getUpstash() (+32 more)

### Community 4 - "CIP Design Scripts"
Cohesion: 0.06
Nodes (42): BM25, detect_domain(), get_cip_brief(), _load_csv(), Load CSV and return list of dicts, Core search function using BM25, Auto-detect the most relevant domain from query, Main search function with auto-domain detection (+34 more)

### Community 5 - "Design Tokens (Color)"
Cohesion: 0.04
Nodes (48): $type, $value, background, destructive, destructive-foreground, foreground, muted, muted-foreground (+40 more)

### Community 6 - "Design Tokens (Component)"
Cohesion: 0.06
Nodes (45): $type, $value, $type, $value, bg, fg, font-size, hover-bg (+37 more)

### Community 7 - "Slide Search Engine"
Cohesion: 0.08
Nodes (36): format_context(), format_result(), main(), Format a single search result for display, Format contextual recommendations for display., BM25, calculate_pattern_break(), detect_domain() (+28 more)

### Community 8 - "Skill References Hub"
Cohesion: 0.06
Nodes (41): Banner Design Skill, BM25 Search Engine, Brand Skill, Canvas Design System, Chart.js, CIP Design Skill, CIP Deliverable Guide, CIP Design Reference (+33 more)

### Community 9 - "Design Tokens (Spacing)"
Cohesion: 0.06
Nodes (34): $type, $value, $type, $value, $type, $value, $type, $value (+26 more)

### Community 10 - "TypeScript References"
Cohesion: 0.07
Nodes (29): dom, dom.iterable, esnext, next-env.d.ts, .next/types/**/*.ts, node_modules, ./src/*, **/*.ts (+21 more)

### Community 11 - "Tailwind Config Tests"
Cohesion: 0.07
Nodes (15): Test adding colors multiple times., Test adding custom breakpoints., Test TailwindConfigGenerator class., Test generating TypeScript configuration., Test generating JavaScript configuration., Test generating config with custom colors., Test generating config with plugins., Test validating valid configuration. (+7 more)

### Community 12 - "HTML Token Validator"
Cohesion: 0.14
Nodes (24): get_context(), is_allowed_exception(), is_allowed_rgba(), is_inside_block(), load_css_variables(), main(), print_result(), print_summary() (+16 more)

### Community 13 - "UI Components Library"
Cohesion: 0.10
Nodes (20): Avatar, AvatarFallback, AvatarImage, Badge(), BadgeProps, badgeVariants, Button, ButtonProps (+12 more)

### Community 14 - "Logo Design Scripts"
Cohesion: 0.11
Nodes (19): BM25, detect_domain(), _load_csv(), Load CSV and return list of dicts, Core search function using BM25, Auto-detect the most relevant domain from query, Main search function with auto-domain detection, Search across all domains and combine results (+11 more)

### Community 15 - "Auth & Security API"
Cohesion: 0.20
Nodes (19): POST(), schema, POST(), DELETE(), GET(), POST(), POST(), UserAgreementPDF() (+11 more)

### Community 16 - "Brand & Content API"
Cohesion: 0.15
Nodes (17): POST(), POST(), schema, CONTENT_TYPES, POST(), schema, GET(), POST() (+9 more)

### Community 17 - "Dashboard & Plans API"
Cohesion: 0.18
Nodes (16): BrandWithRelations, computeDashboard(), GET(), GET(), DEFAULT_PLANS, POST(), POST(), postSchema (+8 more)

### Community 18 - "Dashboard Page & KPI"
Cohesion: 0.10
Nodes (15): DashboardData, DashboardPage(), KPIs, RATING_COLORS, RatingDist, RecentReview, SENTIMENT_COLORS, SOURCE_COLORS (+7 more)

### Community 19 - "shadcn Components Config"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 20 - "Legal Pages"
Cohesion: 0.14
Nodes (9): metadata, metadata, metadata, CONTACT, metadata, metadata, FOOTER_COLS, LegalArticle() (+1 more)

### Community 21 - "QR & Branch Management"
Cohesion: 0.13
Nodes (16): feedbackUrl(), QrCodeItem, qrImageUrl(), QrPage(), Branch, SubelerPage(), COLORS, SECTORS (+8 more)

### Community 22 - "Project Architecture"
Cohesion: 0.10
Nodes (21): Ajans Platformu, Anthropic AI, bullmq, Docker Compose Config, Sistem Mimarisi Dokümani, Gelistirme Yol Haritasi, framer-motion, CI GitHub Actions (+13 more)

### Community 23 - "Package Dependencies"
Cohesion: 0.10
Nodes (21): @base-ui/react, bcryptjs, next, next-themes, dependencies, @base-ui/react, bcryptjs, next (+13 more)

### Community 24 - "Redis & Cache API"
Cohesion: 0.10
Nodes (13): ioredis, ioredis, createRedis(), globalForRedis, aiQueue, connection, dashboardQueue, emailQueue (+5 more)

### Community 25 - "Community 25"
Cohesion: 0.15
Nodes (19): _e(), generate_chart_slide(), generate_cta_slide(), generate_deck(), generate_metrics_slide(), generate_problem_slide(), generate_solution_slide(), generate_testimonial_slide() (+11 more)

### Community 26 - "Community 26"
Cohesion: 0.10
Nodes (11): Generate Tailwind CSS configuration files., Add full color palette (50-950 shades) for a base color.          Args:, TailwindConfigGenerator, Test adding full color palette., Test adding custom spacing., Test plugin recommendations for Next.js., Test validating config with no content paths., Test writing configuration to file. (+3 more)

### Community 27 - "Community 27"
Cohesion: 0.12
Nodes (10): ALL_TYPES, ContentItem, ContentPage(), ContentPlanDay, ContentPlanView(), ContentPlanWeek, PLATFORM_GROUPS, PlatformBadge() (+2 more)

### Community 28 - "Community 28"
Cohesion: 0.14
Nodes (11): DesignSystemGenerator, Find matching reasoning rule for a category., Apply reasoning rules to search results., Select best matching result based on priority keywords., Extract results list from search result dict., Generate complete design system recommendation.          variance/motion/density, Bucket a 1-10 dial value into its tier config. Returns None if value is None., Generates design system recommendations from aggregated searches. (+3 more)

### Community 29 - "Community 29"
Cohesion: 0.14
Nodes (7): ChatMessage, SUGGESTIONS, Website, WebsiteEditorPage(), WebsitePage, BlockRenderer(), Block

### Community 30 - "Community 30"
Cohesion: 0.17
Nodes (17): generate_css_for_background(), get_background_image(), get_curated_images(), get_overlay_css(), get_pexels_search_url(), load_backgrounds_config(), load_brand_colors(), main() (+9 more)

### Community 31 - "Community 31"
Cohesion: 0.17
Nodes (16): ansi_ljust(), format_ascii_box(), format_markdown(), format_master_md(), generate_design_system(), hex_to_ansi(), persist_design_system(), Convert hex color to ANSI True Color swatch (██) with fallback. (+8 more)

### Community 32 - "Community 32"
Cohesion: 0.14
Nodes (12): ChatWidgetClient(), CAT_COLORS, CATEGORIES, Chatbot, ChatbotPage(), Conversation, KnowledgeEntry, Message (+4 more)

### Community 33 - "Community 33"
Cohesion: 0.15
Nodes (10): AmbientBackground(), MobileSidebarToggle(), NAV, NavClient(), NavItem, PlanFeatures, State, SubscriptionBanner() (+2 more)

### Community 34 - "Community 34"
Cohesion: 0.20
Nodes (15): apply_color(), apply_viewbox_size(), extract_svgs(), generate_batch(), generate_icon(), generate_sizes(), load_env(), main() (+7 more)

### Community 35 - "Community 35"
Cohesion: 0.12
Nodes (16): $type, $value, $type, $value, $type, $value, $type, $value (+8 more)

### Community 36 - "Community 36"
Cohesion: 0.12
Nodes (9): Test adding components without shadcn config., Test adding components that are already installed., Test ShadcnInstaller class., Test adding all components in dry run mode., Create temporary project structure., Test successful addition of all components., Test listing installed components when none exist., Test checking for non-existent shadcn config. (+1 more)

### Community 37 - "Community 37"
Cohesion: 0.24
Nodes (12): GET(), GET(), POST(), exchangeCodeForTokens(), getGoogleAccounts(), getGoogleAuthUrl(), getGoogleLocations(), getGoogleReviews() (+4 more)

### Community 38 - "Community 38"
Cohesion: 0.13
Nodes (8): main(), Add custom font families.          Args:             fonts: Dict of font_type: [, Add custom spacing values.          Args:             spacing: Dict of name: val, Add custom breakpoints.          Args:             breakpoints: Dict of name: wi, Add plugin requirements.          Args:             plugins: List of plugin name, Get plugin recommendations based on configuration.          Returns:, Validate configuration.          Returns:             Tuple of (valid, message), Add custom colors to theme.          Args:             colors: Dict of color_nam

### Community 39 - "Community 39"
Cohesion: 0.29
Nodes (13): blend(), derive_row(), derive_ui_reasoning(), h2r(), is_dark(), lum(), on_color(), r2h() (+5 more)

### Community 40 - "Community 40"
Cohesion: 0.18
Nodes (11): qrcode, qrcode, GET(), ALLERGENS, Menu, MenuCategory, MenuItem, MenuPage() (+3 more)

### Community 41 - "Community 41"
Cohesion: 0.14
Nodes (14): scripts, build, db:deploy, db:generate, db:migrate, db:seed, db:studio, dev (+6 more)

### Community 42 - "Community 42"
Cohesion: 0.16
Nodes (13): AbonelikPage(), daysLeft(), fmt(), Invoice, INVOICE_STATUS_CONFIG, Plan, PLAN_COLORS, PLAN_ICONS (+5 more)

### Community 43 - "Community 43"
Cohesion: 0.17
Nodes (13): Banner Sizes and Styles Reference, Banner Design Skill, Color Palette Management, Messaging Framework, Typography Specifications, Visual Identity, Brand Voice Framework, Brand Skill (+5 more)

### Community 44 - "Community 44"
Cohesion: 0.22
Nodes (7): main(), Add all available shadcn/ui components.          Args:             overwrite: If, List installed components.          Returns:             Tuple of (success, mess, Check if shadcn is initialized in project.          Returns:             True if, Get list of already installed components.          Returns:             List of, Read shadcn version from project package.json; fall back to a pinned default., Add shadcn/ui components.          Args:             components: List of compone

### Community 45 - "Community 45"
Cohesion: 0.15
Nodes (13): eslint, devDependencies, eslint, prisma, tsx, @types/bcryptjs, @types/nodemailer, @types/react (+5 more)

### Community 46 - "Community 46"
Cohesion: 0.21
Nodes (9): POST(), schema, POST(), schema, ConversationMessage, editWebsiteWithAI(), BlockType, generateWebsiteBlocks() (+1 more)

### Community 47 - "Community 47"
Cohesion: 0.15
Nodes (9): Review, ReviewReport, ReviewsPage(), Sentiment, SENTIMENT_COLOR, SENTIMENT_LABEL, SOURCE_LABEL, Stats (+1 more)

### Community 48 - "Community 48"
Cohesion: 0.17
Nodes (7): Handle shadcn/ui component installation., ShadcnInstaller, Test component addition with subprocess error., Test listing installed components when they exist., Test initialization with custom project root., Test checking for existing shadcn config., Test getting installed components without config.

### Community 49 - "Community 49"
Cohesion: 0.20
Nodes (6): Generate configuration file content.          Returns:             Configuration, Generate TypeScript configuration., Generate JavaScript configuration., Format plugins array for config.          Validates each plugin name against a s, Add indentation to JSON string., Write configuration to file.          Returns:             Tuple of (success, me

### Community 50 - "Community 50"
Cohesion: 0.20
Nodes (7): Tests for tailwind_config_gen.py, Reduce a generated TS/JS config to a bare assignable object so it can be     han, Regression guard for the missing-comma bug between the ``theme`` block and     `, The property preceding ``plugins`` must end with a comma (pure-Python         ch, The emitted config parses as valid JS via ``node --check``., _strip_to_object(), TestGeneratedConfigIsValidJs

### Community 51 - "Community 51"
Cohesion: 0.25
Nodes (10): detect_domain(), _load_csv(), Load CSV and return list of dicts, Core search function using BM25, Auto-detect the most relevant domain from query, Main search function with auto-domain detection, Search stack-specific guidelines, search() (+2 more)

### Community 52 - "Community 52"
Cohesion: 0.24
Nodes (5): metadata, MotionProvider(), PostHogProvider(), DashboardColorTheme(), ThemeProvider()

### Community 53 - "Community 53"
Cohesion: 0.22
Nodes (6): Any, Path, Initialize generator.          Args:             typescript: If True, generate ., Determine default output path., Create base configuration structure., Get default content paths for framework.

### Community 54 - "Community 54"
Cohesion: 0.29
Nodes (9): enhance_prompt(), generate_batch(), generate_logo(), load_env(), main(), Enhance the logo prompt with style and industry modifiers, Generate a logo using Gemini models with image generation      Args:         asp, Generate multiple logo variants with different styles (+1 more)

### Community 55 - "Community 55"
Cohesion: 0.20
Nodes (10): fast, normal, slow, $type, $value, $type, $value, duration (+2 more)

### Community 56 - "Community 56"
Cohesion: 0.24
Nodes (10): $type, $value, $type, $value, primitive, radius, shadow, full (+2 more)

### Community 57 - "Community 57"
Cohesion: 0.24
Nodes (8): POST(), schema, ContentInput, generateContent(), GeneratedContent, PROMPTS, TYPE_ICONS, TYPE_LABELS

### Community 58 - "Community 58"
Cohesion: 0.38
Nodes (7): POST(), GET(), generateText(), analyzeBatch(), analyzeReview(), generateInsightReport(), ReviewAnalysis

### Community 59 - "Community 59"
Cohesion: 0.24
Nodes (6): GoogleContent(), GoogleLogo(), GoogleProfile, PlaceResult, Review, timeAgo()

### Community 60 - "Community 60"
Cohesion: 0.24
Nodes (9): featLine(), fmt(), Plan, PLAN_COLORS, PLAN_ICONS, PlanFeatures, POPULAR_SLUGS, PricingPage() (+1 more)

### Community 61 - "Community 61"
Cohesion: 0.24
Nodes (5): DANGEROUS_PATTERNS, hasSqlInjection(), sanitizeDeep(), sanitizeString(), SQL_INJECTION_PATTERNS

### Community 62 - "Community 62"
Cohesion: 0.28
Nodes (8): Path, Regression tests for validate-tokens.cjs.  The validator used to skip any line c, A hardcoded hex on the same line as a var() token is still a violation., A line that references only tokens produces no false positives., _run(), test_flags_hardcoded_hex_sharing_line_with_token(), test_token_only_line_reports_no_violation(), CompletedProcess

### Community 63 - "Community 63"
Cohesion: 0.28
Nodes (5): BM25, BM25 ranking algorithm for text search, Lowercase, split, remove punctuation, filter short words, Build BM25 index from documents, Score all documents against query

### Community 64 - "Community 64"
Cohesion: 0.33
Nodes (6): POST(), schema, anthropic, buildSystemPrompt(), ChatMessage, streamChatResponse()

### Community 65 - "Community 65"
Cohesion: 0.36
Nodes (6): POST(), schema, deleteKnowledge(), getPinecone(), queryKnowledge(), upsertKnowledge()

### Community 66 - "Community 66"
Cohesion: 0.25
Nodes (7): build, buildCommand, builder, deploy, restartPolicyType, startCommand, $schema

### Community 67 - "Community 67"
Cohesion: 0.32
Nodes (3): NAV, metadata, LogoMark()

### Community 68 - "Community 68"
Cohesion: 0.39
Nodes (5): GET(), csrfTokenResponse(), generateCsrfToken(), validateCsrf(), verifyCsrfToken()

### Community 69 - "Community 69"
Cohesion: 0.39
Nodes (6): POST(), audit(), AuditAction, auditFromRequest(), AuditOptions, getClientIp()

### Community 70 - "Community 70"
Cohesion: 0.33
Nodes (6): ACTION_META, Log, LoglarPage(), LogUser, ROLE_COLORS, timeAgo()

### Community 71 - "Community 71"
Cohesion: 0.38
Nodes (4): POST(), DashboardInput, generateDashboardSummary(), SummaryOutput

### Community 72 - "Community 72"
Cohesion: 0.29
Nodes (3): BRAND_ROLES, GLOBAL_ROLE_LABELS, Member

### Community 74 - "Community 74"
Cohesion: 0.33
Nodes (6): _detect_page_type(), format_page_override_md(), _generate_intelligent_overrides(), Format a page-specific override file with intelligent AI-generated content., Generate intelligent overrides based on page type using layered search., Detect page type from context and search results.

### Community 75 - "Community 75"
Cohesion: 0.40
Nodes (3): MailSender(), ROLES, Target

### Community 76 - "Community 76"
Cohesion: 0.47
Nodes (4): POST(), generateThemeReport(), ReviewReport, ThemeItem

### Community 77 - "Community 77"
Cohesion: 0.33
Nodes (4): Brand, Menu, MenuCategory, MenuItem

### Community 78 - "Community 78"
Cohesion: 0.40
Nodes (5): Notification, NotificationBell(), NotificationData, timeAgo(), TYPE_BG

### Community 79 - "Community 79"
Cohesion: 0.60
Nodes (5): lg, $type, $value, lg, lg

### Community 80 - "Community 80"
Cohesion: 0.60
Nodes (5): sm, sm, sm, $type, $value

### Community 81 - "Community 81"
Cohesion: 0.40
Nodes (5): Deployment Rehberi, @upstash/redis, Supabase PostgreSQL, @upstash/redis, Vercel Deployment

### Community 82 - "Community 82"
Cohesion: 0.40
Nodes (4): description, name, private, version

### Community 83 - "Community 83"
Cohesion: 0.70
Nodes (3): POST(), capture(), getPostHogServer()

### Community 84 - "Community 84"
Cohesion: 0.50
Nodes (4): getUpstash(), POST(), schema, SHOPIER_LINKS

### Community 85 - "Community 85"
Cohesion: 0.40
Nodes (3): metadata, STATS, VALUES

### Community 86 - "Community 86"
Cohesion: 0.40
Nodes (3): Brand, STAR_EMOJIS, STAR_LABELS

### Community 87 - "Community 87"
Cohesion: 0.40
Nodes (3): CATS, Faq, FAQS

### Community 88 - "Community 88"
Cohesion: 0.60
Nodes (4): addSecurityHeaders(), config, middleware(), PROTECTED

### Community 89 - "Community 89"
Cohesion: 0.67
Nodes (4): $type, $value, default, default

### Community 90 - "Community 90"
Cohesion: 0.67
Nodes (4): xl, xl, $type, $value

### Community 91 - "Community 91"
Cohesion: 0.67
Nodes (4): $type, $value, md, md

### Community 93 - "Community 93"
Cohesion: 0.83
Nodes (3): DELETE(), getQr(), PATCH()

## Knowledge Gaps
- **478 isolated node(s):** `$schema`, `$value`, `$type`, `$value`, `$type` (+473 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **88 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `Package Dependencies` to `Community 132`, `Community 135`, `Community 136`, `Community 139`, `Community 140`, `Community 141`, `Community 142`, `Community 143`, `Community 144`, `Community 145`, `Community 146`, `Community 147`, `Community 148`, `Community 149`, `Project Architecture`, `Community 150`, `Redis & Cache API`, `Community 151`, `Community 152`, `Community 153`, `Community 154`, `Community 155`, `Community 156`, `Community 157`, `Community 158`, `Community 159`, `Community 160`, `Community 161`, `Community 40`, `Community 81`, `Community 82`, `Community 106`, `Community 107`, `Community 109`?**
  _High betweenness centrality (0.081) - this node is a cross-community bridge._
- **Why does `qrcode` connect `Community 40` to `Auth & Security API`, `Package Dependencies`?**
  _High betweenness centrality (0.073) - this node is a cross-community bridge._
- **Why does `useBrand()` connect `QR & Branch Management` to `Community 32`, `Community 33`, `Community 27`, `Community 40`, `Community 42`, `Community 78`, `Community 47`, `Dashboard Page & KPI`, `Community 59`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Are the 36 inferred relationships involving `TailwindConfigGenerator` (e.g. with `TestGeneratedConfigIsValidJs` and `.test_node_check_parses_generated_config()`) actually correct?**
  _`TailwindConfigGenerator` has 36 INFERRED edges - model-reasoned connections that need verification._
- **Are the 23 inferred relationships involving `ShadcnInstaller` (e.g. with `TestShadcnInstaller` and `.test_add_all_components_dry_run()`) actually correct?**
  _`ShadcnInstaller` has 23 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Regression test for sync-brand-to-tokens.cjs.  The color parser required a paren`, `Resolve token reference like {primitive.color.ocean-blue.500} to hex value.`, `Load colors from assets/design-tokens.json for overlay gradients.      Resolves` to the rest of the system?**
  _699 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Admin Plans & Branch API` be split into smaller, more focused modules?**
  _Cohesion score 0.05698778833107191 - nodes in this community are weakly interconnected._