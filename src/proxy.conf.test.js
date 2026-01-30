const services = [
  "adyen-adapter",
  "awardit-adapter",
  "configuration",
  "ingrid-adapter",
  "klarna-adapter",
  "norce-adapter",
  "order",
  "walley-adapter",
];

const proxyConf = services.reduce((acc, service) => {
  acc[`/proxy/${service}`] = {
    target: `https://${service}.checkout.test.internal.norce.tech`,
    changeOrigin: true,
    pathRewrite: {
      [`^/proxy/${service}`]: "",
    },
  };
  return acc;
}, {});

module.exports = proxyConf;
