/* =========================================================
   РАБОТЫ В ПОРТФОЛИО — порядок здесь = порядок на сайте.

   Как добавить работу:
   1. Положите оригинал в photos/ и добавьте строку в scripts/images.json
      (id начинается с work-), запустите scripts/optimize_images.py.
   2. Добавьте строку сюда: id — как в images.json, style — один из STYLES,
      w/h — размеры, max — самая большая ширина файла (всё из assets/img/manifest.json), alt — что на фото.
   ========================================================= */
window.STYLES = {
  graphic: 'Графика',
  ornamental: 'Орнаментал',
  botanical: 'Ботаника',
  red: 'Красные'
};

window.WORKS = [
  { id: 'work-shell-pearl',     style: 'graphic',    w: 1456, h: 1698, max: 1456, alt: 'Раскрытая ракушка с жемчужиной и звёздами, тонкая графика' },
  { id: 'work-butterflies',     style: 'graphic',    w: 1656, h: 2070, max: 1656, alt: 'Три бабочки на лопатке' },
  { id: 'work-lily',            style: 'botanical',  w: 1260, h: 1572, max: 1260, alt: 'Лилия на плече, тонкая линия' },
  { id: 'work-ornament-chest',  style: 'ornamental', w: 1492, h: 1668, max: 1492, alt: 'Орнамент на груди: солнце и подвесы из точек' },
  { id: 'work-red-heart',       style: 'red',        w: 1324, h: 1454, max: 1324, alt: 'Красное сердце с пламенем и глазом на плече' },
  { id: 'work-poppies',         style: 'botanical',  w: 1656, h: 1674, max: 1656, alt: 'Маки на предплечье' },
  { id: 'work-rapana',          style: 'graphic',    w: 1324, h: 1484, max: 1324, alt: 'Ракушка-рапан со штриховкой на запястье' },
  { id: 'work-neck-eyes',       style: 'ornamental', w: 1160, h: 1476, max: 1160, alt: 'Три символа вдоль позвоночника на шее' },
  { id: 'work-ear-vine',        style: 'botanical',  w: 1656, h: 1790, max: 1656, alt: 'Лоза вдоль завитка уха' },
  { id: 'work-ammonite',        style: 'graphic',    w: 1118, h: 1454, max: 1118, alt: 'Аммонит на предплечье' },
  { id: 'work-red-figure',      style: 'red',        w: 1260, h: 1438, max: 1260, alt: 'Красная фигурка на груди' },
  { id: 'work-butterfly-chest', style: 'graphic',    w: 994, h: 1250, max: 994, alt: 'Бабочка на груди, тонкая линия' },
  { id: 'work-sun-sternum',     style: 'ornamental', w: 1260, h: 1550, max: 1260, alt: 'Солнце на грудине' },
  { id: 'work-butterfly-hand',  style: 'graphic',    w: 1326, h: 1604, max: 1326, alt: 'Бабочка и звёздочки на кисти' },
  { id: 'work-red-dancer',      style: 'red',        w: 1392, h: 1706, max: 1392, alt: 'Красная танцующая фигура на предплечье' },
  { id: 'work-frog',            style: 'graphic',    w: 1492, h: 1580, max: 1492, alt: 'Лягушка на предплечье' },
  { id: 'work-flower-back',     style: 'botanical',  w: 1492, h: 1478, max: 1492, alt: 'Цветок на спине' },
  { id: 'work-star-heart',      style: 'graphic',    w: 1492, h: 1598, max: 1492, alt: 'Звезда с сердцем на лопатке' },
  { id: 'work-lotus',           style: 'ornamental', w: 1160, h: 1404, max: 1160, alt: 'Орнамент-лотос на бедре' },
  { id: 'work-planet',          style: 'graphic',    w: 1492, h: 1576, max: 1492, alt: 'Фигурка, держащая планету' }
];
