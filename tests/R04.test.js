const { expect } = require('chai')
const { createModelMock, createControllerProxy, mockRequest, mockResponse, mockNext } = require('../helpers/unit-test-helper')

// 使用hepler來快速判定登入用戶以及驗證與否
const sinon = require('sinon')
const helpers = require('../helpers/auth-helpers')

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
      },
      {
        userId: 2
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

mockLikeData = []

describe('R04 Like UnLike', ()=> {
  context('[使用者 Like 餐廳]', () => {
    before(() => {
      this.ensureAuthenticated = sinon
        .stub(helpers, 'ensureAuthenticated')
        .returns(true)
      this.getUser = sinon
        .stub(helpers, 'getUser')
        .returns({ id: 1 })
      
      this.restaurantMock = createModelMock('Restaurant', mockRestaurantData)
      this.likeMock = createModelMock('Like', mockLikeData)

      this.userController = createControllerProxy('../controllers/user-controller.js', {
        Like: this.likeMock,
        Restaurant: this.restaurantMock
      })
    })

    //開始測試
    it('#13 POST /like/:restaurantId', async () => {
      const req = mockRequest({
        params: { restaurantId: 2 },
        user: { id: 1 }
      })
      const res = mockResponse()
      const next = mockNext
      await this.userController.addLike(req, res, next)
      const likes = await this.likeMock.findAll()

      expect(likes.length).to.equal(1)
      expect(likes[0].userId).to.equal(1)
      expect(likes[0].restaurantId).to.equal(2)
    })

    it('#14 DELETE /like/:restaurantId', async () => {
      const req = mockRequest({
        params: { restaurantId: 2 },
        user: { id: 1 }
      })
      const res = mockResponse()
      const next = mockNext
      await this.userController.removeLike(req, res, next)
      const likes = await this.likeMock.findAll()

      expect(likes.length).to.equal(0)
    })

    //測試後
    after(async () => {
      this.ensureAuthenticated.restore()
      this.getUser.restore()
    })
  })
})