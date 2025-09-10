/**
 * @module questions-data
 * Données complètes de l'assessment Pod - 36 questions avec contenu éducatif
 */

export const ASSESSMENT_DATA = {
  // Configuration globale
  config: {
    totalQuestions: 36,
    passingScore: 4.0,
    version: '2.0.0'
  },

  // Dimensions (5 total)
  dimensions: [
    {
      id: 'workflow',
      name: 'WORKFLOW MASTERY',
      description: 'How well does the pod control and optimize their flow of work?'
    },
    {
      id: 'rituals',
      name: 'RITUALS & CADENCE',
      description: 'How effective are the pod\'s ceremonies and regular practices?'
    },
    {
      id: 'visibility',
      name: 'VISIBILITY & ALIGNMENT',
      description: 'How clear and transparent are goals progress and information?'
    },
    {
      id: 'execution',
      name: 'EXECUTION QUALITY',
      description: 'How well does the pod deliver on commitments with quality?'
    },
    {
      id: 'improvement',
      name: 'CONTINUOUS IMPROVEMENT',
      description: 'How well does the pod learn and evolve their practices?'
    }
  ],

  // Questions (36 total)
  questions: [
    // WORKFLOW MASTERY (Questions 1-6)
    {
      id: 1,
      dimensionId: 'workflow',
      text: 'The pod tracks workflow KPIs and clearly identifies bottlenecks in their process',
      type: 'A',
      options: null,
      whyContent: {
        whyMatters: 'Without metrics you\'re flying blind. KPIs reveal where work actually gets stuck - often not where teams think. Data beats opinions every time when improving flow.',
        whenDoneWell: [
          'Decisions based on facts not feelings',
          'Team knows exactly where to focus improvement efforts',
          'Problems visible before they become critical',
          'Continuous flow optimization becomes possible'
        ],
        problemsWithout: [
          'Optimizing the wrong things wastes effort',
          'Arguments about what\'s really slowing the team',
          'Hidden wait times kill productivity',
          'Can\'t prove improvements actually worked'
        ]
      }
    },
    {
      id: 2,
      dimensionId: 'workflow',
      text: 'How well does the pod manage concurrent work to maintain flow?',
      type: 'C',
      options: [
        { label: 'Chaos - Everyone works on everything constant context switching', value: 1 },
        { label: 'Overloaded - People juggle many items lots of 90% done work', value: 2 },
        { label: 'Some awareness - Pod tries to limit WIP but often fails under pressure', value: 3 },
        { label: 'Usually controlled - Most members focus on 1-2 items occasional overload', value: 4 },
        { label: 'Well managed - Clear focus items flow smoothly rare bottlenecks', value: 5 },
        { label: 'Optimized flow - Pod proactively manages WIP pulls work at sustainable pace', value: 6 }
      ],
      whyContent: {
        whyMatters: 'Too much WIP creates chaos. Like juggling - add too many balls and you drop them all. Focus enables flow, multitasking destroys it.',
        whenDoneWell: [
          'Work flows predictably through the system',
          'Team members can focus deeply',
          'Less context switching means higher quality',
          'Faster overall delivery despite doing less at once'
        ],
        problemsWithout: [
          'Everything is 90% done nothing is finished',
          'Constant context switching burns mental energy',
          'Blocked work piles up everywhere',
          'Stress and overtime become normal'
        ]
      }
    },
    {
      id: 3,
      dimensionId: 'workflow',
      text: 'The pod knows and actively works to reduce the time from "started" to "done"',
      type: 'A',
      options: null,
      whyContent: {
        whyMatters: 'Cycle time is the truth about your delivery speed. Long cycle times mean late feedback, higher risk, and unhappy stakeholders. Speed isn\'t rushing - it\'s removing delays.',
        whenDoneWell: [
          'Fast feedback loops catch problems early',
          'Value reaches users quickly',
          'Less work in progress reduces complexity',
          'Team morale improves with frequent wins'
        ],
        problemsWithout: [
          'Requirements change before work finishes',
          'Big batches increase risk of failure',
          'Team forgets context on long-running items',
          'Business loses confidence in delivery'
        ]
      }
    },
    {
      id: 4,
      dimensionId: 'workflow',
      text: 'Bottlenecks are made visible and the pod actively works to eliminate them',
      type: 'A',
      options: null,
      whyContent: {
        whyMatters: 'A chain is only as strong as its weakest link. One bottleneck can slow an entire team. Making them visible turns frustration into focused action.',
        whenDoneWell: [
          'Everyone knows where help is needed',
          'Resources shift dynamically to unblock flow',
          'Systematic improvements target real constraints',
          'Team collaborates instead of finger-pointing'
        ],
        problemsWithout: [
          'Work queues up invisibly until crisis hits',
          'People optimize their part while system suffers',
          'Heroics and overtime become the norm',
          'Same problems repeat every sprint'
        ]
      }
    },
    {
      id: 5,
      dimensionId: 'workflow',
      text: 'Dependencies with other pods (code reviews cross-pod projects) are identified and optimized to avoid delays',
      type: 'A',
      options: null,
      whyContent: {
        whyMatters: 'External dependencies are delivery killers. They\'re outside your control but inside your timeline. Managing them proactively is the difference between smooth delivery and constant fire-fighting.',
        whenDoneWell: [
          'No surprise blocks from other teams',
          'Clear contracts and timelines with dependencies',
          'Alternative paths identified in advance',
          'Predictable delivery despite external factors'
        ],
        problemsWithout: [
          'Sprint goals fail due to external delays',
          'Last-minute scrambles to find workarounds',
          'Trust erodes between teams',
          'Planning becomes meaningless'
        ]
      }
    },
    {
      id: 6,
      dimensionId: 'workflow',
      text: 'The number of items completed per sprint is predictable and stable',
      type: 'A',
      options: null,
      whyContent: {
        whyMatters: 'Predictability builds trust. When completion varies wildly, planning becomes guesswork. Stable velocity means reliable commitments and calm delivery.',
        whenDoneWell: [
          'Business can plan with confidence',
          'Team avoids overcommitment stress',
          'Sustainable pace prevents burnout',
          'Focus on value not just activity'
        ],
        problemsWithout: [
          'Constant replanning wastes time',
          'Team credibility suffers',
          'Feast or famine work patterns',
          'Quality drops under pressure'
        ]
      }
    },

    // RITUALS & CADENCE (Questions 7-14)
    {
      id: 7,
      dimensionId: 'rituals',
      text: 'Each iteration has a proper preparation (refinement) and planning session',
      type: 'C',
      options: [
        { label: 'No planning sessions', value: 1 },
        { label: 'Planning exists but poorly prepared', value: 2 },
        { label: 'Planning exists sometimes prepared', value: 3 },
        { label: 'Planning exists usually well prepared', value: 4 },
        { label: 'Planning exists always well prepared', value: 5 },
        { label: 'Planning refined regularly always excellent', value: 6 }
      ],
      whyContent: {
        whyMatters: 'Starting work unprepared is like cooking without reading the recipe first. Good preparation prevents rework, confusion, and wasted effort.',
        whenDoneWell: [
          'Team starts sprints with clarity and confidence',
          'Questions answered before coding begins',
          'Realistic commitments based on understanding',
          'Smooth sprint execution without surprises'
        ],
        problemsWithout: [
          'Discovery happens during development',
          'Constant clarification interrupts flow',
          'Scope creep from misunderstandings',
          'Sprint goals regularly missed'
        ]
      }
    },
    {
      id: 8,
      dimensionId: 'rituals',
      text: 'Daily check-ins effectively identify blockers and coordinate work',
      type: 'A',
      options: null,
      whyContent: {
        whyMatters: 'Blockers grow exponentially - what takes 5 minutes to fix now takes 5 hours tomorrow. Daily sync prevents small issues from becoming big problems.',
        whenDoneWell: [
          'Blockers resolved within hours not days',
          'Natural collaboration emerges',
          'No duplicate work or gaps',
          'Team stays aligned without micromanagement'
        ],
        problemsWithout: [
          'People stuck for days before asking for help',
          'Duplicate work from poor coordination',
          'Surprises at sprint review',
          'Increased stress and frustration'
        ]
      }
    },
    {
      id: 9,
      dimensionId: 'rituals',
      text: 'The pod demonstrates completed work and tracks delivery metrics each sprint',
      type: 'A',
      options: null,
      whyContent: {
        whyMatters: '\'Done\' without demonstration is just a claim. Regular demos create accountability, gather feedback, and celebrate progress. Metrics show if you\'re improving or just busy.',
        whenDoneWell: [
          'Early feedback prevents wrong direction',
          'Team pride in showing real progress',
          'Stakeholders engaged and informed',
          'Continuous improvement based on data'
        ],
        problemsWithout: [
          'Big bang reveals with nasty surprises',
          'Disconnection from user needs',
          'No celebration of achievements',
          'Can\'t tell if process changes help'
        ]
      }
    },
    {
      id: 10,
      dimensionId: 'rituals',
      text: 'Product demos conducted with stakeholders this quarter',
      type: 'B',
      options: [
        { label: '0 demos', value: 1 },
        { label: '1 demo', value: 3 },
        { label: '2 demos', value: 5 },
        { label: '3+ demos', value: 6 }
      ],
      whyContent: {
        whyMatters: 'Stakeholders aren\'t mind readers. Regular demos build trust, get buy-in, and ensure you\'re building the right thing. Silence from stakeholders isn\'t approval - it\'s disengagement.',
        whenDoneWell: [
          'Strong stakeholder support and engagement',
          'Early course corrections save time',
          'Shared excitement about progress',
          'Clear alignment on priorities'
        ],
        problemsWithout: [
          'Surprise disappointment at major milestones',
          'Building the wrong thing perfectly',
          'Loss of stakeholder confidence',
          'Late expensive changes'
        ]
      }
    },
    {
      id: 11,
      dimensionId: 'rituals',
      text: 'Backlog refinement happens regularly and keeps upcoming work ready',
      type: 'A',
      options: null,
      whyContent: {
        whyMatters: 'An unrefined backlog is like a cluttered workshop - you waste time looking for tools instead of building. Regular refinement keeps the team moving smoothly.',
        whenDoneWell: [
          'Sprints start immediately without confusion',
          'Consistent flow without start-stop delays',
          'Better estimates from deeper understanding',
          'Proactive problem solving'
        ],
        problemsWithout: [
          'Sprint planning takes forever',
          'Work starts then stops for clarification',
          'Poor estimates lead to overruns',
          'Technical debt hidden until too late'
        ]
      }
    },
    {
      id: 12,
      dimensionId: 'rituals',
      text: 'The pod has a dedicated ritual for continuous improvement each iteration (retrospective)',
      type: 'A',
      options: null,
      whyContent: {
        whyMatters: 'Teams that don\'t reflect don\'t improve. Retrospectives turn experience into learning and frustration into action. Without them, you repeat the same mistakes forever.',
        whenDoneWell: [
          'Problems solved systematically not repeatedly',
          'Team owns their process improvements',
          'Psychological safety increases',
          'Continuous evolution and adaptation'
        ],
        problemsWithout: [
          'Same problems every sprint',
          'Growing frustration and cynicism',
          'Process imposed not owned',
          'Team stagnation and turnover'
        ]
      }
    },
    {
      id: 13,
      dimensionId: 'rituals',
      text: 'Pod member attendance at ceremonies',
      type: 'B',
      options: [
        { label: 'Less than 60%', value: 1 },
        { label: '60-69%', value: 2 },
        { label: '70-79%', value: 3 },
        { label: '80-89%', value: 4 },
        { label: '90-94%', value: 5 },
        { label: '95% or higher', value: 6 }
      ],
      whyContent: {
        whyMatters: 'Ceremonies need everyone to work. Missing people means missing perspectives, delayed decisions, and repeated conversations. Presence shows commitment to the team.',
        whenDoneWell: [
          'Decisions made quickly with all input',
          'Strong team cohesion and alignment',
          'Efficient ceremonies with clear outcomes',
          'Shared ownership of process'
        ],
        problemsWithout: [
          'Decisions revisited when absentees return',
          'Information gaps and miscommunication',
          'Ceremonies feel wasteful to attendees',
          'Team fragmentation'
        ]
      }
    },
    {
      id: 14,
      dimensionId: 'rituals',
      text: 'Pod members find the ceremonies valuable and wouldn\'t want to skip them',
      type: 'A',
      options: null,
      whyContent: {
        whyMatters: 'Ceremonies that feel like waste ARE waste. When done right, ceremonies are where the magic happens - alignment, problem-solving, and team building. If people want to skip them, they\'re broken.',
        whenDoneWell: [
          'High energy and engagement',
          'Team protects ceremony time',
          'Continuous improvement of ceremonies themselves',
          'Ceremonies drive real outcomes'
        ],
        problemsWithout: [
          'Multitasking during ceremonies',
          'Going through motions without value',
          'Resentment about \'wasted\' time',
          'Ceremonies happen but nothing changes'
        ]
      }
    },

    // VISIBILITY & ALIGNMENT (Questions 15-23)
    {
      id: 15,
      dimensionId: 'visibility',
      text: 'Sprint goals are clear and written by PM/EM',
      type: 'C',
      options: [
        { label: 'No sprint goals defined', value: 1 },
        { label: '"Goal" is just the list of stories/tasks', value: 2 },
        { label: 'Multiple goals to cover different priorities', value: 3 },
        { label: 'Single goal focused on delivery (output)', value: 4 },
        { label: 'Single goal focused on user/business value (outcome)', value: 5 },
        { label: 'Single outcome goal with clear success metric', value: 6 }
      ],
      whyContent: {
        whyMatters: 'A sprint without a clear goal is just a list of tasks. Goals create focus, enable trade-offs, and give meaning to the work. Vague goals are worse than no goals.',
        whenDoneWell: [
          'Everyone knows what success looks like',
          'Easy trade-off decisions during sprint',
          'Sense of achievement when goal is met',
          'Clear communication to stakeholders'
        ],
        problemsWithout: [
          'Team pulls in different directions',
          'No way to say no to new requests',
          'Sprint review becomes task checklist',
          'Lost sense of purpose'
        ]
      }
    },
    {
      id: 16,
      dimensionId: 'visibility',
      text: 'The pod has clear visibility of the portfolio of initiatives in their quarterly roadmap',
      type: 'A',
      options: null,
      whyContent: {
        whyMatters: 'Working without roadmap visibility is like driving with a dirty windshield. Teams need to see where they\'re going to make smart decisions and prepare for what\'s coming.',
        whenDoneWell: [
          'Team makes informed technical decisions',
          'Proactive preparation for upcoming work',
          'Better sprint planning with context',
          'Increased ownership and engagement'
        ],
        problemsWithout: [
          'Short-sighted technical choices',
          'Surprises that could have been prepared for',
          'Disengaged team just taking orders',
          'Wasted effort on soon-to-be-replaced work'
        ]
      }
    },
    {
      id: 17,
      dimensionId: 'visibility',
      text: 'The functional and technical source of truth is clearly identified and kept up-to-date by the pod',
      type: 'A',
      options: null,
      whyContent: {
        whyMatters: 'Outdated documentation is worse than no documentation - it misleads confidently. A single source of truth prevents the chaos of conflicting information and tribal knowledge.',
        whenDoneWell: [
          'Onboarding new members takes days not months',
          'Decisions based on correct information',
          'Less time searching more time building',
          'Knowledge preserved despite turnover'
        ],
        problemsWithout: [
          'Constant questions about how things work',
          'Decisions based on outdated information',
          'New team members struggle for months',
          'Critical knowledge walks out the door'
        ]
      }
    },
    {
      id: 18,
      dimensionId: 'visibility',
      text: 'Sprint progress and blockers are visible to all pod members and stakeholders (Kanban board Up to date)',
      type: 'A',
      options: null,
      whyContent: {
        whyMatters: 'Invisible progress creates anxiety and micromanagement. Transparency builds trust and enables help to arrive before it\'s too late.',
        whenDoneWell: [
          'No status meeting needed',
          'Help arrives proactively',
          'Trust replaces surveillance',
          'Early warning of problems'
        ],
        problemsWithout: [
          'Constant status requests',
          'Surprises at sprint end',
          'Micromanagement increases',
          'Problems hidden until crisis'
        ]
      }
    },
    {
      id: 19,
      dimensionId: 'visibility',
      text: 'Regular clear communication keeps stakeholders informed of progress and challenges',
      type: 'A',
      options: null,
      whyContent: {
        whyMatters: 'Silence breeds anxiety and assumptions. Regular communication builds confidence even when news is bad. Stakeholders can handle problems but hate surprises.',
        whenDoneWell: [
          'Stakeholders become advocates not obstacles',
          'Problems get executive support early',
          'Realistic expectations throughout',
          'Celebration of achievements'
        ],
        problemsWithout: [
          'Stakeholder frustration and intervention',
          'Lost political support when needed',
          'Unrealistic pressure from misunderstandings',
          'Success goes unnoticed'
        ]
      }
    },
    {
      id: 20,
      dimensionId: 'visibility',
      text: 'Decisions are documented and communicated clearly',
      type: 'C',
      options: [
        { label: 'No decision documentation', value: 1 },
        { label: 'Some decisions documented', value: 2 },
        { label: 'Important decisions usually documented', value: 3 },
        { label: 'Most decisions documented', value: 4 },
        { label: 'All decisions documented', value: 5 },
        { label: 'All decisions documented with context and rationale', value: 6 }
      ],
      whyContent: {
        whyMatters: 'Undocumented decisions get relitigated endlessly. \'Why did we do it this way?\' becomes a time sink. Clear decision records prevent groundhog day discussions.',
        whenDoneWell: [
          'No repeated discussions of same topic',
          'New members understand context quickly',
          'Decisions stick and move forward',
          'Learning from past choices'
        ],
        problemsWithout: [
          'Same debates every few months',
          'Decisions mysteriously reverse',
          'New people challenge everything',
          'No learning from history'
        ]
      }
    },
    {
      id: 21,
      dimensionId: 'visibility',
      text: 'How visible and trackable is all the pod\'s work?',
      type: 'C',
      options: [
        { label: 'Invisible work - No idea who works on what lots of surprise tasks', value: 1 },
        { label: 'Scattered - Some work in Jira some in slack some nowhere', value: 2 },
        { label: 'Partially visible - Main work tracked but side tasks are hidden', value: 3 },
        { label: 'Mostly visible - Most work is tracked occasional invisible tasks', value: 4 },
        { label: 'Fully transparent - All work visible everyone knows where to look', value: 5 },
        { label: 'Optimized visibility - Real-time view of all work with clear status', value: 6 }
      ],
      whyContent: {
        whyMatters: 'Invisible work can\'t be managed, celebrated, or improved. When work hides in private lists or mental queues, chaos follows. Visibility enables everything else.',
        whenDoneWell: [
          'Clear picture of all work in progress',
          'Easy to spot overload and bottlenecks',
          'Fair distribution of effort',
          'Accurate planning and forecasting'
        ],
        problemsWithout: [
          'Surprise work appears from nowhere',
          'Some people overloaded others idle',
          'Can\'t explain why things take so long',
          'Planning based on fiction'
        ]
      }
    },
    {
      id: 22,
      dimensionId: 'visibility',
      text: 'The pod clearly understands the priority and rationale behind work items',
      type: 'A',
      options: null,
      whyContent: {
        whyMatters: 'Working without understanding why is soul-crushing. When teams know the \'why\', they make better decisions, find better solutions, and care more about outcomes.',
        whenDoneWell: [
          'Team makes good autonomous decisions',
          'Creative solutions to real problems',
          'Higher engagement and ownership',
          'Push back on low-value work'
        ],
        problemsWithout: [
          'Blind execution misses the point',
          'No innovation or improvement',
          'Disengaged order-takers',
          'Building wrong solutions perfectly'
        ]
      }
    },
    {
      id: 23,
      dimensionId: 'visibility',
      text: 'Critical knowledge is documented and shared not held by individuals',
      type: 'A',
      options: null,
      whyContent: {
        whyMatters: 'Bus factor of one is a time bomb. When critical knowledge lives in one head, vacation becomes crisis and resignation becomes catastrophe.',
        whenDoneWell: [
          'No single points of failure',
          'People can take vacations peacefully',
          'Knowledge sharing becomes culture',
          'Team resilience to change'
        ],
        problemsWithout: [
          'Hero culture creates burnout',
          'Critical people can\'t be promoted',
          'Knowledge walks out the door',
          'Single points of failure everywhere'
        ]
      }
    },

    // EXECUTION QUALITY (Questions 24-30)
    {
      id: 24,
      dimensionId: 'execution',
      text: 'How ready is work when the pod starts it?',
      type: 'C',
      options: [
        { label: 'Not ready - Immediately blocked can\'t even begin', value: 1 },
        { label: 'Barely ready - Start but quickly blocked on basics', value: 2 },
        { label: 'Somewhat ready - Can start but need significant clarifications', value: 3 },
        { label: 'Mostly ready - Good to start minor clarifications needed', value: 4 },
        { label: 'Well ready - Everything clear rare questions during work', value: 5 },
        { label: 'Perfectly ready - Crystal clear zero blocks from start to done', value: 6 }
      ],
      whyContent: {
        whyMatters: 'Starting unready work is like beginning a journey without a map. You\'ll get somewhere, but probably not where you intended, and it\'ll take twice as long.',
        whenDoneWell: [
          'Smooth flow from start to finish',
          'No mid-work surprises or pivots',
          'Predictable delivery times',
          'Higher quality outcomes'
        ],
        problemsWithout: [
          'Constant stops for clarification',
          'Rework from misunderstandings',
          'Frustrated developers and stakeholders',
          'Unpredictable delivery'
        ]
      }
    },
    {
      id: 25,
      dimensionId: 'execution',
      text: 'When work is marked \'done\' how complete is it really?',
      type: 'C',
      options: [
        { label: 'Done = coded - Always needs testing review documentation', value: 1 },
        { label: 'Done = works on my machine - Often breaks in other environments', value: 2 },
        { label: 'Done = technically complete - Functional but missing polish documentation', value: 3 },
        { label: 'Done = mostly shippable - Small tweaks needed before release', value: 4 },
        { label: 'Done = ready to ship - Could go to production immediately', value: 5 },
        { label: 'Done = in production creating value - Deployed monitored validated by users', value: 6 }
      ],
      whyContent: {
        whyMatters: '\'Done\' that isn\'t really done creates hidden work and destroys trust. True done means no surprises, no follow-up work, and no technical debt.',
        whenDoneWell: [
          'Work genuinely complete first time',
          'No surprise follow-up tasks',
          'Trust between team and stakeholders',
          'Predictable capacity planning'
        ],
        problemsWithout: [
          '\'Done\' work comes back repeatedly',
          'Hidden work destroys planning',
          'Stakeholder trust erodes',
          'Technical debt accumulates'
        ]
      }
    },
    {
      id: 26,
      dimensionId: 'execution',
      text: 'Sprint commitment completion rate',
      type: 'B',
      options: [
        { label: 'Less than 50%', value: 1 },
        { label: '50-59%', value: 2 },
        { label: '60-69%', value: 3 },
        { label: '70-79%', value: 4 },
        { label: '80-89%', value: 5 },
        { label: '90% or higher', value: 6 }
      ],
      whyContent: {
        whyMatters: 'Commitment isn\'t just a number - it\'s a promise. Consistently meeting commitments builds trust, confidence, and predictability. Missing them erodes everything.',
        whenDoneWell: [
          'Stakeholder confidence in delivery',
          'Team pride and motivation',
          'Predictable planning and roadmaps',
          'Sustainable pace'
        ],
        problemsWithout: [
          'Erosion of trust and credibility',
          'Pressure and overtime to catch up',
          'Demotivated team',
          'Unreliable planning'
        ]
      }
    },
    {
      id: 27,
      dimensionId: 'execution',
      text: 'Test execution is owned by the entire pod to avoid bottlenecks in the workflow',
      type: 'A',
      options: null,
      whyContent: {
        whyMatters: 'Testing isn\'t someone\'s job, it\'s everyone\'s responsibility. When testing becomes a bottleneck, quality suffers and delivery slows. Shared ownership accelerates flow.',
        whenDoneWell: [
          'Testing happens continuously not at end',
          'No bottleneck waiting for testers',
          'Higher quality through many eyes',
          'Shared understanding of quality'
        ],
        problemsWithout: [
          'Testing bottleneck delays everything',
          'Developers throw code over wall',
          'Quality problems found too late',
          'Adversarial dev vs test relationship'
        ]
      }
    },
    {
      id: 28,
      dimensionId: 'execution',
      text: 'Quality checks are built into the process and prevent defects from moving forward',
      type: 'A',
      options: null,
      whyContent: {
        whyMatters: 'Finding bugs in production is like finding typos after printing 10,000 books. Quality gates catch problems when they\'re cheap to fix, not expensive to apologize for.',
        whenDoneWell: [
          'Defects caught early when cheap',
          'Confidence in releases',
          'Less firefighting and hotfixes',
          'Protected reputation'
        ],
        problemsWithout: [
          'Production fires and emergency fixes',
          'Customer trust erosion',
          'Expensive rework and patches',
          'Team burnout from constant crisis'
        ]
      }
    },
    {
      id: 29,
      dimensionId: 'execution',
      text: 'Defect rate after work is marked "done"',
      type: 'B',
      options: [
        { label: 'Many defects found regularly', value: 1 },
        { label: 'Frequent defects found', value: 2 },
        { label: 'Some defects found occasionally', value: 3 },
        { label: 'Few defects found', value: 4 },
        { label: 'Very few defects found', value: 5 },
        { label: 'Rare or no defects found', value: 6 }
      ],
      whyContent: {
        whyMatters: 'Defects after \'done\' mean it wasn\'t really done. They disrupt future work, erode trust, and cost 10x more to fix than catching them early.',
        whenDoneWell: [
          'Clean handoffs to next stage',
          'Trust in team\'s work quality',
          'Focus on new work not fixes',
          'Happy customers and stakeholders'
        ],
        problemsWithout: [
          'Constant interrupt-driven bug fixes',
          'Future work delayed by past problems',
          'Reputation for poor quality',
          'Customer dissatisfaction'
        ]
      }
    },
    {
      id: 30,
      dimensionId: 'execution',
      text: 'Frequency of rework due to misunderstandings or quality issues',
      type: 'B',
      options: [
        { label: 'Rework happens frequently', value: 1 },
        { label: 'Rework happens often', value: 2 },
        { label: 'Rework happens sometimes', value: 3 },
        { label: 'Rework happens occasionally', value: 4 },
        { label: 'Rework happens rarely', value: 5 },
        { label: 'Rework almost never happens', value: 6 }
      ],
      whyContent: {
        whyMatters: 'Rework is pure waste - you\'re paying twice for the same value. It destroys morale, wastes time, and indicates broken communication or quality processes.',
        whenDoneWell: [
          'First time right becomes the norm',
          'Time spent on new value not fixes',
          'Team morale and pride high',
          'Predictable delivery'
        ],
        problemsWithout: [
          'Constantly redoing \'completed\' work',
          'Demoralized team',
          'Unpredictable capacity',
          'Stakeholder frustration'
        ]
      }
    },

    // CONTINUOUS IMPROVEMENT (Questions 31-36)
    {
      id: 31,
      dimensionId: 'improvement',
      text: 'Improvements implemented in how the pod works together this quarter',
      type: 'B',
      options: [
        { label: '0 improvements', value: 1 },
        { label: '1-2 improvements', value: 3 },
        { label: '3-4 improvements', value: 5 },
        { label: '5+ improvements', value: 6 }
      ],
      whyContent: {
        whyMatters: 'Teams that don\'t evolve get left behind. Regular improvements compound - small changes add up to transformation. Standing still is moving backward.',
        whenDoneWell: [
          'Team continuously gets better',
          'Problems solved not endured',
          'High engagement in process ownership',
          'Competitive advantage through evolution'
        ],
        problemsWithout: [
          'Same problems quarter after quarter',
          'Team frustration grows',
          'Lost talent to better teams',
          'Falling behind industry practices'
        ]
      }
    },
    {
      id: 32,
      dimensionId: 'improvement',
      text: 'Do retrospective actions lead to real improvements?',
      type: 'C',
      options: [
        { label: 'Actions lost - Identified but forgotten immediately', value: 1 },
        { label: 'Actions logged nothing happens - Written somewhere never done', value: 2 },
        { label: 'Few actions completed - Some effort but little change', value: 3 },
        { label: 'Some improvements implemented - Visible progress on key items', value: 4 },
        { label: 'Most improvements delivered - Real changes each sprint', value: 5 },
        { label: 'Continuous improvement culture - Improvements + measurement of impact', value: 6 }
      ],
      whyContent: {
        whyMatters: 'Actions without follow-through are just wishes. When retrospective actions don\'t create change, teams lose faith in the process and stop trying to improve.',
        whenDoneWell: [
          'Visible changes from team input',
          'Growing belief in ability to improve',
          'Proactive problem solving',
          'Continuous evolution'
        ],
        problemsWithout: [
          'Cynicism about retrospectives',
          'Same issues discussed repeatedly',
          'Learned helplessness',
          'Process theater without value'
        ]
      }
    },
    {
      id: 33,
      dimensionId: 'improvement',
      text: 'The pod regularly tries new practices and techniques',
      type: 'A',
      options: null,
      whyContent: {
        whyMatters: 'Innovation requires experimentation. Teams that don\'t try new things slowly become obsolete. Safe-to-fail experiments drive breakthrough improvements.',
        whenDoneWell: [
          'Cutting edge practices adopted early',
          'Culture of innovation and learning',
          'Competitive advantage through innovation',
          'Engaged and excited team'
        ],
        problemsWithout: [
          'Stagnation and obsolescence',
          'Missing out on better ways',
          'Bored and disengaged team',
          'Falling behind competition'
        ]
      }
    },
    {
      id: 34,
      dimensionId: 'improvement',
      text: 'Problems and failures are analyzed for root causes and learning (post-mortem)',
      type: 'A',
      options: null,
      whyContent: {
        whyMatters: 'Failures are expensive teachers - waste the lesson and you\'ll pay for it again. Root cause analysis turns failure into wisdom and prevents repeat performances.',
        whenDoneWell: [
          'Problems solved once permanently',
          'Failures become learning opportunities',
          'Blame-free culture of improvement',
          'Increasing resilience'
        ],
        problemsWithout: [
          'Same failures repeatedly',
          'Blame culture prevents honesty',
          'No learning from mistakes',
          'Increasing fragility'
        ]
      }
    },
    {
      id: 35,
      dimensionId: 'improvement',
      text: 'Fast feedback loops exist at multiple levels (code product process)',
      type: 'A',
      options: null,
      whyContent: {
        whyMatters: 'Slow feedback is expensive feedback. The longer between action and result, the more waste when you\'re wrong. Fast feedback enables rapid correction and learning.',
        whenDoneWell: [
          'Mistakes caught in minutes not months',
          'Rapid iteration and improvement',
          'Lower cost of change',
          'Higher quality outcomes'
        ],
        problemsWithout: [
          'Building the wrong thing for months',
          'Expensive late-stage changes',
          'Slow learning and adaptation',
          'Quality problems compound'
        ]
      }
    },
    {
      id: 36,
      dimensionId: 'improvement',
      text: 'Improvements and their impacts are celebrated and shared',
      type: 'A',
      options: null,
      whyContent: {
        whyMatters: 'Uncelebrated improvements die quietly. Recognition fuels more improvement, sharing spreads benefits, and celebration builds culture. Success needs spotlights.',
        whenDoneWell: [
          'Improvement becomes cultural norm',
          'Knowledge spreads across organization',
          'Team pride and motivation high',
          'Positive reinforcement cycle'
        ],
        problemsWithout: [
          'Improvements forgotten and abandoned',
          'Lessons learned stay local',
          'Team feels unappreciated',
          'Innovation dies from neglect'
        ]
      }
    }
  ],

  // Guide de scoring
  scoreGuide: {
    6: { level: 'Mastered', description: 'Consistently excellent, could teach others', meaning: 'This is a pod strength' },
    5: { level: 'Proficient', description: 'Usually works well, minor tweaks only', meaning: 'Maintain and refine' },
    4: { level: 'Capable', description: 'Generally good, some gaps to address', meaning: 'Steady improvement needed' },
    3: { level: 'Developing', description: 'Hit and miss, needs focus', meaning: 'Priority for improvement' },
    2: { level: 'Struggling', description: 'More often problematic than not', meaning: 'Requires urgent attention' },
    1: { level: 'Not Present', description: 'Rarely or never happens', meaning: 'Critical gap to address' }
  }
};

// Fonction helper pour valider les données au chargement
export function validateAssessmentData() {
  const errors = [];
  const { questions, dimensions } = ASSESSMENT_DATA;
  
  // Vérifier que toutes les questions ont du contenu why
  questions.forEach(q => {
    if (!q.whyContent || !q.whyContent.whyMatters) {
      errors.push(`Question ${q.id} missing whyContent.whyMatters`);
    }
    if (!q.whyContent.whenDoneWell || q.whyContent.whenDoneWell.length === 0) {
      errors.push(`Question ${q.id} missing whyContent.whenDoneWell`);
    }
    if (!q.whyContent.problemsWithout || q.whyContent.problemsWithout.length === 0) {
      errors.push(`Question ${q.id} missing whyContent.problemsWithout`);
    }
  });
  
  // Vérifier le compte total
  if (questions.length !== 36) {
    errors.push(`Expected 36 questions, got ${questions.length}`);
  }
  
  // Vérifier les dimensions
  if (dimensions.length !== 5) {
    errors.push(`Expected 5 dimensions, got ${dimensions.length}`);
  }
  
  return errors;
}
