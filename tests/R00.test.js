// 練習supertest

const request = require('supertest')
const app = require('../app')
const { expect } = require('chai')


describe('# 開始測試', () => {
  context(' first test', () => {
    it('#1 / 根目錄導向到/restaurats' , done => {
      request(app)
        .get('/')
        .end((err, res) => {
          expect(res.status).to.equal(302)
          expect(res.headers['location']).to.include('/restaurants')
          // done()不加上去 不會結束
          done()
        })
    })
  })
})