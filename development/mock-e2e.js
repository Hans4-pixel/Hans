function setupMocking(server) {
  server
    .forOptions('https://gas-api.metaswap.codefi.network/networks/1/gasPrices')
    .thenCallback(() => {
      return {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
          'Access-Control-Allow-Headers': 'content-type,x-client-id',
        },
        statusCode: 200,
      };
    });

  server
    .forGet('https://gas-api.metaswap.codefi.network/networks/1/gasPrices')
    .thenCallback(() => {
      return {
        headers: { 'Access-Control-Allow-Origin': '*' },
        statusCode: 200,
        json: {
          SafeGasPrice: '1',
          ProposeGasPrice: '2',
          FastGasPrice: '3',
        },
      };
    });
}

module.exports = { setupMocking };
