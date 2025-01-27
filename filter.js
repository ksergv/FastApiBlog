$(document).ready(function () {
  // При нажатии на элемент фильтра
  $(".filter-item").click(function () {
    // Получаем значение фильтра
    const value = $(this).attr("data-filter");

    // Если выбрано "Все", показываем все посты
    if (value == "all") {
      $("li").show("1000");
    } else {
      // Скрываем те посты, у которых нет нужного класса
      $("li")
        .not("." + value)
        .hide("1000");
      // Показываем те, у которых есть нужный класс
      $("li")
        .filter("." + value)
        .show("1000");
    }
  });

  // Добавляем класс "active-filter" для выбранного фильтра
  $(".filter-item").click(function () {
    $(this).addClass("active-filter").siblings().removeClass("active-filter");
  });
});

