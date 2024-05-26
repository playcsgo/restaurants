const { expect } = require('chai')
const { createModelMock, createControllerProxy, mockRequest, mockResponse, mockNext } = require('../helpers/unit-test-helper')

const sinon = require('sinon')
const helpers = require('../helpers/auth-helpers')

const request = require('supertest')
const app = require('../app')

const mockRestaurantData = [
  {
    id: 1,
    name: 'Rest_1',
    tel: 'tel_1',
    address: 'address_1',
    opening_hours: 'opening_hours_1',
    description: 'description_1',
    FavoritedUsers: [
      {
        userId: 1
      }
    ]
  },
  {
    id: 2,
    name: 'Rest_2',
    tel: 'tel_2',
    address: 'address_2',
    opening_hours: 'opening_hours_2',
    description: 'description_2',
    FavoritedUsers: []
  }
]

describe('R05 Top 10 人氣餐廳 ', () => {
  context('[url, display]', () => {
    before(() => {
      this.ensureAuthenticated = sinon
        .stub(helpers, 'ensureAuthenticated')
        .returns(true)
      this.getUser = sinon
        .stub(helpers, 'getUser')
        .returns({ id: 1, Followings: [], FavoritedRestaurants: [] })
    })

    it('#15 GET /restaurants/top', async () => {
      try {
        const res = await request(app).get('/restaurants/top')
        expect(res.text).to.include('Top 10 人氣餐廳')
      } catch (err) {
        console.log(err)
      }
    })

    after(async () => {
      this.ensureAuthenticated.restore()
    this.getUser.restore()
    })
  })

  context('[點擊加入/移除最愛按鈕時, 即時更新蒐藏數字 ]', () => {
    before(() => {
      this.ensureAuthenticated = sinon
      .stub(helpers, 'ensureAuthenticated')
      .returns(true)
      this.getUser = sinon
      .stub(helpers, 'getUser')
      .returns({ id: 1, Followings: [], FavoritedRestaurants: [] })
      this.restaurantMock = createModelMock('Restaurant', mockRestaurantData)
      this.restController = createControllerProxy('../controllers/restaurant-controller.js', {
        Restaurant: this.restaurantMock
      })
      this.favoriteMock = createModelMock('Favorite', [{ userId: 1, restaurantId: 1 }], 'FavoritedUsers', mockRestaurantData)
      this.userController = createControllerProxy('../controllers/user-controller.js', {
        Favorite: this.favoriteMock,
        Restaurant: this.restaurantMock
      })
    })

    it('#16 POST /favorite', async () => {
      const req = mockRequest({
        user: { id: 1, FavoritedRestaurants: [] },
        params: { restaurantId: 2 }
      })
      const res = mockResponse()
      const next = mockNext

      await this.userController.addFavorite(req, res, next)
      await this.restController.getTopRestaurants(req, res, next)

      // restaurant_2 蒐藏數 0 -> 1 
      expect(res.render.getCall(0).args[1].restaurants[1].favoritedCount).to.equal(1)
    })

    it('#17 DELETE /favorite', async() => {
      const req = mockRequest({
        user: { FavoritedRestaurants: [], id: 1 },
        params: { restaurantId: 1 }
      })
      const res = mockResponse()
      const next = mockNext

      await this.userController.removeFavorite(req, res, next)
      await this.restController.getTopRestaurants(req, res, next)

      // 蒐藏的餐廳 剩下 restaurant_2
      expect(res.render.getCall(0).args[1].restaurants[0].id).to.equal(2)
    })

    after(async () => {
      this.ensureAuthenticated.restore()
      this.getUser.restore()
    })
  })
})