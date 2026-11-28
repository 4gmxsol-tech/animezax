/* AnimeZax instant download: verifies the USDT payment on-chain in the browser, then shows the download link.
   Replaces verifyAndSubmit on the digital-product pages. Binance Pay and unlisted products keep the old manual flow. */
(function () {
var FILES = {
  "dreamy-sky-wallpaper-pack": "MUtqT1BlWFU0RVNoVlZlcGlNSWhCbmtqbnVOODhjeUUw",
  "kawaii-sticker-sheets": "MUw5eFg3NGFxNW03UHlDQXpMVmNhV3ViWnZBNTNhSy1o",
  "desk-calendar-2027": "MTFnQmJRUXNBQjdfT2JlZ1Q4QnRhcEVSMW1OVF9LdVlp",
  "study-planner-printables": "MUhSZE9CZTN6OEZadjk1bnFVNDVEQWpfZXE1WXF4OWp3",
  "printable-bookmarks": "MW4wRWQ3RGhtcnI5WlRkQUQ3YU1MbzBrOWZHb18zVC0z",
  "social-media-template-pack": "MW1iRlR1MENfSDhScGlHYmQza1BKY2w1cUZXNVA3TWlL"
};
var OUR = "0x47258cfc9056d74f1bc31618eaba4b97347596d5", USDT_C = "0x55d398326f99059ff775485246999027b3197955";
var OUR_TRON = "01e0fec470a8fe848c3d430fc22c24dec2e7b87f", TRON_USDT = "a614f803b6fd780986a42c78ec9c7f77e6ded13c";
var TRANSFER = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
var RPCS = ["https://bsc-dataseed.binance.org", "https://bsc-dataseed1.defibit.io", "https://bsc-dataseed1.ninicoin.io"];
var BSC_CONF = 3;
var slug = location.pathname.split("/").pop().replace(/\.html$/, "");
if (!FILES[slug] || typeof window.verifyAndSubmit !== "function") return;
var oldVerify = window.verifyAndSubmit;

function rpc(method, params) {
  var i = 0;
  function next() {
    if (i >= RPCS.length) return Promise.reject(new Error("network"));
    return fetch(RPCS[i++], { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", method: method, params: params, id: 1 }) })
      .then(function (r) { return r.json(); })
      .then(function (j) { return j && j.result !== undefined ? j.result : next(); }, next);
  }
  return next();
}
function link() { return "https://drive.usercontent.google.com/download?export=download&id=" + atob(FILES[slug]); }
function usedKey(chain, tx) { return "az_tx_" + chain + "_" + tx; }

// returns {state:"ok",amount}|{state:"pending"}|{state:"reject",msg}
function checkBsc(tx) {
  return rpc("eth_getTransactionReceipt", [tx]).then(function (rc) {
    if (!rc) return { state: "pending" };
    if (rc.status !== "0x1") return { state: "reject", msg: "This transaction failed on-chain. No payment was received." };
    return rpc("eth_blockNumber", []).then(function (bn) {
      if (parseInt(bn, 16) - parseInt(rc.blockNumber, 16) + 1 < BSC_CONF) return { state: "pending" };
      var total = 0n, found = false;
      (rc.logs || []).forEach(function (l) {
        if (l.address.toLowerCase() !== USDT_C || (l.topics[0] || "").toLowerCase() !== TRANSFER || l.topics.length < 3) return;
        if (("0x" + l.topics[2].slice(-40)).toLowerCase() === OUR) { total += BigInt(l.data); found = true; }
      });
      if (!found) return { state: "reject", msg: "This transaction did not pay OUR USDT (BEP20) address. Check the address in Step 1." };
      return { state: "ok", amount: Number(total / 1000000000000n) / 1e6 };
    });
  });
}
function checkTron(t) {
  return fetch("https://api.trongrid.io/walletsolidity/gettransactioninfobyid", { method: "POST",
    headers: { "Content-Type": "application/json" }, body: JSON.stringify({ value: t }) })
    .then(function (r) { return r.json(); }).then(function (info) {
      if (!info || !info.blockNumber) return { state: "pending" };
      if (!info.receipt || info.receipt.result !== "SUCCESS") return { state: "reject", msg: "This transaction failed on-chain. No payment was received." };
      var total = 0n, found = false;
      (info.log || []).forEach(function (l) {
        if (!l.address || l.address.toLowerCase() !== TRON_USDT || !l.topics || l.topics.length < 3) return;
        if (("0x" + l.topics[0].toLowerCase()) !== TRANSFER) return;
        if (l.topics[2].slice(-40).toLowerCase() === OUR_TRON) { total += BigInt("0x" + l.data); found = true; }
      });
      if (!found) return { state: "reject", msg: "This transaction did not pay OUR USDT (TRC20) address. Check the address in Step 1." };
      return { state: "ok", amount: Number(total) / 1e6 };
    });
}
function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

window.verifyAndSubmit = async function (formId, minAmt, resId) {
  var form = document.getElementById(formId);
  var method = form.querySelector(".payMethod").value;
  if (method === "binance") return oldVerify(formId, minAmt, resId);   // manual flow as before
  var btn = form.querySelector("button"), label = btn.textContent;
  var email = form.querySelector("input[name=email]").value.trim();
  var txid = form.querySelector(".txidField").value.trim().toLowerCase();
  var chain = method === "trc20" ? "tron" : "bsc";
  var id = chain === "tron" ? txid.replace(/^0x/, "") : txid;
  var bad = chain === "tron" ? !/^[0-9a-f]{64}$/.test(id) : !/^0x[0-9a-f]{64}$/.test(id);
  if (!email) return showRes(resId, false, "Please enter your email first.");
  if (bad) return showRes(resId, false, "That is not a valid TxID for the selected network.");
  var saved = null; try { saved = JSON.parse(localStorage.getItem(usedKey(chain, id))); } catch (e) {}
  if (saved && saved.slug !== slug) return showRes(resId, false, "This TxID was already used for a different product.");
  btn.disabled = true;
  var r = null;
  for (var i = 0; i < 12; i++) {
    btn.textContent = "Verifying on the blockchain...";
    try { r = await (chain === "tron" ? checkTron(id) : checkBsc(id)); }
    catch (e) { btn.disabled = false; btn.textContent = label; return showRes(resId, false, "Could not reach the blockchain. Try again in a minute."); }
    if (r.state !== "pending") break;
    showRes(resId, true, "Waiting for network confirmations... (" + (i + 1) + "/12)");
    await sleep(5000);
  }
  btn.disabled = false; btn.textContent = label;
  if (!r || r.state === "pending") return showRes(resId, false, "Not confirmed yet. Wait a minute and press the button again.");
  if (r.state === "reject") return showRes(resId, false, "Rejected: " + r.msg);
  if (r.amount + 1e-9 < minAmt) return showRes(resId, false, "Rejected: only " + r.amount + " USDT arrived. The price is $" + minAmt + ".");
  try { localStorage.setItem(usedKey(chain, id), JSON.stringify({ slug: slug, t: Date.now() })); } catch (e) {}
  form.querySelector(".paymentCheck").value = "onchain-verified-" + r.amount + "-usdt-" + chain + "-instant-download";
  try { fetch(form.action, { method: "POST", mode: "no-cors", body: new FormData(form) }).catch(function () {}); } catch (e) {}   // order notice to the owner, as before
  showRes(resId, true, "Payment verified: " + r.amount + " USDT received.<br><a href=\"" + link() +
    "\" style=\"display:inline-block;margin-top:8px;padding:10px 18px;background:#6c3df4;color:#fff;border-radius:8px;font-weight:bold;text-decoration:none\">Download your files</a>" +
    "<br><small>Save this link. If the download does not start, email 4gmxsol@gmail.com with your TxID.</small>");
};
})();
