const UserController = require('../../controllers/userController');

jest.mock('../../models', () => ({
  User: {
    findOne: jest.fn(async () => null),
  },
}));

jest.mock('bcryptjs', () => ({ compareSync: jest.fn(() => false) }));

describe('UserController error handling', () => {
  test('login calls next when invalid credentials', async () => {
    const req = { body: { email: 'no@one.com', password: 'bad' } };
    const res = { status: jest.fn(() => res), json: jest.fn() };
    const next = jest.fn();

    await UserController.login(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
