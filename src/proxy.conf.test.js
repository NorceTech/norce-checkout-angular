const dotenv = require('dotenv');
dotenv.config();

function configure(proxy) {
  proxy.on('proxyReq', function (proxyReq, req, res) {
    proxyReq.setHeader('Authorization', `Bearer ${process.env.TOKEN}`);
  });
}

const proxyConf = {
  "/proxy/order": {
    "target": "https://order.checkout.test.internal.norce.tech",
    "changeOrigin": true,
    "pathRewrite": {
      "^/proxy/order": ""
    },
    configure
  },
  "/proxy/norce-adapter": {
    "target": "https://norce-adapter.checkout.test.internal.norce.tech",
    "changeOrigin": true,
    "pathRewrite": {
      "^/proxy/norce-adapter": ""
    },
    configure
  },
  "/proxy/adyen-adapter": {
    "target": "https://adyen-adapter.checkout.test.internal.norce.tech",
    "changeOrigin": true,
    "pathRewrite": {
      "^/proxy/adyen-adapter": ""
    },
    configure
  },
  "/proxy/walley-adapter": {
    "target": "https://walley-adapter.checkout.test.internal.norce.tech",
    "changeOrigin": true,
    "pathRewrite": {
      "^/proxy/walley-adapter": ""
    },
    configure
  },
  "/proxy/configuration": {
    "target": "https://configuration.checkout.test.internal.norce.tech",
    "changeOrigin": true,
    "pathRewrite": {
      "^/proxy/configuration": ""
    },
    configure
  },
}

module.exports = proxyConf;
