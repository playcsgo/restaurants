const { expect } = require('chai')
const { createModelMock, createControllerProxy, mockRequest, mockResponse, mockNext } = require('../helpers/unit-test-helper')

// 使用hepler來快速判定登入用戶以及驗證與否
const sinon = require('sinon')
const helpers = require('../helpers/auth-helpers')


describe('R03 User Profile', () => {
  context('[Get User Profile頁面]', () => {
    before(() => {
      // 模擬登入
      this.ensureAuthenticated = sinon
        .stub(helpers, 'ensureAuthenticated') // 設定要調用的函式
        .returns(true) // 設定調用helpers.ensureAuthenticated 時回傳 true
      this.getUser = sinon.stub(helpers, 'getUser').returns({ id: 1 })

      // mock 資料
      this.UserMock = createModelMock('User', [
        {
          id: 1,
          email: 'root@example.com',
          name: 'root',
          isAdmin: true
        }
      ])

      // mock controller
      this.userController = createControllerProxy('../controllers/user-controller.js', { User: this.UserMock })
      })
      // 開始測試
      it('#10 GET /users/:id', async () => {
        const req = mockRequest({ params: { id: 1 } })
        const res = mockResponse()
        const next = mockNext
        await this.userController.getUser(req, res, next)

        expect(res.render.getCall(0).args[0]).to.equal('users/profile')
        expect(res.render.getCall(0).args[1].user.id).to.equal(1)
      })

      // 測試完畢, 清除資料
      after(async () => {
        this.ensureAuthenticated.restore()
        this.getUser.restore()
    })
  })

  context('[瀏覽 Profile edit頁面]', () => {
    before(() => {
      // 設定登入狀態
      this.ensureAuthenticated = sinon
        .stub(helpers, 'ensureAuthenticated')
        .returns(true)
      this.getUser = sinon
        .stub(helpers, 'getUser')
        .returns({ id: 2 })
      
      this.UserMock = createModelMock('User', [
        {
          id: 2,
          email: 'user2@example.com',
          name: 'user2',
          isAdmin: false,
        }
      ])
      // mock controller
      this.userController = createControllerProxy('../controllers/user-controller.js', { User: this.UserMock })
    })

    // 開始測試
    it('#11 GET /users/:id/edit', async () => {
      const req = mockRequest({ params: { id: 2 } })
      const res = mockResponse()
      const next = mockNext
      await this.userController.editUser(req, res, next)

      expect(res.render.getCall(0).args[0]).to.equal('users/edit')
      expect(res.render.getCall(0).args[1].user.name).to.equal('user2')
    })

    // 測試完畢  清除資料
    after(async () => {
      this.ensureAuthenticated.restore()
      this.getUser.restore()
    })
  })

  context('[編輯 User Profile]', () => {
    before(async () => {
      // 設定登入狀態
      this.ensureAuthenticated = sinon
        .stub(helpers, 'ensureAuthenticated')
        .returns(true)
      this.getUser = sinon
        .stub(helpers, 'getUser')
        .returns({ id: 2 })
      
      this.UserMock = createModelMock('User', [
        {
          id: 2,
          email: 'user2@example.com',
          name: 'user2',
          isAdmin: false,
        }
      ])
      // mock controller
      this.userController = createControllerProxy('../controllers/user-controller.js', { User: this.UserMock })
    })

    // 開始測試
    it('#12 PUT /users/:id', async() => {
      const req = mockRequest({
        user: { id: 2 },
        params: { id: 2 },
        body: { name: 'user2_edit' }
      })
      const res = mockResponse()
      const next = mockNext
      await this.userController.putUser(req, res, next)
      expect(req.flash.calledWith('success_messages', '使用者資料編輯成功')).to.be.true
      expect(res.redirect.calledWith('/users/2')).to.be.true

      const user = await this.UserMock.findOne({ where: { id: 2 } })
      expect(user.name).to.equal('user2_edit')
    })

    after(async() => {
      this.ensureAuthenticated.restore()
      this.getUser.restore()
    })

  })

})

// // sinon.stub()
// // 存根（Stub）的主要用途：
// // 返回固定的响应值：可以预设函数调用的返回值，不管传入什么参数。
// // 防止方法执行：阻止某些方法的执行，例如，阻止发送网络请求或写文件等副作用操作。
// // 模拟方法行为：替代复杂逻辑，返回需要的值或执行简单的操作。
// // 记录函数调用：跟踪函数是否被调用，调用了多少次，以及被调用时传入了什么参数。

// #使用存根替代对象的方法
// // sinon.stub(object, 'methodName');

// #创建一个存根并设定返回值
// let stub = sinon.stub().returns('foo');

// #创建一个存根并让它对特定参数返回特定值
// let stub = sinon.stub();
// stub.withArgs(42).returns('The meaning of life');

// #创建一个存根，使其抛出错误
// let stub = sinon.stub().throws(new Error('Something went wrong'));

// #替换对象中的方法，并指定存根的行为
// sinon.stub(object, 'method').callsFake(function () {
//   console.log('Method was called');
// });


// // sinon.restore()
// .restore() 的主要用途：
// 恢复函数原有的行为：当你使用 sinon.stub() 或 sinon.spy() 修改了一个对象的方法时，使用 .restore() 可以恢复这个方法到它原来的实现。这通常在测试的清理阶段进行，确保每个测试运行的环境都是干净的。
// 防止内存泄漏：在长时间运行的应用中，频繁地修改对象的方法而不恢复，可能导致内存泄漏或其他意外行为。