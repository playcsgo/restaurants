const { expect } = require('chai')
const { createModelMock, createControllerProxy, mockRequest, mockResponse, mockNext } = require('../helpers/unit-test-helper')

describe(' R02 測試餐廳Dashboard', () => {
  context('[Dashboard route -> controller -> view]', () => {
    // mock models data
    this.UserMock = createModelMock('User', [
      {
        id: 1,
        email: 'root@example.com',
        name: 'root',
        isAdmin: true
      }
    ])
    this.RestaurantMock = createModelMock('Restaurant', [
      {
        id: 1,
        name: '拉麵',
        viewCount: 3
      }
    ])
    this.CategoryMock = createModelMock('Category', [
      {
        id: 1,
        name: '日式'
      }
    ])
    this.CommentMock = createModelMock('Comment', [
      {
        id: 1,
        text: '好吃又便宜'
      }
    ])

    // 載入controller, 輸入mock資料
    this.restController = createControllerProxy('../controllers/restaurant-controller', {
      User: this.UserMock,
      Category: this.CategoryMock,
      Restaurant: this.RestaurantMock,
      Comment: this.CommentMock
    })

    // 開始測試
    it(' #9 GET /restaurants/:id/dashboard', async () => {
      // 載入req res next
      const req = mockRequest({ params: { id: 1 } })
      const res = mockResponse()
      const next = mockNext

      // 執行mock controller
      await this.restController.getDashboard(req, res, next)

      // 檢驗結果
      // res.render.getCall(0)  -> res.render第1次被調用
      // 裡面常用的有
      // args: 一个数组，包含该次调用的所有参数。
      // returnValue: 函数调用的返回值。
      // exception: 如果调用时抛出异常，这里会包含该异常对象。
      // calledWith(arg1, arg2, ...): 一个方法，用来检查函数是否用特定的参数被调用。
      expect(res.render.getCall(0).args[0]).to.equal('dashboard')
      expect(res.render.getCall(0).args[1].restaurant.name).to.equal('拉麵')
      expect(res.render.getCall(0).args[1].restaurant.viewCount).to.equal(3)

      
    })
      //應該還要加測. comment mockComment後會不會增加,  mockGet之後會不會增加
  })

})
