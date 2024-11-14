jest.setTimeout(30000); 
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const User = require('../models/users/userModel'); 

let mongoServer;
let token;

describe('POST /api/recommendations', () => {

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();

        await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

        const user = await User.create({
            name: 'Alice Johnson',
            household_income: 300000,
            email: 'alice.johnson@gmail.com',
            password: '12345678',
            role: "Tenant",
            passwordConfirm: '12345678',
        });

        return request(app)
            .post('/api/users/signin')
            .send({
                email: 'alice.johnson@gmail.com',
                password: '12345678',
            })
            .then((response) => {
                token = response.body.token;
            });
    });

    afterAll(async () => {
        await mongoose.connection.db.dropDatabase();
        await mongoose.connection.close();
        await mongoServer.stop();
    });

    // first test case to return status code 200 and a list of recommendations
    it('should return 200 and a list of recommendations', async () => {
        const response = await request(app)
            .post('/api/recommendations')
            .set('Authorization', `Bearer ${token}`)
            .send({
                household_income: 50000,
                preferred_locations: ['Downtown', 'Uptown'],
                property_type: ['Apartment'],
                min_bedrooms: 2,
                max_rent: 1500,
            });

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.recommendations).toBeInstanceOf(Array);
    });

    // second test case to return status code 400 if a required field is missing from the request body.
    it('should return 400 if the required fields are missing or invalid', async () => {
        const response = await request(app)
            .post('/api/recommendations')
            .set('Authorization', `Bearer ${token}`)
            .send({
                // missing household_income which is a required field
                preferred_locations: ['Downtown'],
                property_type: ['Apartment'],
                min_bedrooms: 2,
                max_rent: 1500,
            });

        expect(response.status).toBe(400);
        expect(response.body.errors).toBeInstanceOf(Array);
    });

    // third test case to return status code 400 if required fields is an invalid data type
    it('should return 400 if required fields is an invalid data type', async () => {
        const response = await request(app)
            .post('/api/recommendations')
            .set('Authorization', `Bearer ${token}`)
            .send({
                household_income: "fifty thousand", // Invalid type
                preferred_locations: ['Downtown'],
                property_type: ['Apartment'],
                min_bedrooms: 2,
                max_rent: 1500,
            });

        expect(response.status).toBe(400);
        expect(response.body.errors).toBeInstanceOf(Array);
    });
});
