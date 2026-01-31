const services = [
  "adyen-adapter",
  "awardit-adapter",
  "configuration",
  "ingrid-adapter",
  "klarna-adapter",
  "nonpsp-adapter",
  "norce-adapter",
  "order",
  "qliro-adapter",
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
