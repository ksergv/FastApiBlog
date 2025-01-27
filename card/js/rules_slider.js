
document.querySelector('.read-rules').onclick = function () {
    document.querySelector('.form-slider').style.marginLeft = '-400px'; 
   // Получаем src изображения
   const imageSrc = window.displayImage.src;

   // Извлекаем номер из имени файла изображения (например, "15" из "15.jpg")
   const audioNumber = imageSrc.match(/(\d+)\.jpg$/)[1];


   // Формируем путь к аудиофайлу на основе номера
   const audioSrc = `audio/a${audioNumber}.mp3`;
   console.log(audioSrc); 

   // HTML-код аудиоплеера с динамическим src
   const audioPlayerHTML = `
       <div class="audio-player">
           <h1>Проиграть ${audioNumber} Аркан?</h1>
           <img class="cover" src="${imageSrc}" alt="">
           <audio id="audio-player" src="${audioSrc}" type="audio/mp3" controls></audio>
       </div>
   `;

// Вставляем HTML-код в div с id="player"
document.getElementById('player').innerHTML = audioPlayerHTML;
$(document).ready(function() {
    $('#audio-player').mediaelementplayer({
        alwaysShowControls: true,
        features: ['playpause', 'volume', 'duration', 'progress'],
        audioVolume: 'horizontal',
        audioWidth: 400,
        audioHeight: 120
    });
});
}

document.querySelector('.read-rules-back').onclick = function () {
    document.querySelector('.form-slider').style.marginLeft = '0';
    document.getElementById('player').innerHTML = '';
}