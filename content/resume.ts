export type WorkEntry = {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  location?: string;
  url?: string;
  note?: string;
  highlights: string[];
};

export type EducationEntry = {
  institution: string;
  area: string;
  studyType: string;
  startDate: string;
  endDate: string;
  url?: string;
};

export type ProjectEntry = {
  name: string;
  year?: string;
  /** Custom status badge, e.g. "Unmaintained", "Deprecated" */
  tag?: string;
  description: string;
  links: { label: string; url: string }[];
};

export const resume = {
  basics: {
    name: "Brody Berson",
    label: "Forward Deployed Engineer at Ravenna",
    tagline: "Product-focused hacker and leader.",
    email: "hello@brodyberson.com",
    url: "https://brodyberson.com",
    location: "East Grand Rapids, Michigan",
    summary:
      "Forward Deployed Engineer working across APIs, AI agents, rapid prototyping, hands-on customer engineering, and partnerships. Currently at Ravenna, the agentic service desk for IT, HR, and Ops. Previously embedded on Zapier's MCP team from its infancy, driving adoption with AI partners like OpenAI, Anthropic, Google, Microsoft, Meta, and xAI.",
  },
  work: [
    {
      company: "Ravenna",
      position: "Forward Deployed Engineer",
      startDate: "Aug 2026",
      endDate: "Present",
      location: "Remote",
      url: "https://ravenna.ai",
      highlights: [
        "Working hands-on with customers at Ravenna (the agentic service desk for IT, HR, and Operations that lives in Slack).",
      ],
    },
    {
      company: "Zapier",
      position: "Sr. Partner Solution Engineer, AI",
      startDate: "Feb 2024",
      endDate: "Jul 2026",
      location: "Remote",
      url: "https://zapier.com",
      highlights: [
        "Embedded on Zapier's MCP team from its infancy, helping the product grow from early prototype to a core part of Zapier's AI platform.",
        "Worked directly with AI partners such as OpenAI, Anthropic, Google, Microsoft, Meta, xAI, among others, as their technical point of contact at Zapier.",
        "Onboarded partners onto Zapier MCP and rapidly prototyped partner use cases with both MCP and the Zapier SDK.",
        "Drove two-way MCP ecosystem adoption: introduced partners to Zapier MCP, got Zapier's MCP server listed in partner marketplaces, and brought partners' MCP clients into Zapier's side.",
      ],
    },
    {
      company: "Magic",
      position: "Lead Solutions Engineer",
      startDate: "May 2023",
      endDate: "Dec 2023",
      location: "Remote",
      url: "https://magic.link",
      highlights: [
        "Helped medium to large enterprise customers, mostly C-suite contacts, understand what is technically possible with Magic's products.",
        "Turned partner and user technical requirements into real solutions for their onboarding and checkout flows.",
        "Maintained a deep understanding of the Magic SDK across languages and frameworks like React.js and Next.js, contributing technical content, proofs of concept, and demos.",
        "Worked closely with customer success to ensure customers onboarded, launched, and renewed successfully.",
      ],
    },
    {
      company: "Metaverse Group",
      position: "Head of Product",
      startDate: "Dec 2022",
      endDate: "May 2023",
      location: "Remote",
      url: "https://www.businesswire.com/news/home/20230103005447/en/Tokens.coms-Metaverse-Subsidiary-Acquires-CocoNFT",
      highlights: [
        "Along with the CTO from cocoNFT, built out an entire Engineering and Product organization internally, working cross-functionally with Sales.",
        "Built a knowledge base of best practices, playbooks, and guides to keep the whole org organized.",
        "Turned a consulting company into a technical product team with a multi-year roadmap in the Metaverse space and started executing on that strategy.",
      ],
    },
    {
      company: "cocoNFT",
      position: "Cofounder & Chief Product Officer",
      startDate: "Mar 2021",
      endDate: "Dec 2022",
      location: "Remote",
      url: "http://coconft.com",
      note: "Acquired by Metaverse Group",
      highlights: [
        "Led the launch of cocoNFT, a web3 B2C product that let millions of non-crypto users turn their Instagram posts into NFT digital collectibles, traction that led Metaverse Group to acquire the company.",
        "Managed day-to-day operations and raised two rounds of pre-seed funding; interviewed for Y Combinator twice.",
        "Built and led a team of 12 employees, including a direct team of 4 engineers, running two-week sprints to keep the org moving.",
        "Ran user research with our Principal Designer to find the gaps and barriers keeping non-crypto users from joining in.",
      ],
    },
    {
      company: "Zapier",
      position: "Lead Solutions Engineer",
      startDate: "Oct 2020",
      endDate: "Feb 2022",
      location: "Remote",
      url: "https://zapier.com",
      highlights: [
        "Worked directly with API partners and developers, helping them build in-depth Zapier integrations using the Developer Platform and Partner APIs.",
        "Created documentation, guides, and a developer-centric YouTube playlist detailing all of Zapier's embeddable options and complex integrations.",
        "Hired as Zapier's first Partner Solutions Engineer and built out the function, including the process the Partnerships team used to field inbound leads and prioritize where Solution Engineers could best plug in.",
        "Worked cross-functionally with Engineering, Product, Partnerships, and the newly budding Sales organization to influence the product roadmap based on partner needs.",
      ],
    },
    {
      company: "Squarespace",
      position: "Senior Technical Support Engineer",
      startDate: "Jun 2020",
      endDate: "Oct 2020",
      location: "Remote",
      url: "https://www.squarespace.com",
      highlights: [
        "Worked with developers and partners integrating with the growing number of Squarespace APIs, setting them up for success.",
        "Partnered with the API Development team to prioritize new endpoints based on what key stakeholders were requesting.",
        "Built proof-of-concept integrations to show off the capabilities of the various APIs.",
      ],
    },
    {
      company: "Zapier",
      position: "Engineer, App Integrations",
      startDate: "Nov 2016",
      endDate: "Jun 2020",
      location: "Remote",
      url: "https://zapier.com",
      highlights: [
        "Joined as a very early employee right as Zapier crossed 2,000+ connected APIs, working with third-party developers to build and review new integrations.",
        "Provided developers first-line support and actively reviewed and QA'd all new integrations submitted to go public on the platform.",
        "Grew into the Strategic Apps team, working with Partnerships to build brand-new Node.js integrations strategic to the platform.",
        "Maintained and deployed bug fixes for legacy integrations developed in Python.",
      ],
    },
    {
      company: "Invoca",
      position: "Software Quality Assurance Engineer",
      startDate: "Jun 2015",
      endDate: "Nov 2016",
      location: "Boulder, CO",
      url: "https://www.invoca.com",
      highlights: [
        "Led QA efforts at Invoca's Boulder office, regularly collaborating with remote co-workers around the world.",
        "Sole SQA engineer for the development team: wrote all automated end-to-end Capybara tests plus manual test plans across continuous development sprint cycles.",
        "Became a Scrum Alliance Certified ScrumMaster (CSM) and led the six-member scrum team.",
      ],
    },
    {
      company: "Yello",
      position: "Software Quality Assurance Engineer",
      startDate: "Jul 2014",
      endDate: "May 2015",
      location: "Chicago, IL",
      url: "https://yello.co",
      note: "Formerly RECSOLU",
      highlights: [
        "Provided first-line application support to users and clients of Yello.",
        "Helped support system availability of web and mobile applications in production and staging environments.",
        "Worked independently with customers during implementation and in production, troubleshooting at a technical level.",
        "Main test automation engineer using Cucumber and Capybara, with Jenkins as the continuous integration tool.",
      ],
    },
  ] satisfies WorkEntry[],
  education: [
    {
      institution: "Grand Valley State University",
      area: "Computer Science",
      studyType: "Bachelor of Science",
      startDate: "2010",
      endDate: "2014",
      url: "https://www.gvsu.edu/",
    },
  ] satisfies EducationEntry[],
  projects: [
    {
      name: "cinamini",
      year: "2026",
      tag: "Unmaintained",
      description:
        "A daily movie puzzle site: guess the film from progressively easier clues, then come back tomorrow.",
      links: [{ label: "cinamini.app", url: "https://cinamini.app" }],
    },
    {
      name: "Doop Doop Bot",
      year: "2023",
      tag: "Deprecated",
      description:
        "A TypeScript app wiring together Twitter, Discord, and Alchemy APIs to track Doodles 'dooplications' happening on the Ethereum blockchain in real time.",
      links: [
        {
          label: "GitHub",
          url: "https://github.com/mynamebrody/doodles-ethereum-nft-sales-bot",
        },
      ],
    },
    {
      name: "Cocktail Database",
      year: "2022",
      tag: "New version coming soon",
      description:
        "After numerous attempts at Google Docs and Sheets, an Airtable that catalogs favorite recipes and an entire cocktail book collection, with a new version in the works beyond Airtable.",
      links: [
        {
          label: "Airtable",
          url: "https://airtable.com/appf6w4DuaHnumI3U/shrTsXskos0QmZvT2",
        },
      ],
    },
    {
      name: "Pizza Dash",
      year: "2015",
      description:
        "Hacked an Amazon Dash button to order Domino's pizza at the press of a button. Featured on The Verge, Gizmodo, Consumerist, Lifehacker, and Hackaday.",
      links: [
        {
          label: "Medium post",
          url: "https://medium.com/@mynamebrody/hacking-amazon-s-5-dash-button-to-order-domino-s-pizza-9d19c9d04646",
        },
        { label: "GitHub", url: "https://github.com/mynamebrody/pizzadash" },
        {
          label: "The Verge",
          url: "https://www.theverge.com/2015/9/28/9407669/amazon-dash-button-hack-pizza",
        },
      ],
    },
    {
      name: "Drizly Dash",
      year: "2015",
      description:
        "The follow-up: hacked another Dash button to order beer from Drizly to go with the pizza.",
      links: [
        {
          label: "Medium post",
          url: "https://medium.com/@mynamebrody/drizly-dash-beer-me-with-the-press-of-a-button-a8c1185d316f",
        },
        { label: "GitHub", url: "https://github.com/mynamebrody/DrizlyDash" },
      ],
    },
  ] satisfies ProjectEntry[],
  skills: [
    "Model Context Protocol (MCP)",
    "Solutions engineering",
    "APIs & integrations",
    "Partner engineering",
    "TypeScript / Node.js",
    "Technical solution design",
    "Product management",
  ],
} as const;

export type Resume = typeof resume;
