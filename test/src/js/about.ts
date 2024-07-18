import Scrollbar from 'smooth-scrollbar'

(d => {
  d.addEventListener('DOMContentLoaded', () => {
    console.log('about page')

    /**
     * smooth scrollbar
     */
    Scrollbar.initAll({
      damping: 0.1,
    })

    /**
     * カラースキームの変更
     * @param {string} className 変更後のクラス名
     */
    const theme = (className: string) => {
      d.querySelector('html')!.classList.remove(...['is--light', 'is--dark'])
      d.querySelector('html')!.classList.add(className)
    };

    d.querySelector('.c-header--color_theme--button_light')?.addEventListener('click', e => {
      e.stopPropagation()
      theme('is--light')
    })
    d.querySelector('.c-header--color_theme--button_dark')?.addEventListener('click', e => {
      e.stopPropagation()
      theme('is--dark')
    })
  })
})(document)
