require("dotenv").config();

module.exports = (function () {
  return {
    real: {
      // localhost
      host: process.env.DB_HOST, //엔드포인트입력
      port: process.env.DB_PORT,
      user: process.env.DB_USER, //마스터유저입력
      password: process.env.DB_PASSWORD, //마스터유저비밀번호입력
      database: process.env.DB_NAME, //데이터베이스 인스턴스입력
    },
  };
})();
