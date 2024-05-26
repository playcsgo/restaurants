const request = require('supertest') // 引入測試用HTTP
const chai = require('chai') //引入斷言庫
const should = chai.should()
const sinon = require('sinon')  // 引入 spy
// const shoud = chai.should()  //可能不用
const { expect } = require('chai')

const app = require('../app')
const { createModelMock, createControllerProxy, mockRequest, mockResponse, mockNext } = require('../helpers/unit-test-helper')

describe('R01', () => {
  context('[登入測試]: POST /signin', () => {
    it('#2 密碼錯誤', done => {
      request(app)
        // 使用POST 訪問 url: /signin
        .post('/signin')
        // 設定 Content-Type
        .type('urlencoded')
        // .send 發送form.  email = test, passwrod = test
        .send('email=root@example.com&password=abc')
        // .expect 檢查 headers是否有 Location = /signin
        .expect('Location', '/signin')
        // 檢查 headers 是否有302.  同時使用done結束此it
        .expect(302, done)
    })

    it('#3 帳號錯誤', done => {
      request(app)
        .post('/signin')
        .type('urlencoded')
        // 輸入錯的帳號
        .send('email=root&password=12345678')
        // 期待 導向回signin /signin
        .expect('Location', '/signin')
        .expect(302, done)
    })

    it('#4 登入成功', done => {
      request(app)
        .post('/signin')
        .type('urlencoded')
        .send('email=root@example.com&password=12345678')
        .expect('Location', '/restaurants')
        .expect(302, done)
    })
  })
  
  describe('使用者權限管理', () => {
    before(() => {
      // mock資料 
      this.UserMock = createModelMock('User', [
        {
          id: 1,
          email: 'root@example.com',
          name: 'root',
          isAdmin: true,
        }
      ])
      // mock adminController
      this.adminController = createControllerProxy('../controllers/admin-controller', { User:this.UserMock })
    })

    //開始測試
    context('[顯示使用者清單]', () => {
      it('#5 GET /admin/users', async () => {
        const req = mockRequest()
        const res = mockResponse()
        const next = mockNext
        await this.adminController.getUsers(req, res, next)
        // expect(res.render.getCall(0).args[1].users[0].name).to.equal('admin')
        res.render.getCall(0).args[1].users[0].name.should.equal('root')
      })
    })

    context('[修改使用者權限] root', () => {
      it('#6 PATCH /admin/users/:id', async () => {
        // 模擬 params.id = 1 的req
        const req = mockRequest({ params: { id: 1 } })
        const res = mockResponse()
        const next = mockNext
        await this.adminController.patchUser(req, res, next)

        // calledWith 方法用来检查一个 spy 或 stub 是否被以指定的参数调用过
        // 延伸用法spy.calledWith('A', 'B', 'C', 'D')
        req.flash.calledWith('error_messages', '禁止變更 root 權限').should.be.true
        res.redirect.calledWith('back').should.be.true
      })
    })

    context('[修改使用者權限] user -> admin ', () => {
      before(() => {
        this.UserMock = createModelMock('User', [{
          id: 2,
          email: 'user2@example.com',
          name: 'user2',
          isAdmin: false
        }])
        this.adminController = createControllerProxy('../controllers/admin-controller', { User: this.UserMock })
      })

      it('#7 PATCH /admin/users/:id', async () => {
        const req = mockRequest({ params: { id: 2 } })
        const res = mockResponse()
        const next = mockNext
        await this.adminController.patchUser(req, res, next)

        const user = await this.UserMock.findOne({
          where: { id: 2 } 
        })
      
        expect(req.flash.calledWith('success_messages', '使用者權限變更成功')).to.be.true
        expect(res.redirect.calledWith('/admin/users')).to.be.true
        expect(user.isAdmin).to.equal(true)
      })
    })

    //
    context('[修改使用者權限] admin -> user ', () => {
      before(() => {
        this.UserMock = createModelMock('User', [{
          id: 2,
          email: 'user2@example.com',
          name: 'user2',
          isAdmin: true
        }])
        this.adminController = createControllerProxy('../controllers/admin-controller', { User: this.UserMock })
      })

      it('#8 PATCH /admin/users/:id', async () => {
        const req = mockRequest({ params: { id: 2 } })
        const res = mockResponse()
        const next = mockNext
        await this.adminController.patchUser(req, res, next)

        const user = await this.UserMock.findOne({
          where: { id: 2 } 
        })
      
        expect(req.flash.calledWith('success_messages', '使用者權限變更成功')).to.be.true
        expect(res.redirect.calledWith('/admin/users')).to.be.true
        expect(user.isAdmin).to.equal(false)
      })
    })
  })
  
})