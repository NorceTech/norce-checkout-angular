const dotenv = require("dotenv");
dotenv.config();

function configure(proxy) {
  proxy.on("proxyReq", function (proxyReq, req, res) {
    proxyReq.setHeader("Authorization", `Bearer ${process.env.TOKEN}`);
  });
}

const SLUG = process.env.SLUG;
const proxyConf = {
  "/proxy": {
    target: `https://${SLUG}.api-se.stage.norce.tech/checkout`,
    changeOrigin: true,
    pathRewrite: {
      "^/proxy": "",
    },
    configure,
  },
};

module.exports = proxyConf;
