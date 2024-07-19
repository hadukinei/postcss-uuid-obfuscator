(d => {
  d.addEventListener('DOMContentLoaded', () => {
    console.log('fired')

    d.querySelector('.c-color_red')?.addEventListener('click', e => {
      e.stopPropagation()
      e.preventDefault()
      console.log('red', 'c-color_red')
      return false
    })
    d.querySelector('.c-color_blue')?.addEventListener('click', e => {
      e.stopPropagation()
      e.preventDefault()
      console.log('blue', 'c-color_blue')
      return false
    })
  })
})(document)