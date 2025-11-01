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
      { min: 0, max: null, rate: 21 }
    ]
  },
  usa: {
    name: "United States",
    brackets: [
      { min: 0, max: null, rate: 21 }
    ]
  },
  uk: {
    name: "United Kingdom",
    brackets: [
      { min: 0, max: null, rate: 25 }
    ]
  },
  germany: {
    name: "Germany",
    brackets: [
      { min: 0, max: null, rate: 30.06 }
    ]
  },
  france: {
    name: "France",
    brackets: [
      { min: 0, max: null, rate: 25 }
    ]
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