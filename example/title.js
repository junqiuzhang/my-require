console.log('title.js load')
define(['./sub-title.js'], function (SubTitle) {
  console.log('title callback', SubTitle.name)
  return {
    name: '标题',
    subName: SubTitle.name
  }
})