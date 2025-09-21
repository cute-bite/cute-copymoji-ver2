// /assets/ga.js
(function(){
  var MID = 'G-939VP60V1C'; // GA4 Measurement ID

  // gtag.js 로드
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + MID;
  document.head.appendChild(s);

  // gtag 초기화
  window.dataLayer = window.dataLayer || [];
  function gtag(){ dataLayer.push(arguments); }
  window.gtag = gtag;

  gtag('js', new Date());
  gtag('config', MID);
})();
