
function showModal() {
        // let modalId = this.dataset.modal;
        let modalId = "#sign-in";
         document.querySelector(modalId).classList.remove('hide');
         document.onkeydown = function (event) {
             //закрываем окно на кнопку Esc
             if (event.keyCode == 27) closeModal();
         }
     };
     function closeModal() {
        document.querySelectorAll('.modal-wrap').forEach(function (element) {
            element.classList.add('hide');
            document.querySelector('.block-modal-test').classList.remove('hide');
        });
        document.onkeydown = null;
    };

    document.querySelectorAll('.modal-close').forEach(function (element) {
        //закрываем окно на кнопке закрыть
        element.onclick = closeModal;
    });
    

function loadDoc(fileName) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            document.getElementById("demo").innerHTML = this.responseText;
        }
    };
    xhttp.open("GET", fileName, true); 
    xhttp.send();
}

 // Устанавливаем изображение по умолчанию при загрузке страницы

        const selectedImage = document.getElementById("selectedImage");
        selectedImage.src = "media/15.jpg";
 // загружаем начальный текст       
        loadDoc('info/15.html');



document.querySelector('.read-cards').onclick = function () {
    document.querySelector('.block-modal-test').classList.add('hide');

  

    // Обработчик события изменения выбора в <select>
    document.getElementById("imageSelect").onchange = function() {   
        let onSelect = document.getElementById("imageSelect");
        let url = onSelect.value;
        window.displayImage.src = url;
        selectedImage.src = url;      

        // Обновляем значение window.fileName
         fileName = 'info/'+url.substring(url.lastIndexOf('/') + 1).replace(".jpg", ".html");
         console.log(fileName);  // Выводит, например, "15.txt"
          // Вызываем loadDoc после обновления fileName
        loadDoc(fileName); 
       
    };

    showModal();
  
 
};

              
             

        
