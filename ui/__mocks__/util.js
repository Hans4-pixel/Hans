const zeroAddress = function() {
  const addressLength = 20
  const addr = zeros(addressLength)
  return bufferToHex(addr)
}


module.exports = {
  zeroAddress,
};
