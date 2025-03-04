const proxyConf = {
  "/proxy/order": {
    "target": "https://order.checkout.test.internal.norce.tech",
    "changeOrigin": true,
    "pathRewrite": {
      "^/proxy/order": "",
    },
  },
  "/proxy/norce-adapter": {
    "target": "https://norce-adapter.checkout.test.internal.norce.tech",
    "changeOrigin": true,
    "pathRewrite": {
      "^/proxy/norce-adapter": "",
    },
  },
  "/proxy/adyen-adapter": {
    "target": "https://adyen-adapter.checkout.test.internal.norce.tech",
    "changeOrigin": true,
    "pathRewrite": {
      "^/proxy/adyen-adapter": "",
    },
  },
  "/proxy/walley-adapter": {
    "target": "https://walley-adapter.checkout.test.internal.norce.tech",
    "changeOrigin": true,
    "pathRewrite": {
      "^/proxy/walley-adapter": "",
    },
  },
  "/proxy/ingrid-adapter": {
    "target": "https://ingrid-adapter.checkout.test.internal.norce.tech",
    "changeOrigin": true,
    "pathRewrite": {
      "^/proxy/ingrid-adapter": "",
    },
  },
  "/proxy/configuration": {
    "target": "https://configuration.checkout.test.internal.norce.tech",
    "changeOrigin": true,
    "pathRewrite": {
      "^/proxy/configuration": "",
    },
  },
  "/proxy/awardit-adapter": {
    "target": "https://awardit-adapter.checkout.test.internal.norce.tech",
    "changeOrigin": true,
    "pathRewrite": {
      "^/proxy/awardit-adapter": "",
    },
  },
}

module.exports = proxyConf;
