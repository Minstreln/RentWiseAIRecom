// Import the function to test
const { calculateMaxAffordableRent } = require('../controllers/recommendation/recommendationController'); // Adjust path as necessary

describe('calculateMaxAffordableRent', () => {
  // first test case that return one-third of the household_hold income if the max_rent is not provided
  it('should return one-third of household income if max_rent is not provided', () => {
    const household_income = 3000;
    const max_rent = null;

    const result = calculateMaxAffordableRent(household_income, max_rent);

    expect(result).toBe(household_income / 3);
  });

  // second test case should retirn max_rent if it is less than or equal to one-third of the household income
  it('should return max_rent if it is less than or equal to one-third of household income', () => {
    const household_income = 3000;
    const max_rent = 1000;

    const result = calculateMaxAffordableRent(household_income, max_rent);

    expect(result).toBe(max_rent);
  });

  // third test case should return one-third of the household income if the max_rent rent is greater than one-third of the household income
  it('should return one-third of household income if max_rent is greater than one-third of household income', () => {
    const household_income = 3000;
    const max_rent = 2000;

    const result = calculateMaxAffordableRent(household_income, max_rent);

    expect(result).toBe(household_income / 3);
  });

  // fourth test case should return and error if the household_income is a negative value
  it('should throw an error if household_income is negative', () => {
    const household_income = -3000;
    const max_rent = 1000;

    expect(() => {
      calculateMaxAffordableRent(household_income, max_rent);
    }).toThrow('household_income and max_rent must be non-negative');
  });

  // fifth test case should return an error if max_rent is negative
  it('should throw an error if max_rent is negative', () => {
    const household_income = 3000;
    const max_rent = -1000;

    expect(() => {
      calculateMaxAffordableRent(household_income, max_rent);
    }).toThrow('household_income and max_rent must be non-negative');
  });

  // sixth test case should return an error if both the household_income and max_rent are negative
  it('should throw an error if both household_income and max_rent are negative', () => {
    const household_income = -3000;
    const max_rent = -1000;

    expect(() => {
      calculateMaxAffordableRent(household_income, max_rent);
    }).toThrow('household_income and max_rent must be non-negative');
  });
});
