require(['./title.js', './content.js'], function (title, content) {
  console.log('index callback', title, content)
  document.body.innerHTML = `<h1>${title}</h1><p>${content.p1}</p><p>${content.p2}</p>`
})
