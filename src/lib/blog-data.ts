export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  authorAvatar: string;
  category: string;
  tags: string[];
  coverImage: string;
  publishedAt: string;
  readTime: number;
  featured?: boolean;
}

export const BLOG_CATEGORIES = [
  { id: "travel", label: "Travel Tips", emoji: "✈️" },
  { id: "esim", label: "eSIM Guide", emoji: "📱" },
  { id: "tech", label: "Technology", emoji: "💻" },
  { id: "deals", label: "Deals & Offers", emoji: "🏷️" },
  { id: "news", label: "News", emoji: "📰" },
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: "1",
    slug: "best-esim-apps-2024",
    title: "Best eSIM Apps and Services for International Travel in 2024",
    excerpt: "Discover the top eSIM providers and apps that will keep you connected while traveling abroad without breaking the bank.",
    content: `
# Best eSIM Apps and Services for International Travel in 2024

Traveling internationally has never been easier, thanks to eSIM technology. Gone are the days of hunting for local SIM cards or paying excessive roaming fees. Here are the best eSIM apps and services you should consider in 2024.

## Why Choose eSIM?

eSIM (embedded SIM) technology allows you to activate a cellular plan digitally without using a physical SIM card. This means:
- No need to visit a physical store
- Instant activation
- Keep your original phone number
- Multiple eSIMs on one device

## Top eSIM Providers

### 1. OW SIM
OW SIM offers competitive pricing with coverage in 190+ countries. Their instant QR code delivery and 7-day refund policy make them a top choice for travelers.

**Pros:**
- 190+ countries coverage
- Instant activation
- 24/7 customer support
- Great prices

### 2. Airalo
One of the pioneers in eSIM technology, Airalo offers a wide range of plans across multiple regions.

### 3. Holafly
Known for their unlimited data plans, Holafly is perfect for heavy data users.

## How to Choose the Right eSIM Service

When selecting an eSIM provider, consider:
1. **Coverage** - Ensure they cover your destination
2. **Data limits** - Choose based on your usage needs
3. **Validity period** - Match the plan duration to your trip
4. **Price** - Compare prices per GB
5. **Customer reviews** - Check user experiences

## Conclusion

eSIM technology has revolutionized international travel. Whether you're a occasional traveler or a digital nomad, there's an eSIM service that fits your needs. OW SIM stands out for its balance of coverage, pricing, and customer service.
    `,
    author: "Sarah Johnson",
    authorAvatar: "👩‍💼",
    category: "esim",
    tags: ["esim", "travel", "international", "technology"],
    coverImage: "https://images.unsplash.com/photo-1523961131990-5ea7c61b2107?w=800",
    publishedAt: "2024-01-15",
    readTime: 8,
    featured: true,
  },
  {
    id: "2",
    slug: "japan-esim-guide",
    title: "Complete Guide to Using eSIM in Japan",
    excerpt: "Everything you need to know about staying connected in Japan - from choosing the right eSIM plan to installation tips.",
    content: `
# Complete Guide to Using eSIM in Japan

Japan is a fascinating destination for travelers, and staying connected is essential for navigation, translation, and staying in touch with family. Here's your complete guide to using eSIM in Japan.

## Why eSIM is Best for Japan

Japan has excellent cellular coverage, but international roaming can be expensive. eSIM offers:
- **Cost-effective** - Save up to 70% compared to roaming
- **Easy setup** - No need to visit convenience stores
- **Reliable coverage** - Works with major networks like Docomo, KDDI, SoftBank

## Best eSIM Plans for Japan

### Unlimited Plans
Perfect for heavy users who need constant connectivity:
- 7-day unlimited from $18.99
- 15-day unlimited from $29.99

### Data Plans
For moderate users:
- 5GB/15 days from $13.99
- 10GB/30 days from $19.99

## How to Install eSIM in Japan

1. **Purchase your plan** - Buy online before your trip
2. **Receive QR code** - Get instant delivery via email
3. **Scan QR code** - Go to Settings > Cellular > Add Cellular Plan
4. **Activate** - Turn on your new eSIM line

## Tips for Using eSIM in Japan

- **Keep your physical SIM** - You can use both simultaneously
- **Set data alerts** - Monitor usage to avoid surprises
- **Download offline maps** - Google Maps works offline
- **Use WiFi when available** - Save data for when you need it

## Network Coverage

Major networks in Japan include Docomo, KDDI (au), and SoftBank. Most eSIM providers use Docomo's network, which has the best nationwide coverage.

## Conclusion

eSIM is the smartest way to stay connected in Japan. With instant activation, competitive pricing, and excellent coverage, you can focus on exploring all that Japan has to offer.
    `,
    author: "Kenji Tanaka",
    authorAvatar: "👨‍💻",
    category: "esim",
    tags: ["japan", "esim", "travel guide", "asia"],
    coverImage: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800",
    publishedAt: "2024-01-10",
    readTime: 6,
    featured: true,
  },
  {
    id: "3",
    slug: "europe-esim-plans",
    title: "Best eSIM Plans for European Travel in 2024",
    excerpt: "Navigate through Europe with the best eSIM plans. Compare prices, coverage, and find the perfect plan for your European adventure.",
    content: `
# Best eSIM Plans for European Travel in 2024

Europe offers incredible diversity, and with 35+ countries in the Schengen Area, having reliable data is crucial. Here's your guide to eSIM plans for Europe.

## Why Europe Needs Special Attention

Unlike other regions, Europe has:
- Multiple countries in close proximity
- Different network coverage per country
- Schengen Zone for border-free travel
- Varying data regulations

## Top eSIM Plans for Europe

### Regional Europe Plans
- 5GB/15 days: €14.99
- 10GB/30 days: €24.99
- 20GB/30 days: €34.99

### Single Country Plans
Perfect for focused trips:
- France: From €9.99
- Italy: From €9.99
- UK: From £8.99

### Multi-Country Plans
Best for backpackers:
- EU + UK: From €19.99
- EU + Switzerland + UK: From €24.99

## Network Coverage

Major networks include:
- Vodafone (22 countries)
- Orange (12 countries)
- Deutsche Telekom (10 countries)
- Telefonica (6 countries)

## Tips for European Travel

1. **Check included countries** - Not all EU plans include Switzerland, UK, or Norway
2. **Data caps** - Some plans throttle after certain limits
3. **Hotspot usage** - Most plans support tethering
4. **Activation timing** - Some plans activate immediately, others at midnight local time

## Conclusion

Europe is well-served by eSIM providers. Whether you're doing a quick city break or a months-long backpacking trip, there's a plan that fits your needs and budget.
    `,
    author: "Maria Schmidt",
    authorAvatar: "👩‍🇪🇺",
    category: "travel",
    tags: ["europe", "travel", "esim", "schengen"],
    coverImage: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800",
    publishedAt: "2024-01-05",
    readTime: 7,
    featured: false,
  },
  {
    id: "4",
    slug: "digital-nomad-guide",
    title: "eSIM for Digital Nomads: The Ultimate Guide",
    excerpt: "Everything digital nomads need to know about staying connected while working remotely from anywhere in the world.",
    content: `
# eSIM for Digital Nomads: The Ultimate Guide

As a digital nomad, your ability to work depends on reliable internet. Here's everything you need to know about using eSIM while traveling the world.

## The Digital Nomad's Connectivity Challenge

Digital nomads face unique connectivity needs:
- Working from various locations
- Video calls and large file transfers
- Need for reliable, fast internet
- Budget constraints

## Why eSIM is Perfect for Digital Nomads

### No PhysicalSIM Cards
- Don't need to carry multiple SIMs
- Instant activation worldwide
- Easy to manage multiple plans

### Cost Efficiency
- Pay as you go
- No contracts
- Competitive rates per GB

### Flexibility
- Switch between plans easily
- Have multiple eSIMs for different regions
- Keep home number for verification

## Recommended Setup

### Primary eSIM
Use for work and important tasks:
- High-data unlimited plan
- Global or regional coverage
- Reliable network

### Secondary eSIM
Backup and local use:
- Local plans for each country
- Lower cost for casual browsing
- Emergency backup

## Best Countries for Digital Nomads

Based on connectivity and eSIM compatibility:
1. **Thailand** - Great local plans, fast speeds
2. **Portugal** - EU coverage, good infrastructure
3. **Mexico** - Growing network coverage
4. **Indonesia (Bali)** - Popular nomad destination
5. **Georgia** - Excellent connectivity

## Tools and Apps

- **SpeedTest** - Check connection speeds
- **Wifi Mapper** - Find reliable hotspots
- **Google Maps Offline** - Navigate without data
- **eSIM Manager** - Track your plans

## Conclusion

eSIM technology has made it easier than ever to work remotely. With the right setup and planning, you can stay connected from anywhere in the world without breaking the bank.
    `,
    author: "Alex Chen",
    authorAvatar: "🌏",
    category: "travel",
    tags: ["digital nomad", "remote work", "esim", "travel"],
    coverImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
    publishedAt: "2023-12-20",
    readTime: 10,
    featured: true,
  },
  {
    id: "5",
    slug: "esim-vs-physical-sim",
    title: "eSIM vs Physical SIM: Which is Better?",
    excerpt: "Compare eSIM and physical SIM cards to find out which option is best for your travel needs.",
    content: `
# eSIM vs Physical SIM: Which is Better?

With the rise of eSIM technology, travelers now have more options than ever. Let's compare eSIM vs physical SIM cards to help you decide.

## Quick Comparison

| Feature | eSIM | Physical SIM |
|---------|------|-------------|
| Setup Time | Minutes | Hours/Days |
| Physical Card | Not needed | Required |
| Multiple Plans | Yes | No |
| Cost | Generally lower | Varies |
| Compatibility | Limited | Universal |

## Advantages of eSIM

### Instant Activation
No waiting for delivery or visiting stores. Get your plan instantly via QR code.

### Space Saving
No need for a physical slot. Perfect for devices with limited SIM tray space.

### Multiple Plans
Store multiple eSIM profiles and switch between them easily. Great for multi-country trips.

### Environmental Impact
No plastic cards, packaging, or shipping needed.

## Advantages of Physical SIM

### Universal Compatibility
Works with any phone, including older models and budget devices.

### Easy to Share
Can easily share your SIM with others if needed.

### No Activation Issues
Some phones have limited eSIM support or complex activation processes.

## When to Choose eSIM

- International travel
- Multi-country trips
- Quick trips without time for shipping
- Want to keep home number active
- Have eSIM-compatible device

## When to Choose Physical SIM

- Older phone without eSIM support
- Need very cheap local plans
- Plan to use SIM in multiple phones
- Prefer having a physical backup

## Conclusion

For most modern travelers, eSIM is the better choice. It offers convenience, cost savings, and flexibility that physical SIMs can't match. However, your specific situation and device compatibility should guide your decision.
    `,
    author: "Tech Team",
    authorAvatar: "⚙️",
    category: "tech",
    tags: ["esim", "technology", "comparison", "guide"],
    coverImage: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800",
    publishedAt: "2023-12-15",
    readTime: 5,
    featured: false,
  },
  {
    id: "6",
    slug: "usa-esim-travel-guide",
    title: "Complete USA eSIM Travel Guide 2024",
    excerpt: "Navigate the US with confidence. Find the best eSIM plans for traveling in America, from coast to coast.",
    content: `
# Complete USA eSIM Travel Guide 2024

The United States offers incredible diversity, from bustling cities to stunning national parks. Here's your guide to staying connected with eSIM while exploring the USA.

## Why eSIM for USA Travel

The US has excellent cellular infrastructure but complex coverage areas:
- Major carriers: AT&T, Verizon, T-Mobile
- MVNOs offer cheaper alternatives
- Coverage varies significantly by location

## Best eSIM Plans for USA

### Popular Plans
- 10GB/30 days: $16.99
- Unlimited/30 days: $29.99
- 5GB/15 days: $11.99

### Multi-Country Plans
- USA + Canada + Mexico: $21.99 for 10GB/30 days

## Network Coverage

### AT&T
- Best nationwide coverage
- Good in rural areas
- 5G available in most cities

### T-Mobile
- Excellent 5G network
- Great urban coverage
- Growing rural presence

### Verizon
- Strong coverage
- Reliable speeds
- Premium pricing

## Tips for USA Travel

1. **Check coverage maps** - Verify coverage for your specific destinations
2. **Consider multi-country plans** - If visiting Canada or Mexico
3. **Download offline maps** - Essential for national parks
4. **Get a US number** - Useful for rideshare apps and verification

## Destinations and Coverage

### National Parks
- **Yellowstone**: Limited, plan ahead
- **Grand Canyon**: Good coverage at South Rim
- **Yosemite**: Spotty, download offline maps

### Cities
- **New York**: Excellent coverage
- **Los Angeles**: Good coverage
- **San Francisco**: Excellent coverage

## Conclusion

eSIM makes staying connected in the USA easy and affordable. Choose a plan based on your itinerary and data needs, and enjoy your American adventure!
    `,
    author: "Mike Johnson",
    authorAvatar: "🇺🇸",
    category: "travel",
    tags: ["usa", "america", "travel", "esim"],
    coverImage: "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=800",
    publishedAt: "2023-12-10",
    readTime: 7,
    featured: false,
  },
];

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find(post => post.slug === slug);
}

export function getFeaturedPosts(): BlogPost[] {
  return BLOG_POSTS.filter(post => post.featured);
}

export function getPostsByCategory(category: string): BlogPost[] {
  return BLOG_POSTS.filter(post => post.category === category);
}

export function getAllPosts(): BlogPost[] {
  return BLOG_POSTS.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}
