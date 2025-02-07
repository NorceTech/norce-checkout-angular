const dotenv = require('dotenv');
dotenv.config();

function configure(proxy) {
  proxy.on('proxyReq', function (proxyReq, req, res) {
    proxyReq.setHeader('Authorization', `Bearer ${process.env.TOKEN}`);
  });
}

const proxyConf = {
  "/proxy/order": {
    "target": "https://order-demo.api-se.playground.norce.tech/checkout/order",
    "changeOrigin": true,
    "pathRewrite": {
      "^/proxy/order": ""
    },
    configure
  },
  "/proxy/norce-adapter": {
    "target": "https://order-demo.api-se.playground.norce.tech/checkout/norce-adapter",
    "changeOrigin": true,
    "pathRewrite": {
      "^/proxy/norce-adapter": ""
    },
    configure
  },
  "/proxy/adyen-adapter": {
    "target": "https://order-demo.api-se.playground.norce.tech/checkout/adyen-adapter",
    "changeOrigin": true,
    "pathRewrite": {
      "^/proxy/adyen-adapter": ""
    },
    configure
  },
  "/proxy/walley-adapter": {
    "target": "https://order-demo.api-se.playground.norce.tech/checkout/walley-adapter",
    "changeOrigin": true,
    "pathRewrite": {
      "^/proxy/walley-adapter": ""
    },
    configure
  },
  "/proxy/ingrid-adapter": {
    "target": "https://order-demo.api-se.playground.norce.tech/checkout/ingrid-adapter",
    "changeOrigin": true,
    "pathRewrite": {
      "^/proxy/ingrid-adapter": ""
    },
    configure
  },
  "/proxy/configuration": {
    "target": "https://order-demo.api-se.playground.norce.tech/checkout/configuration",
    "changeOrigin": true,
    "pathRewrite": {
      "^/proxy/configuration": ""
    },
    configure
  },
}

module.exports = proxyConf;
