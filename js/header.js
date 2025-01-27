
  let lastScrollTop = 0; // Переменная для хранения предыдущей позиции прокрутки
  const header = document.querySelector('header');

  window.addEventListener('scroll', function() {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > lastScrollTop) {
      // Прокрутка вниз
      header.classList.add('hide');
    } else {
      // Прокрутка вверх
      header.classList.remove('hide');
    }

    lastScrollTop = scrollTop;
  });

