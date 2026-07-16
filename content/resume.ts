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
};

export type ProjectEntry = {
  name: string;
  year?: string;
  description: string;
  links: { label: string; url: string }[];
};

export const resume = {
  basics: {
    name: "Brody Berson",
    label: "Forward Deployed Engineer at Ravenna (starting August 2026)",
    tagline: "Product-focused hacker and leader.",
    email: "hello@brodyberson.com",
    url: "https://brodyberson.com",
    location: "East Grand Rapids, Michigan",
    summary:
      "Solutions engineer working at the intersection of APIs, AI agents, and partnerships. Most recently embedded on Zapier's MCP team from its infancy, driving adoption with AI partners like OpenAI, Anthropic, Google, and Meta. Joining Ravenna as a Forward Deployed Engineer in August 2026.",
  },
  work: [
    {
      company: "Ravenna",
      position: "Forward Deployed Engineer",
      startDate: "Aug 2026",
      endDate: "",
      location: "Remote",
      url: "https://ravenna.ai",
      note: "Starting August 2026",
      highlights: [
        "Joining Ravenna — the agentic service desk for IT, HR, and Operations that lives in Slack — to work hands-on with customers as a Forward Deployed Engineer.",
      ],
    },
    {
      company: "Zapier",
      position: "Sr. Partner Solution Engineer, AI",
      startDate: "Feb 2024",
      endDate: "Present",
      location: "Remote — East Grand Rapids, MI",
      url: "https://zapier.com",
      highlights: [
        "Embedded on Zapier's MCP team from its infancy, helping the product grow from early prototype to a core part of Zapier's AI platform.",
        "Worked directly with AI partners — OpenAI, Anthropic, Google, Meta, and others — as their technical point of contact at Zapier.",
        "Drove two-way MCP ecosystem adoption: introduced partners to Zapier MCP, got Zapier's MCP server listed in partner marketplaces, and brought partners' MCP clients into Zapier's side.",
      ],
    },
    {
      company: "Magic",
      position: "Lead Solutions Engineer",
      startDate: "May 2023",
      endDate: "Dec 2023",
      location: "Remote",
      highlights: [
        "Helped medium to large enterprise customers, mostly C-suite contacts, understand what is technically possible with Magic's products.",
        "Understood user and partner technical requirements and communicated how Magic could solve their onboarding and checkout flow needs.",
        "Maintained a deep understanding of the Magic SDK and how to integrate it into different languages and frameworks, such as React.js and Next.js.",
        "Contributed technical content, proof of concepts, and demos showing customers how to implement specific use cases and best practices.",
        "Worked closely with customer success to ensure customers onboarded, launched, and renewed successfully.",
      ],
    },
    {
      company: "Metaverse Group",
      position: "Head of Product",
      startDate: "Dec 2022",
      endDate: "May 2023",
      highlights: [
        "Along with the CTO from cocoNFT, built out an entire Engineering and Product organization internally, working cross-functionally with Sales.",
        "Constructed a knowledge base of best practices, playbooks, and guides to keep the entire organization organized.",
        "Turned a consulting company into a technical product team with a multi-year roadmap in the Metaverse space and started executing on that strategy.",
        "Trained 6 existing team members on product management tools like Linear, folding those practices into their day-to-day as they spun client projects up and down.",
      ],
    },
    {
      company: "cocoNFT",
      position: "Cofounder & Chief Product Officer",
      startDate: "Mar 2021",
      endDate: "Dec 2022",
      note: "Acquired by Metaverse Group",
      highlights: [
        "Spearheaded the launch of cocoNFT, a web3 B2C product enabling millions of non-crypto users to create NFT digital collectibles from Instagram posts — propelling the company to an acquisition by Metaverse Group.",
        "Managed day-to-day operations and raised two rounds of pre-seed funding; interviewed for Y Combinator twice.",
        "Built and led a team of 12 employees, including a direct team of 4 engineers, fostering Agile methodologies to streamline operations.",
        "Conducted comprehensive user research with our Principal Designer, identifying market gaps and barriers for non-crypto users.",
        "Helped negotiate the acquisition of cocoNFT by Metaverse Group.",
      ],
    },
    {
      company: "Zapier",
      position: "Lead Solutions Engineer",
      startDate: "Oct 2020",
      endDate: "Feb 2022",
      url: "https://zapier.com",
      highlights: [
        "Worked directly with API partners and developers, helping them build in-depth Zapier integrations using the Developer Platform and Partner APIs.",
        "Created documentation, guides, and a developer-centric YouTube playlist detailing all of Zapier's embeddable options and complex integrations.",
        "Implemented a streamlined process for the Partnerships team to field inbound leads, prioritizing where Solution Engineers could best fit in.",
        "Worked cross-functionally with Engineering, Product, Partnerships, and the newly budding Sales organization to influence the product roadmap based on partner needs.",
      ],
    },
    {
      company: "Squarespace",
      position: "Senior Technical Support Engineer",
      startDate: "Jun 2020",
      endDate: "Oct 2020",
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
      url: "https://zapier.com",
      highlights: [
        "Joined as a very early employee as Zapier surpassed 2,000+ connected APIs, working with third-party developers to build and review new integrations.",
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
    },
  ] satisfies EducationEntry[],
  projects: [
    {
      name: "cinamini",
      description:
        "A daily movie puzzle site — guess the film from progressively easier clues, then come back tomorrow.",
      links: [{ label: "cinamini.app", url: "https://cinamini.app" }],
    },
    {
      name: "Doop Doop Bot",
      year: "2023",
      description:
        "A TypeScript app wiring together Twitter, Discord, and Alchemy APIs to track Doodles 'dooplications' happening on the Ethereum blockchain in real time.",
      links: [],
    },
    {
      name: "Cocktail Database",
      year: "2022",
      description:
        "After numerous attempts at Google Docs and Sheets, an Airtable that catalogs favorite recipes and an entire cocktail book collection.",
      links: [],
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
