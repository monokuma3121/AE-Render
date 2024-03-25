// 首先确保安装了fontkit库
// npm install fontkit

const fontkit = require('fontkit');

fs.readFile('../../public/123.ttf', (err, buffer) => {
  if (err) throw err;

  const font = fontkit.create(buffer);
  console.log(font.familyName); // 输出字体的家族名称
  console.log(font.styleName); // 输出字体的样式名称
});