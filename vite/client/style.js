window.sheetsMap = new Map();

export const globalUpdateStyle = (id, content) => {
  let style = window.sheetsMap.get(id);

  if (!!style) {
    style.innerHTML = content;
  } else {
    style = document.createElement('style');
    style.setAttribute('type', 'text/css');
    style.innerHTML = content;
    document.head.appendChild(style);
  }

  window.sheetsMap.set(id, style);
};

export const removeStyle = (id) => {
  let style = window.sheetsMap.get(id);
  if (!!style) {
    document.head.removeChild(style);
    window.sheetsMap.delete(id);
  }
};
