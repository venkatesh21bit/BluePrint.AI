import { SimulationScenario } from '@/schemas/simulation';

export const SCENARIOS: SimulationScenario[] = [
  {
    id: 'launch-day',
    name: 'Launch Day',
    description: 'Product-market fit signal, word-of-mouth dynamics, and competitive response on day 1.',
    worldEventPrompt: 'The startup has just launched its MVP publicly on Product Hunt, Hacker News, and Twitter. Agents are discovering it for the first time.',
    agentRolesToSpawn: [
      'Early Adopter Enthusiast',
      'Skeptical Industry Veteran',
      'Competitor Employee',
      'Tech Journalist',
      'Budget-Constrained Startup Founder',
      'Mid-Market Buyer',
    ],
    maxRounds: 8,
  },
  {
    id: 'pricing-gauntlet',
    name: 'Pricing Gauntlet',
    description: 'Test price sensitivity, willingness to pay, and deal-breaker thresholds.',
    worldEventPrompt: 'The startup has revealed its pricing tiers. Agents must decide if the value justifies the cost.',
    agentRolesToSpawn: [
      'Bootstrapped Founder (Low Budget)',
      'Series A CFO (ROI Focused)',
      'Enterprise Procurement Manager (Compliance Focused)',
      'VP of Engineering (Build vs. Buy Analyst)',
      'Early Adopter (Price Insensitive)',
    ],
    maxRounds: 6,
  },
  {
    id: 'the-pitch',
    name: 'The Pitch',
    description: 'Fundability, objection patterns, and VC sentiment.',
    worldEventPrompt: 'The founder is pitching to a panel of investors for a Seed round. The investors are scrutinizing the market size, team, and traction.',
    agentRolesToSpawn: [
      'Lead Partner (Vision Focused)',
      'Associate (Metrics & Due Diligence Focused)',
      'Angel Investor (Team & Vibes Focused)',
      'Skeptical LP (Risk Averse)',
    ],
    maxRounds: 6,
  },
  {
    id: 'enterprise-sales',
    name: 'Enterprise Sales',
    description: 'Enterprise buying dynamics, security objections, and champion/blocker dynamics.',
    worldEventPrompt: 'The startup is engaged in a B2B sales cycle with a Fortune 500 company. The product must pass through multiple stakeholders.',
    agentRolesToSpawn: [
      'End-User Champion (Needs the tool badly)',
      'CISO (Security Blocker)',
      'VP of IT (Integration Concerns)',
      'Procurement Officer (Budget Blocker)',
    ],
    maxRounds: 8,
  },
  {
    id: 'community-reaction',
    name: 'Community Reaction',
    description: 'Viral potential, common criticisms, and open-source/hacker community fit.',
    worldEventPrompt: 'The startup is trending on Hacker News and Reddit. The community is tearing it apart and praising it simultaneously.',
    agentRolesToSpawn: [
      'Open Source Purist',
      'Trend-Chaser Dev',
      'Cynical Redditor',
      'Supportive Creator',
      'Niche Expert',
    ],
    maxRounds: 6,
  },
];
