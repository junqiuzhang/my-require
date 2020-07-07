console.log('index.js load')
require(['./title.js', './content.js'], function (Title, Content) {
  console.log('index callback', Title.name, Title.subName, Content.name)
})
