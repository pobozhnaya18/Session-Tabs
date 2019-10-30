var openTabsList = document.querySelector("#open");
var sessionUl = document.querySelector("#session");
var openTabsButton = document.querySelector("#openTabs");
var search = document.querySelector("#search");
var openedTabsArray = [];
var savedTabsArray = [];

search.addEventListener("input", function(ev) {
  if (!openedTabsArray.length) {
    return;
  }
  let searchResults = openedTabsArray.filter(tab =>
    tab.title.toLowerCase().includes(ev.target.value.toLowerCase())
  );
  while (openTabsList.childNodes.length > 3) {
    openTabsList.removeChild(openTabsList.childNodes[3]);
  }
  searchResults.forEach(tab => {
    //html elements создание
    const divOut = document.createElement("div");
    const divInner = document.createElement("div");
    const li = document.createElement("li");
    const divButton = document.createElement("div");
    const button = document.createElement("button");

    //добавление классов к html elements
    divInner.className = "inner-div-li";
    divOut.className = "outer-div-le";
    divButton.className = "right-div-icon";
    button.className = "f6 link dim br1 ba ph1 pv1 dib dark-green";
    li.className = "ph3 pv3";

    //установка текста в html elements
    button.innerText = "Add";
    li.innerText = tab.title;

    //добавление скрытого URL к div js object
    divOut.url = tab.url;
    divOut.title = tab.title;

    //вставка элементов в DOM
    divButton.appendChild(button);
    divInner.appendChild(li);
    divOut.appendChild(divInner);
    divOut.appendChild(divButton);
    openTabsList.appendChild(divOut);

    addListenerToAddButton(button);
  });
});

//получить данные, хранящиеся в локальном хранилище Chrome
chrome.storage.sync.get(null, function(data) {
  savedTabsArray = data.tabs.length ? data.tabs : [];
  savedTabsArray.forEach(tab => {
    //создание html elements
    const divOut = document.createElement("div");
    const divIn = document.createElement("div");
    const li = document.createElement("li");
    const divButtons = document.createElement("div");
    const del = document.createElement("button");
    const open = document.createElement("button");

    //добавление классов
    open.className = "f6 link dim br1 ba ph1 pv1 dib mt1 mr2 dark-blue";
    del.className = "f6 link dim br1 ba ph1 pv1 mt1 mr1 dib dark-pink";
    divIn.className = "inner-div-li";
    divOut.className = "outer-div-le";
    divButtons.className = "right-div-icon";
    li.className = "ph3 pv3";

    //установка текста в html elements
    open.innerText = "Open";
    del.innerText = "Delete";
    li.innerText = tab.title;

    //вставка элементов DOM
    divButtons.appendChild(open);
    divButtons.appendChild(del);
    divIn.appendChild(li);
    divOut.appendChild(divIn);
    divOut.appendChild(divButtons);
    sessionUl.appendChild(divOut);

    //добавление listeners к open and del
    addEventListenerToRemove(del, divOut);
    addEventListenerToOpen(open, tab.url);
  });
});

//получить открытые вкладки в текущем окне
chrome.tabs.query({ currentWindow: true }, function(tabs) {
  openedTabsArray = tabs.length
    ? tabs.map(tab => {
        return {
          title: tab.title,
          url: tab.url
        };
      })
    : [];
  tabs.forEach(tab => {
    //создание html elements
    const divOuter = document.createElement("div");
    const divInner = document.createElement("div");
    const li = document.createElement("li");
    const divButton = document.createElement("div");
    const button = document.createElement("button");

    //добавление классов к html elements
    divInner.className = "inner-div-li";
    divOuter.className = "outer-div-le";
    divButton.className = "right-div-icon";
    button.className = "f6 link dim br1 ba ph1 pv1 dib dark-green";
    li.className = "ph3 pv3";

    //установка текста в html elements
    button.innerText = "Add";
    li.innerText = tab.title;

    //добавить скрытый URL к div js object
    divOuter.url = tab.url;
    divOuter.title = tab.title;

    //вставка элементов в DOM
    divButton.appendChild(button);
    divInner.appendChild(li);
    divOuter.appendChild(divInner);
    divOuter.appendChild(divButton);
    openTabsList.appendChild(divOuter);

    addListenerToAddButton(button);
  });
});

openTabsButton.addEventListener("click", function() {
  savedTabsArray.forEach(tab => {
    chrome.tabs.create({ url: tab.url });
  });
});

function addListenerToAddButton(button) {
  button.addEventListener("click", function(ev) {
    let url = ev.target.parentNode.parentNode.parentNode;
    let divToRemove = ev.target.parentNode.parentNode;
    let found = savedTabsArray.findIndex(tab => tab.url === divToRemove.url);
    if (found) {
      const obj = divToRemove.cloneNode(true);
      obj.title = divToRemove.title;
      obj.url = divToRemove.url;
      addElementToSession(obj);
    }
  });
}

function addElementToSession(element) {
  element.childNodes[1].removeChild(element.childNodes[1].childNodes[0]); //удаление add button
  const title = element.title;
  var obj = {
    title: title,
    url: element.url
  };
  //Создание двух html buttons открыть и удалить, чтобы добавить в новый созданный элемент сеанса
  const del = document.createElement("button");
  const open = document.createElement("button");
  open.className = "f6 link dim br1 ba ph1 pv1 dib mt1 mr2 dark-blue";
  del.className = "f6 link dim br1 ba ph1 pv1 mt1 mr1 dib dark-pink";
  open.innerText = "Open";
  del.innerText = "Delete";
  element.childNodes[1].appendChild(open);
  element.childNodes[1].appendChild(del);
  sessionUl.appendChild(element);
  savedTabsArray.push(obj);
  //добавление event listeners на нажатие
  addEventListenerToRemove(del, element);
  addEventListenerToOpen(open, obj.url);
  //хранение savedTabsArray в chrome local storage
  chrome.storage.sync.set({ tabs: savedTabsArray });
}

function addEventListenerToRemove(button, toRemove) {
  button.addEventListener("click", function(ev) {
    let index = savedTabsArray.findIndex(
      tab => tab.title === toRemove.childNodes[0].childNodes[0].innerText
    );
    savedTabsArray.splice(index, 1);
    chrome.storage.sync.set({ tabs: savedTabsArray }, () => {
      ev.target.parentNode.parentNode.parentNode.removeChild(
        ev.target.parentNode.parentNode
      );
    });
  });
}

function addEventListenerToOpen(button, url) {
  button.addEventListener("click", function(ev) {
    chrome.tabs.create({ url: url });
  });
}
