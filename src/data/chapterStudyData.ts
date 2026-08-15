export interface ChapterContent {
  paperName: string;
  moduleName: string;
  examWeightage: string;
  applicableCycle: string;
  learningObjectives: string[];
  keyTopics: { title: string; summary: string }[];
  importantFormulasOrSections: { title: string; code: string }[];
  examTips: string[];
  officialPortalUrl: string;
  samplePracticeQuestions: { question: string; answer: string }[];
}

export function getChapterStudyGuide(material: {
  course?: string;
  subject?: string;
  title?: string;
  group_name?: string;
  material_type?: string;
}): ChapterContent {
  const course = (material.course || '').toLowerCase();
  const subject = (material.subject || '').toLowerCase();
  const title = (material.title || '').toLowerCase();
  const group = (material.group_name || '').toLowerCase();
  const type = (material.material_type || '').toLowerCase();

  // ==========================================
  // CA FOUNDATION PAPERS (Papers 1 - 4)
  // ==========================================

  // 1. Foundation: Accounting (Paper 1)
  if (course.includes('foundation') && (subject.includes('accounting') || title.includes('accounting'))) {
    return {
      paperName: 'Paper 1: Accounting (CA Foundation)',
      moduleName: material.title || 'Accounting Core Concepts & Practical Preparation',
      examWeightage: '100 Marks (100% Descriptive / Subjective Analysis)',
      applicableCycle: 'May / June 2026 & November / December 2026 Examination Cycles',
      officialPortalUrl: 'https://www.icai.org/post/bos-knowledge-portal',
      learningObjectives: [
        'Understand the conceptual framework, accounting principles, and standard double-entry rules.',
        'Master the preparation of Journal, Ledger, Trial Balance, Cash Book, and Rectification of Errors.',
        'Construct Bank Reconciliation Statements (BRS) including amended cash book adjustments.',
        'Account for Inventories (AS 2) and compute depreciation under Straight Line Method (SLM) and Written Down Value (WDV).',
        'Prepare Financial Statements for Sole Proprietorships, Manufacturing Concerns, Partnership Firms, and Company Share Capital basics.'
      ],
      keyTopics: [
        {
          title: 'Theoretical Framework & Accounting Process',
          summary: 'Accounting concepts (Going Concern, Consistency, Accrual, Prudence, Materiality), Indian Accounting Standards overview, trial balance preparation, and rectification of errors (one-sided vs two-sided).'
        },
        {
          title: 'Bank Reconciliation Statement (BRS)',
          summary: 'Causes of timing differences and errors between cash book bank balance and bank statement balance, amended cash book method, and overdraft scenarios.'
        },
        {
          title: 'Valuation of Inventory & Depreciation Accounting',
          summary: 'Measurement of inventories at lower of cost and net realizable value (NRV) per AS 2, FIFO and Weighted Average cost formulas, SLM and WDV calculations with mid-year asset additions/disposals.'
        },
        {
          title: 'Partnership Accounts & Financial Statements',
          summary: 'Preparation of Trading, Profit & Loss A/c, Balance Sheet; admission, retirement, and death of a partner with Goodwill adjustments and revaluation of assets and liabilities.'
        }
      ],
      importantFormulasOrSections: [
        {
          title: 'Inventory Valuation Rule (AS 2)',
          code: 'Valuation = MIN(Cost of Purchase + Conversion Cost, Net Realizable Value)'
        },
        {
          title: 'Straight Line Method (SLM) Annual Depreciation',
          code: 'Annual Depreciation = (Original Cost - Residual Value) / Useful Life (Years)'
        },
        {
          title: 'Sacrificing Ratio in Partnership',
          code: 'Sacrificing Ratio = Old Share - New Share'
        }
      ],
      examTips: [
        'Always provide clear, numbered Working Notes — ICAI examiners allocate dedicated step-marks for working schedules.',
        'State the governing Accounting Standard or convention in your opening explanation for theoretical questions.',
        'Ensure BRS clearly starts with the specified baseline balance and states whether it represents debit or credit.'
      ],
      samplePracticeQuestions: [
        {
          question: 'Explain the difference between the Accrual basis and Cash basis of accounting.',
          answer: 'Under the accrual basis, revenue and expenses are recognized in the period in which they are earned or incurred, irrespective of actual cash inflow or outflow. Under the cash basis, transactions are recorded only when cash is received or paid.'
        },
        {
          question: 'How is an abnormal loss of inventory treated in financial statements under AS 2?',
          answer: 'The full cost of abnormal inventory loss is credited to the Trading Account to ensure correct gross profit computation, and the net loss (after deducting insurance claim receivables) is debited to the Profit & Loss Account.'
        }
      ]
    };
  }

  // 2. Foundation: Business Laws (Paper 2)
  if (course.includes('foundation') && (subject.includes('law') || title.includes('law'))) {
    return {
      paperName: 'Paper 2: Business Laws (CA Foundation)',
      moduleName: material.title || 'Business Laws Comprehensive Study Text',
      examWeightage: '100 Marks (Descriptive Case Studies & Theory)',
      applicableCycle: 'May / June 2026 Examination (New Scheme of Education)',
      officialPortalUrl: 'https://www.icai.org/post/bos-knowledge-portal',
      learningObjectives: [
        'Understand the Indian Regulatory Framework and sources of Indian Law.',
        'Analyze the essential legal elements of a valid contract under The Indian Contract Act, 1872.',
        'Examine conditions, warranties, and rights of unpaid seller under The Sale of Goods Act, 1930.',
        'Understand formation, relations of partners, and dissolution under The Indian Partnership Act, 1932.',
        'Comprehend corporate personality, incorporation, and classifications under The Companies Act, 2013 & LLP Act, 2008.'
      ],
      keyTopics: [
        {
          title: 'The Indian Contract Act, 1872',
          summary: 'Offer & Acceptance, Consideration (privity of contract & exceptions), Capacity of Parties, Free Consent (Coercion, Undue Influence, Fraud, Misrepresentation, Mistake), and Remedies for Breach.'
        },
        {
          title: 'The Sale of Goods Act, 1930',
          summary: 'Contract of Sale vs Agreement to Sell, Conditions and Warranties (Sec 12), Doctrine of Caveat Emptor & exceptions, Transfer of Title (Nemo dat quod non habet), Rights of Unpaid Seller.'
        },
        {
          title: 'The Indian Partnership Act, 1932 & LLP Act, 2008',
          summary: 'Mutual agency test (Cox v. Hickman), relations of partners inter se, admission of minor (Sec 30), registration of firms, LLP incorporation and characteristics.'
        },
        {
          title: 'The Companies Act, 2013',
          summary: 'Salomon v. Salomon doctrine, lifting the corporate veil, One Person Company (OPC), Private vs Public company criteria, Small Company definition (Sec 2(85)).'
        }
      ],
      importantFormulasOrSections: [
        {
          title: 'Section 10 of Indian Contract Act 1872 (Essentials of Valid Contract)',
          code: 'Valid Contract = Agreement + Free Consent + Competency + Lawful Consideration + Lawful Object + Not Declared Void'
        },
        {
          title: 'Doctrine of Caveat Emptor (Sec 16 Sale of Goods Act)',
          code: '"Buyer Beware" — Seller not responsible for quality/fitness unless buyer relied on seller\'s skill/judgment or bought by description.'
        }
      ],
      examTips: [
        'Structure all practical legal case study answers in four distinct paragraphs: (1) Relevant Legal Provision & Section, (2) Facts of the Case, (3) Legal Analysis & Correlation, (4) Direct Conclusion.',
        'Mention landmark case laws (e.g., Carlill v. Carbolic Smoke Ball Co., Balfour v. Balfour, Salomon v. Salomon) to secure top grades.'
      ],
      samplePracticeQuestions: [
        {
          question: 'Can a minor enter into a partnership as a partner?',
          answer: 'Under Section 30 of The Indian Partnership Act, 1932, a minor cannot be a partner because an agreement with a minor is void ab initio. However, with the consent of all partners, a minor may be admitted to the benefits of an existing partnership.'
        }
      ]
    };
  }

  // 3. Foundation: Quantitative Aptitude (Paper 3)
  if (course.includes('foundation') && (subject.includes('quantitative') || subject.includes('aptitude') || title.includes('math') || title.includes('qa') || subject.includes('mathematics'))) {
    return {
      paperName: 'Paper 3: Quantitative Aptitude (CA Foundation)',
      moduleName: material.title || 'Quantitative Aptitude, Logical Reasoning & Statistics Guide',
      examWeightage: '100 Marks (Objective MCQ Format • 0.25 Negative Marking)',
      applicableCycle: 'May / June 2026 Examination Cycle',
      officialPortalUrl: 'https://www.icai.org/post/bos-knowledge-portal',
      learningObjectives: [
        'Apply financial mathematics to compute Simple & Compound Interest, Effective Rates, Annuity values, and Perpetuities.',
        'Solve algebraic equations, linear inequalities, and permutations & combinations problems.',
        'Master logical reasoning: number series, coding-decoding, blood relations, and seating arrangements.',
        'Compute statistical measures of central tendency, dispersion, probability distributions, correlation, and index numbers.'
      ],
      keyTopics: [
        {
          title: 'Mathematics of Finance',
          summary: 'Compound Interest formulas, Effective Rate of Interest, Future & Present Value of Annuity Regular, Annuity Due, Sinking Fund calculations, and Capital Budgeting basics.'
        },
        {
          title: 'Logical Reasoning & Arrangements',
          summary: 'Direction sense tests, linear and circular seating arrangements, blood relation genealogical trees, and syllogisms.'
        },
        {
          title: 'Statistical Description & Central Tendency',
          summary: 'Mean, Median, Mode, Standard Deviation, Variance, Coefficient of Variation, Quartile Deviation, and Mean Deviation.'
        },
        {
          title: 'Probability & Theoretical Distributions',
          summary: 'Conditional probability, Bayes theorem, Binomial Distribution, Poisson Distribution, and Normal Distribution bell curves.'
        }
      ],
      importantFormulasOrSections: [
        {
          title: 'Future Value of Annuity Regular (FVA)',
          code: 'FVA = P * [ ((1 + i)^n - 1) / i ]'
        },
        {
          title: 'Present Value of Annuity Regular (PVA)',
          code: 'PVA = P * [ (1 - (1 + i)^(-n)) / i ]'
        },
        {
          title: 'Coefficient of Variation (CV)',
          code: 'CV = (Standard Deviation / Arithmetic Mean) * 100'
        }
      ],
      examTips: [
        'Time allocation: aim for under 55 seconds per question. Solve straightforward direct formula MCQs first before time-consuming logical puzzles.',
        'Master standard calculator shortcuts (M+, M-, MRC) to compute compound interest sequences in a few keystrokes.'
      ],
      samplePracticeQuestions: [
        {
          question: 'Find the effective annual rate corresponding to a nominal interest rate of 12% per annum compounded monthly.',
          answer: 'Effective Rate E = (1 + 0.12/12)^12 - 1 = (1.01)^12 - 1 = 1.1268 - 1 = 12.68% p.a.'
        }
      ]
    };
  }

  // 4. Foundation: Business Economics (Paper 4)
  if (course.includes('foundation') && (subject.includes('economics') || title.includes('economics') || title.includes('micro') || title.includes('macro'))) {
    return {
      paperName: 'Paper 4: Business Economics (CA Foundation)',
      moduleName: material.title || 'Business Economics Complete Study Module',
      examWeightage: '100 Marks (Objective MCQ Format • 0.25 Negative Marking)',
      applicableCycle: 'May / June 2026 Examination',
      officialPortalUrl: 'https://www.icai.org/post/bos-knowledge-portal',
      learningObjectives: [
        'Understand microeconomic principles: demand elasticity, supply dynamics, consumer equilibrium, and indifference curves.',
        'Analyze production functions, law of variable proportions, economies of scale, and short/long-run cost curves.',
        'Evaluate market pricing mechanisms under Perfect Competition, Monopoly, Monopolistic Competition, and Oligopoly.',
        'Comprehend macroeconomic aggregates: National Income (GDP, GNP, NNP), Business Cycles, Public Finance, Monetary & Fiscal Policies, and International Trade.'
      ],
      keyTopics: [
        {
          title: 'Theory of Demand, Supply & Consumer Behaviour',
          summary: 'Price, income, and cross elasticity of demand; Law of Diminishing Marginal Utility; Consumer Surplus; Indifference Curve properties.'
        },
        {
          title: 'Theory of Production & Cost',
          summary: 'Total, average, and marginal product curves; Law of Variable Proportions (Stage 1, 2, 3); Short-run vs long-run cost curves (U-shape vs envelope).'
        },
        {
          title: 'Price Determination in Different Markets',
          summary: 'Equilibrium under Perfect Competition (P=MC), Monopoly (price discrimination), Monopolistic Competition (product differentiation), and Oligopoly (Kinked Demand Curve).'
        },
        {
          title: 'National Income, Public Finance & Indian Economy',
          summary: 'Measurement of GDP by value added, income, and expenditure methods; Keynesian multiplier; Fiscal deficit; RBI tools (Repo, Reverse Repo, CRR, SLR).'
        }
      ],
      importantFormulasOrSections: [
        {
          title: 'Price Elasticity of Demand (Point Method)',
          code: 'Ep = (dQ / dP) * (P / Q) = Lower Segment / Upper Segment of Demand Curve'
        },
        {
          title: 'Keynesian Investment Multiplier (k)',
          code: 'k = 1 / (1 - MPC) = 1 / MPS'
        }
      ],
      examTips: [
        'Memorize curve relationships: Marginal Cost (MC) always intersects Average Cost (AC) and Average Variable Cost (AVC) at their lowest points.',
        'Differentiate clearly between a movement along a demand curve (change in quantity demanded) and a shift of the demand curve (change in demand).'
      ],
      samplePracticeQuestions: [
        {
          question: 'What is the condition for profit maximization in all market forms?',
          answer: '1. Marginal Revenue (MR) = Marginal Cost (MC), and 2. The MC curve must cut the MR curve from below.'
        }
      ]
    };
  }

  // ==========================================
  // CA INTERMEDIATE PAPERS (Papers 1 - 6)
  // ==========================================

  // 5. Intermediate Paper 1: Advanced Accounting
  if (course.includes('intermediate') && (subject.includes('accounting') || title.includes('accounting') || subject.includes('account') || title.includes('account')) && !subject.includes('cost') && !title.includes('cost') && !subject.includes('tax') && !title.includes('tax')) {
    return {
      paperName: 'Paper 1: Advanced Accounting (CA Intermediate)',
      moduleName: material.title || 'Advanced Accounting Study Module',
      examWeightage: '100 Marks (30% Case Scenario MCQs + 70% Descriptive)',
      applicableCycle: 'May 2026 & November 2026 Examination Cycles',
      officialPortalUrl: 'https://www.icai.org/post/bos-knowledge-portal',
      learningObjectives: [
        'Apply Indian Accounting Standards (AS 1 to AS 29) rigorously to diverse business situations.',
        'Execute company accounts: Internal Reconstruction, Capital Reduction, and Buy-back of Securities.',
        'Account for Business Combinations and Amalgamation of Companies under AS 14.',
        'Prepare Consolidated Financial Statements for parent and subsidiary entities under AS 21, AS 23, and AS 27.',
        'Construct Branch Accounts (Foreign & Inland branches per AS 11) and Financial Statements of Companies per Schedule III.'
      ],
      keyTopics: [
        {
          title: 'Core Accounting Standards Suite',
          summary: 'AS 1 (Disclosure), AS 2 (Inventory), AS 3 (Cash Flow), AS 10 (PPE), AS 11 (Forex), AS 12 (Grants), AS 13 (Investments), AS 14 (Amalgamation), AS 16 (Borrowing Costs), AS 19 (Leases), AS 20 (EPS), AS 22 (Deferred Taxes).'
        },
        {
          title: 'Company Accounts & Restructuring',
          summary: 'Accounting for internal reconstruction schemes (Capital Reduction Account entries), buy-back of shares under Companies Act provisions, and redemption of preference shares.'
        },
        {
          title: 'Consolidated Financial Statements',
          summary: 'Cost of control/goodwill calculation, Non-Controlling Interest (NCI), elimination of intra-group balances, and pre/post acquisition profit distribution.'
        }
      ],
      importantFormulasOrSections: [
        {
          title: 'Goodwill / Capital Reserve in Consolidation',
          code: 'Cost of Investment - (Parent Share in Subsidiary Net Assets at Acquisition Date) = Goodwill / (Capital Reserve)'
        },
        {
          title: 'Basic Earnings Per Share (AS 20)',
          code: 'Basic EPS = Net Profit attributable to Equity Shareholders / Weighted Average Number of Equity Shares'
        }
      ],
      examTips: [
        'In AS 14 Amalgamation questions, check whether the transaction is "in the nature of merger" (pooling of interests) or "in the nature of purchase".',
        'State the Accounting Standard title and exact number in the first sentence of your solution.'
      ],
      samplePracticeQuestions: [
        {
          question: 'How are borrowing costs incurred during extended interruption of asset development treated under AS 16?',
          answer: 'Capitalization of borrowing costs is suspended during extended periods in which active development of a qualifying asset is interrupted.'
        }
      ]
    };
  }

  // 6. Intermediate Paper 2: Corporate and Other Laws
  if (course.includes('intermediate') && (subject.includes('law') || title.includes('corporate') || title.includes('fema') || subject.includes('corporate'))) {
    return {
      paperName: 'Paper 2: Corporate and Other Laws (CA Intermediate)',
      moduleName: material.title || 'Corporate and Other Laws Comprehensive Guide',
      examWeightage: '100 Marks (Part I: Company Law 70M | Part II: Other Laws 30M)',
      applicableCycle: 'May 2026 / Nov 2026 Examination',
      officialPortalUrl: 'https://www.icai.org/post/bos-knowledge-portal',
      learningObjectives: [
        'Master Company Law provisions under Companies Act 2013 (Chapters I to VII: Incorporation, Prospectus, Share Capital, Debentures, Deposits, Charges, Management & Administration, Dividend, Accounts & Audit).',
        'Analyze the Foreign Exchange Management Act, 1999 (FEMA) definitions, Current vs Capital Account transactions, and residential status.',
        'Understand The General Clauses Act, 1897 and Interpretation of Statutes principles (literal, purposive, mischief rule, ejusdem generis).'
      ],
      keyTopics: [
        {
          title: 'Company Law: Management, Meetings & Accounts',
          summary: 'Notice of AGM/EGM (Sec 101), Quorum (Sec 103), Proxies (Sec 105), Resolutions (Ordinary vs Special), Declaration & Payment of Dividend (Sec 123-127), Books of Account (Sec 128), CSR (Sec 135).'
        },
        {
          title: 'Charges & Deposits',
          summary: 'Registration of charges with RoC within 30 days (Sec 77-87), acceptance of deposits from members vs public (Sec 73-76).'
        },
        {
          title: 'Other Laws: FEMA & Interpretation of Statutes',
          summary: 'Person resident in India definition (Sec 2(v)), Current Account transactions (Sec 5 & Rules), Capital Account transactions (Sec 6), Rules of statutory interpretation.'
        }
      ],
      importantFormulasOrSections: [
        {
          title: 'Section 135(5) CSR Mandatory Spending',
          code: 'Mandatory CSR = At least 2% of Average Net Profits made during the immediately preceding 3 financial years'
        },
        {
          title: 'Section 103 Quorum for Public Company General Meetings',
          code: 'Members up to 1000: 5 members | 1001-5000: 15 members | Exceeding 5000: 30 members personally present'
        }
      ],
      examTips: [
        'Quote the exact Section number and Act name in every legal case study answer.',
        'Follow the structured 4-step answer format: Applicable Section, Facts of the Problem, Application & Analysis, Clear Conclusion.'
      ],
      samplePracticeQuestions: [
        {
          question: 'Can interim dividend once declared by the Board of Directors be revoked?',
          answer: 'No. Once declared, dividend creates a debt due to shareholders and cannot be revoked without the consent of shareholders, except in cases of force majeure or where the declaration was illegal.'
        }
      ]
    };
  }

  // 7. Intermediate Paper 3: Taxation
  if (course.includes('intermediate') && (subject.includes('tax') || title.includes('tax') || title.includes('gst') || title.includes('income_tax'))) {
    return {
      paperName: 'Paper 3: Taxation (CA Intermediate)',
      moduleName: material.title || 'Taxation (Income Tax Law & GST) Study Guide',
      examWeightage: '100 Marks (Section A: Income Tax 50M | Section B: GST 50M)',
      applicableCycle: 'May 2026 & Nov 2026 Examination Cycles (Finance Act 2025/2026 Provisions)',
      officialPortalUrl: 'https://www.icai.org/post/bos-knowledge-portal',
      learningObjectives: [
        'Determine residential status under Section 6 and compute total income under Section 5.',
        'Compute taxable income across 5 heads: Salaries, House Property, PGBP, Capital Gains, and Other Sources.',
        'Calculate Chapter VI-A deductions, Default Tax Regime (Sec 115BAC), TDS, TCS, and Advance Tax.',
        'Analyze Concept of Supply under CGST Act (Sec 7, 8), Place of Supply, Input Tax Credit (Sec 16-18), and GST Returns.'
      ],
      keyTopics: [
        {
          title: 'Income Tax: Heads of Income & Total Income',
          summary: 'Salary deductions (Sec 16), House Property standard deduction (Sec 24), PGBP presumptive taxation (44AD/ADA/AE), Capital gains indexation, STCG (Sec 111A) and LTCG (Sec 112A).'
        },
        {
          title: 'Default Tax Regime under Section 115BAC',
          summary: 'Default taxation regime for individuals/HUFs with revised tax slabs, rebate u/s 87A up to threshold, and comparison with optional normal provisions.'
        },
        {
          title: 'GST: Supply, Charge & Input Tax Credit (ITC)',
          summary: 'Taxable event is supply of goods/services. Blocked credits under Section 17(5), time & value of supply rules, and registration thresholds.'
        }
      ],
      importantFormulasOrSections: [
        {
          title: 'Section 115BAC Default Tax Slabs',
          code: 'Up to Rs 3L: Nil | 3L-7L: 5% | 7L-10L: 10% | 10L-12L: 15% | 12L-15L: 20% | Above 15L: 30%'
        },
        {
          title: 'Section 16(2) GST ITC Conditions',
          code: 'Possession of tax invoice + Invoice reflected in GSTR-2B + Goods/services received + Tax paid to Govt + Return filed'
        }
      ],
      examTips: [
        'Always check if the assessee is being taxed under Section 115BAC (default) or normal provisions before applying Chapter VI-A deductions.',
        'Review Section 17(5) blocked credit rules thoroughly before computing eligible ITC.'
      ],
      samplePracticeQuestions: [
        {
          question: 'What is the maximum limit of rebate under Section 87A under the default tax regime (Section 115BAC)?',
          answer: 'Rebate under Section 87A is available up to 100% of income tax or Rs. 25,000 (whichever is less) if total income does not exceed Rs. 7,00,000.'
        }
      ]
    };
  }

  // 8. Intermediate Paper 4: Cost and Management Accounting
  if (course.includes('intermediate') && (subject.includes('cost') || title.includes('cost') || title.includes('costing') || title.includes('cma'))) {
    return {
      paperName: 'Paper 4: Cost and Management Accounting (CA Intermediate)',
      moduleName: material.title || 'Cost and Management Accounting Study Guide',
      examWeightage: '100 Marks (30% Case MCQs + 70% Practical Computations)',
      applicableCycle: 'May 2026 / Nov 2026 Examination',
      officialPortalUrl: 'https://www.icai.org/post/bos-knowledge-portal',
      learningObjectives: [
        'Determine material cost (EOQ, stock levels), labor cost (incentive wage plans), and allocate/apportion overheads.',
        'Apply Activity Based Costing (ABC), Job, Batch, and Process Costing (equivalent production units).',
        'Use Marginal Costing techniques: CVP analysis, Breakeven point, Margin of Safety, and Key Factor decision making.',
        'Compute Standard Costing variances (Material, Labour, Overheads) and prepare Functional & Flexible Budgets.'
      ],
      keyTopics: [
        {
          title: 'Elements of Cost: Material, Labour & Overheads',
          summary: 'Economic Order Quantity (EOQ), re-order level, safety stock; Rowan and Halsey incentive plans; machine hour rates and under/over absorption of overheads.'
        },
        {
          title: 'Activity Based Costing & Process Costing',
          summary: 'Cost pools, cost drivers, calculation of cost driver rates; process accounts with normal/abnormal loss, abnormal gain, and FIFO/weighted average equivalent units.'
        },
        {
          title: 'Marginal Costing & CVP Decision Making',
          summary: 'Contribution, P/V ratio, Break-even sales, Margin of Safety, Shut-down point, Make or Buy decisions, and Limiting factor optimization.'
        },
        {
          title: 'Standard Costing Variances & Budgetary Control',
          summary: 'Material cost/price/usage/mix/yield variances; Labour rate/efficiency/idle time variances; Flexible budgets and zero-base budgeting.'
        }
      ],
      importantFormulasOrSections: [
        {
          title: 'Economic Order Quantity (EOQ)',
          code: 'EOQ = SQRT [ (2 * Annual Consumption * Cost per Order) / Carrying Cost per unit p.a. ]'
        },
        {
          title: 'Break-Even Point (in Value)',
          code: 'Break-Even Sales = Fixed Cost / (Profit-Volume Ratio)'
        },
        {
          title: 'Profit-Volume Ratio (P/V Ratio)',
          code: 'P/V Ratio = (Contribution / Sales) * 100 = (Change in Profit / Change in Sales) * 100'
        }
      ],
      examTips: [
        'Always verify reconciliation of variances (Total Cost Variance = Price/Rate Variance + Usage/Efficiency Variance).',
        'State formulas explicitly before substituting numbers to capture full step marks.'
      ],
      samplePracticeQuestions: [
        {
          question: 'What is Margin of Safety and how is it calculated in marginal costing?',
          answer: 'Margin of Safety is the excess of actual sales over break-even sales. Formulas: MoS = Actual Sales - Break-even Sales = Profit / P/V Ratio.'
        }
      ]
    };
  }

  // 9. Intermediate Paper 5: Auditing and Ethics
  if (course.includes('intermediate') && (subject.includes('audit') || title.includes('audit') || title.includes('ethics'))) {
    return {
      paperName: 'Paper 5: Auditing and Ethics (CA Intermediate)',
      moduleName: material.title || 'Auditing and Ethics Study Module',
      examWeightage: '100 Marks (30% Case MCQs + 70% Descriptive)',
      applicableCycle: 'May 2026 Examination',
      officialPortalUrl: 'https://www.icai.org/post/bos-knowledge-portal',
      learningObjectives: [
        'Understand auditing principles, professional skepticism, and Standards on Auditing (SAs).',
        'Formulate audit risk, materiality (SA 320), internal control evaluation, and audit sampling (SA 530).',
        'Comprehend company audit provisions under Companies Act 2013 (Sec 139-148), CARO 2020 reporting, and ICAI Code of Ethics.'
      ],
      keyTopics: [
        {
          title: 'Core Standards on Auditing',
          summary: 'SA 200 (Overall Objectives), SA 210 (Terms of Engagement), SA 230 (Documentation), SA 240 (Fraud responsibilities), SA 315 (Risk Assessment & Internal Control), SA 500 (Evidence), SA 700/705/706 (Audit Reports).'
        },
        {
          title: 'Company Audit & CARO 2020 Reporting',
          summary: 'Appointment, eligibility, disqualifications (Sec 141(3)), rotation, rights, duties, and reporting on all 21 clauses of Companies (Auditor\'s Report) Order, 2020.'
        },
        {
          title: 'ICAI Code of Ethics & Audit Documentation',
          summary: 'Fundamental principles: integrity, objectivity, competence, confidentiality, professional behaviour; working paper retention (minimum 7 years).'
        }
      ],
      importantFormulasOrSections: [
        {
          title: 'The Audit Risk Model (SA 200 / SA 315)',
          code: 'Audit Risk (AR) = Risk of Material Misstatement (Inherent Risk * Control Risk) * Detection Risk'
        },
        {
          title: 'Section 141(3) Disqualifications of Auditor',
          code: 'Body corporate, officer/employee of company, indebted > Rs 5 lakh, holds securities > Rs 1 lakh face value, etc.'
        }
      ],
      examTips: [
        'Use standard ICAI technical phrases: "obtain sufficient appropriate audit evidence", "reasonable assurance", "material misstatement".',
        'Cite the exact clause number of CARO 2020 when reporting on inventory, PPE, or title deeds.'
      ],
      samplePracticeQuestions: [
        {
          question: 'What is the auditor\'s responsibility regarding audit trail under Rule 11(g)?',
          answer: 'The auditor must verify whether the company used accounting software with an active audit trail feature (edit log facility) that operated throughout the financial year without tampering.'
        }
      ]
    };
  }

  // 10. Intermediate Paper 6: Financial Management & Strategic Management
  if (course.includes('intermediate') && (subject.includes('financial management') || subject.includes('strategic') || title.includes('fm') || title.includes('sm') || title.includes('financial_management') || subject.includes('fm-sm') || subject.includes('fmsm'))) {
    return {
      paperName: 'Paper 6: Financial Management & Strategic Management (CA Intermediate)',
      moduleName: material.title || 'FM & SM Study Module',
      examWeightage: '100 Marks (Section A: FM 50M | Section B: SM 50M)',
      applicableCycle: 'May 2026 & November 2026 Examination Cycles',
      officialPortalUrl: 'https://www.icai.org/post/bos-knowledge-portal',
      learningObjectives: [
        'Evaluate capital budgeting proposals using NPV, IRR, Modified IRR, Payback, and Profitability Index.',
        'Compute Cost of Capital (Ke, Kd, Kp, WACC) and assess Capital Structure Theories (NI, NOI, MM, Traditional).',
        'Analyze Financial, Operating, and Combined Leverage; manage Working Capital (Operating Cycle, Cash, Receivables).',
        'Formulate business strategies using SWOT, Porter\'s Five Forces, BCG Matrix, Ansoff Grid, and Value Chain Analysis.'
      ],
      keyTopics: [
        {
          title: 'Capital Budgeting & Cost of Capital',
          summary: 'Cash flow estimation, discounted cash flow techniques, NPV vs IRR conflicts, Cost of equity under CAPM model, and Weighted Average Cost of Capital (WACC).'
        },
        {
          title: 'Leverage Analysis & Working Capital Management',
          summary: 'Operating Leverage (Contribution/EBIT), Financial Leverage (EBIT/EBT), Combined Leverage, Working capital estimation via operating cycle approach.'
        },
        {
          title: 'Strategic Management & Competitive Analysis',
          summary: 'Strategic analysis frameworks: Porter\'s Five Forces, Michael Porter generic strategies (Cost leadership, Differentiation, Focus), BCG Growth-Share Matrix, and McKinsey 7S.'
        }
      ],
      importantFormulasOrSections: [
        {
          title: 'CAPM Cost of Equity (Ke)',
          code: 'Ke = Rf + Beta * (Rm - Rf)   [where Rf = Risk-free rate, Rm = Market return]'
        },
        {
          title: 'Weighted Average Cost of Capital (WACC / Ko)',
          code: 'Ko = (We * Ke) + (Wd * Kd * (1 - t)) + (Wp * Kp)'
        },
        {
          title: 'Operating Leverage & Financial Leverage',
          code: 'DOL = Contribution / EBIT  |  DFL = EBIT / EBT  |  DCL = DOL * DFL = Contribution / EBT'
        }
      ],
      examTips: [
        'In capital budgeting questions, always list cash flow assumptions clearly (e.g. working capital release at end of project life).',
        'In Strategic Management, draw clean 2x2 matrix diagrams for BCG (Stars, Cash Cows, Question Marks, Dogs) and Ansoff Matrix.'
      ],
      samplePracticeQuestions: [
        {
          question: 'Why is Net Present Value (NPV) preferred over Internal Rate of Return (IRR) when evaluating mutually exclusive projects?',
          answer: 'NPV assumes reinvestment of intermediate cash flows at the firm\'s cost of capital (a realistic assumption), whereas IRR assumes reinvestment at the project\'s IRR (often unrealistic), avoiding scale and timing distortion.'
        }
      ]
    };
  }

  // ==========================================
  // CA FINAL PAPERS (Papers 1 - 6)
  // ==========================================

  // 11. Final Paper 1: Financial Reporting
  if (course.includes('final') && (subject.includes('reporting') || title.includes('fr') || title.includes('ind as') || title.includes('financial_reporting'))) {
    return {
      paperName: 'Paper 1: Financial Reporting (CA Final)',
      moduleName: material.title || 'Financial Reporting (Ind AS) Comprehensive Guide',
      examWeightage: '100 Marks (Advanced Financial Analysis & Ind AS Mastery)',
      applicableCycle: 'May 2026 Examination Cycle',
      officialPortalUrl: 'https://www.icai.org/post/bos-knowledge-portal',
      learningObjectives: [
        'Master Indian Accounting Standards (Ind AS) framework, recognition, measurement, and comprehensive disclosures.',
        'Execute complex Business Combinations (Ind AS 103), Purchase Price Allocation (PPA), and Consolidation (Ind AS 110).',
        'Analyze Financial Instruments (Ind AS 109 / 32) classification, amortized cost, FVOCI, FVTPL, and hedge accounting.',
        'Apply Ind AS 115 (Revenue from Contracts with Customers) 5-step model and Ind AS 116 (Leases) Right-of-Use accounting.'
      ],
      keyTopics: [
        {
          title: 'Ind AS 103 (Business Combinations) & Ind AS 110 (Consolidation)',
          summary: 'Acquisition method, purchase consideration, contingent consideration valuation, bargain purchase gain in OCI, step-acquisitions, and joint arrangements (Ind AS 111).'
        },
        {
          title: 'Ind AS 109, 32 & 107 (Financial Instruments)',
          summary: 'Business model test, SPPI test, Expected Credit Loss (ECL) 3-stage model, compound financial instruments, split accounting, and derivative hedges.'
        },
        {
          title: 'Ind AS 115 (Revenue) & Ind AS 116 (Leases)',
          summary: '5-step revenue recognition model, principal vs agent, variable consideration constraint, ROU asset and lease liability amortization schedules.'
        }
      ],
      importantFormulasOrSections: [
        {
          title: 'Ind AS 115: 5-Step Revenue Recognition Model',
          code: 'Step 1: Identify Contract -> Step 2: Performance Obligations -> Step 3: Transaction Price -> Step 4: Allocate Price -> Step 5: Recognize Revenue'
        },
        {
          title: 'Right-of-Use (ROU) Asset Initial Measurement (Ind AS 116)',
          code: 'ROU Asset = Initial Lease Liability + Advance Payments + Initial Direct Costs + Restoration Estimate - Lease Incentives'
        }
      ],
      examTips: [
        'Structure Ind AS answers with: (1) Applicable Standard and core principle, (2) Step-by-step mathematical computation, (3) Journal entries, (4) Financial statement presentation notes.',
        'Always evaluate whether an arrangement contains embedded derivatives or distinct performance obligations.'
      ],
      samplePracticeQuestions: [
        {
          question: 'How is contingent consideration classified under Ind AS 103, and how are subsequent changes accounted for?',
          answer: 'Classified as equity or liability. Equity is not remeasured. Liability is remeasured at fair value at each reporting date with changes recognized in Profit & Loss.'
        }
      ]
    };
  }

  // 12. Final Paper 2: Advanced Financial Management (AFM)
  if (course.includes('final') && (subject.includes('financial management') || title.includes('afm') || title.includes('portfolio') || title.includes('derivatives') || subject.includes('advanced financial'))) {
    return {
      paperName: 'Paper 2: Advanced Financial Management (CA Final)',
      moduleName: material.title || 'Advanced Financial Management Study Module',
      examWeightage: '100 Marks (Advanced Quantitative & Valuation Analysis)',
      applicableCycle: 'May 2026 Examination',
      officialPortalUrl: 'https://www.icai.org/post/bos-knowledge-portal',
      learningObjectives: [
        'Construct optimal investment portfolios using Markowitz Efficient Frontier, Sharpe Single Index Model, and Treynor/Sharpe/Jensen performance ratios.',
        'Evaluate corporate derivatives: Futures, Options (Black-Scholes, Binomial model), Interest Rate Swaps, and Caps/Floors/Collars.',
        'Manage Foreign Exchange Risk: Transaction, Translation, and Economic exposures using Forward Contracts, Money Market Hedge, and Currency Swaps.',
        'Execute Corporate Valuation (DCF, Relative Valuation) and Mergers & Acquisitions exchange ratios, synergy valuation, and post-merger EPS.'
      ],
      keyTopics: [
        {
          title: 'Security Analysis & Portfolio Management',
          summary: 'Risk-return tradeoff, covariance, correlation coefficient, minimum variance portfolio, Capital Asset Pricing Model (CAPM), and Arbitrage Pricing Theory (APT).'
        },
        {
          title: 'Foreign Exchange Exposure & International Financial Management',
          summary: 'Purchasing Power Parity (PPP), Interest Rate Parity (IRP), International Fisher Effect, Forward cover vs Money Market Hedge decision matrices.'
        },
        {
          title: 'Derivatives & Interest Rate Risk Management',
          summary: 'Option Greeks (Delta, Gamma, Vega, Theta), Black-Scholes Model, Interest Rate Futures, Forward Rate Agreements (FRAs), and Interest Rate Swaps.'
        },
        {
          title: 'Business Valuation, Mergers & Acquisitions',
          summary: 'Free Cash Flow to Firm (FCFF), Free Cash Flow to Equity (FCFE), Dividend Discount Model, swap ratios, hostile takeovers, and divestitures.'
        }
      ],
      importantFormulasOrSections: [
        {
          title: 'Interest Rate Parity (IRP) Forward Rate',
          code: 'Forward Rate = Spot Rate * [ (1 + Foreign Interest Rate) / (1 + Domestic Interest Rate) ]'
        },
        {
          title: 'Sharpe Ratio & Treynor Ratio',
          code: 'Sharpe Ratio = (Rp - Rf) / Sigma_p  |  Treynor Ratio = (Rp - Rf) / Beta_p'
        },
        {
          title: 'Black-Scholes Call Option Formula',
          code: 'C = S0 * N(d1) - X * e^(-r*t) * N(d2)'
        }
      ],
      examTips: [
        'Round currency quotes to four decimal places unless specified otherwise in the question.',
        'Show explicit steps for Money Market Hedge: (1) Borrow in appropriate currency, (2) Convert at Spot Rate, (3) Invest in target currency, (4) Settle receivable/payable.'
      ],
      samplePracticeQuestions: [
        {
          question: 'What is Covered Interest Arbitrage and when does it occur?',
          answer: 'Covered Interest Arbitrage occurs when the Interest Rate Parity condition is violated. An investor borrows in a lower interest rate currency, converts at spot rate, invests in a higher interest rate currency, and locks in exchange rate via a forward contract to earn riskless profit.'
        }
      ]
    };
  }

  // 13. Final Paper 3: Advanced Auditing, Assurance and Professional Ethics
  if (course.includes('final') && (subject.includes('audit') || title.includes('audit') || title.includes('ethics') || title.includes('assurance'))) {
    return {
      paperName: 'Paper 3: Advanced Auditing, Assurance & Professional Ethics (CA Final)',
      moduleName: material.title || 'Advanced Auditing Study Guide',
      examWeightage: '100 Marks (30% Case MCQs + 70% Descriptive Analysis)',
      applicableCycle: 'May 2026 Examination',
      officialPortalUrl: 'https://www.icai.org/post/bos-knowledge-portal',
      learningObjectives: [
        'Apply Engagement and Quality Control Standards (SQC 1, SA 200 to SA 720) in complex corporate engagements.',
        'Execute Specialized Audits: Banks (NPA classification), NBFCs, Insurance, Public Sector Undertakings, and Forensic Audits.',
        'Comprehend Internal Audit, Due Diligence, Investigation, Forensic Accounting, and ESG Sustainability Assurance.',
        'Master the Chartered Accountants Act, 1949 and ICAI Code of Ethics (First Schedule & Second Schedule Clauses).'
      ],
      keyTopics: [
        {
          title: 'Standards on Quality Control & Auditing Suite',
          summary: 'SQC 1 (Quality Control for Firms), SA 240 (Fraud), SA 250 (Laws & Regulations), SA 299 (Joint Audit), SA 540 (Accounting Estimates), SA 600 (Using Work of Another Auditor), SA 701 (Key Audit Matters).'
        },
        {
          title: 'Audit of Banks, NBFCs & Forensic Auditing',
          summary: 'Prudential norms on income recognition, asset classification (Standard, Sub-standard, Doubtful, Loss) and provisioning (IRAC norms); digital forensics, red flags, and fraud investigation.'
        },
        {
          title: 'Professional Ethics & CA Act, 1949',
          summary: 'First Schedule (Parts I-IV) & Second Schedule (Parts I-III) clauses: advertising restrictions, fee sharing, substantial interest, ceiling on tax audits (Sec 44AB), and Council Guidelines.'
        }
      ],
      importantFormulasOrSections: [
        {
          title: 'RBI IRAC NPA Provisioning Norms (Banks)',
          code: 'Sub-standard (Secured): 15% | Doubtful D1: 25% | Doubtful D2: 40% | Doubtful D3: 100% | Loss Asset: 100%'
        },
        {
          title: 'Key Audit Matters (SA 701)',
          code: 'Matters communicated with TCWG that in auditor\'s professional judgment were of most significance in the audit.'
        }
      ],
      examTips: [
        'For Professional Ethics questions, always specify: (1) The exact Clause number, (2) Part number, (3) Schedule number of Chartered Accountants Act 1949, (4) Analysis of facts, (5) Definite conclusion on misconduct.',
        'State whether Key Audit Matters (KAM) are mandatory for listed entities under SA 701.'
      ],
      samplePracticeQuestions: [
        {
          question: 'Under what circumstances can a Chartered Accountant in practice share fees or profits with non-members?',
          answer: 'Under Clause (2) of Part I of the First Schedule to the CA Act, 1949, sharing fees is prohibited unless it is with a partner or retired partner or member of another professional body specified in the Regulations (e.g. CS, CWA, Advocate).'
        }
      ]
    };
  }

  // 14. Final Paper 4: Direct Tax Laws & International Taxation
  if (course.includes('final') && (subject.includes('direct tax') || subject.includes('international') || title.includes('dt') || (subject.includes('tax') && !subject.includes('indirect') && !title.includes('gst') && !title.includes('idt') && !title.includes('customs')))) {
    return {
      paperName: 'Paper 4: Direct Tax Laws & International Taxation (CA Final)',
      moduleName: material.title || 'Direct Tax & International Taxation Guide',
      examWeightage: '100 Marks (Corporate Taxation 70M | International Tax 30M)',
      applicableCycle: 'May 2026 Examination (Finance Act 2025/2026 Amendments)',
      officialPortalUrl: 'https://www.icai.org/post/bos-knowledge-portal',
      learningObjectives: [
        'Compute corporate total income and tax liability taking into account Section 115BAA/BAB, Minimum Alternate Tax (Sec 115JB), and AMT.',
        'Navigate complex assessment procedures, reassessment under Section 148, search assessments, faceless schemes, and penalties.',
        'Apply International Taxation principles: Double Taxation Relief (Sec 90/91), Transfer Pricing methods (Sec 92C), Safe Harbour rules, and Equalisation Levy.',
        'Comprehend taxation of Charitable Trusts (Sec 11-13), Business Trusts (REITs/InvITs), and Alternate Investment Funds (AIFs).'
      ],
      keyTopics: [
        {
          title: 'Corporate Taxation & Minimum Alternate Tax (MAT)',
          summary: 'Book profit adjustments under Section 115JB, brought forward loss/depreciation set-off, MAT credit carry forward (15 years), and concessional tax regime (Sec 115BAA).'
        },
        {
          title: 'International Taxation & DTAA Provisions',
          summary: 'Place of Effective Management (POEM), Section 90 bilateral relief, Section 91 unilateral relief, Multilateral Instrument (MLI), and Principal Purpose Test (PPT).'
        },
        {
          title: 'Transfer Pricing & BEPS Action Plans',
          summary: 'Arm’s Length Price determination (CUP, Resale Price, Cost Plus, Profit Split, TNMM), secondary adjustment (Sec 92CE), Master File & CbCR reporting.'
        }
      ],
      importantFormulasOrSections: [
        {
          title: 'MAT Computation (Sec 115JB)',
          code: 'MAT = 15% of Book Profit + Surcharge (if applicable) + 4% Health & Education Cess'
        },
        {
          title: 'Section 91 Foreign Tax Credit (Unilateral Relief)',
          code: 'Relief = Doubly Taxed Income * Lower of (Indian Average Tax Rate, Foreign Average Tax Rate)'
        },
        {
          title: 'Thin Capitalization Limit (Sec 94B)',
          code: 'Interest paid/payable to non-resident AE is disallowed in excess of 30% of EBITDA'
        }
      ],
      examTips: [
        'Always verify if the company opted for Section 115BAA (22% flat rate where MAT does not apply and MAT credit cannot be utilized).',
        'Cite landmark Supreme Court judgments in trust and business deduction problems.'
      ],
      samplePracticeQuestions: [
        {
          question: 'What is the time limit for issuing notice for reassessment under Section 148A of Income-tax Act?',
          answer: '3 years from the end of the relevant assessment year, extendable up to 10 years if the Assessing Officer has evidence that escaped income in the form of asset/expenditure/entry exceeds Rs. 50 lakhs.'
        }
      ]
    };
  }

  // 15. Final Paper 5: Indirect Tax Laws (GST & Customs)
  if (course.includes('final') && (subject.includes('indirect') || subject.includes('customs') || title.includes('idt') || title.includes('gst_final') || title.includes('customs') || title.includes('foreign trade policy') || title.includes('ftp'))) {
    return {
      paperName: 'Paper 5: Indirect Tax Laws (CA Final)',
      moduleName: material.title || 'Indirect Tax Laws (GST, Customs & FTP) Study Guide',
      examWeightage: '100 Marks (GST 80M | Customs & Foreign Trade Policy 20M)',
      applicableCycle: 'May 2026 Examination (Updated with all latest CBIC Notifications)',
      officialPortalUrl: 'https://www.icai.org/post/bos-knowledge-portal',
      learningObjectives: [
        'Analyze complex GST transactions: Place of Supply (Sec 10-13 IGST Act), Valuation rules, and Apportionment of ITC (Rule 42/43).',
        'Execute GST Procedures: Demand & Recovery (Sec 73/74), Search & Seizure, E-way bill rules, Advance Ruling, and GST Appellate Tribunal (GSTAT).',
        'Compute Customs Duty: Types of duties (Basic, SWS, IGST, Anti-dumping, Safeguard), Valuation of imported/export goods (Rule 10), and Duty Drawback (Sec 74/75).',
        'Comprehend Foreign Trade Policy (FTP 2023) schemes: Advance Authorisation, EPCG, RoDTEP, and Status Holders.'
      ],
      keyTopics: [
        {
          title: 'Advanced GST: Place of Supply & Valuation',
          summary: 'Cross-border supply of services, intermediary services, performance-based services, OIDAR services, valuation of supply to related persons/distinct persons (Rule 28).'
        },
        {
          title: 'Input Tax Credit Apportionment (Rule 42 & 43)',
          summary: 'Reversal of ITC on exempt supplies and non-business use for inputs, input services (Rule 42), and capital goods (Rule 43 with 5% quarterly reduction).'
        },
        {
          title: 'Customs Law & Foreign Trade Policy',
          summary: 'Assessable Value computation (FOB + Insurance + Freight per Rule 10), Warehousing (Sec 57-73), Duty Drawback under Section 74 (98% of duty paid) vs Section 75.'
        }
      ],
      importantFormulasOrSections: [
        {
          title: 'Customs Assessable Value (CIF Basis)',
          code: 'Assessable Value = FOB + Sea Freight (Actual or 20% of FOB) + Insurance (Actual or 1.125% of FOB)'
        },
        {
          title: 'Rule 43 Capital Goods Common Credit Monthly Reversal',
          code: 'Monthly Common Credit Tm = Tr / 60  |  Reversal Te = Tm * (Exempt Turnover / Total Turnover)'
        }
      ],
      examTips: [
        'In Customs problems, calculate Basic Customs Duty first, then SWS at 10% on BCD, and then IGST on (Assessable Value + BCD + SWS).',
        'Remember that air freight is strictly restricted to a maximum of 20% of FOB value in Customs Valuation.'
      ],
      samplePracticeQuestions: [
        {
          question: 'What is the distinction between Duty Drawback under Section 74 and Section 75 of Customs Act, 1962?',
          answer: 'Section 74 applies to re-export of duty-paid imported goods in their original identity (up to 98% drawback). Section 75 applies to duty-paid imported materials used in the manufacture/processing of export products per All Industry Rates.'
        }
      ]
    };
  }

  // 16. Final Paper 6: Integrated Business Solutions (IBS)
  if (course.includes('final') && (subject.includes('integrated') || title.includes('integrated') || title.includes('ibs') || title.includes('case_studies') || title.includes('multi-disciplinary'))) {
    return {
      paperName: 'Paper 6: Integrated Business Solutions (CA Final)',
      moduleName: material.title || 'Integrated Business Solutions Multi-Disciplinary Study Guide',
      examWeightage: '100 Marks (Multi-Disciplinary Case Studies • Open Book Format)',
      applicableCycle: 'May 2026 Examination (New Scheme of Education)',
      officialPortalUrl: 'https://www.icai.org/post/bos-knowledge-portal',
      learningObjectives: [
        'Integrate concepts across Financial Reporting, Strategic Financial Management, Auditing, Corporate Laws, Direct Tax, and Indirect Tax.',
        'Synthesize strategic business solutions, corporate restructuring proposals, cross-border M&A tax implications, and forensic governance.',
        'Evaluate multi-regulatory compliance scenarios (SEBI LODR, RBI regulations, Competition Act, Insolvency and Bankruptcy Code IBC 2016).'
      ],
      keyTopics: [
        {
          title: 'Multi-Disciplinary Business Case Analysis',
          summary: 'Holistic assessment of real-world corporate situations requiring concurrent evaluation of Ind AS accounting, tax structuring, valuation, and governance.'
        },
        {
          title: 'Corporate Restructuring & Regulatory Compliance',
          summary: 'Amalgamations, demergers, cross-border acquisitions, FEMA approvals, SEBI takeover code compliance, and IBC resolution process.'
        },
        {
          title: 'Risk Management & Strategic Financial Advisory',
          summary: 'Enterprise risk management frameworks, ESG disclosures, sustainability reporting (BRSR), and fraud risk assessments.'
        }
      ],
      importantFormulasOrSections: [
        {
          title: 'Cross-Disciplinary Valuation & Tax Integration',
          code: 'Post-Merger Value = Value of A + Value of B + Synergy Gain - Cash Consideration Paid - Tax Liability on Transfer'
        },
        {
          title: 'IBC Resolution Plan Approval Threshold (Sec 30(4))',
          code: 'Requires approval of at least 66% of voting share of the Committee of Creditors (CoC)'
        }
      ],
      examTips: [
        'Since Paper 6 is an Open Book Examination, master index mapping and fast cross-referencing across all Final study materials.',
        'Do not spend excessive time copying textbook text — the exam tests analytical synthesis and practical problem-solving.'
      ],
      samplePracticeQuestions: [
        {
          question: 'In a corporate demerger, what conditions must be satisfied under Section 2(19AA) of Income-tax Act for the demerger to be tax-neutral?',
          answer: 'All properties and liabilities of the undertaking must be transferred at book value, on a going concern basis, to the resulting company, and the resulting company must issue shares to shareholders of the demerged company on a proportionate basis.'
        }
      ]
    };
  }

  // ==========================================
  // Generic Fallback (Context-Aware)
  // ==========================================
  const detectedCourse = material.course ? `CA ${material.course}` : 'ICAI BoS';
  const detectedSubject = material.subject || 'Chartered Accountancy Curriculum';

  return {
    paperName: `${detectedCourse}: ${detectedSubject}`,
    moduleName: material.title || `${detectedSubject} Official Board of Studies Study Module`,
    examWeightage: 'Standard ICAI Exam Weightage (New Scheme of Education)',
    applicableCycle: 'May 2026 Examination & Continuing Cycles',
    officialPortalUrl: 'https://www.icai.org/post/bos-knowledge-portal',
    learningObjectives: [
      'Master the conceptual foundation and regulatory requirements specified by the ICAI Board of Studies syllabus.',
      'Solve practical, application-oriented scenario questions aligned with the latest examination pattern.',
      'Comprehend key statutory amendments, judicial precedents, and examiner expectations for scoring high marks.'
    ],
    keyTopics: [
      {
        title: `${detectedSubject} - Core Theoretical Principles`,
        summary: `In-depth analysis of foundational principles, statutory frameworks, and standard procedures prescribed for ${detectedCourse}.`
      },
      {
        title: `${detectedSubject} - Practical Problem Solving & Case Studies`,
        summary: 'Comprehensive numerical illustrations, case law applications, and step-by-step model solutions.'
      },
      {
        title: `${detectedSubject} - High-Yield Exam Topics`,
        summary: 'Summary revision tables, essential statutory provisions, and past examination trend patterns.'
      }
    ],
    importantFormulasOrSections: [
      {
        title: 'ICAI Board of Studies Standards Compliance',
        code: 'All provisions conform strictly to the 2024-2026 New Scheme of Education and Training.'
      }
    ],
    examTips: [
      'Focus on high-weightage chapters and practice writing answers under timed conditions.',
      'Review RTPs and MTPs from the last 3 examination attempts for comprehensive coverage.'
    ],
    samplePracticeQuestions: [
      {
        question: `How should students structure answers for ${detectedSubject}?`,
        answer: 'State the relevant statutory section / standard, present step-by-step workings with clear assumptions, and provide a crisp conclusion.'
      }
    ]
  };
}
