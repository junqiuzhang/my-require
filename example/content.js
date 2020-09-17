define(['./p1.js', './p2.js'], function (p1, p2) {
  console.log('content callback', p1, p2)
  return {
    p1,
    p2
  }
})
