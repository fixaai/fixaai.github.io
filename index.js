// Ponto de entrada — o Firebase publica tudo que este arquivo exporta.
const { corrigirDiscursiva } = require("./corrigirDiscursiva");
const { killSwitchOrcamento } = require("./killSwitchOrcamento");

exports.corrigirDiscursiva = corrigirDiscursiva;
exports.killSwitchOrcamento = killSwitchOrcamento;
