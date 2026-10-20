// Pix copia e cola (BR Code estático, padrão do Banco Central).
const tlv = (id: string, v: string) => id + String(v.length).padStart(2, "0") + v;

export function limpaPix(s: string | null | undefined) {
  return String(s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^A-Za-z0-9 .\-]/g, "").trim();
}

export function crc16(s: string) {
  let c = 0xffff;
  for (let i = 0; i < s.length; i++) {
    c ^= s.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) c = (c & 0x8000 ? (c << 1) ^ 0x1021 : c << 1) & 0xffff;
  }
  return c.toString(16).toUpperCase().padStart(4, "0");
}

export function pixCopiaECola(o: { chave: string; nome: string; cidade?: string | null; valor?: number; txid?: string }) {
  const tx = String(o.txid ?? "").replace(/[^A-Za-z0-9]/g, "").slice(0, 25) || "***";
  const p =
    tlv("00", "01") +
    tlv("26", tlv("00", "br.gov.bcb.pix") + tlv("01", o.chave.trim())) +
    tlv("52", "0000") + tlv("53", "986") +
    (o.valor ? tlv("54", o.valor.toFixed(2)) : "") +
    tlv("58", "BR") +
    tlv("59", limpaPix(o.nome).slice(0, 25) || "RECEBEDOR") +
    tlv("60", limpaPix(o.cidade).slice(0, 15) || "SAO PAULO") +
    tlv("62", tlv("05", tx)) + "6304";
  return p + crc16(p);
}
