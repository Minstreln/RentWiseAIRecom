const { body, validationResult } = require('express-validator');
const { validateRequest } = require('../controllers/recommendation/recommendationController');

describe('validateRequest', () => {
    let req;

    beforeEach(() => {
        req = {
            body: {
                household_income: 50000,
                preferred_locations: ['New York', 'Los Angeles'],
                property_type: ['apartment', 'condo'],
                min_bedrooms: 2,
                max_rent: 1500,
            }
        };
    });

    // first test case should pass if the input is valid
    test('should pass with valid input', async () => {
        await validateRequest(req);
        const errors = validationResult(req);
        expect(errors.isEmpty()).toBe(true);
    });

    // second test case should fail if the household_income is missing
    test('should fail if household_income is missing', async () => {
        delete req.body.household_income;
        await validateRequest(req);
        const errors = validationResult(req);
        expect(errors.isEmpty()).toBe(false);
        expect(errors.array()).toEqual(expect.arrayContaining([
            expect.objectContaining({ msg: 'Household income must be a positive number.' })
        ]));
    });

    // third test case should fail if the household_income is not a positive number
    test('should fail if household_income is not positive', async () => {
        req.body.household_income = -100;
        await validateRequest(req);
        const errors = validationResult(req);
        expect(errors.isEmpty()).toBe(false);
        expect(errors.array()).toEqual(expect.arrayContaining([
            expect.objectContaining({ msg: 'Household income must be a positive number.' })
        ]));
    });

    // fourth test case should fail if preferred_locations is not an array
    test('should fail if preferred_locations is not an array', async () => {
        req.body.preferred_locations = 'New York';
        await validateRequest(req);
        const errors = validationResult(req);
        expect(errors.isEmpty()).toBe(false);
        expect(errors.array()).toEqual(expect.arrayContaining([
            expect.objectContaining({ msg: 'Preferred locations must be an array.' })
        ]));
    });    

    // fifth test case should fail if preferred_locations has values that are not strings
    test('should fail if preferred_locations has non-string values', async () => {
        req.body.preferred_locations = [123, 'New York'];
        await validateRequest(req);
        const errors = validationResult(req);
        expect(errors.isEmpty()).toBe(false);
        expect(errors.array()).toEqual(expect.arrayContaining([
            expect.objectContaining({ msg: 'Each location must be a string.' })
        ]));
    });

    // sixth test case should pass if the property_type is not provided
    test('should pass if property_type is optional and not provided', async () => {
        delete req.body.property_type;
        await validateRequest(req);
        const errors = validationResult(req);
        expect(errors.isEmpty()).toBe(true);
    });

    // seventh test case should fail if the min_bedrooms is not a positive number
    test('should fail if min_bedrooms is not a positive integer', async () => {
        req.body.min_bedrooms = 0;
        await validateRequest(req);
        const errors = validationResult(req);
        expect(errors.isEmpty()).toBe(false);
        expect(errors.array()).toEqual(expect.arrayContaining([
            expect.objectContaining({ msg: 'Minimum bedrooms must be a positive integer.' })
        ]));
    });

    // eight test case should fail if max_rent is not a postive number
    test('should fail if max_rent is not a positive number', async () => {
        req.body.max_rent = -100;
        await validateRequest(req);
        const errors = validationResult(req);
        expect(errors.isEmpty()).toBe(false);
        expect(errors.array()).toEqual(expect.arrayContaining([
            expect.objectContaining({ msg: 'Max rent must be a positive number.' })
        ]));
    });
});
