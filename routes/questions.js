'use strict';
const express = require('express');
const router = express.Router();
const fs = require('fs');
// temporarily... 一時的という意味
const mainFile = './text/main.txt'; // 文字列のメインの追加先のファイル
const temporarilyFile = './text/temporarily.txt'; // 一時的に文字列が追加されるファイル
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

// html側で入力された文字列をtext.txtに追加、またはtemporarily.txtをリセット
router.post('/', csrfProtection, (req, res, next) => {
  if (req.query.reset === 'string') {
    const allTexts = readFileFunc(mainFile).concat(readFileFunc(temporarilyFile)); // それぞれのファイルの文字列の配列を結合
    allTexts.push(''); // 保存形式をあわせている
    const temporarilyTexts = readFileFunc(temporarilyFile);
    const resetTemporarily = temporarilyTexts.filter(t => t !== t);
    writeFileFunc(mainFile, allTexts); // 全ての文字列の配列をmain.txtに書き込んでいる
    writeFileFunc(temporarilyFile, resetTemporarily); //temporarily.txtの中身を空っぽ
    res.redirect('/');
  } else {
    const string = req.body.str; // 入力された文字列
    appendFileFunc(mainFile, string); // ファイルに追加
    console.log(readFileFunc(mainFile));
    res.redirect('/');
  }
});

// entry.jsに送るデータの作成
router.get('/', (req, res, nest) => {
  if (!readFileFunc(mainFile).length) {
    const temporarilyTexts = readFileFunc(temporarilyFile);
    const resetTemporarily = temporarilyTexts.filter(t => t !== t);
    temporarilyTexts.push(''); // 保存形式をあわせている
    writeFileFunc(temporarilyFile, resetTemporarily); // temporarily.txtの中身を空っぽ
    writeFileFunc(mainFile, temporarilyTexts); // temporarily.txtの中身を書き写す
    res.json({ text: '終了！！' });
  } else if (readFileFunc(mainFile).length) {
    const randomText = readFileFunc(mainFile)[Math.floor(Math.random() * readFileFunc(mainFile).length)]; // ランダムでmain.txtから文字列を抽出している
    const filterTextAndNewArray = readFileFunc(mainFile).filter(t => t !== randomText) // 抽出されなかった残りの文字列の配列
    filterTextAndNewArray.push(''); // 保存形式をあわせている
    appendFileFunc(temporarilyFile, randomText); // 抽出された文字列をtemporarily.txtに追加
    writeFileFunc(mainFile, filterTextAndNewArray); // 抽出されなかった文字列をtext/main.txtに再書き込み
    res.json({ text: randomText });
  }
});

// 追加された文字列一覧
router.get('/lists', csrfProtection, (req, res, next) => {
  const allTexts = readFileFunc(mainFile).concat(readFileFunc(temporarilyFile)); // それぞれのファイルの文字列の配列を結合
  res.render('list', {
    texts: allTexts,
    csrfToken: req.csrfToken()
  });
});

router.post('/lists/:text', csrfProtection, (req, res, next) => {
  if (req.query.delete === 'all') {
    const emptyArray = []; // 空の配列
    writeFileFunc(mainFile, emptyArray);
    writeFileFunc(temporarilyFile, emptyArray);
    res.redirect('/questions/lists');
  } else if (parseInt(req.query.delete) === 1) {
    const deleteText = req.params.text; // 削除リクエストされてきた文字列
    if (readFileFunc(mainFile).includes(deleteText)) { // deleteTextがmain.txtに含まれている場合
      const filterTextAndNewArray = readFileFunc(mainFile).filter(t => t !== deleteText) // 抽出されなかった残りの文字列の配列
      filterTextAndNewArray.push(''); // 保存形式をあわせている
      writeFileFunc(mainFile, filterTextAndNewArray);
    } else if (readFileFunc(temporarilyFile).includes(deleteText)) { // deleteTextにtemporarily.txtに含まれている場合
      const filterTextAndNewArray = readFileFunc(temporarilyFile).filter(t => t !== deleteText) // 抽出されなかった残りの文字列の配列
      filterTextAndNewArray.push(''); // 保存形式をあわせている
      writeFileFunc(temporarilyFile, filterTextAndNewArray);
    }
    res.redirect('/questions/lists');
  }
});

/**
 * @param {String}  textFile 読み込むファイル
 * @type {Array} array text.txtの文字列を格納する配列
 * @type {String} texts 読み込んだ文字列
 * @return {Array} 空白行を除いた配列
 */
function readFileFunc(textFile) {
  const array = [];
  const texts = fs.readFileSync(textFile, 'utf8');
  for (const text of texts.toString().split('\n')) {
    array.push(text);
  }
  const newArray = array.filter(t => t !== ''); // `${string\n}`で追加しているため行末が空白のため
  return newArray;
}

/**
 * @param {String} textFile 追加先のファイル
 * @param {String} text 一行の文字列
 */
function appendFileFunc(textFile, text) {
  fs.appendFileSync(textFile, `${text}\n`, 'utf8');
}

/**
 * @param {String} textFile 書き込み先のファイル
 * @param {String} text 複数行の文字列
 */
function writeFileFunc(textFile, text) {
  fs.writeFileSync(textFile, text.join('\n'), 'utf8');
}

module.exports = router;