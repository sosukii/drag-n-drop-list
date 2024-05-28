//    ----    KNOCKOUT LOGIC    ----

let fakeID = 1;
let fakeSubID = 1;

function Category(name, subcategories) {
  const self = this;
  self.name = ko.observable(name);
  self.subcategories = ko.observableArray(
    subcategories.map((subcategory) => {
      return {
        name: subcategory,
        sub_id: 'subcat-' + fakeSubID++,
      };
    })
  );
  self.id = fakeID++;
}

function ViewModel() {
  const self = this;

  self.categories = ko.observableArray([
    new Category('Обязательные для всех', ['Паспорт', 'ИНН']),
    new Category('Обязательные для трудоустройства', ['Мяу', 'Вау']),
    new Category('Специальные', ['Супер', 'Классный пункт']),
  ]);
}

ko.applyBindings(new ViewModel());

//    ----    DRAG AND DROP    ----

const cats = document.querySelector('.cats');
const move = document.querySelector('.move');

let anchorEl = null;
let ghost = null;
let baseX = 0;
let baseY = 0;

function dragStart(e) {
  e.preventDefault();
  e.stopPropagation();

  if (!e.target.classList.contains('move')) return;

  const draggedEl = defineDraggedEl(e);
  addGhost(draggedEl);

  baseX = e.clientX - draggedEl.offsetLeft;
  baseY = e.clientY - draggedEl.offsetTop;

  placementDraggedEl(e, draggedEl);

  document.addEventListener('mousemove', dragMove);
  document.addEventListener('mouseup', dragEnd);

  draggedEl.classList.add('dragged');
  draggedEl.style.position = 'absolute';
  cats.style.cursor = 'move';
}

function dragMove(e) {
  e.preventDefault();

  const draggedEl = document.querySelector('.dragged');

  placementDraggedEl(e, draggedEl);
  highlightDropPlace(e, draggedEl)
}

function dragEnd(e) {
  e.preventDefault();
  const draggedEl = document.querySelector('.dragged');
  const isSubcat = anchorEl.id.includes('subcat');

  let apendMethod = getAppendMethod(anchorEl, isSubcat);

  removeGhost();
  insert(draggedEl, anchorEl, apendMethod);

  if (!isSubcat) {
    draggedEl.style.maxHeight = draggedEl.scrollHeight + 'px';
  }

  cats.style.cursor = null;
  anchorEl = null;
  clearHightlight();
  resetDraggedEl(draggedEl)

  document.removeEventListener('mousemove', dragMove);
  document.removeEventListener('mouseup', dragEnd);
}

function expand(e) {
  const head = e.target.closest('.head');
  const isMoveBtn = e.target.classList.contains('move');

  if (!head || isMoveBtn) return;

  const body = head.nextElementSibling;
  const mark = head.querySelector('.circle__check');

  if (body.style.maxHeight) {
    body.style.maxHeight = null;
    mark.classList.remove('circle__check--active');
  } else {
    body.style.maxHeight = body.scrollHeight + 'px';
    mark.classList.add('circle__check--active');
  }
}

function insert(insertedEl, anchorEl, insertMethod) {
  const isSubcat = anchorEl.id.includes('subcat');

  anchorEl[insertMethod](insertedEl);

  if (isSubcat) {
    const body = anchorEl.closest('.body');
    setTimeout(() => {
      body.style.maxHeight = body.scrollHeight + 'px';
    });
  } else {
    setTimeout(() => (insertedEl.style.maxHeight = '100%'), 500);
  }
}

function addGhost(draggedEl) {
  ghost = draggedEl.cloneNode(true);
  ghost.classList.add('ghost');
  const prevSibling = draggedEl.previousElementSibling;
  setTimeout(() => {
    if (prevSibling) {
      prevSibling.after(ghost);
    } else {
      draggedEl.parentElement.prepend(ghost);
    }
  });
}
function removeGhost() {
  const ghost = document.querySelector('.ghost');
  ghost.style.height = 0;
  ghost.remove();
}

function defineDraggedEl(e) {
  return e.target.closest('.subcat') || e.target.closest('.cats__cat');
}
function placementDraggedEl(e, draggedEl) {
  draggedEl.style.top = (e.clientY - baseY).toString() + 'px';
  draggedEl.style.left = (e.clientX - baseX).toString() + 'px';
}
function resetDraggedEl(draggedEl) {
  draggedEl.style.position = null;
  draggedEl.classList.remove('dragged');
}

function getAppendMethod(anchorEl, isSubcat) {
  if (!isSubcat) {
    return anchorEl.querySelector('.head').classList.contains('border-bottom')
      ? 'after'
      : 'before';
  } else {
    return anchorEl.classList.contains('border-bottom') ? 'after' : 'before';
  }
}

function highlightDropPlace(e, draggedEl) {
  const x = e.clientX;
  const y = e.clientY;

  const isSub = draggedEl.classList.contains('subcat');
  const elementsUnderCursor = document.elementsFromPoint(x, y);
  const highlightedEl = elementsUnderCursor
    .filter((e) => e.classList.contains(isSub ? 'subcat' : 'head'))
    .pop();
  // относительно anchorEl высчитывается, курсор - выше или ниже центра anchorEl
  anchorEl = isSub ? highlightedEl : highlightedEl.parentElement;

  if (!anchorEl || !anchorEl.id || draggedEl.id === anchorEl.id) return;

  const top = anchorEl.getBoundingClientRect().top;
  const bottom = anchorEl.getBoundingClientRect().bottom;

  clearHightlight();
  highlightedEl.classList.add('highlight');
  if (e.clientY < (top + bottom) / 2) {
    highlightedEl.classList.add('border-top');
    highlightedEl.classList.remove('border-bottom');
  } else {
    highlightedEl.classList.add('border-bottom');
    highlightedEl.classList.remove('border-top');
  }
}
function clearHightlight() {
  document
    .querySelectorAll('.border-top')
    .forEach((e) => e.classList.remove('border-top'));
  document
    .querySelectorAll('.border-bottom')
    .forEach((e) => e.classList.remove('border-bottom'));
  document.querySelector('.highlight')?.classList.remove('highlight');
}

cats.addEventListener('mousedown', expand);
const moveBtns = document.querySelectorAll('.move');
moveBtns.forEach((btn) => btn.addEventListener('mousedown', dragStart));
