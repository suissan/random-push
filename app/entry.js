'use strict';
import $ from 'jquery';
const global = Function('return this;')();
global.jQuery = $;
import bootstrap from 'bootstrap';

const randomPush = $('#random-push');
const randomText = $('#random-text');
randomPush.on('click', () => {
  $.get('/questions', {}, (data) => {
    randomText.text(data.text.toString());
  });
});

$(function () {
  const topBtn = $('.to-top');
  topBtn.hide(); // formのhiddenと同じ「隠す」
  // スクロールしてページトップから100に達したらボタンを表示
  $(window).scroll(function () {
    if ($(this).scrollTop() > 100) { // .指定がないのでグローバルオブジェクトのウィンドウオブジェクト（？）
      topBtn.fadeIn(); // 出現!!
    } else {
      topBtn.fadeOut(); // 避難!!
    }
  });
  // スクロールしてトップへ戻る
  topBtn.click(function () {
    $('body,html').animate({
      scrollTop: 0 // トップへ戻る
    }, 500);
    return false;
  });
});