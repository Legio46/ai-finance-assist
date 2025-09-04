export interface TaxCalculation {
  grossIncome: number;
  taxAmount: number;
  netIncome: number;
  taxRate: number;
  country: string;
}

export interface CountryTaxRates {
  [key: string]: {
    name: string;
    brackets: Array<{
      min: number;
      max: number | null;
      rate: number;
    }>;
    socialSecurity?: number;
    healthInsurance?: number;
  };
}

export const taxRates: CountryTaxRates = {
  slovakia: {
    name: "Slovakia",
    brackets: [
      { min: 0, max: 3936, rate: 0 },
      { min: 3936, max: 22167, rate: 19 },
      { min: 22167, max: null, rate: 25 }
    ],
    socialSecurity: 13.4,
    healthInsurance: 14
  },
  usa: {
    name: "United States",
    brackets: [
      { min: 0, max: 11000, rate: 10 },
      { min: 11000, max: 44725, rate: 12 },
      { min: 44725, max: 95375, rate: 22 },
      { min: 95375, max: 182050, rate: 24 },
      { min: 182050, max: 231250, rate: 32 },
      { min: 231250, max: 578125, rate: 35 },
      { min: 578125, max: null, rate: 37 }
    ]
  },
  uk: {
    name: "United Kingdom",
    brackets: [
      { min: 0, max: 12570, rate: 0 },
      { min: 12570, max: 50270, rate: 20 },
      { min: 50270, max: 125140, rate: 40 },
      { min: 125140, max: null, rate: 45 }
    ]
  },
  germany: {
    name: "Germany",
    brackets: [
      { min: 0, max: 10908, rate: 0 },
      { min: 10908, max: 62810, rate: 14 },
      { min: 62810, max: 277826, rate: 42 },
      { min: 277826, max: null, rate: 45 }
    ],
    socialSecurity: 18.6,
    healthInsurance: 14.6
  },
  france: {
    name: "France",
    brackets: [
      { min: 0, max: 10777, rate: 0 },
      { min: 10777, max: 27478, rate: 11 },
      { min: 27478, max: 78570, rate: 30 },
      { min: 78570, max: 168994, rate: 41 },
      { min: 168994, max: null, rate: 45 }
    ],
    socialSecurity: 22
  }
};

export function calculateTax(income: number, country: string): TaxCalculation {
  const countryData = taxRates[country];
  if (!countryData) {
    throw new Error(`Tax rates for ${country} not found`);
  }

  let totalTax = 0;
  let remainingIncome = income;

  // Calculate income tax using progressive brackets
  for (const bracket of countryData.brackets) {
    if (remainingIncome <= 0) break;

    const taxableInThisBracket = bracket.max 
      ? Math.min(remainingIncome, bracket.max - bracket.min)
      : remainingIncome;

    if (taxableInThisBracket > 0 && income > bracket.min) {
      const actualTaxableAmount = Math.min(taxableInThisBracket, income - bracket.min);
      if (actualTaxableAmount > 0) {
        totalTax += (actualTaxableAmount * bracket.rate) / 100;
      }
    }
  }

  // Add social security and health insurance if applicable
  if (countryData.socialSecurity) {
    totalTax += (income * countryData.socialSecurity) / 100;
  }
  if (countryData.healthInsurance) {
    totalTax += (income * countryData.healthInsurance) / 100;
  }

  const netIncome = income - totalTax;
  const effectiveTaxRate = income > 0 ? (totalTax / income) * 100 : 0;

  return {
    grossIncome: income,
    taxAmount: totalTax,
    netIncome,
    taxRate: effectiveTaxRate,
    country: countryData.name
  };
}