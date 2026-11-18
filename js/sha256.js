/* SHA-256 implementation (чистая реализация на JS, без внешних библиотек)
   Написано на основе спецификации FIPS 180-4. Работает в любом браузере. */
var sha256=(function(){
  'use strict';
  var K=[
    0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
    0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
    0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
    0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
    0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
    0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
    0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
    0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2
  ];
  var H0=0x6a09e667,H1=0xbb67ae85,H2=0x3c6ef372,H3=0xa54ff53a,
      H4=0x510e527f,H5=0x9b05688c,H6=0x1f83d9ab,H7=0x5be0cd19;

  function utf8Bytes(str){
    var bytes=[];
    for(var i=0;i<str.length;i++){
      var code=str.charCodeAt(i);
      if(code<0x80){ bytes.push(code); }
      else if(code<0x800){ bytes.push(0xc0|(code>>6),0x80|(code&0x3f)); }
      else if(code<0xd800||code>=0xe000){
        bytes.push(0xe0|(code>>12),0x80|((code>>6)&0x3f),0x80|(code&0x3f));
      } else {
        i++;
        code=0x10000+(((code&0x3ff)<<10)|(str.charCodeAt(i)&0x3ff));
        bytes.push(0xf0|(code>>18),0x80|((code>>12)&0x3f),0x80|((code>>6)&0x3f),0x80|(code&0x3f));
      }
    }
    return bytes;
  }
  function rotr(x,n){ return (x>>>n)|(x<<(32-n)); }

  return function(str){
    var msg=utf8Bytes(str);
    var bitLen=msg.length*8;
    msg.push(0x80);
    while(msg.length%64!==56) msg.push(0);
    msg.push(bitLen>>>24,bitLen>>>16,bitLen>>>8,bitLen);
    var a=H0,b=H1,c=H2,d=H3,e=H4,f=H5,g=H6,h=H7,w=new Array(64);
    for(var i=0;i<msg.length;i+=64){
      for(var t=0;t<16;t++){ w[t]=((msg[i+t*4]<<24)|(msg[i+t*4+1]<<16)|(msg[i+t*4+2]<<8)|(msg[i+t*4+3]))>>>0; }
      for(var t2=16;t2<64;t2++){
        var s0=rotr(w[t2-15],7)^rotr(w[t2-15],18)^(w[t2-15]>>>3);
        var s1=rotr(w[t2-2],17)^rotr(w[t2-2],19)^(w[t2-2]>>>10);
        w[t2]=(w[t2-16]+s0+w[t2-7]+s1)>>>0;
      }
      var A=a,B0=b,C0=c,D0=d,E0=e,F0=f,G0=g,H0v=h;
      for(var t3=0;t3<64;t3++){
        var S1=rotr(E0,6)^rotr(E0,11)^rotr(E0,25);
        var ch=(E0&F0)^(~E0&G0);
        var temp1=(H0v+S1+ch+K[t3]+w[t3])>>>0;
        var S0=rotr(A,2)^rotr(A,13)^rotr(A,22);
        var maj=(A&B0)^(A&C0)^(B0&C0);
        var temp2=(S0+maj)>>>0;
        H0v=G0;G0=F0;F0=E0;E0=(D0+temp1)>>>0;D0=C0;C0=B0;B0=A;A=(temp1+temp2)>>>0;
      }
      a=(a+A)>>>0;b=(b+B0)>>>0;c=(c+C0)>>>0;d=(d+D0)>>>0;
      e=(e+E0)>>>0;f=(f+F0)>>>0;g=(g+G0)>>>0;h=(h+H0v)>>>0;
    }
    function hex(x){ var s=(x>>>0).toString(16); return '00000000'.slice(s.length)+s; }
    return hex(a)+hex(b)+hex(c)+hex(d)+hex(e)+hex(f)+hex(g)+hex(h);
  };
})();